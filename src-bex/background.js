import {Arknights} from './hypergryphConnect';

async function updateInformation() {
  console.log('开始同步数据');
  let arknights = new Arknights();
  console.log('进行身份验证');
  console.log('官服' + arknights.officialStatus ? '已登录' : '未登录');
  console.log('B服' + arknights.bilibiliStatus ? '已登录' : '未登录');
  await arknights.init();
  try {
    console.log("同步抽卡数据")
    await arknights.syncPoolData();
    console.log("同步源石数据")
    await arknights.syncStoneData();
    console.log("同步充值数据")
    await arknights.syncRechargeData();
    console.log("更新状态...")
    await arknights.updateStatus();
  } catch (e) {
    console.log(e);
    console.trace();
  }
  console.log("数据同步完毕")
  if (arknights.officialPoolDifference > 0)
    await reportChanging(1);
  if (arknights.bilibiliPoolDifference > 0)
    await reportChanging(2);
  console.log(arknights)
}

async function reportChanging(type = 1) {
  chrome.notifications.create('DataUpdate', {
    type: 'basic',
    iconUrl: '/icons/record-128.png',
    title: (type ? '官服:' : 'B服') + '有新的抽卡数据更新, 更新了' + count + '条数据',
    message: '抽卡数据已更新，请刷新页面查看',
    priority: 2
  })
}

function checkStructure(data) {
  if (!(data instanceof Array)) {
    return false;
  }
  data.forEach(item => {
    if (typeof (item.pool) == 'string' && typeof (item.timestamp) == 'number' && item.result instanceof Array) {
      item.result.forEach(element => {
        if (typeof (element["isNew"]) == 'boolean' && typeof (element.name) == 'string' && typeof (element["rarity"]) == 'number') {
        } else {
          return false;
        }
      });
    } else {
      return false;
    }
  });
  return true;
}

function getUpdate(count, bilibili) {
  chrome.notifications.create('DataUpdate', {
    type: 'basic',
    iconUrl: '/icons/icon-128x128.png',
    title: (bilibili ? 'B服数据:' : '') + '有新的抽卡数据更新, 更新了' + count + '条数据',
    message: '抽卡数据已更新，请刷新页面查看',
    priority: 2
  })
}

updateInformation().then(_ => {
});

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.hasOwnProperty("Type")) {
      if (request.Type === "refresh") {
        console.log("收到刷新请求")
        updateInformation().then(() => {
          sendResponse({message: "refreshed"});
        });
      }
    }
  }
);

export default {}
