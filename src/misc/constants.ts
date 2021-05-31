//rate limits
export const MESSAGE_COOLDOWN = 2_000;
export const RENAME_COOLDOWN = 60_000;

//regexes
export const roomRegex = /^[a-z0-9\-]{3,24}$/i;
export const nameRegex = /^[a-z0-9_\-]{3,16}$/i