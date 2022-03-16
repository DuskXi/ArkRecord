# Quasar App (arkrecord)

***详细使用方法在这里 [Blog](https://duskxi.github.io/2022/03/16/ArkRecord/)***

这是一个基于[Quasar](https://quasar.dev)的Chrome插件。

用于记录明日方舟的抽卡记录，并且进行统计。

因为明日方舟官网上的记录只能查询近期30天和近100条数据，因此这个插件具有持续记录缓存的功能。

并且可以导出数据(暂时只支持JSON数据导出，后续会更新更多导出格式)

## 构建这个插件首先要安装好Quasar环境

前往[Quasar-cli](https://quasar.dev/start/quasar-cli/)查看安装方法。

### 然后在项目目录下执行

```bash
quasar build -m bex
```

### 然后打包好的和解包状态的编译后的插件会被放在dist目录下，其中分别对应Chrome和EFirefox两个浏览器所用的插件。

---

### 当你每次重启浏览器的时候，插件会自动获取抽卡数据，并且自动更新缓存。

### 过阵子会直接丢到Chrome商店中(正在等待Google审核)

---

## 本地插件安装方法

#### 在浏览器中打开`chrome://extensions/`

#### 打开右上角的开发者模式

#### 左上角点击加载已解压的扩展程序

#### 选择你构建之后的Unpacked目录 或者去 release(过阵子发布) 中下载后解压
