import { Socket } from "socket.io";



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



const aroomMap = new Map<string, IRoom>();


export default function wsCtx(roomMap:Map<string,IRoom>) {
    return (socket:Socket,next:(error?:any)=>void)=>{
        socket.onAny((eventName:string)=>{
            // http://yeet.si/room/xd/
            const room  = socket.request.headers.referer?.split('/').filter(x=>x.length>0).pop();
        })
    }
}