export default class User {
    public name: string
    private id: string
    /**
     * Creates a new user, the default name is Anon and the first 3 chars from the socket id
     * @param id Socket ID
     */
    constructor(id:string) {
        this.id = id;
        this.name = `Anon${id.substring(0,3)}`;        
    }
}