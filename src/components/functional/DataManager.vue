<template>
  <q-btn-group class="float-right" push>
    <q-btn color="accent" label="刷新数据" @click="refreshData()"/>
    <q-btn color="positive" label="导入数据" @click="uploadData()"/>
    <q-btn-dropdown color="secondary" label="导出数据">
      <q-list>
        <q-item clickable v-close-popup @click="exportData('json')">
          <q-item-section>
            <q-item-label>json</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-close-popup @click="exportData('csv')">
          <q-item-section>
            <q-item-label>csv</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </q-btn-group>
  <input type="file" style="visibility: hidden" id="uploader" @change="fileLoaded()">
</template>

<script>
import {Notify, exportFile} from "quasar";
import {readLocalStorage, listLocalStorageKeys, writeLocalStorage} from "src/utils/storage";
import {loadPools, buildTotalData} from "src/utils/data";
import {DataLoader} from "src/utils/DataLoader";

export default {
  name: "DataManager",
  methods: {
    refreshData() {
      chrome.runtime.sendMessage({
        Type: "refresh", initiative: true, realTimeUpdate: (percentage, create = false, title = '') => {
          return this.$q.notify({group: false, timeout: 0, spinner: true, message: title, caption: '0%', position: 'center', type: 'info'});
        }
      }, function () {
        Notify.create({type: 'positive', message: '数据已刷新'})
      });
    },
    registryListener() {
      var quasarCore = this;
      chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
          if (request.type === "statusUpdate") {
            Notify.create({
              type: 'positive',
              message: '状态更新: ' + request.message,
              timeout: 5000
            })
          }
          if (request.type === "progress") {
            let create = request.create;
            let percentage = request.percentage;
            let name = request.name ? request.name : '';
            let index = request.index;
            let finished = request.finished;
            let unit = request.unit;
            if (create) {
              const notification = quasarCore.$q.notify({group: false, timeout: 0, spinner: true, message: `正在同步${name}`, caption: '0%', position: 'center', type: 'info'});
              quasarCore.notify = (percentage, count, finish) => {
                notification({caption: `${Math.round(percentage * 100)}% (${count} ${unit})`});
                if (finish)
                  notification({icon: 'done', spinner: false, message: '同步完成', timeout: 3500})
              }
            } else {
              quasarCore.notify(percentage, index, finished)
            }
          }
          sendResponse({});
        }
      );
    },
    async exportData(type) {
      let dataLoader = await this.loadData();
      if (type === 'json') {
        let content = dataLoader.toJson();
        let currentTime = new Date();
        let timeString = `${currentTime.toLocaleDateString()} ${currentTime.toLocaleTimeString()}`;
        timeString = timeString.replace(/\//g, '-').replace(/:/g, '-');
        exportFile(`ArkRecord_data_${timeString}.json`, content, 'text/json')
      } else if (type === 'csv') {
        let csvDict = dataLoader.toCsv();
        let currentTime = new Date();
        let timeString = `${currentTime.toLocaleDateString()} ${currentTime.toLocaleTimeString()}`;
        timeString = timeString.replace(/\//g, '-').replace(/:/g, '-');
        let keys = Object.keys(csvDict);
        for (let i = 0; i < keys.length; i++) {
          let content = csvDict[keys[i]];
          if (content !== null) {
            exportFile(`exported_${keys[i]}_${timeString}.csv`, "\uFEFF" + content, 'text/csv');
          }
        }
      } else {
        Notify.create({
          type: 'error',
          message: '不支持的类型' + `: "${type}"`
        })
      }

      Notify.create({
        type: 'positive',
        message: `导出: ${dataLoader.summary()}`
      })
    },
    async loadData() {
      let dataLoader = new DataLoader();
      let keys = await listLocalStorageKeys();
      if (keys.includes("ArknightsCardInformation"))
        dataLoader.officialPools = await readLocalStorage("ArknightsCardInformation");
      if (keys.includes("ArknightsCardInformationB"))
        dataLoader.bilibiliPools = await readLocalStorage("ArknightsCardInformationB");
      if (keys.includes("StoneOfficial"))
        dataLoader.officialStones = await readLocalStorage("StoneOfficial");
      if (keys.includes("StoneBilibili"))
        dataLoader.bilibiliStones = await readLocalStorage("StoneBilibili");
      if (keys.includes("RechargeOfficial"))
        dataLoader.officialRecharge = await readLocalStorage("RechargeOfficial");
      if (keys.includes("RechargeBilibili"))
        dataLoader.bilibiliRecharge = await readLocalStorage("RechargeBilibili");
      return dataLoader;
    },
    uploadData() {
      document.getElementById("uploader").click();
    },
    async fileLoaded() {
      let file = document.getElementById("uploader").files[0];
      const reader = new FileReader();
      let result = await new Promise((resolve, reject) => {
        reader.onload = function (e) {
          resolve(e.target.result);
        };
        reader.onerror = function (e) {
          reject(e);
        }
        reader.readAsText(file);
      });
      try {
        let dataLoader = new DataLoader();
        dataLoader.load(result);
        if (dataLoader.officialPools.length > 0)
          await writeLocalStorage("ArknightsCardInformation", this.merge(dataLoader.officialPools, await readLocalStorage("ArknightsCardInformation")));
        if (dataLoader.bilibiliPools.length > 0)
          await writeLocalStorage("ArknightsCardInformationB", this.merge(dataLoader.bilibiliPools, await readLocalStorage("ArknightsCardInformationB")));
        if (dataLoader.officialStones.length > 0)
          await writeLocalStorage("StoneOfficial", this.merge(dataLoader.officialStones, await readLocalStorage("StoneOfficial")));
        if (dataLoader.bilibiliStones.length > 0)
          await writeLocalStorage("StoneBilibili", this.merge(dataLoader.bilibiliStones, await readLocalStorage("StoneBilibili")));
        if (dataLoader.officialRecharge.length > 0)
          await writeLocalStorage("RechargeOfficial", this.merge(dataLoader.officialRecharge, await readLocalStorage("RechargeOfficial")));
        if (dataLoader.bilibiliRecharge.length > 0)
          await writeLocalStorage("RechargeBilibili", this.merge(dataLoader.bilibiliRecharge, await readLocalStorage("RechargeBilibili")));
        Notify.create({
          type: 'positive',
          message: `数据导入完成: ${dataLoader.summary()}`
        });
      } catch (e) {
        Notify.create({
          type: 'error',
          message: '导入数据失败，请检查文件是否正确' + e
        })
      }
    },
    merge(data, prevData) {
      let local = prevData;
      local = local !== null ? local : [];
      let changed = 0;
      if (this.checkStructure(local)) {
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
      return local;
    },
    download(url, name) {
      const a = document.createElement('a')
      a.download = name
      a.rel = 'noopener'
      a.href = url
      a.dispatchEvent(new MouseEvent('click'))
    },
    checkStructure(data) {
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
    },
    poolsDataToCsv(poolsData) {
      let pools = Object.values(loadPools(poolsData));
      let totalPool = buildTotalData(pools);
      let csv = "";
      csv += "池子,干员,星级,时间,是否第一次获得\n";
      totalPool.records.forEach(item => {
        let datetime = new Date(item.timestamp);
        csv += `${item.pool},${item.character},${item.star}星,${datetime.toLocaleDateString()} ${datetime.toLocaleTimeString()},${item.isFirstTimes ? "是" : "否"}\n`;
      });
      return csv;
    }
  },
  mounted() {
    this.registryListener();
  },
  data: () => ({}),
  props: {
    dataUpdated: {
      type: Number,
      default: new Date().getTime()
    },
    bilibili: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>

</style>
