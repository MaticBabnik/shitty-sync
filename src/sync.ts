import { Socket } from "socket.io";
import { MESSAGE_COOLDOWN, RENAME_COOLDOWN, roomRegex } from "./constants";
import * as cdn from "./video-sources/cdn";
import * as yt from "./video-sources/youtube";
import { EventEmitter } from "events";
import e from "cors";
import { createHash } from "crypto";
import { type } from "os";
import { urlToHttpOptions } from "url";

export type MediaType = "cdn" | "yt-search" | "offline";
export interface Media {
    type: MediaType;
    src: string;
}

interface RoomManagerEvents {
    roomcreate: (room: Room) => void;
    roomdestroy: (id: string) => void;
    roomjoin: (room: Room, newUser: User) => void;
    roomleave: (room: Room, userId: string) => void;
    roomsourcechanged: (room: Room) => void;
}
export declare interface RoomManager {
    on<U extends keyof RoomManagerEvents>(
        event: U,
        listener: RoomManagerEvents[U]
    ): this;

    emit<U extends keyof RoomManagerEvents>(
        event: U,
        ...args: Parameters<RoomManagerEvents[U]>
    ): boolean;
}

function isChristmas(): boolean {
    const d = new Date();
    return d.getMonth() === 11 || (d.getMonth() === 0 && d.getDate() <= 10); //return true in december and in the begining of january
}

export class RoomManager extends EventEmitter {
    public io: Socket;
    private rooms: Map<string, Room>;

    constructor(io: Socket, options?: any) {
        super();
        this.rooms = new Map<string, Room>();
        this.io = io;
        io.on("connect", (socket) => {
            socket.on("ping", (args: any) => this.ping(socket, args));
            socket.on("synctime", (args: any) => this.synctime(socket, args));
            socket.on("testtime", (args: any) => this.testtime(socket, args));

            socket.on("joinroom", (args: any) => this.joinroom(socket, args));
        });
    }

    public deleteRoom(id: string) {
        this.emit("roomdestroy", id);
        this.rooms.delete(id);
    }

    private joinRoom(id: string, socket: Socket) {
        let room = this.rooms.get(id);

        if (!room) {
            room = new Room(id, this, socket);
            this.emit("roomcreate", room);
            this.rooms.set(id, room);
        }

        const user = room.join(socket);
        this.emit("roomjoin", room, user);
        return user;
    }

    private ping(socket: Socket, args: any) {
        socket.emit("pingret");
    }

    private synctime(socket: Socket, args: any) {
        socket.emit("synctime", Date.now() + (args?.latency ?? 0) / 2);
    }

    private testtime(socket: Socket, args: any) {
        socket.emit("testtime", Date.now() - args.time ?? 0);
    }

    private joinroom(socket: Socket, args: any) {
        if (typeof args.roomId !== "string") return;
        if (!roomRegex.test(args.roomId)) return;

        const newUser = this.joinRoom(args.roomId, socket);

        if (typeof args.nickname !== "string") return; // no nickname specified
        if (!["string", "undefined"].includes(typeof args.gravatar)) return;
        newUser.updateNickname(args.nickname, args.gravatar);
    }
}

export class Room {
    public id: string;
    public roomManager: RoomManager;
    private users: Map<string, User>;
    public owner: string;
    public media: Media;
    public status: MediaSync;

    public serialize() {
        return {
            id: this.id,
            media: this.media,
            users: Array.from(this.users.values(), (x) => x.serialize()),
        };
    }

    public join(socket: Socket): User {
        socket.join(this.id);
        const user = new User(socket, this);
        this.users.set(socket.id, user);

        //notify the other users
        this.syncRoom();
        return user;
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

        user.socket.emit("kicked");
        user.socket.disconnect(true);
        this.users.delete(id);

        this.syncRoom();
        return true;
    }

    public userDisconnect(id: string) {
        this.users.delete(id);

        this.roomManager.emit("roomleave", this, id); //TODO: maybe make `Room` an EventEmitter too?

        if (id == this.owner) this.owner = this.users.keys().next().value;

        if (this.users.size === 0) {
            this.roomManager.deleteRoom(this.id);
            return;
        }

        this.syncRoom();
    }

    public syncRoom() {
        this.roomManager.io.to(this.id).emit("updateroom", this.serialize());
    }

    public sync() {
        this.roomManager.io.to(this.id).emit("sync", this.status);
    }

    constructor(id: string, roomManager: RoomManager, creator: Socket) {
        this.id = id;
        this.roomManager = roomManager;
        this.users = new Map<string, User>();

        if (isChristmas())
            this.media = {
                type: "cdn",
                src: "https://s3.eu-central-1.wasabisys.com/cdn.femboy.si/padoru.webm",
            };
        else this.media = { type: "offline", src: "" };

        this.status = { status: "PAUSED", timestamp: 0 };

        this.owner = creator.id; // we set the id but don't create the user
    }
}

export class User {
    public id: string;
    public name: string;
    public socket: Socket;
    public gravatarHash: string;
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
            role: this.isAdmin ? "admin" : "user",
            pfp: `https://www.gravatar.com/avatar/${this.gravatarHash}?d=retro&s=128`,
        };
    }

    constructor(socket: Socket, room: Room) {
        this.id = socket.id;
        this.socket = socket;

        this.room = room;

        this.lastMessage = Date.now() - MESSAGE_COOLDOWN;
        this.lastNickChange = Date.now() - RENAME_COOLDOWN; //make sure we can do everything right away

        this.name = `Anon#${this.id.substr(0, 5)}`;
        this.gravatarHash = createHash("md5")
            .update(this.name.toLowerCase())
            .digest("hex");

        this.socket.on("msg", (args) => this.msg(args));
        this.socket.on("promote", (args) => this.promote(args));
        this.socket.on("changenick", (args) => this.changeNick(args));
        this.socket.on("changemedia", (args) => this.changeMedia(args));
        this.socket.on("kick", (args) => this.kick(args));
        this.socket.on("sync", (args) => this.sync(args));

        this.socket.on("disconnect", (args) => this.disconnect(args));

        this.socket.emit("joinroom", this.room.serialize());
        this.socket.emit("sync", this.room.status);
    }

    private msg(args: any) {
        if (typeof args.text !== "string") return;
        if (Date.now() - this.lastMessage < 2_000) return; //sending too fast
        //TODO: max length check

        this.lastMessage = Date.now();
        this.room.roomManager.io
            .to(this.room.id)
            .emit("msg", { username: this.name, text: args.text });
    }

    private promote(args: any) {
        if (typeof args.target !== "string") return; //invalid params
        if (this.id !== this.room.owner) return; //no perms

        if (!this.room.promote(args.target)) return; //no such user or something
        //sucess!
    }

    private changeNick(args: any) {
        console.log({ args });
        if (typeof args.nickname !== "string") return; //invalid params
        if (!["string", "undefined"].includes(typeof args.gravatar)) return;
        if (Date.now() - this.lastNickChange < 60_000)
            return this.socket.emit("msg", {
                username: "⚙️ System",
                text: "You may only update your nickname once per minute.",
            }); //too fast

        this.lastNickChange = Date.now();

        this.updateNickname(args.nickname, args.gravatar);
    }

    public updateNickname(nickname: string, gravatar?: string) {
        if (nickname.length > 24 || nickname.length < 3) return; //invalid nick

        this.name = nickname;

        let gravatarInput: string = gravatar ?? nickname;
        this.gravatarHash = createHash("md5")
            .update(gravatarInput.trim().toLowerCase())
            .digest("hex");

        this.room.syncRoom();
    }

    private kick(args: any) {
        if (typeof args.target !== "string") return; //invalid params
        if (this.id !== this.room.owner) return; //no perms

        if (!this.room.kick(args.target)) return; //no such user or something
    }

    private async changeMedia(args: any) {
        if (!this.isAdmin) return;
        if (typeof args.src !== "string" && typeof args.type !== "string")
            return;
        if (!["youtube-search", "cdn"].includes(args.type)) return;

        try {
            switch (args.type) {
                case "youtube-search":
                    if (!(await yt.test(args.src)).title) return;
                    break;
                case "cdn":
                    if (!(await cdn.test(args.src)).valid) return;
                    break;
                default:
                    return;
            }
        } catch {
            return;
        }

        //media is valid
        this.room.media = args;
        this.room.roomManager.emit("roomsourcechanged", this.room);
        this.room.syncRoom();
    }

    private sync(args: any) {
        if (!this.isAdmin) return; //no perms
        if (typeof args !== "object") return; //invalid params
        switch (args.status) {
            case "PLAYING":
                if (typeof args.offset !== "number") return;
                this.room.status = { status: "PLAYING", offset: args.offset };
                this.room.sync();
                break;
            case "PAUSED":
                if (typeof args.timestamp !== "number") return;
                this.room.status = {
                    status: "PAUSED",
                    timestamp: args.timestamp,
                };
                this.room.sync();
                break;
        }
    }

    private disconnect(args: any) {
        this.room?.userDisconnect(this.id);
    }
}

interface MediaSync {
    status: "PLAYING" | "PAUSED";
    offset?: number;
    timestamp?: number;
}
