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

import { readFileSync, existsSync, writeFile, readFile, mkdirSync, readdirSync, statSync, unlinkSync, rmdirSync, readdir } from "node:fs";
import { resolve, sep, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

/**
 * Supported entry names for the application executables
 * 
 * @public
 * @type {Array<String>}
 */
export const APPLICATION_INDEX_FILES = [
       "index",
       "main"
];

/**
 * Supported extension types for the bundlers
 * 
 * @public
 * @type {Array<String>}
 */
export const APPLICATION_INDEX_EXTENSIONS = [
       ".ts",
       ".js"
];

/**
 * Application common resource directory name
 * 
 * @public
 * @type {String}
 */
export const APP_COMMON_DIRECTORY = "common";

/**
 * Root @see assets path
 * 
 * @public
 * @type {String}
 */
export const ROOT_ASSETS_PATH = resolve(__dirname, "../../../assets");

/**
 * Bundles assets defined in the provided @see options.destination
 * 
 * @param {Object} options 
 * @returns {Promise<void>}
 */
export const bundleAssets = async function (options)
{
       try
       {
              const destination = options[ "destination" ];

              const assetsPath = ROOT_ASSETS_PATH;
              const commonPath = join(assetsPath, APP_COMMON_DIRECTORY);
              const overrides = join(assetsPath, options[ "environment" ]);
              /** First, attempt to copy the @see common default files */
              if (existsSync(commonPath) === true)
              {
                     /** Copy all asset files/directories from the @see assetsPath directory */
                     await copy({
                            verbose: options[ "verbose" ],
                            destination: destination,
                            path: commonPath
                     });
              }

              /** Depending on the @see environment copy and replace any overrides within the @see common directory */
              if (existsSync(overrides) === true)
              {
                     await copy({
                            verbose: options[ "verbose" ],
                            destination: destination,
                            path: overrides
                     });
              }

              return true;
       }
       catch (error)
       {
              return {
                     error: error.message
              };
       }
};

/**
 * Copies over all directories & files from the specified @see String path to the specified @see String destination
 * 
 * @public
 * @param {String} path 
 * @returns {Promise<void>}
 */
export const copy = function (options)
{
       return new Promise((resolve, _) =>
       {
              const { path, destination } = options;

              readdir(path, async (error, files) =>
              {
                     if (error)
                     {
                            return resolve(null);
                     }

                     const length = files.length;
                     let index = 0;

                     let promises = [];

                     for (; index < length; ++index)
                     {
                            try
                            {
                                   const file = files[ index ];
                                   const filePath = join(path, file);
                                   const destinationPath = join(destination, file);

                                   if (statSync(filePath).isDirectory() === true)
                                   {
                                          /** Create new directory at @see destination */
                                          if (existsSync(destinationPath) === false)
                                          {
                                                 mkdirSync(destinationPath, { recursive: true });
                                          }

                                          await copy({
                                                 destination: destinationPath,
                                                 path: filePath
                                          });
                                   }
                                   else
                                   {
                                          if (options[ "verbose" ] === true)
                                          {
                                                 console.log(`${chalk.green("CREATE")} ${chalk.yellow("FILE")} ${destinationPath}`);
                                          }

                                          /** Write file at @see destination - This will by default replace any existing files */
                                          promises.push(readWriteAsync({
                                                 destination: destinationPath,
                                                 path: filePath
                                          }));
                                   }
                            }
                            catch (error) { console.log(error) }
                     }

                     await Promise.all(promises);
                     resolve();
              });
       });
};

/**
 * Gets the main entry absolute path for the given application @see String name
 * 
 * @public
 * @param {String} name 
 * @returns {String}
 */
export const getApplicationMain = function (name)
{
       const root = resolve(__dirname, "../../../");
       const path = `${root}${sep}${name}`;

       /** Check if application @see name directory exists */
       if (existsSync(path) === true)
       {
              const eLength = APPLICATION_INDEX_EXTENSIONS.length;
              const length = APPLICATION_INDEX_FILES.length;
              let index = 0;

              for (; index < length; ++index)
              {
                     const main = APPLICATION_INDEX_FILES[ index ];
                     let eIndex = 0;

                     for (; eIndex < eLength; ++eIndex)
                     {
                            const extension = APPLICATION_INDEX_EXTENSIONS[ eIndex ];
                            const filePath = `${path}${sep}src${sep}${main}${extension}`;

                            if (existsSync(filePath) === true)
                            {
                                   /** Return the first result */
                                   return filePath;
                            }
                     }
              }
       }

       return null;
};

/**
 * Reads and writes to & from the given path parameters asynchronously
 * 
 * @public
 * @param {Object} options 
 * @returns {Promise<Buffer>}
 */
export const readWriteAsync = function (options)
{
       const { path, destination } = options;

       return new Promise((resolve, _) =>
       {
              readFile(path, (error, buffer) =>
              {
                     if (error)
                     {
                            return resolve();
                     }

                     writeFile(destination, buffer, (error) =>
                     {
                            resolve(buffer);
                     });
              });

       });
};

/**
 * Loads the root @see tsconfig.json file
 * 
 * @public
 * @param {Boolean} quiet 
 * @returns {Object}
 */
export const loadRootTsConfig = function (quiet)
{
       try
       {
              const rootPath = resolve(__dirname, "../../tsconfig.json");
              const file = readFileSync(rootPath);

              return JSON.parse(file);
       }
       catch (error)
       {
              if (!quiet)
              {
                     console.error(error.message);
              }
       }
};

/**
 * Recusively cleans all files and directories from the given @see String path
 * 
 * @public
 * @param {String} path 
 */
export const clean = function (path)
{
       try
       {
              const resolved = resolve(path);

              if (existsSync(resolved) === false)
              {
                     return;
              }

              const files = readdirSync(resolved);
              const length = files.length;
              let index = 0;

              for (; index < length; ++index)
              {
                     const file = files[ index ];
                     const filePath = join(resolved, file);

                     /** Recursively clean/unlink files within the @see directory */
                     if (statSync(filePath).isDirectory() === true)
                     {
                            clean(filePath);
                     }
                     else
                     {
                            unlinkSync(filePath);
                     }
              }

              /** Finally remove directory @see resolved */
              rmdirSync(resolved);
       }
       catch (error) { }
};