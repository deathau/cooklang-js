import { Recipe, Step, Metadata, Ingredient, Cookware, Timer } from '../src/cooklang'

let tests: any;

// Include fs module
const fs = require('fs');

const data = fs.readFileSync('./__tests__/canonical.yaml',
  { encoding: 'utf8', flag: 'r' });

const YAML = require('yaml')

const parsed = YAML.parse(data)
tests = parsed.tests

describe.each(Object.keys(tests))("canonical tests", (testName: string) => {
  test(testName, () => {
    const source = tests[testName].source
    const result = tests[testName].result

    const recipe = new Recipe(source)

    // test the metadata
    const resultMetadataKeys = Object.keys(result.metadata)
    expect(recipe.metadata.length).toBe(resultMetadataKeys.length)
    for (let m = 0; m < resultMetadataKeys.length; m++) {
      const recipeMetadata: Metadata = recipe.metadata[m]

      const resultKey: string = resultMetadataKeys[m]
      const resultValue: string = result.metadata[resultKey]

      expect(recipeMetadata.key).toEqual(resultKey)
      expect(recipeMetadata.value).toEqual(resultValue)
    }

    // test the steps
    expect(recipe.steps.length).toBe(result.steps.length)
    for (let lineNo = 0; lineNo < result.steps.length; lineNo++) {
      const recipeStep:Step = recipe.steps[lineNo]
      const resultStep: any = result.steps[lineNo]

      expect(recipeStep.line.length).toBe(resultStep.length)
      for (let i = 0; i < recipeStep.line.length; i++){
        const recipeComponent: any = recipeStep.line[i];
        const resultComponent: any = resultStep[i];
        switch (resultComponent.type) {
          case "text":
            expect(typeof recipeComponent).toBe("string")
            expect(recipeComponent).toEqual(resultComponent.value)
            break;
          case "ingredient":
            expect(recipeComponent).toBeInstanceOf(Ingredient)
            const ingredient = recipeComponent as Ingredient
            expect(ingredient.name).toBe(resultComponent.name)
            // split in logic here. For non-number quantities, the string is still in the "amount" field
            if(typeof ingredient.quantity === 'undefined' || isNaN(ingredient.quantity))
              expect(ingredient.amount).toBe(resultComponent.quantity)
            else
              expect(ingredient.quantity).toBe(resultComponent.quantity)
            expect(ingredient.units).toBe(resultComponent.units)
            break;
          case "cookware":
            expect(recipeComponent).toBeInstanceOf(Cookware)
            const cookware = recipeComponent as Cookware
            expect(cookware.name).toBe(resultComponent.name)
            break;
          case "timer":
            expect(recipeComponent).toBeInstanceOf(Timer)
            const timer = recipeComponent as Timer
            expect(timer.name).toBe(resultComponent.name)
            expect(timer.quantity).toBe(resultComponent.quantity)
            expect(timer.units).toBe(resultComponent.units)
            break;
          default:
            expect(resultComponent.type).toMatch(/^text|ingredient|cookware|timer$/)
        }
      }
    }
  })
});

describe("custom tests", () => {
  test("test ingredient emoji in the middle", () => {
    const source = "Brush with @🥛 or @🥚"
    const recipe = new Recipe(source)

    expect(recipe.steps.length).toBe(1)
    const step: Step = recipe.steps[0]
    
    expect(step.line.length).toBe(4)
    expect(typeof step.line[0]).toBe("string")
    expect(step.line[0]).toEqual("Brush with ")

    expect(step.line[1]).toBeInstanceOf(Ingredient)
    const ingredient1 = step.line[1] as Ingredient
    expect(ingredient1.name).toBe("🥛")
    expect(ingredient1.quantity).toBe(1)
    expect(ingredient1.units).toBe("")

    expect(typeof step.line[2]).toBe("string")
    expect(step.line[2]).toEqual(" or ")

    expect(step.line[3]).toBeInstanceOf(Ingredient)
    const ingredient3 = step.line[1] as Ingredient
    expect(ingredient3.name).toBe("🥚")
    expect(ingredient3.quantity).toBe(1)
    expect(ingredient3.units).toBe("")
  })

  test("test blank lines get stripped", () => {
    const source = "Line a\n\nLine b"
    const recipe = new Recipe(source)

    expect(recipe.steps.length).toBe(2)
    const step1: Step = recipe.steps[0]
    const step2: Step = recipe.steps[1]

    expect(step1.line.length).toBe(1)
    expect(typeof step1.line[0]).toBe("string")
    expect(step1.line[0]).toEqual("Line a")

    expect(step2.line.length).toBe(1)
    expect(typeof step2.line[0]).toBe("string")
    expect(step2.line[0]).toEqual("Line b")
  })

  test("test whitespace only lines get stripped", () => {
    const source = "Line a\n \t \nLine b"
    const recipe = new Recipe(source)

    expect(recipe.steps.length).toBe(2)
    const step1: Step = recipe.steps[0]
    const step2: Step = recipe.steps[1]

    expect(step1.line.length).toBe(1)
    expect(typeof step1.line[0]).toBe("string")
    expect(step1.line[0]).toEqual("Line a")

    expect(step2.line.length).toBe(1)
    expect(typeof step2.line[0]).toBe("string")
    expect(step2.line[0]).toEqual("Line b")
  })
})