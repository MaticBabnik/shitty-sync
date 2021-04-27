import { Socket } from "socket.io";

export class RoomManager {
    private rooms: Map<string, Room>;

    constructor(io: Socket, options?: any) {
        this.rooms = new Map<string, Room>();

        io.on('connect', socket => {
            socket.on('ping', (args: any) => this.ping(socket, args));
            socket.on('synctime', (args: any) => this.synctime(socket, args));
            socket.on('testtime', (args: any) => this.testtime(socket, args));

            socket.on('joinroom', (args:any) => this.joinroom(socket,args));
        })
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

    private joinroom(socket: Socket, args: any) {

    }

}

export class Room {
    public id: string;
    private roomManager: RoomManager;
    private users: Map<string, User>;
    public owner: string;

    public serialize() {
        return {
            id: this.id,
            owner: this.owner,
            media: null,
            users: Array.from(this.users.values(), x => x.serialize())
        }
    }
    constructor(id: string, roomManager: RoomManager, creator: Socket) {
        this.id = id;
        this.roomManager = roomManager;
        this.users = new Map<string, User>();

        this.users.set(creator.id, new User(creator, this))
        this.owner = creator.id;
    }
}

export class User {
    public id: string;
    public name: string;
    private socket: Socket;
    private room: Room;

    private get isAdmin(): boolean {
        return this.id === this.room.owner;
    }

    public serialize() {
        return {
            id: this.id,
            name: this.name,
            admin: this.isAdmin
        }
    }

    constructor(socket: Socket, room: Room) {
        this.id = socket.id;
        this.socket = socket;

        this.room = room;

        this.name = `Anon#${this.id.substr(0, 5)}`;
    }
}