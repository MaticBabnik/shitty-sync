import * as io from 'socket.io';
import { Room } from '../Room';

declare module 'socket.io' {
    class Socket {
        ctx?: Room
    }
}