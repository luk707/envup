#!/usr/bin/env node

import Inquirer from "inquirer";
import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";
import path from "path";
import fs from "then-fs";
import { create } from "domain";

const optionDefinitions = [
  {
    name: "directory",
    alias: "d",
    type: String,
    defaultOption: true,
    defaultValue: process.cwd()
  },
  {
    name: "skip",
    alias: "s",
    type: Boolean,
    defaultValue: false
  },
  {
    name: "default",
    alias: "D",
    type: Boolean,
    defaultValue: false
  },
  {
    name: "help",
    alias: "h",
    type: Boolean,
    defaultValue: false
  }
];

const usage = commandLineUsage([
  {
    header: "envup",
    content: "Dotenv configuration tool"
  },
  {
    header: "Options",
    optionList: [
      {
        name: "directory",
        alias: "d",
        defaultOption: true,
        typeLabel: "[underline]{/path/to/directory}",
        group: "main"
      },
      {
        name: "default",
        alias: "D",
        description: "Selects the default option for everything",
        type: Boolean,
        group: "main"
      },
      {
        name: "skip",
        alias: "s",
        description: "Skips the existing enironment file",
        type: Boolean,
        group: "main"
      },
      {
        name: "help",
        description: "Display this usage guide.",
        alias: "h",
        type: Boolean,
        group: "main"
      }
    ]
  },
  {
    content: "Github: [underline]{https://github.com/luk707/envup}"
  }
]);

const options = commandLineArgs(optionDefinitions);

const { help, directory } = options;

if (help) {
  console.log(usage);
  process.exit(0);
}

const readEnvFile = (path, options) =>
  new Promise((resolve, reject) => {
    if (options.skip) {
      resolve({});
    }
    fs.exists(path).then(envFileExists => {
      if (envFileExists) {
        resolve(
          fs
            .readFile(path)
            //
            .then(env => env.toString("utf-8"))
            // Split each line
            .then(env => env.split("\n"))
            // Filter out lines that are not truthy i.e. empty strings
            .then(env => env.filter(value => !!value))
            // Ignore comments
            .then(env =>
              env.filter(value => {
                const trimmed = value.trim();
                return !trimmed.match(/^#/) || !trimmed.match(/^\/\//);
              })
            )
            .then(env => env.map(keyPair => keyPair.split(/=/)))
            .then(env => env.map(([key, ...pair]) => [key, pair.join("=")]))
            .then(env =>
              env.reduce((cur, [key, value]) => ({ ...cur, [key]: value }), {})
            )
            .catch(() =>
              console.error(
                "Please check that the existing environment file is invalid, use the -s flag to skip reading the existing environment file."
              )
            )
        );
      } else {
        resolve({});
      }
    });
  });

fs
  .exists(path.join(directory, "env.js"))
  .then(jsExists => {
    if (jsExists) {
      const createEnv = require(path.join(directory, "env.js"));
      return readEnvFile(path.join(directory, ".env"), options)
        .then(env =>
          createEnv(
            options.default
              ? {
                  prompt: options =>
                    Promise.resolve(
                      options.reduce(
                        (acc, option) => ({
                          ...acc,
                          [option.name]: option.default
                        }),
                        {}
                      )
                    )
                }
              : Inquirer,
            env
          )
        )
        .then(environment =>
          fs.writeFile(
            path.join(directory, ".env"),
            new Buffer(
              Object.keys(environment)
                .reverse()
                .reduce((acc, cur) => `${cur}=${environment[cur]}\n${acc}`, ""),
              "utf-8"
            )
          )
        )
        .then(() => {
          console.log("Wrote environment file succesfully!");
        });
    }
    return fs.exists(path.join(directory, "env.json"));
  })
  .then(jsonExists => {
    if (jsonExists) {
      return fs
        .readFile(path.join(directory, "env.json"))
        .then(JSON.parse)
        .then(
          environment =>
            options.default
              ? {
                  prompt: options =>
                    Promise.resolve(
                      options.reduce(
                        (acc, option) => ({
                          ...acc,
                          [option.name]: option.default
                        }),
                        {}
                      )
                    )
                }
              : Inquirer.prompt(
                  environment.map(({ name, defaultOption, sensitive }) => ({
                    type: sensitive ? "password" : "input",
                    name,
                    message: `Enter ${name}:`,
                    default: defaultOption || ""
                  }))
                )
        )
        .then(environment =>
          fs.writeFile(
            path.join(directory, ".env"),
            new Buffer(
              Object.keys(environment)
                .reverse()
                .reduce((acc, cur) => `${cur}=${environment[cur]}\n${acc}`, ""),
              "utf-8"
            )
          )
        )
        .then(() => {
          console.log("Wrote environment file succesfully!");
        });
    } else {
      console.log(
        "You must have a env.json or env.js file in the specified directory."
      );
    }
  })
  .catch(console.error);
