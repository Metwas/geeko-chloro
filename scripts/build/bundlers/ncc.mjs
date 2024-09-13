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

import { writeFile, mkdirSync } from "node:fs";
import { clean } from "../tools/file.mjs";
import { join } from "node:path";
import ncc from '@vercel/ncc';

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Invokes the @see ncc bundler API to create a single minified .js executable
 * 
 * @public
 * @param {String} app 
 * @param {Object} options 
 * @param {Function} log
 * @returns {Promise<Boolean>}
 */
export const build = async (app, options, log) =>
{
       try
       {
              const result = await ncc(options[ "main" ], {
                     filterAssetBase: process.cwd(),
                     assetBuilds: false,
                     target: 'es2015',
                     minify: true,
                     quiet: true,
              });

              if (typeof result?.[ "code" ] === "string")
              {
                     const destination = options[ "output" ];
                     const code = result[ "code" ];

                     const name = `${app}.js`;

                     /** Remove any existing code */
                     clean(destination);
                     mkdirSync(destination, { recursive: true });

                     const create = () =>
                     {
                            return new Promise((resolve, reject) =>
                            {
                                   writeFile(join(destination, name), code, async (error) =>
                                   {
                                          if (error)
                                          {
                                                 return reject(error);
                                          }

                                          resolve(true);
                                   });
                            });
                     };

                     return await create();
              }

              return false;
       }
       catch (error)
       {
              console.error(error);
              return {
                     error: error.message
              };
       }
};