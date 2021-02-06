import { Socket, } from "socket.io";
import socket from 'socket.io'

const io = require('socket.io')();

const router = new Router();
io.use((socket: Socket) => router)



class Router {
    private _sockets: Array<Socket> = [];
    private listenersMap: Map<string, Function> = new Map();
    public constructor() {
        // @ts-ignore 
        return this.newSocket.bind(this);
    }
    public () {
        
    }

    
    public get listeners() : Array<string> {
        return [...this.listenersMap.keys()]
    }

    public on(eventName: string, callback: (socket: Socket )=>void):void {
        this.listenersMap.set(eventName, callback)
    }

    public removeEvent(eventName: string): void {
        this.listenersMap.delete(eventName)
    }

    private onEvent(event: string, message: any): void {
        const socket = arguments.callee.caller.;
        const handler = this.listenersMap.get(event)
        if (handler) handler(message)
    }

    private newSocket(socket: Socket) {
        socket.onAny(this.onEvent)
        this._sockets.push(socket)
    }
}
