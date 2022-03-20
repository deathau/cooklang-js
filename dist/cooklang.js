"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metadata = exports.Timer = exports.Cookware = exports.Ingredient = exports.Step = exports.Recipe = void 0;
const COMMENT_REGEX = /(--.*)|(\[-(.|\n)+?-\])/g;
const INGREDIENT_REGEX = /@(?:([^@#~]+?)(?:{(.*?)}|{\s*}))|@((?:[^@#~\s])+)/;
const COOKWARE_REGEX = /#(?:([^@#~]+?)(?:{(.*?)}|{\s*}))|#((?:[^@#~\s])+)/;
const TIMER_REGEX = /~([^@#~]*){([0-9]+(?:[\/|\.][0-9]+)?)%(.+?)}/;
const METADATA_REGEX = /^>>\s*(.*?):\s*(.*)$/;
// a base class containing the raw string
class base {
    constructor(s) {
        if (s instanceof Array)
            this.raw = s[0];
        else if (typeof s === 'string')
            this.raw = s;
        else if ('raw' in s)
            this.raw = s.raw;
    }
}
class Recipe extends base {
    constructor(s) {
        var _a, _b;
        super(s);
        this.metadata = [];
        this.ingredients = [];
        this.cookware = [];
        this.timers = [];
        this.steps = [];
        (_b = (_a = s === null || s === void 0 ? void 0 : s.replace(COMMENT_REGEX, '')) === null || _a === void 0 ? void 0 : _a.split('\n')) === null || _b === void 0 ? void 0 : _b.forEach(line => {
            if (line.trim()) {
                let l = new Step(line);
                if (l.line.length != 0) {
                    if (l.line.length == 1 && l.line[0] instanceof Metadata) {
                        this.metadata.push(l.line[0]);
                    }
                    else {
                        l.line.forEach(b => {
                            if (b instanceof Ingredient)
                                this.ingredients.push(b);
                            else if (b instanceof Cookware)
                                this.cookware.push(b);
                            else if (b instanceof Timer)
                                this.timers.push(b);
                        });
                        this.steps.push(l);
                    }
                }
            }
        });
    }
    calculateTotalTime() {
        return this.timers.reduce((a, b) => a + (b.seconds || 0), 0);
    }
}
exports.Recipe = Recipe;
// a single recipe step
class Step extends base {
    constructor(s) {
        super(s);
        this.line = [];
        if (s && typeof s === 'string')
            this.line = this.parseLine(s);
        else if (s) {
            if ('line' in s)
                this.line = s.line;
            if ('image' in s)
                this.image = s.image;
        }
    }
    // parse a single line
    parseLine(s) {
        let match;
        let b;
        let line = [];
        // if it's a metadata line, return that
        if (match = METADATA_REGEX.exec(s)) {
            return [new Metadata(match)];
        }
        // if it has an ingredient, pull that out
        else if (match = INGREDIENT_REGEX.exec(s)) {
            b = new Ingredient(match);
        }
        // if it has an item of cookware, pull that out
        else if (match = COOKWARE_REGEX.exec(s)) {
            b = new Cookware(match);
        }
        // if it has a timer, pull that out
        else if (match = TIMER_REGEX.exec(s)) {
            b = new Timer(match);
        }
        // if we found something (ingredient, cookware, timer)
        if (b && b.raw) {
            // split the string up to get the string left and right of what we found
            const split = s.split(b.raw);
            // if the line doesn't start with what we matched, we need to parse the left side
            if (!s.startsWith(b.raw))
                line.unshift(...this.parseLine(split[0]));
            // add what we matched in the middle
            line.push(b);
            // if the line doesn't end with what we matched, we need to parse the right side
            if (!s.endsWith(b.raw))
                line.push(...this.parseLine(split[1]));
            return line;
        }
        // if it doesn't match any regular expressions, just return the whole string
        return [s];
    }
}
exports.Step = Step;
// ingredients
class Ingredient extends base {
    constructor(s) {
        var _a;
        super(s);
        if (s instanceof Array || typeof s === 'string') {
            const match = s instanceof Array ? s : INGREDIENT_REGEX.exec(s);
            if (!match || match.length != 4)
                throw `error parsing ingredient: '${s}'`;
            this.name = (match[1] || match[3]).trim();
            const attrs = (_a = match[2]) === null || _a === void 0 ? void 0 : _a.split('%');
            this.amount = attrs && attrs.length > 0 ? attrs[0].trim() : "1";
            if (!this.amount)
                this.amount = "1";
            this.quantity = this.amount ? stringToNumber(this.amount) : 1;
            this.units = attrs && attrs.length > 1 ? attrs[1].trim() : "";
        }
        else {
            if ('name' in s)
                this.name = s.name;
            if ('amount' in s)
                this.amount = s.amount;
            if ('quantity' in s)
                this.quantity = s.quantity;
            if ('units' in s)
                this.units = s.units;
        }
    }
}
exports.Ingredient = Ingredient;
// cookware
class Cookware extends base {
    constructor(s) {
        super(s);
        if (s instanceof Array || typeof s === 'string') {
            const match = s instanceof Array ? s : COOKWARE_REGEX.exec(s);
            if (!match || match.length != 4)
                throw `error parsing ingredient: '${s}'`;
            this.name = (match[1] || match[3]).trim();
            const attrs = match[2];
            this.amount = attrs && attrs.length > 0 ? attrs[0].trim() : "1";
            if (!this.amount)
                this.amount = "1";
            this.quantity = this.amount ? stringToNumber(this.amount) : 1;
        }
        else {
            if ('name' in s)
                this.name = s.name;
            if ('amount' in s)
                this.amount = s.amount;
            if ('quantity' in s)
                this.quantity = s.quantity;
        }
    }
}
exports.Cookware = Cookware;
// timer
class Timer extends base {
    constructor(s) {
        super(s);
        if (s instanceof Array || typeof s === 'string') {
            const match = s instanceof Array ? s : TIMER_REGEX.exec(s);
            if (!match || match.length != 4)
                throw `error parsing timer: '${s}'`;
            this.name = match[1] ? match[1].trim() : "";
            this.amount = match[2] ? match[2].trim() : 0;
            this.units = match[3] ? match[3].trim() : "";
            this.quantity = this.amount ? stringToNumber(this.amount) : 0;
            this.seconds = Timer.getSeconds(this.quantity, this.units);
        }
        else {
            if ('name' in s)
                this.name = s.name;
            if ('amount' in s)
                this.amount = s.amount;
            if ('quantity' in s)
                this.quantity = s.quantity;
            if ('units' in s)
                this.units = s.units;
            if ('seconds' in s)
                this.seconds = s.seconds;
        }
    }
    static getSeconds(amount, unit = 'm') {
        let time = 0;
        if (amount > 0) {
            if (unit.toLowerCase().startsWith('s')) {
                time = amount;
            }
            else if (unit.toLowerCase().startsWith('m')) {
                time = amount * 60;
            }
            else if (unit.toLowerCase().startsWith('h')) {
                time = amount * 60 * 60;
            }
        }
        return time;
    }
}
exports.Timer = Timer;
function stringToNumber(s) {
    let amount = 0;
    if (parseFloat(s) + '' == s)
        amount = parseFloat(s);
    else if (s.includes('/')) {
        const split = s.split('/');
        if (split.length == 2) {
            const num = parseFloat(split[0].trim());
            const den = parseFloat(split[1].trim());
            if (num + '' == split[0].trim() && den + '' == split[1].trim()) {
                amount = num / den;
            }
            else
                amount = NaN;
        }
    }
    else
        amount = NaN;
    return amount;
}
// metadata
class Metadata extends base {
    constructor(s) {
        super(s);
        if (s instanceof Array || typeof s === 'string') {
            const match = s instanceof Array ? s : METADATA_REGEX.exec(s);
            if (!match || match.length != 3)
                throw `error parsing metadata: '${s}'`;
            this.key = match[1].trim();
            this.value = match[2].trim();
        }
        else {
            if ('key' in s)
                this.key = s.key;
            if ('value' in s)
                this.value = s.value;
        }
    }
}
exports.Metadata = Metadata;
