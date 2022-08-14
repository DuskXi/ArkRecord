<template>
  <q-btn-group class="float-right" push>
    <q-btn color="accent" label="刷新数据" @click="refreshData()"/>
    <q-btn color="positive" label="导入数据" @click="loadData()"/>
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
import {readLocalStorage} from "src/utils/storage";
import {loadPools, buildTotalData} from "src/utils/data";

export default {
  name: "DataManager",
  methods: {
    refreshData() {
      var core = this;
      chrome.runtime.sendMessage({Type: "refresh", initiative: true}, function (message) {
        // core.$emit('update:dataUpdated', new Date().getTime());
        Notify.create({
          type: 'positive',
          message: '数据已刷新'
        })
      });
    },
    registryListener() {
      chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
          if (request.type === "statusUpdate") {
            Notify.create({
              type: 'positive',
              message: '状态更新: ' + request.message,
              timeout: 5000
            })
          }
          sendResponse({});
        }
      );
    },
    async exportData(type) {
      if (type === 'json') {
        let data = {
          "poolsData": await readLocalStorage("ArknightsCardInformation"),
          "poolsDataB": await readLocalStorage("ArknightsCardInformationB")
        }
        const content = JSON.stringify(data, null, 4);
        exportFile('exported_data.json', content, 'text/json')
      } else if (type === 'csv') {
        let poolsData = await readLocalStorage("ArknightsCardInformation");
        let poolsDataB = await readLocalStorage("ArknightsCardInformationB");
        if (poolsData !== null) {
          let csv = this.poolsDataToCsv(poolsData);
          exportFile('exported_data.csv', "\uFEFF" + csv, 'text/csv')
        }
        if (poolsDataB !== null) {
          let csv = this.poolsDataToCsv(poolsDataB);
          exportFile('exported_data_bilibili.csv', "\uFEFF" + csv, 'text/csv')
        }
        if (poolsData === null && poolsDataB === null) {
          Notify.create({
            type: 'negative',
            message: '没有数据可以导出'
          })
        }
      } else {
        Notify.create({
          type: 'error',
          message: '不支持的类型' + `: "${type}"`
        })
      }
    },
    loadData() {
      document.getElementById("uploader").click();
    },
    fileLoaded() {
      let file = document.getElementById("uploader").files[0];
      const reader = new FileReader();
      var core = this;
      reader.onload = async function (evt) {
        let data = JSON.parse(evt.target.result);
        let success = false;
        if (data.hasOwnProperty("poolsData") && data["poolsData"] != null) {
          await core.saveToStorage(data.poolsData, false);
          success = true;
        }
        if (data.hasOwnProperty("poolsDataB") && data["poolsDataB"] != null) {
          await core.saveToStorage(data.poolsDataB, true);
          success = true;
        }
        if (!success) {
          Notify.create({
            type: 'negative',
            message: '导入数据失败，请检查文件是否正确'
          })
        }
      };
      reader.readAsText(file);
    },
    async saveToStorage(data, bilibili = false) {
      let merged = await this.mergeData(data, bilibili ? "ArknightsCardInformationB" : "ArknightsCardInformation");
      let mergedData = merged[0];
      mergedData.sort((a, b) => b.timestamp - a.timestamp);
      let infoData = {}
      infoData[(bilibili ? "ArknightsCardInformationB" : "ArknightsCardInformation")] = mergedData
      chrome.storage.local.set(infoData);
      let pools = [];
      mergedData.forEach(item => {
        if (!pools.includes(item.pool)) pools.push(item.pool);
      });
      let poolsData = {};
      poolsData[(bilibili ? "poolsB" : "pools")] = pools;
      chrome.storage.local.set(poolsData);
      Notify.create({
        type: 'positive',
        message: '成功导入数据 ' + merged[1] + ' 条'
      })
      this.$emit('update:dataUpdated', new Date().getTime())
    },
    async mergeData(data, key = "ArknightsCardInformation") {
      let local = await readLocalStorage(key);
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
      return [local, changed];
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
