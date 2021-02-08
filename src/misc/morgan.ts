//custom morgan config
import morgan from 'morgan'
import chalk  from 'chalk'

function padRight(text:string|undefined,len:Number) {
    if (!text)
        text = '';

    while (text.length<len) {
        text += ' ';
    }
    return text;
}

function getStatusColor(status:string|number) {
    if (typeof(status)==='number') status = status.toString();
    switch (status[0]) {
        case '1':
            return 33;
        case '2':
            return 40;
        case '3':
            return 226;
        case '4':
            return 202;
        case '5':
            return 196;
        default:
            return 15;
    }
}

const methodColors = {
    "GET": 165,
    "POST": 76,
    "PUT": 178,
    "PATCH": 226,
    "DELETE": 196,
    "OPTIONS": 51,
    "HEAD": 21,
    "CONNECTION": 214,
}


const methodToColor = new Map(Object.entries(methodColors)) ;

/**
 * A custom morgan config
 */
export default morgan((tokens, req, res)=>{
    let method = tokens.method(req, res) ?? '';
    let status = tokens.status(req, res) ?? '???';
    let a = [
        chalk.ansi256(methodToColor.get(method) ?? 15).bold(padRight(method,7)),
        chalk.ansi256(getStatusColor(status)).bold(status),
        chalk.ansi256(15).bold(padRight(tokens.url(req, res),50)),
        chalk.ansi256(76).bold(tokens['response-time'](req, res) + ' ms')
    ]
    if (status == '404' && req.url?.includes('login')){
        a.push('\n');
        a.push(`chink spotted @ ${tokens['remote-addr'](req,res)}`);
    }
    return a.join(' ');
});