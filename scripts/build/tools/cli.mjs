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

import { createLogUpdate } from "log-update";
import { cursor } from "sisteransi";
import { sleep } from "./time.mjs";
import chalk from "chalk";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * CLI usage printable information
 * 
 * @public
 * @type {String}
 */
export const usage = `Usage: --app <app> <opts>

Options:
  -t,  --target            Build/bundler target (defaults to nest)
  -o,  --out [file]        Output directory for build (defaults to dist)
  -v,  --verbose           Outputs all stdout, stderr logs
  -c,  --skip-compile      Skips main application compiling
  -b,  --skip-bundle       Skips application asset bundling
  -e,  --env               Specify environment for configuration & asset files
`;

/**
 * Gets the current @see process arguments offset by the headers (2)
 * 
 * @public
 * @returns {Array<String>}
 */
export const getProcessArguments = function ()
{
       return process[ "argv" ].slice(2);
};

/**
 * Gradient color list
 * 
 * @public
 * @type {Array<String>}
 */
const COLORS = [
       "#883AE3",
       "#7B30E7",
       "#6B22EF",
       "#5711F8",
       "#3640FC",
       "#2387F1",
       "#3DA9A3",
       "#47DA93",
].reverse();

/**
 * @see COLORS gradient frames
 * 
 * @public
 * @type {Array<String>}
 */
const GRADIENT_FRAMES = [
       ...Array.from({ length: COLORS.length - 1 }, () => COLORS[ 0 ]),
       ...COLORS,
       ...Array.from({ length: COLORS.length - 1 }, () => COLORS[ COLORS.length - 1 ]),
       ...[ ...COLORS ].reverse(),
];

/**
 * Returns the sliced frames with @see offset
 * 
 * @public
 * @param {Number} offset 
 * @returns {Array<String>}
 */
const frame = function (offset = 0) 
{
       const frames = GRADIENT_FRAMES.slice(offset, offset + (COLORS.length - 2));

       if (frames.length < COLORS.length - 2)
       {
              const filled = new Array(COLORS.length - frames.length - 2).fill(COLORS[ 0 ]);
              frames.push(...filled);
       }

       return frames;
};

const GRADIENT = [ ...GRADIENT_FRAMES.map((_, i) => frame(i)) ].reverse();

/**
 * Creates a mapped @see Array containing the progress bars referencing the @see COLORS array
 * 
 * @public
 * @returns {Array<String>}
 */
const mapGradientAnimation = function ()
{
       return GRADIENT.map(
              (colors) => " " + colors.map((g) => chalk.hex(g)("▓")).join("")
       );
};

/**
 * Creates an OK status badge with the optional message
 * 
 * @public
 * @param {String} message 
 * @returns {String}
 */
export const ok = (message) =>
{
       return `${chalk.bgGreenBright.whiteBright(" OK ")}${message ? chalk.greenBright(message) : ""}`;
};

/**
 * Creates an ERROR status badge with the optional error message
 * 
 * @public
 * @param {String} message 
 * @returns {String}
 */
export const error = (message) =>
{
       return `${chalk.bgRedBright.whiteBright(` FAIL `)}${message ? chalk.redBright("\t" + message) : ""}`;
};

/**
 * Creates a new progress indicator @see log-update function
 * 
 * @public
 * @returns {Function}
 */
export const logger = () =>
{
       const logUpdate = createLogUpdate(process.stdout);
       const frames = mapGradientAnimation();
       let done = false;
       let i = 0;

       return function (text, loader = true) 
       {
              if (text === false)
              {
                     done = true;
                     logUpdate.done();
                     return;
              }

              if (done === true)
              {
                     done = false;
              }

              process.stdout.write(cursor.hide);

              const loop = async (text) =>
              {
                     if (done)
                     {
                            return;
                     }

                     if (i < frames.length - 1)
                     {
                            i++;
                     }
                     else
                     {
                            i = 0;
                     }

                     if (loader)
                     {
                            let frame = frames[ i ];
                            logUpdate(`${text}${frame}`);

                            if (done === false)
                            {
                                   await sleep(40);
                            }

                            loop(text);
                     }
                     else
                     {
                            logUpdate(text);
                     }
              };

              loop(text);
       };
}