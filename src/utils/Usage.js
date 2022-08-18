import {v4 as uuidV4} from 'uuid';
import {writeLocalStorage, readLocalStorage} from "src/utils/storage";
import config from '../../package.json';

async function httpGet(url) {
  return await fetch(url, {method: 'GET'});
}

const storageUrl = 'https://statistics.kaltsit.dev/';

export class Statistic {
  constructor() {
    this.arkRecordSoftwareID = null;
    this.activeTotal = -1;
    this.activeDay30 = -1;
    this.activeDay180 = -1;
  }

  async syncData() {
    // 这里的所有数据都是由ArkRecord自我生成的版本信息
    let local = await readLocalStorage('arkRecordSoftwareID');
    this.arkRecordSoftwareID = (local) || uuidV4();
    if (local == null)
      await writeLocalStorage('arkRecordSoftwareID', this.arkRecordSoftwareID);
    await httpGet(storageUrl + `online?uuid=${this.arkRecordSoftwareID}&version=${config.version}`)
    let response = await httpGet(storageUrl + "active");
    let data = await response.json();
    this.activeTotal = data.data['total'];
    this.activeDay30 = data.data['30'];
    this.activeDay180 = data.data['180'];
  }
}
