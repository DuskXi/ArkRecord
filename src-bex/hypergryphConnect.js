async function readLocalStorage(key) {
  return new Promise((resolve, _) => {
    chrome.storage.local.get([key], function (result) {
      if (result[key] === undefined) {
        resolve(null);
      } else {
        resolve(result[key]);
      }
    });
  });
}

async function writeLocalStorage(key, value) {
  return new Promise((resolve, _) => {
    chrome.storage.local.set({[key]: value}, function () {
      resolve();
    });
  });
}

async function removeLocalStorage(key) {
  await new Promise((resolve, _) => {
    chrome.storage.local.remove([key], () => {
      resolve();
    })
  });
}

async function listLocalStorageKeys() {
  return new Promise((resolve, _) => {
    chrome.storage.local.get(null, function (items) {
      resolve(Object.keys(items));
    });
  });
}

async function httpGet(url) {
  return await fetch(url, {method: 'GET'});
}

async function httpPost(url, data) {
  return await fetch(url, {method: 'POST', body: JSON.stringify(data)});
}

function max(array, compare = (a, b) => a - b > 0) {
  if (array.length === 0) return null;
  let maxItem = array[0];
  for (let i = 1; i < array.length; i++) {
    if (compare(array[i], maxItem)) {
      maxItem = array[i];
    }
  }
  return maxItem;
}

class Connect {
  constructor() {
    this.token = null;
    this.logged = false;
    this.initialized = false;
    this.tokenRequestUrl = null;
    this.poolDataRequestUrl = "https://ak.hypergryph.com/user/api/inquiry/gacha?channelId=1";
    this.stoneDataRequestUrl = "https://ak.hypergryph.com/user/api/inquiry/diamond?channelId=1";
    this.rechargeDataRequestUrl = "https://as.hypergryph.com/u8/pay/v1/recent";
    this.postData = {appId: 1, channelMasterId: 1, channelToken: {token: null}}
  }

  async verifyAuthorization() {
    let result = await httpGet(this.tokenRequestUrl);
    if (result.status === 200) {
      let json = await result.json();
      this.logged = true;
      this.token = json.data.token;
    }
    this.initialized = true;
  }

  async getPoolData(currentLastTimestamp, strongLoading = false) {
    let dataset = [];
    let max = 1;
    for (let i = 1; i <= max; i++) {
      let data = await httpGet(this.poolDataRequestUrl + `&page=${i}&token=${encodeURIComponent(this.token)}`);
      let json = await data.json();
      if (json.code === 3000) {
        return false;
      }
      max = json.data["pagination"].total;
      dataset.push(json.data.list);
      if (json.data.list.length > 0 && !strongLoading) {
        let lastTimestamp = json.data.list[json.data.list.length - 1]['ts'];
        if (lastTimestamp < currentLastTimestamp) {
          console.log("非强加载，暂停节省资源");
          break;
        }
      }
    }
    return {data: dataset, pages: max};
  }

  async getStoneData(currentLastTimestamp, strongLoading = false) {
    let dataset = [];
    let max = 1;
    for (let i = 1; i <= max; i++) {
      let data = await httpGet(this.stoneDataRequestUrl + `&page=${i}&token=${encodeURIComponent(this.token)}`);
      let json = await data.json();
      if (json.code === 3000) {
        return false;
      }
      max = json.data["pagination"].total;
      dataset.push(json.data.list);
      if (json.data.list.length > 0 && !strongLoading) {
        let lastTimestamp = json.data.list[json.data.list.length - 1]['ts'];
        if (lastTimestamp < currentLastTimestamp){
          console.log("非强加载，暂停节省资源");
          break;
        }
      }
    }
    return {data: dataset, pages: max};
  }

  async getRechargeData() {
    this.postData.channelToken.token = this.token;
    let data = await httpPost(this.rechargeDataRequestUrl, this.postData);
    let json = await data.json();
    if (data.status === 200)
      return json.data;
    else
      return false;
  }
}

class OfficialConnector extends Connect {
  constructor() {
    super();
    this.tokenRequestUrl = "https://as.hypergryph.com/user/info/v1/token_by_cookie";
  }
}

class BilibiliConnector extends Connect {
  constructor() {
    super();
    this.tokenRequestUrl = "https://web-api.hypergryph.com/account/info/ak-b";
    this.poolDataRequestUrl = "https://ak.hypergryph.com/user/api/inquiry/gacha?channelId=2";
    this.stoneDataRequestUrl = "https://ak.hypergryph.com/user/api/inquiry/diamond?channelId=2";
  }

  async verifyAuthorization() {
    let result = await httpGet(this.tokenRequestUrl);
    if (result.status === 200) {
      let json = await result.json();
      this.logged = true;
      this.token = json.data.content;
    }
    this.initialized = true;
  }
}

class Arknights {
  constructor() {
    this.official = new OfficialConnector();
    this.bilibili = new BilibiliConnector();
    this.initialized = false;
  }

  async init() {
    await this.official.verifyAuthorization();
    await this.bilibili.verifyAuthorization();
    this.initialized = true;
    this.bilibiliStatus = this.bilibili.logged;
    this.officialStatus = this.official.logged;
  }

  async updateStatus() {
    await writeLocalStorage("login", this.officialStatus);
    await writeLocalStorage("loginB", this.bilibiliStatus);
  }

  /**
   *
   * @param {Connect} connector
   * @param {number} currentLastTimestamp
   * @param strongLoading
   * @returns
   */
  async requestPoolData(connector, currentLastTimestamp, strongLoading = false) {
    let rawData = await connector.getPoolData(currentLastTimestamp, strongLoading);
    let results = [];
    rawData.data.forEach(group => {
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

  /**
   *
   * @param {Connect} connector
   * @param {number} currentLastTimestamp
   * @param strongLoading
   * @returns
   */
  async requestStoneData(connector, currentLastTimestamp, strongLoading = false) {
    let rawData = await connector.getStoneData(currentLastTimestamp, strongLoading);
    let results = [];
    rawData.data.forEach(group => {
      group.forEach(items => {
        results.push({
          timestamp: items["ts"],
          changes: items["changes"],
          operation: items["operation"]
        });
      })
    });
    return results;
  }

  /**
   *
   * @param {Connect} connector
   * @returns
   */
  async requestRechargeData(connector) {
    let rawData = await connector.getRechargeData();
    if (rawData === false)
      return false;
    let results = [];
    rawData.forEach(items => {
        results.push({
          timestamp: items["payTime"],
          amount: items["amount"],
          orderId: items["orderId"],
          productName: items["productName"],
          platform: items["platform"]
        });
      }
    );
    return results;
  }

  async mergeData(prevData, newData) {
    let occupiedTime = [];
    let merged = [];
    let difference = 0;
    prevData.forEach(item => {
      occupiedTime.push(item.timestamp);
      merged.push(item);
    });
    newData.forEach(item => {
      if (!occupiedTime.includes(item.timestamp)) {
        merged.push(item);
        difference++;
      }
    });
    return [merged, difference];
  }

  async syncPool(connector, keyPoolData, keyPools, strongLoading) {
    let localData = await readLocalStorage(keyPoolData);
    let currentLastTimestamp = max(localData, (a, b) => a.timestamp - b.timestamp > 0).timestamp;
    let serverData = await this.requestPoolData(connector, currentLastTimestamp, strongLoading);
    if (localData === null)
      localData = [];
    let [merged, difference] = await this.mergeData(localData, serverData);
    await writeLocalStorage(keyPoolData, merged);
    return difference;
  }

  async syncStone(connector, keyStone, strongLoading) {
    let localData = await readLocalStorage(keyStone);
    let currentLastTimestamp = max(localData, (a, b) => a.timestamp - b.timestamp > 0).timestamp;
    let serverData = await this.requestStoneData(connector, currentLastTimestamp, strongLoading);
    if (localData === null)
      localData = [];
    let [merged, difference] = await this.mergeData(localData, serverData);
    await writeLocalStorage(keyStone, merged);
    return difference;
  }

  async syncRecharge(connector, keyRecharge) {
    let localData = await readLocalStorage(keyRecharge);
    let serverData = await this.requestRechargeData(connector);
    if (serverData === false)
      return false;
    if (localData === null)
      localData = [];
    let [merged, difference] = await this.mergeData(localData, serverData);
    await writeLocalStorage(keyRecharge, merged);
    return difference;
  }

  async syncPoolData(strongLoading = false) {
    if (this.officialStatus) {
      this.officialPoolDifference = await this.syncPool(this.official, "ArknightsCardInformation", "pools", strongLoading);
    }

    if (this.bilibiliStatus) {
      this.bilibiliPoolDifference = await this.syncPool(this.bilibili, "ArknightsCardInformationB", "poolsB", strongLoading);
    }
  }

  async syncStoneData(strongLoading = false) {
    if (this.officialStatus) {
      this.officialStoneDifference = await this.syncStone(this.official, "StoneOfficial", strongLoading);
    }

    if (this.bilibiliStatus) {
      this.bilibiliStoneDifference = await this.syncStone(this.bilibili, "StoneBilibili", strongLoading);
    }
  }

  async syncRechargeData() {
    if (this.officialStatus) {
      this.officialRechargeDifference = await this.syncRecharge(this.official, "RechargeOfficial");
    }

    if (this.bilibiliStatus) {
      // this.bilibiliRechargeDifference = await this.syncRecharge(this.bilibili, "RechargeBilibili");
    }
  }
}

export {
  Arknights,
  removeLocalStorage,
  readLocalStorage,
  writeLocalStorage,
  listLocalStorageKeys
}
