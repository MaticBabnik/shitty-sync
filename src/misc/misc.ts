import os from 'os';

export function getIPs() {
    const interfaces = os.networkInterfaces();
    return Object.keys(interfaces).map(x=>interfaces[x]?.find(y=>y.family=='IPv4')?.address);
}