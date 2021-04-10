module.exports = {
    get(name) {
        return decodeURIComponent(
            document.cookie
                .split(';') //split on cookie boundary
                .map(x => x.split('='))//split name and value
                .find(y => y[0] == name) //find the cookie by name
                ?.[1] //take the value (if it exists)
        );
    },
    set(name, val) {
        document.cookie = `${name}=${encodeURIComponent(val)}`
    }
}