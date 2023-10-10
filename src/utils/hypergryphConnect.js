import {readLocalStorage, writeLocalStorage, UserData} from './storage';


async function httpGet(url) {
  return await fetch(url, {method: 'GET', mode: 'cors'});
}

async function httpPost(url, data) {
  return await fetch(url, {method: 'POST', body: JSON.stringify(data), mode: 'cors'});
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
    this.vertifyUrl = 'https://api.kaltsit.dev/info/u8/user/info/v1/basic';
    this.poolDataRequestUrl = "https://api.kaltsit.dev/pool/user/api/inquiry/gacha?channelId=1";
    this.stoneDataRequestUrl = "https://api.kaltsit.dev/stone/user/api/inquiry/diamond?channelId=1";
    this.rechargeDataRequestUrl = "https://api.kaltsit.dev/recharge/u8/pay/v1/recent";
    this.postData = {appId: 1, channelMasterId: 1, channelToken: {token: null}}
  }

  async verifyAuthorization() {
    if (!this.token) {
      this.initialized = true;
      return;
    }
    let result = await httpPost(this.vertifyUrl, this.postData);
    if (result.status === 200) {
      let data = await result.json();
      if (data.status === 0)
        this.logged = true;
    }
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
        if (lastTimestamp < currentLastTimestamp) {
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
  constructor(userInfo) {
    super();
    if (userInfo != null) {
      this.token = userInfo.token;
      this.postData.channelToken.token = this.token;
      this.userData = new UserData(userInfo);
    }
  }
}

class BilibiliConnector extends Connect {
  constructor(userInfo) {
    super();
    this.poolDataRequestUrl = "https://api.kaltsit.dev/pool/user/api/inquiry/gacha?channelId=2";
    this.stoneDataRequestUrl = "https://api.kaltsit.dev/stone/user/api/inquiry/diamond?channelId=2";
    if (userInfo != null) {
      this.token = userInfo.token;
      this.postData = {token: userInfo.token};
      this.userData = new UserData(userInfo);
    }
  }
}

class Arknights {
  constructor(userInfo) {
    if (userInfo != null) {
      this.official = new OfficialConnector(userInfo.type === 'official' ? userInfo : null);
      this.bilibili = new BilibiliConnector(userInfo.type === 'bilibili' ? userInfo : null);
    } else {
      this.official = new OfficialConnector(null);
      this.bilibili = new BilibiliConnector(null);
    }
    this.initialized = false;
  }

  async init() {
    if (this.official.userData != null)
      await this.official.userData.initialize();
    if (this.bilibili.userData != null)
      await this.bilibili.userData.initialize();
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
    if (localData === null)
      localData = [];
    let currentLastTimestamp = max(localData, (a, b) => a.timestamp - b.timestamp > 0);
    currentLastTimestamp = currentLastTimestamp ? currentLastTimestamp.timestamp : 0;
    let serverData = await this.requestPoolData(connector, currentLastTimestamp, strongLoading);
    let [merged, difference] = await this.mergeData(localData, serverData);
    await writeLocalStorage(keyPoolData, merged);
    return difference;
  }

  async SyncPool(connector, strongLoading) {
    let currentLastTimestamp = connector.userData.lastUpdate(connector.userData.data.poolData);
    let serverData = await this.requestPoolData(connector, currentLastTimestamp, strongLoading);
    let difference = connector.userData.difference(serverData, [], []).pool;
    await connector.userData.save(serverData, [], []);
    return difference;
  }

  async SyncStone(connector, strongLoading) {
    let currentLastTimestamp = connector.userData.lastUpdate(connector.userData.data.stoneData);
    let serverData = await this.requestStoneData(connector, currentLastTimestamp, strongLoading);
    let difference = connector.userData.difference([], serverData, []).stone;
    await connector.userData.save([], serverData, []);
    return difference;
  }

  async SyncRecharge(connector) {
    let serverData = await this.requestRechargeData(connector);
    let difference = connector.userData.difference([], [], serverData).recharge;
    await connector.userData.save([], [], serverData);
    return difference;
  }

  async syncStone(connector, keyStone, strongLoading) {
    let localData = await readLocalStorage(keyStone);
    if (localData === null)
      localData = [];
    let currentLastTimestamp = max(localData, (a, b) => a.timestamp - b.timestamp > 0);
    currentLastTimestamp = currentLastTimestamp ? currentLastTimestamp.timestamp : 0;
    let serverData = await this.requestStoneData(connector, currentLastTimestamp, strongLoading);
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
      // this.officialPoolDifference = await this.syncPool(this.official, "ArknightsCardInformation", "pools", strongLoading);
      this.officialPoolDifference = await this.SyncPool(this.official, strongLoading);
    }

    if (this.bilibiliStatus) {
      // this.bilibiliPoolDifference = await this.syncPool(this.bilibili, "ArknightsCardInformationB", "poolsB", strongLoading);
      this.bilibiliPoolDifference = await this.SyncPool(this.bilibili, strongLoading);
    }
  }

  async syncStoneData(strongLoading = false) {
    if (this.officialStatus) {
      // this.officialStoneDifference = await this.syncStone(this.official, "StoneOfficial", strongLoading);
      this.officialStoneDifference = await this.SyncStone(this.official, strongLoading);
    }

    if (this.bilibiliStatus) {
      // this.bilibiliStoneDifference = await this.syncStone(this.bilibili, "StoneBilibili", strongLoading);
      this.bilibiliStoneDifference = await this.SyncStone(this.bilibili, strongLoading);
    }
  }

  async syncRechargeData() {
    if (this.officialStatus) {
      // this.officialRechargeDifference = await this.syncRecharge(this.official, "RechargeOfficial");
      this.officialRechargeDifference = await this.SyncRecharge(this.official);
    }

    if (this.bilibiliStatus) {
      // this.bilibiliRechargeDifference = await this.syncRecharge(this.bilibili, "RechargeBilibili");
    }
  }
}

class Background {
  async updateInformation(feedback, initiative = false) {
    let active = await readLocalStorage("active");
    feedback('开始同步数据');
    let arknights = new Arknights(active);
    feedback('进行身份验证');
    await arknights.init();
    feedback('官服' + (arknights.officialStatus ? '已登录' : '未登录'));
    feedback('B服' + (arknights.bilibiliStatus ? '已登录' : '未登录'));
    // await arknights.updateStatus();
    if (arknights.officialStatus || arknights.bilibiliStatus) {
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
      } catch (e) {
        console.log(e);
        console.trace();
      }
      feedback("数据同步完毕")
      if (arknights.officialPoolDifference > 0)
        await this.reportChanging(arknights.officialPoolDifference, "寻访", 1);
      if (arknights.bilibiliPoolDifference > 0)
        await this.reportChanging(arknights.officialPoolDifference, "寻访", 2);
      if (arknights.officialStoneDifference > 0)
        await this.reportChanging(arknights.officialStoneDifference, "源石变更", 1);
      if (arknights.bilibiliStoneDifference > 0)
        await this.reportChanging(arknights.officialStoneDifference, "源石变更", 2);
      if (arknights.officialRechargeDifference > 0)
        await this.reportChanging(arknights.officialRechargeDifference, "充值", 1);
    }
    console.log(arknights)
  }

  async updateSpecify(userInfo, feedback, initiative = false){
    feedback('开始同步数据');
    let arknights = new Arknights(userInfo);
    feedback('进行身份验证');
    await arknights.init();
    feedback('官服' + (arknights.officialStatus ? '已登录' : '未登录'));
    feedback('B服' + (arknights.bilibiliStatus ? '已登录' : '未登录'));
    // await arknights.updateStatus();
    if (arknights.officialStatus || arknights.bilibiliStatus) {
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
      } catch (e) {
        console.log(e);
        console.trace();
      }
      feedback("数据同步完毕")
      if (arknights.officialPoolDifference > 0)
        await this.reportChanging(arknights.officialPoolDifference, "寻访", 1);
      if (arknights.bilibiliPoolDifference > 0)
        await this.reportChanging(arknights.officialPoolDifference, "寻访", 2);
      if (arknights.officialStoneDifference > 0)
        await this.reportChanging(arknights.officialStoneDifference, "源石变更", 1);
      if (arknights.bilibiliStoneDifference > 0)
        await this.reportChanging(arknights.officialStoneDifference, "源石变更", 2);
      if (arknights.officialRechargeDifference > 0)
        await this.reportChanging(arknights.officialRechargeDifference, "充值", 1);
    }
    console.log(arknights)
  }

  async reportChanging(count, name, type = 1,) {
    // chrome.notifications.create('DataUpdate', {
    //   type: 'basic',
    //   iconUrl: '/icons/record-128.png',
    //   title: (type ? '官服:' : 'B服') + `有新的${name}数据更新, 更新了${count}条数据`,
    //   message: `${name}数据已更新，请刷新页面查看`,
    //   priority: 2
    // })
  }
}

var background = new Background();

export default {background};
