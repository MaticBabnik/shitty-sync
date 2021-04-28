/*
------------------------------------------------
!   Sync.ts - Server side socket code
?   Most of this is prolly quite bad,    
?   but the OOP code makes my C#
?   mind happy.
------------------------------------------------
*/


import { Socket } from "socket.io";
import { MESSAGE_COOLDOWN, nameRegex, RENAME_COOLDOWN, roomRegex } from './misc/constants'


export class RoomManager {
    public io: Socket;
    private rooms: Map<string, Room>;

    constructor(io: Socket, options?: any) {
        this.rooms = new Map<string, Room>();
        this.io = io;
        io.on('connect', socket => {
            socket.on('ping', (args: any) => this.ping(socket, args));
            socket.on('synctime', (args: any) => this.synctime(socket, args));
            socket.on('testtime', (args: any) => this.testtime(socket, args));

            socket.on('joinroom', (args: any) => this.joinroom(socket, args));
        })
    }



    public deleteRoom(id: string) {
        
        this.rooms.delete(id);
    }

    private joinRoom(id: string, socket: Socket) {
        let room = this.rooms.get(id);

        if (!room) {
            room = new Room(id, this, socket);
            this.rooms.set(id, room);
        }

        room.join(socket);
    }

    private ping(socket: Socket, args: any) {
        socket.emit('pingret');
    }
    private synctime(socket: Socket, args: any) {
        socket.emit('synctime', Date.now() + (args?.latency ?? 0) / 2);
    }
    private testtime(socket: Socket, args: any) {
        socket.emit('testtime', Date.now() - args.time ?? 0);
    }

    private joinroom(socket: Socket, roomId: any) {
        if (typeof (roomId) !== "string") return;
        if (!roomRegex.test(roomId)) return;

        
        this.joinRoom(roomId, socket);
    }

}

export class Room {
    public id: string;
    public roomManager: RoomManager;
    private users: Map<string, User>;
    public owner: string;

    public serialize() {
        return {
            id: this.id,
            media: null,
            users: Array.from(this.users.values(), x => x.serialize())
        }
    }

    public join(socket: Socket) {
        

        socket.join(this.id);
        this.users.set(socket.id, new User(socket, this));

        //notify the other users
        this.syncRoom();
    }

    public promote(id: string): boolean {
        

        const user = this.users.get(id);

        if (!user) return false;

        this.owner = id;

        this.syncRoom();
        return true;
    }

    public kick(id: string): boolean {
        
        const user = this.users.get(id);

        if (!user) return false;

        user.socket.emit('kicked');
        user.socket.disconnect(true);
        this.users.delete(id);

        this.syncRoom();
        return true;
    }
    public userDisconnect(id: string) {
        
        this.users.delete(id);

        if (this.users.size === 0) {
            this.roomManager.deleteRoom(this.id);
            return;
        }

        this.syncRoom();
    }

    public syncRoom() {
        
        this.roomManager.io.to(this.id).emit('updateroom', this.serialize());
    }

    constructor(id: string, roomManager: RoomManager, creator: Socket) {
        


        this.id = id;
        this.roomManager = roomManager;
        this.users = new Map<string, User>();

        this.owner = creator.id;// we set the id but don't create the user
    }
}

export class User {
    public id: string;
    public name: string;
    public socket: Socket;
    private room: Room;

    private lastMessage: number;
    private lastNickChange: number;

    private get isAdmin(): boolean {
        
        return this.id === this.room.owner;
    }

    public serialize() {
        
        return {
            id: this.id,
            nickname: this.name,
            role: this.isAdmin ? 'admin' : 'user',
        }

    }

    constructor(socket: Socket, room: Room) {
        this.id = socket.id;
        this.socket = socket;

        this.room = room;

        
        this.lastMessage = Date.now() - MESSAGE_COOLDOWN;
        this.lastNickChange = Date.now() - RENAME_COOLDOWN; //make sure we can do everything right away

        this.name = `Anon#${this.id.substr(0, 5)}`;

        this.socket.on('msg', (args) => this.msg(args));
        this.socket.on('promote', (args) => this.promote(args));
        this.socket.on('changenick', (args) => this.changeNick(args));
        this.socket.on('kick', (args) => this.kick(args));

        this.socket.on('disconnect', this.disconnect);

        this.socket.emit('joinroom', this.room.serialize());
        
    }

    private msg(args: any) {
        

        if (typeof (args.text) !== 'string') return;
        if (Date.now() - this.lastMessage < 2_000) return; //sending too fast
        //TODO: max length check

        this.lastMessage = Date.now();
        this.room.roomManager.io.to(this.room.id).emit('msg', { username: this.name, text: args.text });
    }

    private promote(args: any) {
        

        if (typeof (args.target) !== 'string') return; //invalid params
        if (this.id !== this.room.owner) return; //no perms

        if (!this.room.promote(args.target)) return; //no such user or something
        //sucess!
    }
    private changeNick(args: any) {
        

        if (typeof (args.nickname) !== 'string') return; //invalid params
        if (!nameRegex.test(args.nickname)) return; //invalid nick
        if (Date.now() - this.lastNickChange < 60_000) return; //too fast

        this.name = args.nickname;
        this.lastNickChange = Date.now();
        
        
        this.room.syncRoom();

    }
    private kick(args: any) {
        

        if (typeof (args.target) !== 'string') return; //invalid params
        if (this.id !== this.room.owner) return; //no perms

        if (!this.room.kick(args.target)) return; //no such user or something
    }

    private disconnect(args: any) {
        

        this.room?.userDisconnect(this.id);
    }
}