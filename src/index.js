#!/usr/bin/env node

const fs = require('fs');
const fse = require('fs-extra');
const program = require('commander');
const inquirer = require('inquirer');
const request = require('request');
const logSymbols = require('log-symbols');
const chalk = require('chalk');
const spawn = require('cross-spawn');
const walk = require('walk');

const configPath = `${__dirname}/../config.ini`;

program.version('1.0.0', '-v, --version')
    .option('-i, --init', '初始化配置文件')
    .option('-d, --download', '下载iconfont文件');

program.on('--help', function(){
    console.log('\n-------------------------------------\n');
    console.log('自动下载iconfont助手\n');
    console.log('先使用 okIcon -i 进行初始化\n');
    console.log("后续iconfont的改动，使用 okIcon -d 进行下载\n");
});
    
program.parse(process.argv);

if(program.init){
    inquirer.prompt([{
        type: 'input',
        name: 'iconAddr',
        message: '请输入iconfont的项目下载地址:\n'
    },
    {
        type: 'input',
        name: 'iconCookies',
        message: '请输入iconfont的Cookies:\n'
    },
    {
        type: 'input',
        name: 'iconPath',
        message: '请输入保存iconfont的绝对路径:\n'
    }]).then((answers) => {
        const {iconAddr,iconCookies,iconPath} = answers;
        if(setIconInfo(iconAddr,iconCookies,iconPath)){
            console.log(logSymbols.success, chalk.green('设置完毕，开始下载'));
            getIconfont();
        } else {
            console.log(logSymbols.error, chalk.red('设置失败,再试一次'));
        }
    });
}

if(program.download){
    getIconfont();
}


function getIconfont() {
    
    // iconfont 下载配置文件
    let configData = null;

    //创建存放 iconfont 解压数据的临时目录
    fse.ensureDirSync(`${__dirname}/../temp`);

    // 判断文件是否存在
    try {
       if(fs.existsSync(configPath) && fs.existsSync(`${__dirname}/../temp`)){
            try {
                configData = JSON.parse(fs.readFileSync(configPath));
            } catch (error) {
                console.log(logSymbols.warning, chalk.yellow('读取配置文件失败'));
            }
       } else {
            console.log(logSymbols.info, "还未初始化,请执行", chalk.blue(' okIcon -i'));
            console.log("");
            return;
       }
    } catch (error) {
        console.log(logSymbols.info, "还未初始化,请执行", chalk.blue(' okIcon -i'));
        return;
    }

    // 同步从阿里获取 iconfont
    requestSync(configData.iconAddr, configData.iconCookies).then(()=>{
        // 解压iconfont configData.iconPath
        spawn.sync('tar', ['zxf', `${__dirname}/../iconfont.zip`, '-C', `${__dirname}/../temp`], { stdio: 'inherit' });
        moveIconfont(configData.iconPath);
    });
    
}

function setIconInfo(iconAddr,iconCookies,iconPath){
    const source = { iconAddr, iconCookies, iconPath }
    try {
        const s = fs.writeFileSync(configPath, JSON.stringify(source));
        return true;
    } catch (error) {
        return false;
    }  
}

function requestSync(url, cookies) {
    return new Promise(function(resolve, reject){
        let options = {
            url: url,
            headers: {
            'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36`,
            Cookie: cookies
            }
        };

        request(options,function(e,r,b){
            if(e){
                reject(e);
            }else{
                resolve(b);
            }
        }).pipe(fs.createWriteStream('iconfont.zip'));
    });
}

function moveIconfont(iconPath){
    const walker = walk.walk(`${__dirname}/../temp`);
    const iconFiles = ['iconfont.css', 'iconfont.eot', 'iconfont.js', 'iconfont.svg', 'iconfont.ttf', 'iconfont.woff'];
    walker.on("file", function(root, fileStats, next){
        if (iconFiles.includes(fileStats.name)){
            fse.moveSync(`${root}/${fileStats.name}`, `${iconPath}/${fileStats.name}`, { overwrite: true });
        }
        next();
    });

    walker.on("errors", function (root, nodeStatsArray, next) {
        next();
    });
    
    walker.on("end", function () {
        console.log(logSymbols.success, chalk.green("下载完毕"));
        fse.removeSync(`${__dirname}/../temp`);
        fse.removeSync(`${__dirname}/../iconfont.zip`);
    });
}