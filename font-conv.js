const fsPromises = require('fs/promises');
const path = require('path');
const ttf2woff2 = require('ttf2woff2');
const ttf2woff = require('ttf2woff');

async function main({ sourcePath, resPath }){
    const stats = await fsPromises.stat(sourcePath);
    if(stats.isDirectory()){
        await convFilesInDir({ sourcePath, resPath });
    }
    else if(stats.isFile()){
        await convOneFile({ sourcePath, resPath });
    }
    else {
        throw new Error('Source path is not a directory and not a file');
    }
}

async function convOneFile({ sourcePath, resPath, isMultiple }){
    const fileName = path.basename(sourcePath);
    const fileExtension = path.extname(fileName);
    const fileNameWithoutExtension = path.basename(fileName, fileExtension);
    if(fileExtension.toLowerCase() !== '.ttf'){
        throw new Error('Source path to convert hasn\'t .ttf extension');
    }
    if(!isMultiple){
        await prepareResDir(resPath);
    }
    const fileData = await fsPromises.readFile(sourcePath);

    const woff2Data = ttf2woff2(fileData);
    const woffData = _ttf2woff(fileData);

    await fsPromises.writeFile(path.join(resPath, fileNameWithoutExtension + '.woff2'), woff2Data);
    await fsPromises.writeFile(path.join(resPath, fileNameWithoutExtension + '.woff'), woffData);
    
}

function _ttf2woff(fileData){
    const ttf = new Uint8Array(fileData);
    const woffData = Buffer.from(ttf2woff(ttf, {}).buffer);
    return woffData;
}

async function convFilesInDir({ sourcePath, resPath }){
    const filesPaths = await listFontFilesInSourcePath(sourcePath);
    await prepareResDir(resPath);
    for(let i=0; i<filesPaths.length; i++){
        await convOneFile({ sourcePath: filesPaths[i], resPath, isMultiple: true });
    }
}

async function listFontFilesInSourcePath(sourcePath){
    const items = await fsPromises.readdir(sourcePath);
    const resultFilesPaths = [];
    for(let i=0; i<items.length; i++){
        const itemPath = path.join(sourcePath, items[i]);
        const itemStats = await fsPromises.stat(itemPath);
        if(itemStats.isFile()){
            if(path.extname(items[i]).toLowerCase() === '.ttf'){
                resultFilesPaths.push(itemPath);
            }
        }
    }
    return resultFilesPaths;
}

async function prepareResDir(resPath){
    try{
        const stats = await fsPromises.stat(resPath);
        if(stats.isDirectory()){
            await fsPromises.rm(resPath, { recursive: true });
            await fsPromises.mkdir(resPath);
        }
        else {
            throw new Error('Res path is exists and it is not a directory');
        }
    }
    catch(err){
        if(err.code === 'ENOENT'){
            try{
                await fsPromises.mkdir(resPath);
            }
            catch(err){
                return err;
            }
        }
        else{
            return err;
        }
    }
}

module.exports = main;