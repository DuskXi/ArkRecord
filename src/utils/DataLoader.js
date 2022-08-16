import {loadPools, buildTotalData} from "src/utils/data";

class DataLoader {
  constructor(version) {
    this.version = version;
    this.officialPools = [];
    this.bilibiliPools = [];
    this.officialStones = [];
    this.bilibiliStones = [];
    this.officialRecharge = [];
    this.bilibiliRecharge = [];

    this.numberOfficialPools = 0;
    this.numberBilibiliPools = 0;
    this.numberOfficialStones = 0;
    this.numberBilibiliStones = 0;
    this.numberOfficialRecharge = 0;
    this.numberBilibiliRecharge = 0;
  }

  load(jsonString) {
    let object = JSON.parse(jsonString);
    this.version = object.hasOwnProperty('version') ? object.version : -1;
    this.officialPools = object.hasOwnProperty('poolsData') ? object.poolsData : [];
    this.bilibiliPools = object.hasOwnProperty('poolsDataB') ? object.poolsDataB : [];
    this.officialStones = object.hasOwnProperty('officialStones') ? object.officialStones : [];
    this.bilibiliStones = object.hasOwnProperty('bilibiliStones') ? object.bilibiliStones : [];
    this.officialRecharge = object.hasOwnProperty('officialRecharge') ? object.officialRecharge : [];
    this.bilibiliRecharge = object.hasOwnProperty('bilibiliRecharge') ? object.bilibiliRecharge : [];
  }

  toJson() {
    return JSON.stringify({
      version: this.version,
      message: `本数据文件存有: ${this.summary()}`,
      poolsData: this.officialPools,
      poolsDataB: this.bilibiliPools,
      officialStones: this.officialStones,
      bilibiliStones: this.bilibiliStones,
      officialRecharge: this.officialRecharge,
      bilibiliRecharge: this.bilibiliRecharge
    }, null, 4);
  }

  toCsv() {
    let result = {};
    result.officialPools = this.officialPools.length > 0 ? this.poolsToCsv(this.officialPools) : null;
    result.bilibiliPools = this.bilibiliPools.length > 0 ? this.poolsToCsv(this.bilibiliPools) : null;
    result.officialStones = this.officialStones.length > 0 ? this.stoneDataToCsv(this.officialStones) : null;
    result.bilibiliStones = this.bilibiliStones.length > 0 ? this.stoneDataToCsv(this.bilibiliStones) : null;
    result.officialRecharge = this.officialRecharge.length > 0 ? this.rechargeDataToCsv(this.officialRecharge) : null;
    result.bilibiliRecharge = this.bilibiliRecharge.length > 0 ? this.rechargeDataToCsv(this.bilibiliRecharge) : null;
    return result;
  }

  poolsToCsv(poolsData) {
    let pools = Object.values(loadPools(poolsData));
    let totalPool = buildTotalData(pools);
    let csv = "";
    csv += "池子,干员,星级,时间,是否第一次获得\n";
    totalPool.records.forEach(item => {
      let datetime = new Date(item.timestamp);
      let timeString = `${datetime.toLocaleDateString()} ${datetime.toLocaleTimeString()} UTC+${(0 - new Date().getTimezoneOffset() / 60)}`;
      csv += `${item.pool},${item.character},${item.star}星,${timeString},${item.isFirstTimes ? "是" : "否"}\n`;
    });
    return csv;
  }

  stoneDataToCsv(stoneData) {
    let csv = "";
    csv += "时间,操作,变化前,变化后,变化值,平台\n";
    stoneData.forEach(item => {
      try {
        let datetime = new Date(item.timestamp * 1000);
        let timeString = `${datetime.toLocaleDateString()} ${datetime.toLocaleTimeString()} UTC+${(0 - new Date().getTimezoneOffset() / 60)}`;
        let difference = item.changes[0].after - item.changes[0].before;
        csv += `${timeString},${item.operation},${item.changes[0].before},${item.changes[0].after},${difference},${item.changes[0].type}\n`;
      } catch {
      }
    });
    return csv;
  }

  rechargeDataToCsv(rechargeData) {
    let csv = "";
    csv += "价格(¥),订单号,内容,时间,平台ID\n";
    rechargeData.forEach(item => {
      let datetime = new Date(item.timestamp * 1000);
      let timeString = `${datetime.toLocaleDateString()} ${datetime.toLocaleTimeString()} UTC+${(0 - new Date().getTimezoneOffset() / 60)}`;
      csv += `${item.amount / 100},${item.orderId} \t,${item.productName},${timeString},${item.platform}\n`;
    });
    return csv;
  }

  summary() {
    this.numberOfficialPools = this.officialPools.reduce((acc, cur) => acc + cur.result.length, 0);
    this.numberBilibiliPools = this.bilibiliPools.reduce((acc, cur) => acc + cur.result.length, 0);
    this.numberOfficialStones = this.officialStones.length;
    this.numberBilibiliStones = this.bilibiliStones.length;
    this.numberOfficialRecharge = this.officialRecharge.length;
    this.numberBilibiliRecharge = this.bilibiliRecharge.length;
    let result = '';
    if (this.numberOfficialPools > 0)
      result += `储存官服卡池数据${this.numberOfficialPools}次;`;
    if (this.numberBilibiliPools > 0)
      result += `储存B服卡池数据${this.numberBilibiliPools}次;`;
    if (this.numberOfficialStones > 0)
      result += `储存官服源石数据${this.numberOfficialStones}条;`;
    if (this.numberBilibiliStones > 0)
      result += `储存B服源石数据${this.numberBilibiliStones}条;`;
    if (this.numberOfficialRecharge > 0)
      result += `储存官服充值数据${this.numberOfficialRecharge}条;`;
    if (this.numberBilibiliRecharge > 0)
      result += `储存B服充值数据${this.numberBilibiliRecharge}条;`;
    return result;
  }
}

export {
  DataLoader
}
