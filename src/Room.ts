import User from "./User"

export class Room {
    public roomId: string
    public ownerId: string
    public users: Map<string,User>
    public status: RoomStatus

    /**
     * Creates a new room and sets ownerId as admin
     */
    constructor(roomId:string,ownerId:string) {
        this.roomId = roomId;
        this.ownerId = ownerId;
        this.users = new Map<string,User>();
        
        this.users.set(ownerId,new User(ownerId));

        this.status = new RoomStatus();
    }

}

export enum MediaType {
    Offline,
    VideoFile,
    Youtube //maybe ?
}

export class RoomStatus {
    public mediaType:MediaType
    public mediaUrl?:string
    public mediaPlaying?:boolean
    public mediaTime?:Number

    /**
     *
     */
    constructor() {
        this.mediaType = MediaType.Offline;
    }
}
