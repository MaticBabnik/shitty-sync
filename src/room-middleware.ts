import { Socket } from "socket.io";
import {Room} from './Room';
import User from './User';

import './misc/socket.io.augments' //this enables us to access .ctx on a socket

const roomRegex = /(room\/)([a-z0-9\-]{3,16})(\/|$)/i;


export function wsCtx(roomMap:Map<string,Room>, debug:boolean) {
    return (socket:Socket, next:(error?:any)=>void)=>{
        const roomId = socket.request.headers.referer?.match(roomRegex)?.[2].toUpperCase();

        if (!roomId) {

            socket.send('error',{m:'invalid room id'});

            if (debug) console.log('[ws-ctx] invalid room');

            next(new Error('Invalid room'));
            
        }else{

            // create the room if it doesn't exist
            if (!roomMap.get(roomId)) {

                roomMap.set(roomId,new Room(roomId,socket.id));
                if (debug) console.log(`[ws-ctx] User ${socket.id} created room ${roomId}`);
            }else{
                roomMap.get(roomId)?.users.set(socket.id,new User(socket.id));
                if (debug) console.log(`[ws-ctx] Socket ${socket.id} joined room ${roomId}`);
            }
            socket.join(roomId); //this has to be in else, otherwise TS is mad


            socket.onAny((eventName:string)=>{
                if (debug) console.log(`[ws-ctx] socket: ${socket.id} event: ${eventName}`);
                
                let rooms = Array.from(socket.rooms).filter(x=>x !== socket.id);
                socket.socketRoom = roomMap.get(rooms[0])
                if (debug) console.log(`[ws-ctx] set socket.ctx to room ${roomId}`);
            })

            socket.on('disconnect',()=>{
                const room = roomMap.get(roomId);
                if (!room) throw "User left a room that doesn't exist???";
                room?.users.delete(socket.id);
                if (debug) console.log(`[ws-ctx] User ${socket.id} left`);
                if (room.users.size === 0){
                    if (debug) console.log(`[ws-ctx] Room ${roomId} is empty, deleting`);
                    if (!roomMap.delete(roomId)) {
                        throw "Failed to delete room!";
                    }
                }
            })
        }
        
        next();
    }
}