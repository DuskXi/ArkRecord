var token = null;
var logged = false;
var initialized = false;
var tokenB = null;
var loggedB = false;
var initializedB = false;
const readLocalStorage = async (key) => {
  return new Promise((resolve, _) => {
    chrome.storage.local.get([key], function (result) {
      if (result[key] === undefined) {
        resolve([]);
      } else {
        resolve(result[key]);
      }
    });
  });
};

async function httpGet(url) {
  return await fetch(url, {method: 'GET'});
}

async function initBilibili() {
  let userInfoBilibili = await httpGet('https://web-api.hypergryph.com/account/info/ak-b')
  if (userInfoBilibili.status === 200) {
    let json = await userInfoBilibili.json();
    tokenB = json.data.content;
    loggedB = true;
    console.log(`tokenB: ${tokenB}`);
  } else {
    loggedB = false;
  }
  initializedB = true;
}

async function init() {
  let userInfo = await httpGet(`https://as.hypergryph.com/user/info/v1/token_by_cookie`);
  if (userInfo.status === 200) {
    let json = await userInfo.json();
    token = json.data.token;
    logged = true;
    console.log(`token: ${token}`);
  } else {
    logged = false;
  }
  initialized = true;
}

async function getData(_token, channelId = null) {
  let dataset = [];
  let max = 1;
  for (let i = 1; i <= max; i++) {
    let data = await httpGet(`https://ak.hypergryph.com/user/api/inquiry/gacha?page=${i}&token=${encodeURIComponent(_token)}${channelId ? `&channelId=${channelId}` : ''}`);
    let json = await data.json();
    if (json.code === 3000) {
      return false;
    }
    if (json.data.list.length === 0) {
      max = i - 1;
      break;
    }
    dataset.push(json.data.list);
    max = json.data["pagination"].total;
  }
  return {data: dataset, pages: max};
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

async function mergeData(data, key = "ArknightsCardInformation") {
  let local = await readLocalStorage(key);
  let changed = 0;
  if (checkStructure(local)) {
    let arrayTimestamp = [];
    local.forEach(item => {
      arrayTimestamp.push(item.timestamp);
    });
    for (let i = data.length - 1; i >= 0; i--) {
      if (arrayTimestamp.includes(data[i].timestamp)) {
        continue;
      }
      local.unshift(data[i]);
      changed++;
    }
  }
  return [local, changed];
}

function parseData(dataset) {
  let results = [];
  dataset.forEach(group => {
    group.forEach(items => {
      results.push({
        timestamp: items["ts"],
        pool: items["pool"],
        result: items["chars"]
      });
    })
  });
  return results;
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

async function main() {
  await init();
  await initBilibili();
  if (logged) {
    chrome.storage.local.set({"login": true}, () => {
    });
    let result = await getData(token);
    if (result === false) {
      console.log('login failed');
    } else {
      let parsed = parseData(result.data);
      let merged = await mergeData(parsed);
      let mergedData = merged[0];
      let changed = merged[1];
      if (changed > 0) {
        getUpdate(changed);
      }
      chrome.storage.local.set({"ArknightsCardInformation": mergedData}, () => {
      });
      pools = [];
      mergedData.forEach(item => {
        if (!pools.includes(item.pool)) {
          pools.push(item.pool);
        }
      });
      chrome.storage.local.set({"pools": pools}, () => {
      });
    }
  } else {
    chrome.storage.local.set({"login": false}, () => {
    });
  }
  if (loggedB) {
    chrome.storage.local.set({"loginB": true}, () => {
    });
    let result = await getData(tokenB, 2);
    if (result === false) {
      console.log('login failed');
    } else {
      let parsed = parseData(result.data);
      let merged = await mergeData(parsed, "ArknightsCardInformationB");
      let mergedData = merged[0];
      let changed = merged[1];
      if (changed > 0) {
        getUpdate(changed);
      }
      chrome.storage.local.set({"ArknightsCardInformationB": mergedData}, () => {
      });
      pools = [];
      mergedData.forEach(item => {
        if (!pools.includes(item.pool)) {
          pools.push(item.pool);
        }
      });
      chrome.storage.local.set({"poolsB": pools}, () => {
      });
    }
  } else {
    chrome.storage.local.set({"loginB": false}, () => {
    });
  }
}

main().then(() => {
  console.log(token)
}).catch(e => console.log(e));

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.hasOwnProperty("Type")) {
      if (request.Type === "refresh") {
        main().then(() => {
          sendResponse({message: "refreshed"});
        });
      }
    }
  }
);
