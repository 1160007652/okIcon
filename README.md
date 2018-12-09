# okIcon

## 使用文案

#### 安装助手
> npm install @ok/okicon -D

> npm install @ok/okicon --save-dev

#### 该助手只有两个核心命令
> sudo node_modules/.bin/okIcon -i 初始化配置文件

> sudo node_modules/.bin/okIcon -d 下载IconFont

#### 什么时候使用 ** sudo node_modules/.bin/okIcon -i ** 命令?

- 第一次使用该助手
- 已经在项目中安装了该助手，但是还未使用
- 未生成配置文件

使用 okIcon -i 命令时，生成好后续依赖的配置文件。并且会自动执行一次 **sudo node_modules/.bin/okIcon -d** 命令。

#### 什么时候使用 ** sudo node_modules/.bin/okIcon -d ** 命令？

- 在**sudo node_modules/.bin/okIcon -i**初始化完毕后
- 阿里的iconfont有了新的改动

