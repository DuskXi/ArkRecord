# ArkRecord (Base on Quasar)

## TODO List:

- [ ] 显示和可导出源石/充值记录
- [ ] 完善统计学分析页面
- [ ] 在`全部列出`和`纯常驻寻访`中增加图表选项
- [ ] 重构 **background.js** 提高可读性
- [ ] 提供卡池时间线展示
- [ ] 加入对[PRTS.wiki](https://PRTS.wiki)卡池页面的爬虫，确保完美分类分割常驻标准寻访 **(要是他们有API了请在Issue或者B站私信里敲我)**
  - [X] 核心组件
- [ ] 适配手机竖屏UI（当前在手机上的横屏UI没有问题）

---

### 相关命令

#### Debug:

```bash
quasar dev -m bex
```

#### 构建:

```bash
quasar build -m bex
```

---

### 提交注意事项

开发要往这个dev分支中提交

作者可能两三天会上GitHub看一次，B站私信也可以联系


---

## 视频教程

[Bilibili](https://www.bilibili.com/video/BV1HS4y1D7uZ)

---

这是一个基于[Quasar](https://quasar.dev)的Chrome插件。

用于记录明日方舟的抽卡记录，并且进行统计。

因为明日方舟官网上的记录只能查询近期30天和近100条数据，因此这个插件具有持续记录缓存的功能。

并且可以导出数据(暂时只支持JSON数据导出，后续会更新更多导出格式)

## 构建这个插件首先要安装好Quasar环境

前往[Quasar-cli](https://quasar.dev/start/quasar-cli/)查看安装方法。

### 然后打包好的和解包状态的编译后的插件会被放在dist目录下，其中分别对应Chrome和EFirefox两个浏览器所用的插件。

---

## 本地插件安装方法

#### 在浏览器中打开`chrome://extensions/`

#### 打开右上角的开发者模式

#### 左上角点击加载已解压的扩展程序

#### 选择你构建之后的Unpacked目录 或者去 release(~~过阵子发布~~) 中下载后解压

---
