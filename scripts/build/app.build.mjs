/**
     MIT License

     @Copyright (c) Metwas

     Permission is hereby granted, free of charge, to any person obtaining a copy
     of this software and associated documentation files (the "Software"), to deal
     in the Software without restriction, including without limitation the rights
     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     copies of the Software, and to permit persons to whom the Software is
     furnished to do so, subject to the following conditions:

     The above Copyright notice and this permission notice shall be included in all
     copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     AUTHORS OR Copyright HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     SOFTWARE.
*/

/**_-_-_-_-_-_-_-_-_-_-_-_-_- @Imports _-_-_-_-_-_-_-_-_-_-_-_-_-*/

import { getProcessArguments, logger } from "./tools/cli.mjs";
import { ok, error, usage } from "./tools/cli.mjs";
import { getTimeString } from "./tools/time.mjs";
import { build } from "./bundlers/builder.mjs";
import minimal from "minimist";
import chalk from "chalk";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Global logger
 * 
 * @public
 * @type {Function}
 */
const log = logger();

/**
 * Bundles all applications separated by ','
 * 
 * @public
 * @param {Array<String>} args 
 * @returns {Promise<Array>}
 */
const bundler = async function (args)
{
       return await build(minimal(args), log)
};

/**
 * Begin bundling from the provided @see process arguments
 */
bundler(getProcessArguments()).then((reports) =>
{
       if (Array.isArray(reports) && reports.length > 0)
       {
              const length = reports.length;
              let index = 0;

              let status = [ `\n${chalk.bgBlackBright.whiteBright(`  Summary  ${chalk.yellowBright(getTimeString())}  `)}\nTotal\t${chalk.yellowBright(length)}` ];

              for (; index < length; ++index)
              {
                     const report = reports[ index ];

                     const name = report[ "app" ];
                     const state = report[ "status" ] ? ok() : error();

                     status.push(`App ${chalk.yellowBright(name)}\t${state}`);
              }

              log(chalk.greenBright(`${status.join("\n")}`), false);
       }
});

