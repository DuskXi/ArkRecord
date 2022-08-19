async function readLocalStorage(key) {
  return JSON.parse(window.localStorage.getItem(key));
}

async function writeLocalStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

async function listLocalStorageKeys() {
  return Object.keys(window.localStorage);
}

async function readAllLocalStorage() {
  let buffer = {};
  Object.keys(window.localStorage).forEach(key => {
    buffer[key] = JSON.parse(window.localStorage.getItem(key));
  });
  return buffer;
}

function max(array, compare = (a, b) => a - b > 0) {
  if (array === 0) return null;
  if (array.length === 0) return null;
  let maxItem = array[0];
  for (let i = 1; i < array.length; i++) {
    if (compare(array[i], maxItem)) {
      maxItem = array[i];
    }
  }
  return maxItem;
}

async function removeLocalStorage(key) {
  window.localStorage.removeItem(key);
}

class UserData {
  constructor(userInfo) {
    this.uid = userInfo.info.uid;
    this.data = {};
    this.type = userInfo.type;
    // this.poolData = {};
    // this.stoneData = {};
    // this.rechargeData = {};
    this.userInfo = userInfo;
  }

  async initialize() {
    let dataSet = await readLocalStorage("UserDataSet");
    let key = this.type === 'official' ? `O/${this.uid}` : `B/${this.uid}`
    if (dataSet == null)
      dataSet = {};
    this.data = dataSet[key];
    if (this.data == null)
      this.data = {userInfo: this.userInfo, poolData: [], stoneData: [], rechargeData: []};
    this.userInfo = this.data.userInfo;
    // this.poolData = this.data.poolData;
    // this.stoneData = this.data.stoneData;
    // this.rechargeData = this.data.rechargeData;
    return true;
  }

  lastUpdate(localData) {
    let currentLastTimestamp = max(localData, (a, b) => a.timestamp - b.timestamp > 0);
    currentLastTimestamp = currentLastTimestamp ? currentLastTimestamp.timestamp : 0;
    return currentLastTimestamp;
  }

  async save(poolData = [], stoneData = [], rechargeData = []) {
    let dataSet = await readLocalStorage("UserDataSet");
    let summarySet = await readLocalStorage("SummaryDataSet");
    let key = this.type === 'official' ? `O/${this.uid}` : `B/${this.uid}`
    if (dataSet == null)
      dataSet = {};
    if (summarySet == null)
      summarySet = {};
    this.data.poolData = this.merge(poolData, this.data.poolData);
    this.data.stoneData = this.merge(stoneData, this.data.stoneData);
    this.data.rechargeData = this.merge(rechargeData, this.data.rechargeData);
    dataSet[key] = this.data;
    summarySet[key] = this.summaryData(this.data.poolData , this.data.stoneData, this.data.rechargeData);
    await writeLocalStorage("UserDataSet", dataSet);
    await writeLocalStorage("SummaryDataSet", summarySet);
  }

  summaryData(poolData = [], stoneData = [], rechargeData = []) {
    return {
      pool: poolData.reduce((acc, item) => acc + item.result.length, 0),
      stone: stoneData.length,
      recharge: rechargeData.length
    }
  }

  difference(poolData = [], stoneData = [], rechargeData = []) {
    return {
      pool: this.diff(poolData, this.data.poolData),
      stone: this.diff(stoneData, this.data.stoneData),
      recharge: this.diff(rechargeData, this.data.rechargeData)
    };
  }

  diff(data, prevData) {
    let existsTimestamp = [];
    let difference = [];
    prevData.forEach(item => existsTimestamp.push(item.timestamp));
    data.forEach(item => difference += existsTimestamp.includes(item.timestamp) ? 0 : 1);
    return difference;
  }


  merge(data, prevData) {
    let result = [];
    let existsTimestamp = [];
    prevData.forEach(item => {
      result.push(item);
      existsTimestamp.push(item.timestamp);
    });
    data.forEach(item => {
      if (!existsTimestamp.includes(item.timestamp)) {
        result.push(item);
      }
    });
    result.sort((a, b) => a.timestamp - b.timestamp);
    return result;
  }
}

export {readLocalStorage, writeLocalStorage, listLocalStorageKeys, readAllLocalStorage, removeLocalStorage, UserData};
