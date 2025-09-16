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

import { DEFAULT_ENDPOINT } from "./global/socket.defaults";
import { LeafPlugin } from "./services/plugins/leaf";
import { Endpoint } from "./types/Endpoint";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * Remote websocket URL
 * 
 * @public
 * @type {String}
 */
const LEAF_WEBSOCKET_URL: string = "$URL";

/**
 * Autoconnect flag for the @see LeafPlugin websocket
 * 
 * @public
 * @type {String}
 */
const WEBSOCKET_AUTO_CONNECT: string = "$AUTO_CONNECT";

( (): void =>
{
       const remote: Endpoint = {
              url: LEAF_WEBSOCKET_URL
       };

       const leaf: LeafPlugin = new LeafPlugin( {
              name: "leaf",
              version: "0.0.1"
       } );

       if ( WEBSOCKET_AUTO_CONNECT === "1" || WEBSOCKET_AUTO_CONNECT === "$AUTO_CONNECT" )
       {
              /** Autoconnect @see Endpoint */
              leaf.connect( ( remote[ "url" ] !== "$URL" ? remote : DEFAULT_ENDPOINT ) );
       }
} )();