#!/usr/bin/env node

import Inquirer from 'inquirer'
import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import path from 'path'
import fs from 'then-fs'

const optionDefinitions = [
  {
    name: 'directory',
    alias: 'd',
    type: String,
    defaultOption: true,
    defaultValue: process.cwd()
  }, {
    name: 'help',
    alias: 'h',
    type: Boolean,
    defaultValue: false
  }
]

const usage = commandLineUsage([
  {
    header: 'envup',
    content: 'Dotenv configuration tool'
  },
  {
    header: 'Options',
    optionList: [
      {
        name: 'directory',
        alias: 'd',
        defaultOption: true,
        typeLabel: '[underline]{/path/to/directory}',
        group: 'main'
      },
      {
        name: 'help',
        description: 'Display this usage guide.',
        alias: 'h',
        type: Boolean,
        group: 'main'
      },
    ]
  },
  {
    content: 'Github: [underline]{https://github.com/luk707/envup}'
  }
])

const options = commandLineArgs(optionDefinitions)

const { help, directory } = options;

if (help) {
  console.log(usage);
  process.exit(0);
}

fs
.readFile(path.join(directory, 'env.json'))
.then(JSON.parse)
.then(environment => (
  Inquirer.prompt(
    environment.map(({
      name,
      defaultOption,
      sensitive,
    }) => ({
      type: sensitive ? 'password' : 'input',
      name,
      message: `Enter ${name}:`,
      default: defaultOption
    }))
  )
))
.then(environment => (
  fs
  .writeFile(
    path.join(directory, '.env'),
    new Buffer(
      Object
      .keys(environment)
      .reverse()
      .reduce(
        (acc, cur) => `${cur}=${environment[cur]}\n${acc}`,
        ''
      ),
      'utf-8'
    )
  )
))
.then(() => {
  console.log('Wrote enviornment file succesfully!')
})
.catch(console.error)
