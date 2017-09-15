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
