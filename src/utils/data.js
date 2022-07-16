class Record {
  /**
   *
   * @param { string } character
   * @param { string } star
   * @param { string } pool
   * @param { int } timestamp
   * @param { boolean } isFirstTimes
   */
  constructor(character, star, pool, timestamp, isFirstTimes) {
    this.character = character;
    this.star = star;
    this.pool = pool;
    this.timestamp = timestamp;
    this.isFirstTimes = isFirstTimes;
  }
}

class Pool {

  /**
   *
   * @param { string } name
   * @param { Record[] } records
   */
  constructor(name, records = []) {
    this.name = name;
    this.records = records;
    this.star3 = [];
    this.star4 = [];
    this.star5 = [];
    this.star6 = [];
  }

  getStatisticalInformation() {
    return [
      calculateStatisticalInfo(this.star6, this.records.length, "6星"),
      calculateStatisticalInfo(this.star5, this.records.length, "5星"),
      calculateStatisticalInfo(this.star4, this.records.length, "4星"),
      calculateStatisticalInfo(this.star3, this.records.length, "3星")
    ];
  }

  getLastUpdate() {
    let last_Timestamp = 0;
    this.records.forEach(record => {
      if (record.timestamp > last_Timestamp) {
        last_Timestamp = record.timestamp;
      }
    });
    return last_Timestamp;
  }

  /**
   *
   * @param { Record } record
   */
  add(record) {
    this.records.push(record);
    switch (record.star) {
      case 3:
        this.star3.push(record);
        break;
      case 4:
        this.star4.push(record);
        break;
      case 5:
        this.star5.push(record);
        break;
      case 6:
        this.star6.push(record);
        break;
    }
  }

  sortDown() {
    this.records.sort((a, b) => b.timestamp - a.timestamp);
    this.star3.sort((a, b) => b.timestamp - a.timestamp);
    this.star4.sort((a, b) => b.timestamp - a.timestamp);
    this.star5.sort((a, b) => b.timestamp - a.timestamp);
    this.star6.sort((a, b) => b.timestamp - a.timestamp);
  }

  sortUp() {
    this.records.sort((a, b) => a.timestamp - b.timestamp);
    this.star3.sort((a, b) => a.timestamp - b.timestamp);
    this.star4.sort((a, b) => a.timestamp - b.timestamp);
    this.star5.sort((a, b) => a.timestamp - b.timestamp);
    this.star6.sort((a, b) => a.timestamp - b.timestamp);
  }

  first() {
    let min = this.records[0].timestamp;
    this.records.forEach(record => min = Math.min(min, record.timestamp));
    return min;
  }

  last() {
    let max = this.records[0].timestamp;
    this.records.forEach(record => max = Math.max(max, record.timestamp));
    return max;
  }
}

export class TotalData {
  constructor() {
    this.records = [];
    this.star3 = [];
    this.star4 = [];
    this.star5 = [];
    this.star6 = [];
  }

  getStatisticalInformation() {
    return [
      calculateStatisticalInfo(this.star6, this.records.length, "6星"),
      calculateStatisticalInfo(this.star5, this.records.length, "5星"),
      calculateStatisticalInfo(this.star4, this.records.length, "4星"),
      calculateStatisticalInfo(this.star3, this.records.length, "3星")
    ];
  }

  add(record) {
    this.records.push(record);
    switch (record.star) {
      case 3:
        this.star3.push(record);
        break;
      case 4:
        this.star4.push(record);
        break;
      case 5:
        this.star5.push(record);
        break;
      case 6:
        this.star6.push(record);
        break;
    }
  }

  sortDown() {
    this.records.sort((a, b) => b.timestamp - a.timestamp);
    this.star3.sort((a, b) => b.timestamp - a.timestamp);
    this.star4.sort((a, b) => b.timestamp - a.timestamp);
    this.star5.sort((a, b) => b.timestamp - a.timestamp);
    this.star6.sort((a, b) => b.timestamp - a.timestamp);
  }

  sortUp() {
    this.records.sort((a, b) => a.timestamp - b.timestamp);
    this.star3.sort((a, b) => a.timestamp - b.timestamp);
    this.star4.sort((a, b) => a.timestamp - b.timestamp);
    this.star5.sort((a, b) => a.timestamp - b.timestamp);
    this.star6.sort((a, b) => a.timestamp - b.timestamp);
  }

  first() {
    let min = this.records[0].timestamp;
    this.records.forEach(record => min = Math.min(min, record.timestamp));
    return min;
  }

  last() {
    let max = this.records[0].timestamp;
    this.records.forEach(record => max = Math.max(max, record.timestamp));
    return max;
  }
}

class StatisticalInformation {
  /**
   *
   * @param { string } type
   * @param { number } count
   * @param { number } countWithoutRepeat
   * @param { number } probability
   * @param { number } repeatRate
   * @param { string } showText
   * @param { string } showTextCount
   *
   */
  constructor(type, count, countWithoutRepeat, probability, repeatRate, showText, showTextCount) {
    this.type = type;
    this.count = count;
    this.countWithoutRepeat = countWithoutRepeat;
    this.probability = probability;
    this.repeatRate = repeatRate;
    this.showText = showText;
    this.showTextCount = showTextCount;
  }
}

/**
 *
 * @param { Record[] } records
 * @param { number } totalLength
 * @param { string } type
 */
function calculateStatisticalInfo(records, totalLength, type) {
  let count = records.length;
  let countWithoutRepeat = 0;
  let probability = count / totalLength;
  let repeatRate;
  // calculate countWithoutRepeat and repeatRate
  let visited = [];
  records.forEach(record => {
    if (!visited.includes(record.character)) {
      visited.push(record.character);
      countWithoutRepeat++;
    }
  });
  repeatRate = (count - countWithoutRepeat) / count;
  let countOnName = {};
  let text = "";
  let textCount = "";
  records.forEach(record => {
    if (!countOnName.hasOwnProperty(record.character))
      countOnName[record.character] = 1;
    else
      countOnName[record.character]++;
  });
  let len = Object.keys(countOnName).length;
  let i = 0;
  for (let key in countOnName) {
    text += `${key}${i < len - 1 ? ',' : ''} `;
    textCount += `${key}: ${countOnName[key]}${i < len - 1 ? ',' : ''} `;
    i++;
  }
  return new StatisticalInformation(type, count, countWithoutRepeat, probability, repeatRate, text, textCount);
}

function loadPools(rawData, allowStandardPool = true) {
  let pools = {};
  if (rawData == null) return pools;
  rawData.forEach(element => {
    if (allowStandardPool || element["pool"] !== "常驻标准寻访") {
      let poolName = element["pool"];
      let timestamp = element["timestamp"] * 1000;
      let dataset = element["result"];
      let pool;
      if (!pools.hasOwnProperty(poolName)) {
        pools[poolName] = new Pool(poolName);
      }
      pool = pools[poolName];
      dataset.forEach(item => pool.add(new Record(item["name"], item["rarity"] + 1, poolName, timestamp, item["isNew"])));
    }
  });
  return pools;
}

function filterInTime(rawData, start, end) {
  return rawData.filter(element => element["timestamp"] * 1000 >= start.getTime() && element["timestamp"] * 1000 <= end.getTime());
}

/**
 *
 * @param {TotalData} totalPool
 */
function splitNormalPools(totalPool) {
  let period = [];
  let start = 0;
  let end = 0;
  let pools = [];
  totalPool.sortUp();
  totalPool.records.forEach(record => {
    if (record.pool === "常驻标准寻访") {
      start = start === 0 ? record.timestamp : start;
      end = record.timestamp;
    } else {
      if (start !== 0) {
        period.push([start, end]);
      }
      start = 0;
    }
  });
  if (start !== 0)
    period.push([start, end]);
  period = period.sort((a, b) => b[0] - a[0]);
  period.forEach(range => {
    let startDate = new Date(range[0]).toLocaleDateString();
    let startTime = new Date(range[0]).toLocaleTimeString();
    let endDate = new Date(range[1]).toLocaleDateString();
    let endTime = new Date(range[1]).toLocaleTimeString();
    let poolName = startDate === endDate ? `${startDate} ${startTime}-${endTime}` : `${startDate} ${startTime}-${endDate} ${endTime}`;
    let pool = new Pool(poolName);
    totalPool.records.forEach(record => {
      if (record.timestamp >= range[0] && record.timestamp <= range[1])
        pool.add(record);
    });
    pools.push(pool);
  });
  return pools;
}

/**
 *
 * @param { Pool[] } pools
 * @param { string } name
 */
function mergePools(pools, name) {
  let pool = new Pool(name);
  pools.forEach(element => {
    element.records.forEach(record => {
      pool.add(record);
    });
  });
  return pool;
}


/**
 *
 * @param {Pool[]} pools
 * @returns {TotalData}
 */
function buildTotalData(pools) {
  let totalData = new TotalData();
  pools.forEach(pool => {
    pool.records.forEach(record => totalData.add(record));
  });
  return totalData;
}

export {Record, Pool, StatisticalInformation, loadPools, buildTotalData, filterInTime, splitNormalPools, mergePools};
