// a base class containing the raw string
export class base {
  /** @public */
  raw: string

  /** @public */
  constructor(s: string | string[])
}

export class Recipe extends base {
  /** @public */
  metadata: Metadata[]
  /** @public */
  ingredients: Ingredient[]
  /** @public */
  cookware: Cookware[]
  /** @public */
  timers: Timer[]
  /** @public */
  steps: Step[]
  /** @public */
  image?: any

  /** @public */
  calculateTotalTime():number
}

// a single recipe step
export class Step extends base {
  /** @public */
  line: (string | base)[]
  /** @public */
  image?: any
}

// metadata
export class Metadata extends base {
  /** @public */
  key: string
  /** @public */
  value: string
}

// ingredients
export class Ingredient extends base {
  /** @public */
  name: string
  /** @public */
  amount: string
  /** @public */
  unit: string
}

// cookware
export class Cookware extends base {
  /** @public */
  name: string
}

// timer
export class Timer extends base {
  /** @public */
  amount: string
  /** @public */
  unit: string
  /** @public */
  seconds: number

  /** @public */
  static parseTime(s: string, unit: string): number
}