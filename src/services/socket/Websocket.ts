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

import { Spectra, ProtocolFrame, StackTokenPool, QueueManager, Serializable, JsonLike, JOB_COMPLETE_EVENT, JOB_FAIL_EVENT, Job } from "@geeko/serialization";
import { WATCHDOG_DEFAULT_KICK_INTERVAL } from "../../global/watchdog.tokens";
import { WebSocketWriteOptions } from "../../types/WebSocketWriteOptions";
import { CHANNEL_RESPONSE_EVENT } from "../../global/socket.defaults";
import { EXP_DELAY_STRATEGY } from "../../tools/retry.strategies";
import { WebSocketOptions } from "../../types/WebSocketOptions";
import { MessageResponse } from "../../types/MessageResponse";
import { createSocketId, getSocketId } from "./socket.id";
import { getScriptIndentifier } from "../../tools/search";
import { Connector } from "../../types/Connector";
import { Endpoint } from "../../types/Endpoint";
import { Ticket } from "../../types/Ticket";
import { EventEmitter } from "tseep";

/**_-_-_-_-_-_-_-_-_-_-_-_-_-          _-_-_-_-_-_-_-_-_-_-_-_-_-*/

/**
 * @see WebSocket protocol path regex cleaner
 * 
 * @private
 * @type {RegExp}
 */
const PROTOCOL_PATH_REGEX: RegExp = /[:/]/g;

/**
 * Default @see TXStreamHandler request timeout in milliseconds
 * 
 * @public
 * @type {Number}
 */
export const DEFAULT_REQUEST_TIMEOUT: number = 5000;

/**
 * @see Websocket connection message queue manager
 * 
 * @public
 */
export class WebsocketManager extends EventEmitter
{
       /**
        * Provide optional @see WebSocketOptions to initiate the @see WebSocket connection manager
        * 
        * @public
        * @param {WebSocketOptions} options
        */
       public constructor( options?: WebSocketOptions )
       {
              super();

              this._tx.onProcess = this.onRequestProcess.bind( this );
              this._tx.onComplete = this.onRequestComplete.bind( this );
              this._rx.onProcess = this.onReceiveProcess.bind( this );

              /** Initialize @see StackTokenPool */
              this._tokens = new StackTokenPool( options?.[ "maxTokenPool" ] );

              const watchdog: boolean | number = options?.[ "watchdog" ];

              if ( watchdog !== false )
              {
                     if ( typeof options?.[ "watchdogKickEvent" ] === "string" )
                     {
                            this._watchdogKickEvent = options[ "watchdogKickEvent" ];
                     }

                     const delay: number = ( typeof watchdog === "number" && watchdog > 0 ) ? watchdog : WATCHDOG_DEFAULT_KICK_INTERVAL;
                     /** Enable @see Watchdog feature */
                     this._watchdog( delay );
              }

              /** Assign the default @see Spectra protocol */
              this._protocol = options.protocol ?? new Spectra();
       }

       /**
        * @see Websocket remote connections references
        * 
        * @private
        * @type {Map<string, Connector>}
        */
       private _connections: Map<string, Connector> = new Map();

       /**
        * @see Watchdog interval timer reference
        * 
        * @private
        */
       private _wInterval: any = -1;

       /**
        * Server-side kick event listener which gets serialized with the @see this._watchdogPayload
        * 
        * @private
        * @type {String}
        */
       private _watchdogKickEvent: string = "watchdog_kick";

       /**
        * @see Watchdog serialized kick message for the current running @see Script
        * 
        * @private
        * @type {String}
        */
       private _watchdogPayload: string = null;

       /**
        * Received @see Job processing queue
        * 
        * @private
        * @type {QueueManager}
        */
       private _rx: QueueManager = new QueueManager();

       /**
        * Request @see Job processing queue
        * 
        * @private
        * @type {QueueManager}
        */
       private _tx: QueueManager = new QueueManager();

       /**
        * @see Job Key/token generator helper
        * 
        * @private
        * @type {StackTokenPool}
        */
       private _tokens: StackTokenPool = null;

       /**
        * Streaming @see Buffer frame protocol
        * 
        * @protected
        * @returns {BufferProtocolFrame}
        */
       private _protocol: ProtocolFrame<any, string> = null;

       /**
        * @see WebSocket connection retry strategy
        * 
        * @public
        * @type {Function}
        */
       public retryStrategy: Function = EXP_DELAY_STRATEGY;

       /**
        * Creates a new @see Endpoint connection returning the @see WebSocket reference if connected succesfully
        * 
        * @public
        * @param {Endpoint} options 
        * @returns {WebSocket}
        */
       public connect( options: Endpoint ): WebSocket
       {
              if ( !options )
              {
                     return;
              }

              let url: string = options[ "url" ];

              if ( typeof url !== "string" || !url )
              {
                     const host: string = options[ "host" ];
                     const port: number = options[ "port" ];

                     if ( typeof host !== "string" || !host || typeof port !== "number" || port <= 0 )
                     {
                            return;
                     }

                     const protocol = options[ "protocol" ] || "ws";
                     url = `${protocol.replace( PROTOCOL_PATH_REGEX, "" )}://${host}:${port}`;
              }

              const socket: WebSocket = this._connect( url );
              return socket;
       }

       /**
        * Sends a message out on the connected @see WebSocket endpoints.
        * 
        * @Note This will broadcast by default, otherwise you can specify the @see String socket id
        * 
        * @public
        * @param {Serializable | JsonLike} data 
        * @param {WebSocketWriteOptions} options
        * @param {Function} next
        * @returns {Job}
        */
       public send( data: Serializable | JsonLike, options?: WebSocketWriteOptions, next?: ( error?: string, data?: any ) => void ): Job
       {
              if ( !data )
              {
                     return;
              }

              const id: Ticket = options?.id ?? this._tokens.claim();

              const job: Job = new Job( id, {
                     timeout: options?.timeout,
                     source: options?.source,
                     reply: options?.reply,
                     payload: data
              } );

              this._tx.add( job );

              if ( typeof next === "function" )
              {
                     job.once( JOB_COMPLETE_EVENT, data => next( void 0, data ) );
                     /** Return @see String error message if @see Job failed */
                     job.once( JOB_FAIL_EVENT, error => next( error, void 0 ) );
              }

              return job;
       }

       /**
        * Completes the requested @see Job by Id and updating the payload information
        * 
        * @protected
        * @param {Job} job 
        */
       protected receive( job: Job ): void
       {
              const existing: Job = this._tx.get( job.id );

              if ( existing )
              {
                     existing.payload = job.payload;
                     existing.complete();
              }

              /** Finally complete @see Job  */
              job.complete();
       }

       /**
        * Received @see Job processing event handler
        * 
        * @protected
        * @param {Job} job 
        */
       protected onReceiveProcess( job: Job ): void
       {
              try
              {
                     const payload: any = job.payload;

                     const source: Ticket = job.source;
                     const reply: boolean = job.reply;

                     this.emit( CHANNEL_RESPONSE_EVENT, payload, source );

                     /** Handle any response based @see Job if @see reply has been set */
                     if ( reply === true )
                     {
                            /** Pass to @see _tx to handle response @see Job ticket */
                            return this.receive( job );
                     }

                     job.complete();
              }
              catch ( error )
              {
                     if ( job )
                     {
                            job.fail( error );
                     }
              }
       }

       /**
        * Request @see Job processing event handler
        * 
        * @protected
        * @param {Job} job 
        */
       protected onRequestProcess( job: Job ): void
       {
              const payload: any = job.payload;
              const source: string = job.source;
              const reply: boolean = job.reply;
              const id: Ticket = job.id;

              /** Broadcast if no @see String socket identifer was given */
              const broadcast: boolean = !source;

              /** Frame & encode using the configured @see ProtocolFrame */
              const encoded: Serializable = this._protocol.frame( payload, {
                     source: void 0,
                     reply: reply,
                     id: id
              } );

              for ( let connector of this._connections.values() )
              {
                     const socket: WebSocket = connector.socket;
                     const socketId: string = getSocketId( socket );

                     if ( broadcast === true || ( socketId === source ) )
                     {
                            if ( socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING )
                            {
                                   continue;
                            }

                            socket.send( encoded );
                     }
              }

              const timeout: number = job.timeout;
              /** Complete @see Job at this stage if reply is not expected */
              if ( !timeout || timeout <= 0 )
              {
                     job.complete();
              }
              else
              {
                     /** Set @see Job expiry */
                     job.expiry( timeout ?? DEFAULT_REQUEST_TIMEOUT );
              }
       }

       /**
        * @see Job complete event handler
        * 
        * @protected
        * @param {Job} job 
        */
       protected onRequestComplete( job: Job ): void
       {
              /** Release @see Job.id back into the token pool */
              this._tokens.free( job.id );
       }

       /**
        * Creates a new @see Endpoint connection returning the @see WebSocket reference if connected succesfully
        * 
        * @public
        * @param {String} url
        * @param {Endpoint} options 
        * @returns {WebSocket}
        */
       private _connect( url: string, options?: { token?: string, retries?: number } ): WebSocket
       {
              const socket: WebSocket = new WebSocket( url );
              /** Override if @see String token was specified */
              const token: string = createSocketId( socket, ( token: string ): string =>
              {
                     return options?.[ "token" ] || token;
              } );

              /** Set received message type as an @see ArrayBuffer */
              socket.binaryType = 'arraybuffer';

              socket.onmessage = this.onmessage.bind( this, token );
              socket.onclose = this.onclose.bind( this, token );
              socket.onerror = this.onerror.bind( this, token );
              socket.onopen = this.onopen.bind( this, token );

              this._connections.set( getSocketId( socket ), {
                     attempts: options?.[ "retries" ] || 0,
                     socket: socket,
                     options: {
                            url: url
                     },
              } );

              return socket;
       }

       /**
        * @see WebSocket on open event handler
        * 
        * @protected
        * @param {String} token 
        * @param {Event} event
        */
       protected onopen( token: string, event: Event ): void
       {
              const connector: Connector = this._connections.get( token );
              /** Reset retry counter */
              connector[ "attempts" ] = 0;

              /** Send script @see refer identifier information to server */
              const script: string = getScriptIndentifier();

              if ( script )
              {
                     this.send( {
                            event: "status",
                            refer: script,
                            ok: true
                     } );
              }

              this.emit( "connect", connector[ "socket" ] );
       }

       /**
        * @see WebSocket on message event handler
        * 
        * @protected
        * @param {String} source 
        * @param {Event} event
        */
       protected onmessage( source: string, event: Event ): void
       {
              try
              {
                     const message: string = event[ "data" ];
                     /** Reject invalid @see Job requests */
                     if ( !message )
                     {
                            return;
                     }

                     /** Unwrap using the set @see ProtocolFrame */
                     const unwrap: Job = this._protocol.unwrap( message );

                     if ( !unwrap )
                     {
                            return;
                     }

                     unwrap.source = source;
                     /** Queue a new @see Job */
                     this._rx.add( unwrap );
              }
              catch ( error )
              {
                     console.error( error.message );
              }
       }

       /**
        * @see WebSocket on close/reconnect event handler
        * 
        * @protected
        * @param {String} token 
        * @param {Event} event
        */
       protected onclose( token: string, event: Event ): void
       {
              const connector = this._connections.get( token );
              this.clean( connector?.[ "socket" ] );

              if ( !connector )
              {
                     return;
              }

              this._connections.delete( token );

              if ( typeof this.retryStrategy === "function" )
              {
                     const retry = connector[ "attempts" ] + 1;
                     const delay: number = this.retryStrategy( retry || 1 );

                     const url: string = connector[ "options" ]?.url;

                     if ( delay > 0 && typeof url === "string" )
                     {
                            setTimeout( () =>
                            {
                                   this._connect( url, {
                                          retries: retry,
                                          token: token
                                   } );
                            }, delay );
                     }
              }

              this.emit( "close", connector[ "socket" ] );
       }

       /**
        * @see WebSocket on error event handler
        * 
        * @protected
        * @param {String} token 
        * @param {Event} event
        */
       protected onerror( token: string, event: Event ): void
       {
              this.emit( "error", event[ "data" ] );
       }

       /**
        * @see WebSocket event cleaner function
        * 
        * @protected
        * @param {WebSocket} socket
        */
       protected clean( socket: WebSocket ): void
       {
              if ( socket )
              {
                     socket.onerror = null;
                     socket.onmessage = null;
                     socket.onclose = null;
                     socket.onopen = null;

                     socket.close();
              }
       }

       /**
        * @see Watchdog kick interval
        * 
        * @private
        * @param {Number} delay 
        */
       private _watchdog( delay: number ): void
       {
              try
              {
                     clearTimeout( this._wInterval );

                     if ( !this._watchdogPayload )
                     {
                            this._watchdogPayload = this._protocol.frame( {
                                   event: this._watchdogKickEvent,
                                   script: getScriptIndentifier()
                            } );
                     }

                     /**
                      * Send @see WATCHDOG_KICK_EVENT event payload too all connected @see this._connections
                      */
                     this.send( this._watchdogPayload, { reply: false } );
              }
              catch ( error )
              {
                     console.error( error.message );
              }

              this._wInterval = setTimeout( this._watchdog.bind( this ), delay, delay );
       }
}

/**
 * Creates a resolved @see Promise<MessageResponse> containing the specified error message
 * 
 * @public
 * @param {String | Error} message 
 * @returns {Promise<MessageResponse>}
 */
function responseError( message: Error | string ): Promise<MessageResponse>
{
       return Promise.resolve( {
              error: message,
       } );
}
