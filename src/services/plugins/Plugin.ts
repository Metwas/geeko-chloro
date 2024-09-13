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

import { PluginOptions } from "../../types/PluginOptions";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Plugin service interface which attaches to the @see window object
 * 
 * @public
 */
export abstract class Plugin
{
       /**
        * Initializes self and attaches to the @see window global object by @see String name & @see String version
        * 
        * @public
        * @param {PluginOptions} options 
        */
       public constructor( options: PluginOptions )
       {
              const name: string = options?.[ "name" ];
              const version: string = options?.[ "version" ];

              if ( ( typeof name !== "string" || !name ) || ( typeof version !== "string" || !version ) )
              {
                     throw new TypeError( "Invalid plugin name and/or version was not given" );
              }

              this.name = name;
              this.version = version;
              /** Attempt to connect to provided @see Endpoint or default @see DEFAULT_ENDPOINT */
              this.initialize( options );
       }

       /**
        * Plugin name which gets assigned to the @see Window object
        * 
        * @private
        * @type {String}
        */
       private readonly name: string = "";

       /**
        * Plugin version
        * 
        * @private
        * @type {String}
        */
       private readonly version: string = "";

       /**
        * Option if this plugin can be overritten with the same name
        * 
        * @public
        */
       public overridable: boolean = true;

       /**
        * Initializes self and attaches to the @see window global object by @see String name & @see String version
        * 
        * @public
        * @param {PluginOptions} options 
        */
       protected initialize( options?: PluginOptions ): void
       {
              /** Add @see Plugin self to the window or global object */
              if ( window )
              {
                     const token: string = this.createToken();

                     if ( this.overridable === false && Object.prototype.hasOwnProperty.call( window, token ) === true )
                     {
                            console.error( `Plugin: ${token} has already been attached` );
                            return;
                     }

                     window[ token ] = this;
              }
       }

       /**
        * Plugin name & version tokenizer
        * 
        * @private
        * @returns {String}
        */
       private createToken(): string
       {
              return this.name;
       }
}