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
  <input type="file" style="visibility: hidden" id="uploader" @change="fileLoaded()" :key="uploadKey">
</template>

<script>
import {Notify, exportFile} from "quasar";
import {readLocalStorage, listLocalStorageKeys, writeLocalStorage, UserData} from "src/utils/storage";
import {loadPools, buildTotalData} from "src/utils/data";
import global from "src/utils/hypergryphConnect";
import {DataLoader, DataLoaderPrev, DataPackage} from "src/utils/DataLoader";

export default {
  name: "DataManager",
  methods: {
    refreshData() {
      global.background.updateInformation((message) => {
        Notify.create({
          message: message,
          color: 'positive',
          position: 'top',
          timeout: 2000
        });
      }, false);
    },
    registryListener() {
      // alert("注册");
    },
    async exportData(type) {
      let dataLoader = await this.loadData();
      let dataPackage = await this.loadDataPackage();
      if (type === 'json') {
        let content = dataPackage.toJson();
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
      let active = await readLocalStorage('active');
      let userData = new UserData(active);
      await userData.initialize();
      dataLoader.pool = userData.data.poolData;
      dataLoader.stone = userData.data.stoneData;
      dataLoader.recharge = userData.data.rechargeData;
      return dataLoader;
    },
    async loadDataPackage() {
      let dataPackage = new DataPackage();
      let dataSet = await readLocalStorage("UserDataSet");
      for (let key of Object.keys(dataSet)) {
        let data = dataSet[key];
        let dataLoader = new DataLoader(1);
        dataLoader.pool = data.poolData;
        dataLoader.stone = data.stoneData;
        dataLoader.recharge = data.rechargeData;
        dataPackage.loaders.push({dataLoader: dataLoader, userInfo: data.userInfo});
      }
      return dataPackage;
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
        let jsonObject = JSON.parse(result);
        if (jsonObject.hasOwnProperty("dataBody")) {
          let dataPackage = new DataPackage()
          dataPackage.load(result);
          for (let loader of dataPackage.loaders) {
            let userInfo = loader.userInfo;
            let dataLoader = loader.dataLoader;
            let userData = new UserData(userInfo);
            await userData.initialize();
            // let difference = userData.difference(loader.pool, loader.stone, loader.recharge);
            await userData.save(dataLoader.pool, dataLoader.stone, dataLoader.recharge);
            Notify.create({
              type: 'positive',
              message: `导入数据: ${dataLoader.summary()}`
            });
          }
          Notify.create({
            type: 'positive',
            message: `导入完成，一共: ${dataPackage.loaders.length} 个方舟账户数据`
          });
        } else {
          let dataLoader = new DataLoaderPrev(result);
          let active = await readLocalStorage("active");
          dataLoader.load(result);
          Notify.create({
            type: 'positive',
            message: `导入的数据为老版本数据文件，没有用户标识，将会自动根据渠道导入当前激活的用户数据集`,
            timeout: 10000
          });
          if (active == null) {
            Notify.create({
              type: 'negative',
              message: `导入文件未标记token与uid，没有激活的用户数据集，请先添加一个明日方舟的账号token`,
              timeout: 10000
            });
            return;
          }
          if (dataLoader.hasOfficialData()) {
            if (active.type === "official") {
              let userData = new UserData(active);
              await userData.initialize();
              await userData.save(dataLoader.officialPools, dataLoader.officialStones, dataLoader.officialRecharge);
              Notify.create({
                type: 'positive',
                message: `导入数据: ${dataLoader.summaryOfficial()}`
              });
            } else {
              Notify.create({
                type: 'warning',
                message: `当前导入的数据中有官服数据，但是当前所激活的是B服数据，请到设置中切换后再次导入`,
                timeout: 7000
              });
            }
          }
          if (dataLoader.hasBilibiliData()) {
            if (active.type === "bilibili") {
              let userData = new UserData(active);
              await userData.initialize();
              await userData.save(dataLoader.bilibiliPools, dataLoader.bilibiliStones, dataLoader.bilibiliRecharge);
              Notify.create({
                type: 'positive',
                message: `导入数据: ${dataLoader.summaryBilibili()}`
              });
            } else {
              Notify.create({
                type: 'warning',
                message: `当前导入的数据中有B服数据，但是当前所激活的是官服数据，请到设置中切换后再次导入`,
                timeout: 7000
              });
            }
          }
        }


        // let dataLoader = new DataLoader();
        // dataLoader.load(result);
        // if (dataLoader.officialPools.length > 0)
        //   await writeLocalStorage("ArknightsCardInformation", this.merge(dataLoader.officialPools, await readLocalStorage("ArknightsCardInformation")));
        // if (dataLoader.bilibiliPools.length > 0)
        //   await writeLocalStorage("ArknightsCardInformationB", this.merge(dataLoader.bilibiliPools, await readLocalStorage("ArknightsCardInformationB")));
        // if (dataLoader.officialStones.length > 0)
        //   await writeLocalStorage("StoneOfficial", this.merge(dataLoader.officialStones, await readLocalStorage("StoneOfficial")));
        // if (dataLoader.bilibiliStones.length > 0)
        //   await writeLocalStorage("StoneBilibili", this.merge(dataLoader.bilibiliStones, await readLocalStorage("StoneBilibili")));
        // if (dataLoader.officialRecharge.length > 0)
        //   await writeLocalStorage("RechargeOfficial", this.merge(dataLoader.officialRecharge, await readLocalStorage("RechargeOfficial")));
        // if (dataLoader.bilibiliRecharge.length > 0)
        //   await writeLocalStorage("RechargeBilibili", this.merge(dataLoader.bilibiliRecharge, await readLocalStorage("RechargeBilibili")));
        // Notify.create({
        //   type: 'positive',
        //   message: `数据导入完成: ${dataLoader.summary()}`
        // });
      } catch (e) {
        Notify.create({
          type: 'error',
          message: '导入数据失败，请检查文件是否正确' + e
        })
      }
      this.uploadKey = new Date().getTime();
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
  data: () => ({
    uploadKey: new Date().getTime(),
  }),
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
