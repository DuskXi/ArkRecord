# ArkRecord (Base on Quasar) [![wakatime](https://wakatime.com/badge/user/23381c4b-372b-46eb-b687-994db38af858/project/4c484c69-c10e-4944-8b01-72c8a57a0c92.svg)](https://wakatime.com/badge/user/23381c4b-372b-46eb-b687-994db38af858/project/4c484c69-c10e-4944-8b01-72c8a57a0c92)

## 完成度列表(TODO List):

- [X] 显示和可导出源石/充值记录
  - [X] 表格支持自定义排序
- [X] 时间线
  - [X] 自定义纯时间线截图的背景
  - [X] 支持折叠5/4/3星
  - [X] 独立截图
- [X] 显示新获得的干员
- [X] 加入对[PRTS.wiki](https://PRTS.wiki)卡池页面的爬虫，确保完美分类分割常驻标准寻访 **(要是他们有API了请在Issue或者B站私信里敲我)**
  - [X] 核心组件
  - [X] 时间线干员图片显示支持
- [X] 适配手机竖屏UI
- [X] 加入作者通讯
- [X] 提供背景更改功能
- [X] Debug页面
  - [X] 显示全部chrome.storage.local数据，并且支持展开详细查看
  - [X] 显示背景数据
- [ ] 完善统计学分析页面
- [X] 重构 **background.js** 提高可读性
- [X] ~~在`全部列出`和`纯常驻寻访`中增加图表选项~~(弃置，功能被时间线所替代)``

### 预览:

<img width="1902" alt="image" src="https://user-images.githubusercontent.com/84715902/184939203-ea9553eb-70db-43b7-af38-8e632da87513.png">

<img width="1877" alt="image" src="https://user-images.githubusercontent.com/84715902/184939331-8fdd7121-021d-40fc-b494-b04430dafd27.png">

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

## 视频教程

[Bilibili](https://www.bilibili.com/video/BV1HS4y1D7uZ)

---

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

### 过阵子会直接丢到Chrome商店中(~~正在等待Google审核~~ 谷歌审核已经过了，Web Store中搜索 `ArkRecord`)

[Link](https://chrome.google.com/webstore/detail/arkrecord/mphjjhidfbbnjjnmpffepbfllgocggpl)

---

## 本地插件安装方法

#### 在浏览器中打开`chrome://extensions/`

#### 打开右上角的开发者模式

#### 左上角点击加载已解压的扩展程序

#### 选择你构建之后的Unpacked目录 或者去 release(~~过阵子发布~~) 中下载后解压

---

## 预览

<img width="1910" alt="屏幕截图 2022-07-16 180942~1" src="https://user-images.githubusercontent.com/84715902/179365966-821e9162-ea31-46c8-b3a4-7bbe41cef07b.png">
<img width="1915" alt="屏幕截图 2022-07-16 181035~1" src="https://user-images.githubusercontent.com/84715902/179365968-766747b3-3194-44e0-a475-bb105bf1ac9c.png">
<img width="1904" alt="屏幕截图 2022-07-16 181111~1" src="https://user-images.githubusercontent.com/84715902/179365973-7d9bfb7a-5934-4a7f-836f-88332058f8f3.png">
<img width="1898" alt="屏幕截图 2022-07-16 181137~1" src="https://user-images.githubusercontent.com/84715902/179365998-d949711c-5606-489c-94ff-6731b88db7f3.png">
<img width="1910" alt="屏幕截图 2022-07-16 182733~1" src="https://user-images.githubusercontent.com/84715902/179366000-b6b9775a-698c-421b-a65d-87a5a9165a32.png">


背景出处: https://www.pixiv.net/artworks/95185823
