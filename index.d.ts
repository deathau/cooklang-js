export namespace cooklang {
  // a base class containing the raw string
  export class base {
    /** @public */
    raw: string

    /** @public */
    constructor(s: string | string[])
  }

  export class recipe extends base {
    /** @public */
    metadata: metadata[]
    /** @public */
    ingredients: ingredient[]
    /** @public */
    cookware: cookware[]
    /** @public */
    timers: timer[]
    /** @public */
    steps: step[]
    /** @public */
    image?: any

    /** @public */
    calculateTotalTime()
  }

  // a single recipe step
  export class step extends base {
    /** @public */
    line: (string | base)[]
    /** @public */
    image?: any
  }

  // metadata
  export class metadata extends base {
    /** @public */
    key: string
    /** @public */
    value: string
  }

  // ingredients
  export class ingredient extends base {
    /** @public */
    name: string
    /** @public */
    amount: string
    /** @public */
    unit: string
  }

  // cookware
  export class cookware extends base {
    /** @public */
    name: string
  }

  // timer
  export class timer extends base {
    /** @public */
    amount: string
    /** @public */
    unit: string
    /** @public */
    seconds: number

    /** @public */
    static parseTime(s: string, unit: string) 
  }
}