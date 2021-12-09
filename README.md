# CookLang-JS
CookLang-JS is a JavaScript library for parsing CookLang.

## Installation
`npm install cooklang`

## Usage
```javascript
import { Recipe } from 'cooklang'

const recipeString = `` // <- Your CookLang recipe
const recipe = new Recipe(recipeString);
console.log(recipe);
```

## Documentation
For the recipe structure and other documentation, check out cooklang.d.ts

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Tests
Canonical tests as at https://github.com/cooklang/spec/blob/f67e56c69564369c785a93a28eeda2ed5b51c5ff/tests/canonical.yaml
(in the `__tests__` folder)  
TODO: I want to keep the tests up-to-date with the meain branch instead of copying from the repo

## License
[MIT No Attribution](./LICENCE)
