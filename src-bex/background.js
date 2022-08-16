import {Arknights, listLocalStorageKeys, removeLocalStorage} from './hypergryphConnect';

async function updateInformation(feedback, initiative = false) {
  feedback('开始同步数据');
  let arknights = new Arknights();
  feedback('进行身份验证');
  await arknights.init();
  feedback('官服' + (arknights.officialStatus ? '已登录' : '未登录'));
  feedback('B服' + (arknights.bilibiliStatus ? '已登录' : '未登录'));
  await arknights.init();
  try {
    feedback("同步寻访数据")
    await arknights.syncPoolData(initiative);
    feedback("寻访数据同步完成")
    feedback("同步源石数据中...")
    await arknights.syncStoneData(initiative);
    feedback("源石数据同步完成")
    feedback("同步充值数据中...")
    await arknights.syncRechargeData();
    feedback("充值数据同步完成")
    feedback("更新状态...")
    await arknights.updateStatus();
  } catch (e) {
    console.log(e);
    console.trace();
  }
  feedback("数据同步完毕")
  if (arknights.officialPoolDifference > 0)
    await reportChanging(arknights.officialPoolDifference, "寻访", 1);
  if (arknights.bilibiliPoolDifference > 0)
    await reportChanging(arknights.officialPoolDifference, "寻访", 2);
  if (arknights.officialStoneDifference > 0)
    await reportChanging(arknights.officialStoneDifference, "源石变更", 1);
  if (arknights.bilibiliStoneDifference > 0)
    await reportChanging(arknights.officialStoneDifference, "源石变更", 2);
  if (arknights.officialRechargeDifference > 0)
    await reportChanging(arknights.officialRechargeDifference, "充值", 1);
  console.log(arknights)
}

async function reportChanging(count, name, type = 1,) {
  chrome.notifications.create('DataUpdate', {
    type: 'basic',
    iconUrl: '/icons/record-128.png',
    title: (type ? '官服:' : 'B服') + `有新的${name}数据更新, 更新了${count}条数据`,
    message: `${name}数据已更新，请刷新页面查看`,
    priority: 2
  })
}

async function CleanUpHistoricalIssues() {
  let keys = await listLocalStorageKeys();
  if (keys.includes("pools")) {
    await removeLocalStorage("pools");
    console.log("遗留问题清理完毕");
  }
}

function print(message) {
  console.log(message);
}

async function main(bridge, connect) {
  console.log(bridge);
  console.log(connect);
  await CleanUpHistoricalIssues();
  await updateInformation(print);
}

// main()
//   .then(() => null);

chrome.runtime.onMessage.addListener(
  async function (request, sender, sendResponse) {
    if (request.hasOwnProperty("Type")) {
      let initiative = request["initiative"];
      if (request.Type === "refresh") {
        console.log("收到刷新请求")
        await updateInformation(message => {
          if (initiative)
            chrome.runtime.sendMessage({type: "statusUpdate", message: message});
          print(message);
        }, true);
      }
      sendResponse({});
    }
  }
);

export default main;
