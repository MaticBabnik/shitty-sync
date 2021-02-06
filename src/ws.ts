import { Socket } from "socket.io";
import {  } from "socket.io-events";


enum MediaType {
    Offline,
    VideoFile,
    Youtube //maybe ?
}

interface IRoomStatus {
    mediaType:MediaType,
    mediaUrl:string,
    mediaPlaying:boolean,
    mediaTime:Number
}

interface IUser {
    name:string,
    id:string
}

interface IRoom {
    roomId: string,
    ownerId: string,
    status: IRoomStatus,
    users: Map<string,IUser>
}


const rooms = new Map<string,IRoom>();


export default function onConnect(socket:Socket) {

}