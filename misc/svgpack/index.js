const fs = require('fs')
const xml2js = require('xml2js');

async function main(args) {
    let [srcDir, outFile] = args;
    let b = new xml2js.Builder();

    if (!fs.existsSync(srcDir)) {
        console.log('src dir doesnt exist!!!!');
        process.exit();
    }
    let svgFile = { svg: { $:{xmlns:'http://www.w3.org/2000/svg'},defs: { g: [] } } };
    let output = "";
    let files = fs.readdirSync(srcDir);
    for (let i = 0; i < files.length; i++) {
        try {
            let x = files[i];
            let file = fs.readFileSync(srcDir + '/' + x);
            let xml = await xml2js.parseStringPromise(file);
            let stuff;
            if (xml.svg.g) {
                stuff = xml.svg.g[0];
            }
            else if (xml.svg) {
                stuff = xml.svg;
            } else {
                console.log(`No groups or svgs found in ${files[i]}`);
            }
            stuff.$ = { id: files[i].split('.')[0].toLowerCase().replace(' ', '_') }
            svgFile.svg.defs.g.push(stuff);

        } catch (e){
            console.log(`something went wrong @ ${files[i]}`)
            console.error(e);
        }

    }
    fs.writeFileSync(outFile, b.buildObject(svgFile));
    fs.writeFileSync(outFile + '.json', JSON.stringify(svgFile));
}


let args = process.argv;
main(args.slice(2));
