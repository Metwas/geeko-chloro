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

import { NetworkPluginOptions } from "../../types/PluginOptions";
import { WebsocketManager } from "../socket/Websocket";
import { Endpoint } from "../../types/Endpoint";
import { Plugin } from "./Plugin";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Standard front-end plugin for the Leaf scripting templates
 * 
 * @public
 */
export class LeafPlugin extends Plugin
{
       /**
        * Iniitalizes the @see Plugin with the provided @see NetworkPluginOptions
        * 
        * @public
        * @param {NetworkPluginOptions} options 
        */
       public constructor( options: NetworkPluginOptions )
       {
              super( options );
              /** Initialize @see WebSocket management service */
              this.channels = new WebsocketManager();
       }

       /**
        * @see WebSocket connection/service management provider
        * 
        * @protected
        * @type {WebsocketManager}
        */
       protected channels: WebsocketManager = null;

       /**
        * Connects to the specified @see Endpoint(s) over the @see WebSocket interface
        * 
        * @public
        * @param {Endpoint | Array<Endpoint>} endpoints 
        */
       public connect( endpoints: Endpoint | Array<Endpoint> ): void
       {
              endpoints = Array.isArray( endpoints ) ? endpoints : [ endpoints ];

              const length: number = endpoints.length;
              let index: number = 0;

              for ( ; index < length; ++index )
              {
                     this.channels.connect( endpoints[ index ] );
              }
       }
}