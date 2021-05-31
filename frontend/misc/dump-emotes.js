const fs =require('fs');

const emoteFileRegex = /^\w*\.(jpe?g|png|gif)$/

const fileListing = fs.readdirSync('./public/emotes/')
const emotes = [];

console.log('Scanning for emotes ---------------');

fileListing.filter(x=>emoteFileRegex.test(x)).forEach(x=>{
    const name = x.split('.')[0];
    console.log(`${x}->${name}`);
    emotes.push([name,`/emotes/${x}`]);
})

console.log('writing into ./src/assets/emotes.json');
fs.writeFileSync('./src/assets/emotes.json',JSON.stringify(emotes));
console.log('done');

