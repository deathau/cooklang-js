import { Recipe, Step, Metadata, Ingredient, Cookware, Timer } from '../src/cooklang'

//cooklang recipe used for testing
const testRecipe =
`>> Source: https://www.jamieoliver.com/recipes/eggs-recipes/easy-pancakes/

Crack the @eggs{3} into a blender, then add the @flour{125%g}, @milk{250%ml} and @sea salt{1%pinch}, and blitz until smooth (approx ~{30%seconds}). [- alternately, you could whisk -]

Pour into a #bowl and leave to stand for ~prep{1/4%hour}.

Melt the @butter (or a drizzle of @oil if you want to be a bit healthier) in a #large non-stick frying pan{} on a medium heat, then tilt the pan so the butter coats the surface.

Pour in 1 #ladle of batter and tilt again, so that the batter spreads all over the base, then cook for 1 to ~cook{2%minutes}, or until it starts to come away from the sides.

Once golden underneath, flip the pancake over and cook for a further ~cook{1%minute}, or until cooked through.

Serve straightaway with your favourite topping. -- Add your favorite topping here to make sure it's included in your meal plan!`

test("Test parsing recipe", () => {
  const recipe = new Recipe(testRecipe)

  // make sure the raw string is exactly what was passed in
  expect(recipe.raw).toBe(testRecipe)

  // check metadata
  expect(recipe.metadata.length).toBe(1)

  const source = new Metadata({
    key: "Source",
    value: "https://www.jamieoliver.com/recipes/eggs-recipes/easy-pancakes/",
    raw: ">> Source: https://www.jamieoliver.com/recipes/eggs-recipes/easy-pancakes/"
  })
  expect(recipe.metadata).toContainEqual<Metadata>(source)

  //check ingredients
  expect(recipe.ingredients.length).toBe(6)

  const eggs = new Ingredient({ name: "eggs", amount: "3", unit: undefined, raw: "@eggs{3}" })
  const flour = new Ingredient({ name: "flour", amount: "125", unit: "g", raw: "@flour{125%g}" })
  const milk = new Ingredient({ name: "milk", amount: "250", unit: "ml", raw: "@milk{250%ml}" })
  const salt = new Ingredient({ name: "sea salt", amount: "1", unit: "pinch", raw: "@sea salt{1%pinch}" })
  const butter = new Ingredient({ name: "butter", amount: undefined, unit: undefined, raw: "@butter" })
  const oil = new Ingredient({ name: "oil", amount: undefined, unit: undefined, raw: "@oil" })
  expect(recipe.ingredients).toContainEqual<Ingredient>(eggs)
  expect(recipe.ingredients).toContainEqual<Ingredient>(flour)
  expect(recipe.ingredients).toContainEqual<Ingredient>(milk)
  expect(recipe.ingredients).toContainEqual<Ingredient>(salt)
  expect(recipe.ingredients).toContainEqual<Ingredient>(butter)
  expect(recipe.ingredients).toContainEqual<Ingredient>(oil)

  // check cookware
  expect(recipe.cookware.length).toBe(3)

  const bowl = new Cookware({ raw: "#bowl", name: "bowl" })
  const ladle = new Cookware({ raw: "#ladle", name: "ladle" })
  const frypan = new Cookware({ raw: "#large non-stick frying pan{}", name: "large non-stick frying pan" })
  expect(recipe.cookware).toContainEqual<Cookware>(bowl)
  expect(recipe.cookware).toContainEqual<Cookware>(ladle)
  expect(recipe.cookware).toContainEqual<Cookware>(frypan)

  // check timers
  expect(recipe.timers.length).toBe(4)

  const mixTime = new Timer({ name: undefined, amount: "30", unit: "seconds", seconds: 30, raw: "~{30%seconds}" })
  const standTime = new Timer({ name: "prep", amount: "1/4", unit: "hour", seconds: 900, raw: "~prep{1/4%hour}" })
  const cookTime = new Timer({ name: "cook", amount: "2", unit: "minutes", seconds: 120, raw: "~cook{2%minutes}" })
  const cookTime2 = new Timer({ name: "cook", amount: "1", unit: "minute", seconds: 60, raw: "~cook{1%minute}" })
  expect(recipe.timers).toContainEqual<Timer>(mixTime)
  expect(recipe.timers).toContainEqual<Timer>(standTime)
  expect(recipe.timers).toContainEqual<Timer>(cookTime)
  expect(recipe.timers).toContainEqual<Timer>(cookTime2)

  // check steps
  expect(recipe.steps.length).toBe(6)

  // test all the steps are correct
  expect(recipe.steps[0]).toEqual<Step>(new Step({
    raw: 'Crack the @eggs{3} into a blender, then add the @flour{125%g}, @milk{250%ml} and @sea salt{1%pinch}, and blitz until smooth (approx ~{30%seconds}). ',
    line: ['Crack the ', eggs, ' into a blender, then add the ', flour, ', ', milk, ' and ', salt, ', and blitz until smooth (approx ', mixTime,'). ']
  }))

  expect(recipe.steps[1]).toEqual<Step>(new Step({
    raw: 'Pour into a #bowl and leave to stand for ~prep{1/4%hour}.',
    line: ['Pour into a ', bowl, ' and leave to stand for ', standTime, '.']
  }))

  expect(recipe.steps[2]).toEqual<Step>(new Step({
    raw: 'Melt the @butter (or a drizzle of @oil if you want to be a bit healthier) in a #large non-stick frying pan{} on a medium heat, then tilt the pan so the butter coats the surface.',
    line: ['Melt the ', butter, ' (or a drizzle of ', oil, ' if you want to be a bit healthier) in a ', frypan, ' on a medium heat, then tilt the pan so the butter coats the surface.']
  }))

  expect(recipe.steps[3]).toEqual<Step>(new Step({
    raw: 'Pour in 1 #ladle of batter and tilt again, so that the batter spreads all over the base, then cook for 1 to ~cook{2%minutes}, or until it starts to come away from the sides.',
    line: ['Pour in 1 ', ladle, ' of batter and tilt again, so that the batter spreads all over the base, then cook for 1 to ', cookTime, ', or until it starts to come away from the sides.']
  }))

  expect(recipe.steps[4]).toEqual<Step>(new Step({
    raw: 'Once golden underneath, flip the pancake over and cook for a further ~cook{1%minute}, or until cooked through.',
    line: ['Once golden underneath, flip the pancake over and cook for a further ', cookTime2, ', or until cooked through.']
  }))

  expect(recipe.steps[5]).toEqual<Step>(new Step({
    raw: 'Serve straightaway with your favourite topping. ',
    line: ['Serve straightaway with your favourite topping. ']
  }))


  // check the total time (should be equal to the total of all timers)
  expect(recipe.calculateTotalTime()).toBe(1110)

})