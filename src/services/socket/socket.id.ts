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
 * @see WebSocket id token
 * 
 * @type {String}
 */
const SOCKET_ID_TOKEN: string = "__SOCKET_ID__";

/**
 * Attaches a unique @see String token to the provided @see WebSocket
 * 
 * @public
 * @param {WebSocket} socket 
 * @param {Function} transform
 */
export const createSocketId = ( socket: WebSocket, transform?: ( token: string ) => string ): string =>
{
       if ( socket )
       {
              let token: string = String( Date.now() );

              if ( typeof transform === "function" )
              {
                     token = transform( token ) || token;
              }

              socket[ SOCKET_ID_TOKEN ] = token;

              return token;
       }
};

/**
 * Gets the assigned @see SOCKET_ID_TOKEN token from the provided @see WebSocket
 * 
 * @public
 * @param {WebSocket} socket 
 * @returns {String} 
 */
export const getSocketId = ( socket: WebSocket ): string =>
{
       if ( typeof socket?.[ SOCKET_ID_TOKEN ] === "string" )
       {
              return socket[ SOCKET_ID_TOKEN ];
       }
};