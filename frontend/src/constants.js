module.exports = {
    /**
     * Cooldown (in ms) after each message
     */
    messageCooldown: 1000,
    /**
     * Regex that matches valid usernames
     */
    nameRegex: /^[a-z0-9_-]{3,24}$/i,
    nameRegexes: {
        chars:/^[a-z0-9_-]*$/i,
        len: /^.{3,24}$/i
    },
    /**
     * Regex that matches valid room IDs
     */
    roomRegex: /^[a-z0-9\-]{3,16}$/i,
    /**
     * max delta time between actual video time and synced time
     */
    desyncTolerance: 0.3
}