const COMMENT_REGEX = /(--.*)|(\[-(.|\n)+?-\])/g
const INGREDIENT_REGEX = /@(?:([^@#~]+?)(?:{(.*?)}|{\s*}))|@([^@#~]+?)(?:\b|\s|$)/
const COOKWARE_REGEX = /#(?:([^@#~]+?)(?:{\s*}))|#([^@#~]+?)(?:\b|\s|$)/
const TIMER_REGEX = /~([^@#~]*){([0-9]+(?:[\/|\.][0-9]+)?)%(.+?)}/
const METADATA_REGEX = /^>>\s*(.*?):\s*(.*)$/

// a base class containing the raw string
class base {
  raw?: string

  constructor(s: string | string[] | any) {
    if (s instanceof Array) this.raw = s[0]
    else if (typeof s === 'string') this.raw = s
    else if ('raw' in s) this.raw = s.raw
  }
}

export class Recipe extends base {
  metadata: Metadata[] = []
  ingredients: Ingredient[] = []
  cookware: Cookware[] = []
  timers: Timer[] = []
  steps: Step[] = []
  image?: any

  constructor(s?: string) {
    super(s)
    s?.replace(COMMENT_REGEX, '')?.split('\n')?.forEach(line => {
      if (line.trim()) {
        let l = new Step(line)
        if (l.line.length != 0) {
          if (l.line.length == 1 && l.line[0] instanceof Metadata) {
            this.metadata.push(l.line[0])
          }
          else {
            l.line.forEach(b => {
              if (b instanceof Ingredient) this.ingredients.push(b)
              else if (b instanceof Cookware) this.cookware.push(b)
              else if (b instanceof Timer) this.timers.push(b)
            })
            this.steps.push(l)
          }
        }
      }
    })
  }

  calculateTotalTime() {
    return this.timers.reduce((a, b) => a + (b.seconds || 0), 0)
  }
}


// a single recipe step
export class Step extends base {
  line: (string | base)[] = []
  image?: any

  constructor(s?: string | any) {
    super(s)
    if (s && typeof s === 'string') this.line = this.parseLine(s)
    else if(s) {
      if ('line' in s) this.line = s.line
      if ('image' in s) this.image = s.image
    }
  }

  // parse a single line
  parseLine(s: string): (string | base)[] {
    let match: RegExpExecArray | null
    let b: base | undefined
    let line: (string | base)[] = []
    // if it's a metadata line, return that
    if (match = METADATA_REGEX.exec(s)) {
      return [new Metadata(match)]
    }
    // if it has an ingredient, pull that out
    else if (match = INGREDIENT_REGEX.exec(s)) {
      b = new Ingredient(match)
    }
    // if it has an item of cookware, pull that out
    else if (match = COOKWARE_REGEX.exec(s)) {
      b = new Cookware(match)
    }
    // if it has a timer, pull that out
    else if (match = TIMER_REGEX.exec(s)) {
      b = new Timer(match)
    }

    // if we found something (ingredient, cookware, timer)
    if (b && b.raw) {
      // split the string up to get the string left and right of what we found
      const split = s.split(b.raw)
      // if the line doesn't start with what we matched, we need to parse the left side
      if (!s.startsWith(b.raw)) line.unshift(...this.parseLine(split[0]))
      // add what we matched in the middle
      line.push(b)
      // if the line doesn't end with what we matched, we need to parse the right side
      if (!s.endsWith(b.raw)) line.push(...this.parseLine(split[1]))

      return line
    }
    // if it doesn't match any regular expressions, just return the whole string
    return [s]
  }
}

// ingredients
export class Ingredient extends base {
  name?: string
  amount?: string
  quantity?: number
  units?: string

  constructor(s: string | string[] | any) {
    super(s)
    if (s instanceof Array || typeof s === 'string') {
      const match = s instanceof Array ? s : INGREDIENT_REGEX.exec(s)
      if (!match || match.length != 4) throw `error parsing ingredient: '${s}'`
      this.name = (match[1] || match[3]).trim()
      const attrs = match[2]?.split('%')
      this.amount = attrs && attrs.length > 0 ? attrs[0].trim() : "1"
      if(!this.amount) this.amount = "1"
      this.quantity = this.amount ? stringToNumber(this.amount) : 1
      this.units = attrs && attrs.length > 1 ? attrs[1].trim() : ""
    }
    else {
      if ('name' in s) this.name = s.name
      if ('amount' in s) this.amount = s.amount
      if ('quantity' in s) this.quantity = s.quantity
      if ('unit' in s) this.units = s.unit
    }
  }
}

// cookware
export class Cookware extends base {
  name?: string

  constructor(s?: string | string[] | any) {
    super(s)
    if (s instanceof Array || typeof s === 'string') {
      const match = s instanceof Array ? s : COOKWARE_REGEX.exec(s)
      if (!match || match.length != 3) throw `error parsing cookware: '${s}'`
      this.name = (match[1] || match[2]).trim()
    }
    else {
      if ('name' in s) this.name = s.name
    }
  }
}

// timer
export class Timer extends base {
  name?: string
  amount?: string
  quantity?: number
  units?: string
  seconds?: number

  constructor(s?: string | string[] | any) {
    super(s)

    if (s instanceof Array || typeof s === 'string') {
      const match = s instanceof Array ? s : TIMER_REGEX.exec(s)
      if (!match || match.length != 4) throw `error parsing timer: '${s}'`
      this.name = match[1] ? match[1].trim() : ""
      this.amount = match[2] ? match[2].trim() : 0
      this.units = match[3] ? match[3].trim() : ""
      this.quantity = this.amount ? stringToNumber(this.amount) : 0
      this.seconds = Timer.getSeconds(this.quantity, this.units)
    }
    else {
      if ('name' in s) this.name = s.name
      if ('amount' in s) this.amount = s.amount
      if ('quantity' in s) this.quantity = s.quantity
      if ('unit' in s) this.units = s.unit
      if ('seconds' in s) this.seconds = s.seconds
    }
  }

  static getSeconds(amount: number, unit: string = 'm') {
    let time = 0

    if (amount > 0) {
      if (unit.toLowerCase().startsWith('s')) {
        time = amount
      }
      else if (unit.toLowerCase().startsWith('m')) {
        time = amount * 60
      }
      else if (unit.toLowerCase().startsWith('h')) {
        time = amount * 60 * 60
      }
    }

    return time
  }
}

function stringToNumber(s: string){
  let amount: number = 0
  if (parseFloat(s) + '' == s) amount = parseFloat(s)
  else if (s.includes('/')) {
    const split = s.split('/')
    if (split.length == 2) {
      const num = parseFloat(split[0].trim())
      const den = parseFloat(split[1].trim())
      if (num + '' == split[0].trim() && den + '' == split[1].trim()) {
        amount = num / den
      }
      else amount = NaN
    }
  }
  else amount = NaN
  return amount;
}

// metadata
export class Metadata extends base {
  key?: string
  value?: string

  constructor(s: string | string[] | any) {
    super(s)

    if (s instanceof Array || typeof s === 'string') {
      const match = s instanceof Array ? s : METADATA_REGEX.exec(s)
      if (!match || match.length != 3) throw `error parsing metadata: '${s}'`
      this.key = match[1].trim()
      this.value = match[2].trim()
    }
    else {
      if ('key' in s) this.key = s.key
      if ('value' in s) this.value = s.value
    }
  }
}