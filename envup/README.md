# envup

## Getting started

Install the tool from npm

```
$ npm i -g envup
```

Define the variables your application needs in an `env.json` in the root of the directory:

```json
[
  { "name": "PORT", "defaultOption": "8080" },
  { "name": "HOST", "defaultOption": "127.0.0.1" }
]
```

Run the command in the project root:

```
$ envup
```

For more advanced use cases specify an `env.js` that exports a function returning the env keypairs:

```js
const googleFont = function(font) {
  return `'https://fonts.googleapis.com/css?family=${font}:400,700'`;
};
module.exports = function(inquirer, currentEnv) {
  return inquirer
    .prompt([
      {
        type: "list",
        name: "REACT_APP_FONT",
        message: "Which theme do you want",
        default: currentEnv.REACT_APP_FONT || "Roboto",
        choices: ["Roboto", "Lato", "Montserrat"]
      }
    ])
    .then(function(options) {
      return {
        REACT_APP_FONT: options.REACT_APP_FONT,
        REACT_APP_GOOGLE_FONT_URI: googleFont(options.REACT_APP_FONT)
      };
    });
};
```
