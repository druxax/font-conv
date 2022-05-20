#! /usr/bin/env node

const path = require('path');
const fontConv = require('./font-conv.js');
const commander = require('commander');
const program = new commander.Command();

program.version('1.0.0');

program
.option('-s, --source-path <type>', 'font source path or fonts source dir path', process.cwd())
.option('-r, --res-path <type>', 'font(s) conv result path', path.join(process.cwd(), './font-conv-res'));

program.parse(process.argv);

const options = program.opts();

if(options.sourcePath !== process.cwd()){
    options.sourcePath = path.join(process.cwd(), options.sourcePath);
}

fontConv({ sourcePath: options.sourcePath, resPath: options.resPath })
.catch(function(err){
    console.error(err);
});