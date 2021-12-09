declare class base {
    raw?: string;
    constructor(s: string | string[] | any);
}
export declare class Recipe extends base {
    metadata: Metadata[];
    ingredients: Ingredient[];
    cookware: Cookware[];
    timers: Timer[];
    steps: Step[];
    image?: any;
    constructor(s?: string);
    calculateTotalTime(): number;
}
export declare class Step extends base {
    line: (string | base)[];
    image?: any;
    constructor(s?: string | any);
    parseLine(s: string): (string | base)[];
}
export declare class Ingredient extends base {
    name?: string;
    amount?: string;
    quantity?: number;
    units?: string;
    constructor(s: string | string[] | any);
}
export declare class Cookware extends base {
    name?: string;
    constructor(s?: string | string[] | any);
}
export declare class Timer extends base {
    name?: string;
    amount?: string;
    quantity?: number;
    units?: string;
    seconds?: number;
    constructor(s?: string | string[] | any);
    static getSeconds(amount: number, unit?: string): number;
}
export declare class Metadata extends base {
    key?: string;
    value?: string;
    constructor(s: string | string[] | any);
}
export {};
