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

/**
 * @see RegExp for matching non alphabet & decimal charactors
 * 
 * @public
 * @type {String}
 */
export const NON_CHAR_REG: RegExp = /[^a-z-A-Z\d]/g;

/**
 * Script query key
 * 
 * @public
 * @type {String}
 */
export const SCRIPT_KEY_TAG: string = "script";

/**
 * Script identifer helper
 * 
 * @public
 * @returns {String}
 */
export const getScriptIndentifier = (): string =>
{
       /** Attempt to get script from @see Window location */
       const href: string = window.location.href;
       const script: string = extractKeyFromUrl( href, SCRIPT_KEY_TAG );

       return script;
};

/**
 * Attempts to extract the specified @see String key from the provided @see String url
 * 
 * @public
 * @param {String} url 
 * @param {String} key
 * @returns {String}
 */
export const extractKeyFromUrl = ( url: string, key: string ): string =>
{
       if ( typeof url !== "string" || !url || typeof key !== "string" || !key )
       {
              return null;
       }

       let index: number = url.indexOf( key );

       if ( index === -1 )
       {
              return null;
       }

       index += key.length + 1;
       const length: number = url.length;
       let value: string = "";

       for ( ; index < length; ++index )
       {
              const char: string = url[ index ];

              if ( char.match( NON_CHAR_REG )?.length > 0 )
              {
                     break;
              }

              value += char;
       }

       return value;
};