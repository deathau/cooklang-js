"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metadata = exports.Timer = exports.Cookware = exports.Ingredient = exports.Step = exports.Recipe = void 0;
const COMMENT_REGEX = /(--.*)|(\[-(.|\n)+?-\])/g;
const INGREDIENT_REGEX = /@(?:([^@#~]+?)(?:{(.*?)}|{}))|@(.+?\b)/;
const COOKWARE_REGEX = /#(?:([^@#~]+?)(?:{}))|#(.+?\b)/;
const TIMER_REGEX = /~{([0-9]+(?:\/[0-9]+)?)%(.+?)}/;
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
        if (s)
            this.line = this.parseLine(s);
    }
    // parse a single line
    parseLine(s) {
        let match;
        let b;
        let line = [];
        // if the line is blank, return an empty line
        if (s.trim().length === 0)
            return [];
        // if it's a metadata line, return that
        else if (match = METADATA_REGEX.exec(s)) {
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
            this.amount = attrs && attrs.length > 0 ? attrs[0].trim() : undefined;
            this.unit = attrs && attrs.length > 1 ? attrs[1].trim() : undefined;
        }
        else {
            if ('name' in s)
                this.name = s.name;
            if ('amount' in s)
                this.amount = s.amount;
            if ('unit' in s)
                this.unit = s.unit;
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
            if (!match || match.length != 3)
                throw `error parsing cookware: '${s}'`;
            this.name = (match[1] || match[2]).trim();
        }
        else {
            if ('name' in s)
                this.name = s.name;
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
            if (!match || match.length != 3)
                throw `error parsing timer: '${s}'`;
            this.amount = match[1].trim();
            this.unit = match[2].trim();
            if (this.amount)
                this.seconds = Timer.parseTime(this.amount, this.unit);
        }
        else {
            if ('amount' in s)
                this.amount = s.amount;
            if ('unit' in s)
                this.unit = s.unit;
            if ('seconds' in s)
                this.seconds = s.seconds;
        }
    }
    static parseTime(s, unit = 'm') {
        let time = 0;
        let amount = 0;
        if (parseFloat(s) + '' == s)
            amount = parseFloat(s);
        else if (s.includes('/')) {
            const split = s.split('/');
            if (split.length == 2) {
                const num = parseFloat(split[0]);
                const den = parseFloat(split[1]);
                if (num + '' == split[0] && den + '' == split[1]) {
                    amount = num / den;
                }
            }
        }
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
