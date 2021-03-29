export default class User {
    private _name: string
    private id: string
    private lastNameChange: number

    private readonly nicknameRegex = /^[a-z-2-9_-]{3,24}$/i

    public get name() {
        return this._name;
    }

    public changeName(newNick:string):boolean|string {
        if (!this.nicknameRegex.test(newNick)) return "Invalid nickname";
        if (this.lastNameChange + 60_000 > Date.now()) return "You can only change your nickname once per minute";

        this._name = newNick;

        return false;
    }

    /**
     * Creates a new user, the default name is Anon and the first 4 chars from the socket id
     * @param id Socket ID
     */
    constructor(id:string) {
        this.id = id;
        this._name = `Anon#${id.substring(0,4)}`;
        this.lastNameChange = Date.now() - 60*1000; // you can change your name every 60 seconds so we init it to 60 seconds before now        
    }

}