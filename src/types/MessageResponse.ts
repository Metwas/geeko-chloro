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

import { WebSocketWriteOptions } from "./WebSocketWriteOptions";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * @see WebSocket request function type
 * 
 * @public 
 */
export type ChannelSender = ( message: Buffer, options?: WebSocketWriteOptions ) => Promise<MessageResponse>;

/**
 * @see WebSocket response type
 * 
 * @public
 */
export type MessageResponse = {
       /**
        * Message response to client via @see Connector if specified
        * 
        * @public
        * @type {Object | String | Buffer}
        */
       message?: any;

       /**
        * Response error message
        * 
        * @public
        * @type {Error | String}
        */
       error?: Error | string

       /**
        * @see Channel response sender which binds to the last request
        * 
        * @public
        * @type {ChannelSender}
        */
       send?: ChannelSender;

       /**
        * Connector Identifier
        * 
        * @public
        * @type {Number}
        */
       connector?: number;
}