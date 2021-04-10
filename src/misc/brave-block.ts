import { NextFunction,Request,Response } from "express";

export default function middleware(req:Request,res:Response,next:NextFunction) {
    if (req.path.includes('php')) {
        res.status(500).send('<h1>ERROR 500</h1>FUCKING PHP CANCER');
        console.log('shitty scanner spotted');
        return;
    }
    if (req.headers['user-agent']?.match('/brave/gi')) {
        res.send(`<img src="https://cdn.discordapp.com/attachments/745913145624756234/827226568320745502/N4AAAAASUVORK5CYII.png">
        <h1>Get a real browser</h1>`)
        console.log('shill spotted')
        return;
    }
    next();
}