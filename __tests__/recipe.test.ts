import { Recipe, Step, Metadata, Ingredient, Cookware, Timer, base } from '../src/cooklang'

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
      // if (recipeStep.line.length != resultStep.length) {
      //   console.log(recipeStep.line, resultStep)
      // }
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
            expect(ingredient.amount).toBe(resultComponent.quantity)
            expect(ingredient.unit).toBe(resultComponent.units)
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
            expect(timer.amount).toBe(resultComponent.quantity)
            expect(timer.unit).toBe(resultComponent.units)
            break;
          default:
            expect(resultComponent.type).toMatch(/^text|ingredient|cookware|timer$/)
        }
      }
    }
  })
});