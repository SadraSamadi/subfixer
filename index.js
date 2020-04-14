#!/usr/bin/env node

const cfonts = require('cfonts');
const yargs = require('yargs');
const fse = require('fs-extra');
const path = require('path');
const ProgressBar = require('progress');
const chardet = require('chardet');
const iconv = require('iconv-lite');

(async () => {
  cfonts.say('SUBFIXER');
  let args = yargs
    .command({
      command: '$0 <path>',
      describe: 'Usage: subfixer <path>',
      builder: {
        path: {
          type: 'string',
          desc: 'Path to subtitle(s).'
        }
      }
    })
    .parse();
  let root = path.resolve(args.path);
  let exists = await fse.pathExists(root);
  if (!exists) {
    console.error('directory not exists:', root);
    return;
  }
  let files = await getFiles(root);
  let bar = new ProgressBar('fixing (:current/:total) [:bar] :percent', files.length);
  await files.reduce(async (prev, file) => {
    await prev;
    await fix(file);
    bar.tick();
  }, Promise.resolve());
})();

async function getFiles(root) {
  let stat = await fse.lstat(root);
  if (stat.isDirectory()) {
    let files = await fse.readdir(root);
    return await files.reduce(async (prev, name) => {
      let file = path.join(root, name);
      let list = await getFiles(file);
      return [...await prev, ...list];
    }, Promise.resolve([]));
  } else {
    let regex = new RegExp(/\.srt$/, 'i');
    return regex.test(root) ? [root] : [];
  }
}

async function fix(file) {
  let data = await fse.readFile(file);
  let encoding = chardet.detect(data);
  let converted = iconv.decode(data, encoding);
  let dir = path.dirname(file);
  let name = path.basename(file);
  let fixed = path.join(dir, '(fixed) ' + name);
  await fse.writeFile(fixed, converted);
}
