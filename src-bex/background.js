import {Arknights} from './hypergryphConnect';

async function updateInformation() {
  let arknights = new Arknights();
  await arknights.init();
  try {
    await arknights.syncPoolData();
    await arknights.syncStoneData();
    await arknights.syncRechargeData();
    await arknights.updateStatus();
  } catch (e) {
    console.log(e);
    console.trace();
  }
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
        updateInformation().then(() => {
          sendResponse({message: "refreshed"});
        });
      }
    }
  }
);

export default {}
