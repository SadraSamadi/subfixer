const fs = require('fs');
const path = require('path');
const chardet = require('chardet');
const iconv = require('iconv-lite');

let root = process.argv[2];
let subs = [];
getSubs(root, subs);
subs.forEach(fix);

function getSubs(dir, list) {
    let files = fs.readdirSync(dir);
    files.forEach(file => {
        let abs = path.join(dir, file);
        let stat = fs.lstatSync(abs);
        if (stat.isDirectory()) {
            getSubs(abs, list);
            return;
        }
        let ext = path.extname(file);
        ext = ext.toLowerCase();
        if (ext === '.srt')
            list.push(abs);
    });
}

function fix(sub) {
    let data = fs.readFileSync(sub);
    let encoding = chardet.detect(data);
    let converted = iconv.decode(data, encoding);
    let dir = path.dirname(sub);
    let name = path.basename(sub);
    let fixed = path.join(dir, '(fixed) ' + name);
    fs.writeFileSync(fixed, converted);
    console.log(fixed);
}
