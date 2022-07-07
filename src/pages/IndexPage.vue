<template>
  <q-page class="flex flex-center -primary mainBody ">
    <div class="column" style="width: 65%">
      <div class="col" style="margin-bottom: 20px;">
        <div class="text-h3 vertical-middle	">ArkRecord</div>
      </div>
      <div class="col" style="margin-bottom: 20px;">
        <q-btn-toggle style="margin-bottom: 20px; opacity: .85" v-model="shownMode" spread class="my-custom-toggle" no-caps rounded unelevated toggle-color="primary" color="white" text-color="primary"
                      :options="[  {label: '有限选择', value: '1'}, {label: '全部列出', value: '2'}, {label: '纯常驻寻访', value: '3'} ]"/>

        <q-select filled v-model="poolsChoose" :options="pools" v-if="shownMode === '1'" label="指定池子"/>
        <div class="q-pa-md" v-if="shownMode === '1' || shownMode === '3'" style="max-width: 100%">
          <q-list bordered class="rounded-borders">
            <q-expansion-item
              expand-separator
              icon="perm_identity"
              label="时间区间"
              :caption='enableTimeLimit? "从: "+dateLimit["from"]  +"到: "+dateLimit["to"] :"未启用"'>
              <q-card style="background-color: rgba(255, 255, 255, 0.25);">
                <q-card-section>
                  <q-btn style="" color="primary" icon="info" label="清除时间数据" @click="cleanDate"/>
                  <q-toggle v-model="enableTimeLimit" label="启用时间限制"/>
                  <div class="q-pa-md" v-if="enableTimeLimit">
                    <div class="q-mb-sm">
                      <q-badge color="teal">
                        时间区间 从: {{ dateLimit["from"] }} 到: {{ dateLimit["to"] }}
                      </q-badge>
                    </div>
                    <q-date v-model="dateLimit" range/>
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </div>
      </div>


      <div class="col">
        <div v-if="shownMode === '1'" class="text-h6">样本数量: {{ numberCount }}</div>
        <q-markup-table v-if="shownMode === '1'" style="background-color: rgba(255,255,255, 0.7)">
          <thead>
          <tr>
            <th class="text-left">#</th>
            <th class="text-right">干员类型</th>
            <th class="text-right">数量统计</th>
            <th class="text-right">去重统计</th>
            <th class="text-right">出货概率</th>
            <th class="text-right">平均重复率</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="info in totalInfos" :key="info.id">
            <td class="text-left">{{ info.id }}</td>
            <td class="text-right">{{ info.type }}</td>
            <td class="text-right">{{ info.count }}</td>
            <td class="text-right">{{ info.countNoRepetition }}</td>
            <td class="text-right">{{ (info.probability * 100).toFixed(4) }}%</td>
            <td class="text-right">{{ (info.repetition * 100).toFixed(4) }}%</td>
          </tr>
          </tbody>
        </q-markup-table>

        <q-card v-if="shownMode === '2'" style="background-color: rgba(255,255,255, 0.5)">
          <q-tabs v-model="shownTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
            <q-tab v-for="info in multiTotalInfos" :key="info.pool" :name="info.pool" :label="info.pool"/>
          </q-tabs>
          <q-separator/>
          <q-tab-panels v-model="shownTab" style="background-color: rgba(255,255,255, 0.1)" animated>
            <q-tab-panel v-for="info in multiTotalInfos" :key="info.pool" :name="info.pool">
              <div class="text-h6">样本数量: {{ info.count }}</div>
              <q-markup-table style="background-color: rgba(255,255,255, 0.6)">
                <thead>
                <tr>
                  <th class="text-left">#</th>
                  <th class="text-right">干员类型</th>
                  <th class="text-right">数量统计</th>
                  <th class="text-right">去重统计</th>
                  <th class="text-right">出货概率</th>
                  <th class="text-right">平均重复率</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="data in info.totalInfos" :key="data.id">
                  <td class="text-left">{{ data.id }}</td>
                  <td class="text-right">{{ data.type }}</td>
                  <td class="text-right">{{ data.count }}</td>
                  <td class="text-right">{{ data.countNoRepetition }}</td>
                  <td class="text-right">{{ (data.probability * 100).toFixed(4) }}%</td>
                  <td class="text-right">{{ (data.repetition * 100).toFixed(4) }}%</td>
                </tr>
                </tbody>
              </q-markup-table>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>

        <q-card v-if="shownMode === '3'" style="background-color: rgba(255,255,255, 0.5)">
          <q-tabs v-model="shownTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
            <q-tab v-for="info in multiTotalInfos" :key="info.pool" :name="info.pool" :label="info.pool"/>
          </q-tabs>
          <q-separator/>
          <q-tab-panels v-model="shownTab" style="background-color: rgba(255,255,255, 0.1)" animated>
            <q-tab-panel v-for="info in multiTotalInfos" :key="info.pool" :name="info.pool">
              <div class="text-h6">样本数量: {{ info.count }}</div>
              <q-markup-table style="background-color: rgba(255,255,255, 0.6)">
                <thead>
                <tr>
                  <th class="text-left">#</th>
                  <th class="text-right">干员类型</th>
                  <th class="text-right">数量统计</th>
                  <th class="text-right">去重统计</th>
                  <th class="text-right">出货概率</th>
                  <th class="text-right">平均重复率</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="data in info.totalInfos" :key="data.id">
                  <td class="text-left">{{ data.id }}</td>
                  <td class="text-right">{{ data.type }}</td>
                  <td class="text-right">{{ data.count }}</td>
                  <td class="text-right">{{ data.countNoRepetition }}</td>
                  <td class="text-right">{{ (data.probability * 100).toFixed(4) }}%</td>
                  <td class="text-right">{{ (data.repetition * 100).toFixed(4) }}%</td>
                </tr>
                </tbody>
              </q-markup-table>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>

        <div class="col" style="margin-top: 20px">
          <q-btn-group class="float-right" push>
            <q-btn color="accent" label="刷新数据" @click="refreshData()"/>
            <q-btn color="secondary" label="导出数据" @click="exportData()"/>
            <q-btn color="positive" label="导入数据" @click="loadData()"/>
          </q-btn-group>
          <input type="file" style="visibility: hidden" id="uploader" @change="fileLoaded()">

        </div>
        <div class="q-pa-md q-gutter-sm absolute-bottom-left">
          <q-btn round color="primary" icon="info" @click="showUpdateInfo()"/>
        </div>

        <q-dialog v-model="customDialogModel">
          <q-card style="width: 60vw; max-width: 90vw;">
            <q-card-section>
              <div class="text-h6">更新日志</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <q-select v-model="updateInfoChoose" :options="updateInfoOptions" label="发布信息版本选择"/>

              <div class="text-h6">发布日期: {{ new Date(updateInfo[updateInfoChoose.value].time).toLocaleString() }}</div>

              <div class="text-h6">Github页面: <a :href="updateInfo[updateInfoChoose.value].url">{{ updateInfo[updateInfoChoose.value].url }}</a></div>

              <div class="text-h6" v-if="version !== updateInfo[0].tag_name">当前软件包版本: {{ version }}, 最新tag版本: {{ updateInfo[0].tag_name }}, 可能有更新</div>

              <q-markdown v-if="updateInfoChoose != null" style="margin-top: 10px">
                {{ updateInfo[updateInfoChoose.value].body }}
              </q-markdown>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="OK" color="primary" v-close-popup/>
            </q-card-actions>
          </q-card>
        </q-dialog>
        <!--        <div class="col">-->
        <!--          <q-markdown v-if="updateInfo.length > 0">-->
        <!--            {{ updateInfo[0].body }}-->
        <!--          </q-markdown>-->
        <!--        </div>-->

      </div>
    </div>

  </q-page>
  <!-- Notice lang="sass" -->

</template>

<script>
import {defineComponent} from "vue";
import {ref} from "vue";
import {Notify} from 'quasar';
import {api} from 'boot/axios'
import config from '../../package.json'

const readLocalStorage = async (key) => {
  return new Promise((resolve, _) => {
    chrome.storage.local.get([key], function (result) {
      if (result[key] === undefined) {
        resolve(null);
      } else {
        resolve(result[key]);
      }
    });
  });
};

function checkStructure(data) {
  if (!data instanceof Array) {
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

async function mergeData(data) {
  let local = await readLocalStorage("ArknightsCardInformation");
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

function download(url, name) {
  const a = document.createElement('a')
  a.download = name
  a.rel = 'noopener'
  a.href = url
  a.dispatchEvent(new MouseEvent('click'))
}

export default defineComponent({
  name: "PageIndex",
  data: () => ({
    version: config.version,
    show: "Quasar",
    totalInfos: [],
    multiTotalInfos: [],
    poolsChoose: ref(null),
    pools: [],
    numberCount: -1,
    dateLimit: ref({from: '2019/01/01', to: '2019/01/01'}),
    enableTimeLimit: ref(false),
    shownMode: "1",
    shownTab: "",
    login: false,
    updateInfo: [],
    customDialogModel: false,
    updateInfoChoose: ref(null),
    updateInfoOptions: [],
    updateInfoLoading: false,
  }),
  methods: {
    async updateInformation(options = {}) {
      let probability = await this.getProbabilityInfo(options);
      let rateInfo = this.calculateRate(probability);
      this.totalInfos = [];
      this.totalInfos.push({
        probability: rateInfo.probability.star6, repetition: rateInfo.repetitionRate.star6,
        count: rateInfo.count.star6, countNoRepetition: rateInfo.countNoRepetition.star6, type: '6星', id: 0
      });
      this.totalInfos.push({
        probability: rateInfo.probability.star5, repetition: rateInfo.repetitionRate.star5,
        count: rateInfo.count.star5, countNoRepetition: rateInfo.countNoRepetition.star5, type: '5星', id: 1
      });
      this.totalInfos.push({
        probability: rateInfo.probability.star4, repetition: rateInfo.repetitionRate.star4,
        count: rateInfo.count.star4, countNoRepetition: rateInfo.countNoRepetition.star4, type: '4星', id: 2
      });
      this.totalInfos.push({
        probability: rateInfo.probability.star3, repetition: rateInfo.repetitionRate.star3,
        count: rateInfo.count.star3, countNoRepetition: rateInfo.countNoRepetition.star3, type: '3星', id: 3
      });
      this.numberCount = probability.count;
    },
    async showAll() {
      let pools = await readLocalStorage("pools");
      this.pools = pools;
      if (this.pools.indexOf("常驻标准寻访") >= 0)
        this.pools.splice(this.pools.indexOf("常驻标准寻访"), 1)
      this.poolsChoose = ref(pools[0]);
      this.multiTotalInfos = [];
      for (const pool of this.pools) {

        let probability = await this.getProbabilityInfo({poolLimit: pool});
        let rateInfo = this.calculateRate(probability);
        let totalInfos = [];
        totalInfos.push({
          probability: rateInfo.probability.star6, repetition: rateInfo.repetitionRate.star6,
          count: rateInfo.count.star6, countNoRepetition: rateInfo.countNoRepetition.star6, type: '6星', id: 0
        });
        totalInfos.push({
          probability: rateInfo.probability.star5, repetition: rateInfo.repetitionRate.star5,
          count: rateInfo.count.star5, countNoRepetition: rateInfo.countNoRepetition.star5, type: '5星', id: 1
        });
        totalInfos.push({
          probability: rateInfo.probability.star4, repetition: rateInfo.repetitionRate.star4,
          count: rateInfo.count.star4, countNoRepetition: rateInfo.countNoRepetition.star4, type: '4星', id: 2
        });
        totalInfos.push({
          probability: rateInfo.probability.star3, repetition: rateInfo.repetitionRate.star3,
          count: rateInfo.count.star3, countNoRepetition: rateInfo.countNoRepetition.star3, type: '3星', id: 3
        });
        this.multiTotalInfos.push({pool: pool, totalInfos: totalInfos, count: probability.count});
      }
      // this.pools.unshift("All");
      this.shownTab = this.pools.length > 0 ? this.pools[0] : "";
    },
    async showNormal() {
      this.pools = [];
      this.multiTotalInfos = [];
      let period = await this.splitTime()
      period = period.sort((a, b) => b[0] - a[0])
      for (let i = 0; i < period.length; i++) {
        let timeOffset = new Date().getTimezoneOffset() * 60 * 1000;
        let time_start = new Date((period[i][0] * 1000) + timeOffset);
        let time_end = new Date((period[i][1] * 1000) + timeOffset);
        if (this.enableTimeLimit) {
          if (time_start < new Date(this.dateLimit["from"]) || time_end > new Date(this.dateLimit["to"]))
            continue;
        }
        let probability = await this.getProbabilityInfo({poolLimit: "常驻标准寻访", datetimeLimit: {from: time_start, to: time_end}});
        let rateInfo = this.calculateRate(probability);
        let totalInfos = [];
        totalInfos.push({
          probability: rateInfo.probability.star6, repetition: rateInfo.repetitionRate.star6,
          count: rateInfo.count.star6, countNoRepetition: rateInfo.countNoRepetition.star6, type: '6星', id: 0
        });
        totalInfos.push({
          probability: rateInfo.probability.star5, repetition: rateInfo.repetitionRate.star5,
          count: rateInfo.count.star5, countNoRepetition: rateInfo.countNoRepetition.star5, type: '5星', id: 1
        });
        totalInfos.push({
          probability: rateInfo.probability.star4, repetition: rateInfo.repetitionRate.star4,
          count: rateInfo.count.star4, countNoRepetition: rateInfo.countNoRepetition.star4, type: '4星', id: 2
        });
        totalInfos.push({
          probability: rateInfo.probability.star3, repetition: rateInfo.repetitionRate.star3,
          count: rateInfo.count.star3, countNoRepetition: rateInfo.countNoRepetition.star3, type: '3星', id: 3
        });
        let pool_name = "";
        if (time_start.getFullYear() === time_end.getFullYear() && time_start.getMonth() === time_end.getMonth() && time_start.getDate() === time_end.getDate()) {
          pool_name = time_start.toLocaleDateString() + " " + time_start.toLocaleTimeString() + "-" + time_end.toLocaleTimeString();
        } else {
          pool_name = time_start.toLocaleString() + "-" + time_end.toLocaleString();
        }
        this.multiTotalInfos.push({pool: pool_name, totalInfos: totalInfos, count: probability.count});
        this.pools.push(pool_name)
      }

      // this.pools.unshift("All");
      this.shownTab = this.pools.length > 0 ? this.pools[0] : "";
    },
    async splitTime() {
      let data = await readLocalStorage("ArknightsCardInformation");
      data = data.sort((a, b) => a.timestamp - b.timestamp);
      let period = [];
      let start_timestamp = 0;
      let end_timestamp = 0;
      data.forEach(element => {
        if (element.pool === "常驻标准寻访") {
          if (start_timestamp === 0) {
            start_timestamp = element.timestamp;
          }
          end_timestamp = element.timestamp;
        } else {
          if (start_timestamp !== 0)
            period.push([start_timestamp, end_timestamp])
          start_timestamp = 0;
          end_timestamp = 0;
        }
      });
      if (start_timestamp !== 0) {
        period.push([start_timestamp, end_timestamp])
      }
      return period;
    },
    async getPoolsInfo() {
      let result = await readLocalStorage('ArknightsCardInformation');
      this.pools = [];
      result.forEach(item => {
        if (!this.pools.includes(item.pool))
          this.pools.push(item.pool);
      });
      this.pools.unshift("All");
    },
    async getProbabilityInfo(options = {}) {
      let datetimeLimit = {from: new Date("2019-1-1"), "to": new Date()};
      let timesLimit = -1;
      let poolLimit = null;
      if (options.hasOwnProperty("datetimeLimit")) datetimeLimit = options.datetimeLimit;
      if (options.hasOwnProperty("timesLimit")) timesLimit = options.timesLimit;
      if (options.hasOwnProperty("poolLimit")) {
        if (options.poolLimit === "All") {
          poolLimit = null;
        } else {
          poolLimit = options.poolLimit;
        }
      }
      let data = await readLocalStorage("ArknightsCardInformation");
      let count = 0;
      let result = {star6: [], star5: [], star4: [], star3: []};
      data.forEach(group => {
        let timeOffset = new Date().getTimezoneOffset() * 60 * 1000;
        let time = new Date((group.timestamp * 1000) + timeOffset);
        if (time > datetimeLimit.from && time <= datetimeLimit.to) {
          if (timesLimit === -1 || count < timesLimit) {
            if (poolLimit === null || group.pool === poolLimit) {
              group.result.forEach(item => {
                if (item["rarity"] === 5) {
                  result.star6.push(item);
                } else if (item["rarity"] === 4) {
                  result.star5.push(item);
                } else if (item["rarity"] === 3) {
                  result.star4.push(item);
                } else if (item["rarity"] === 2) {
                  result.star3.push(item);
                }
                count++;
              });
            }
          }
        }
      });
      result.count = count;
      return result;
    },
    repetitionRate(data) {
      let result = {};
      data.forEach(item => {
        if (result.hasOwnProperty(item.name)) {
          result[item.name]++;
        } else {
          result[item.name] = 1;
        }
      });
      let sumResult = 0;
      for (let key in result) {
        result[key] = result[key] / data.length;
        sumResult += result[key];
      }
      sumResult = sumResult / Object.keys(result).length;
      return [result, sumResult];
    },
    calculateRate(data) {
      let totalCount = data.count;
      let times6Star = data.star6.length;
      let times5Star = data.star5.length;
      let times4Star = data.star4.length;
      let times3Star = data.star3.length;
      // 计算出货率
      let probability6Star = times6Star / totalCount;
      let probability5Star = times5Star / totalCount;
      let probability4Star = times4Star / totalCount;
      let probability3Star = times3Star / totalCount;
      // 计算平均重复率
      let repetitionRate6Star = this.repetitionRate(data.star6)[1];
      let repetitionRate5Star = this.repetitionRate(data.star5)[1];
      let repetitionRate4Star = this.repetitionRate(data.star4)[1];
      let repetitionRate3Star = this.repetitionRate(data.star3)[1];
      return {
        probability: {
          star6: probability6Star,
          star5: probability5Star,
          star4: probability4Star,
          star3: probability3Star
        },
        repetitionRate: {
          star6: repetitionRate6Star,
          star5: repetitionRate5Star,
          star4: repetitionRate4Star,
          star3: repetitionRate3Star
        },
        count: {
          star6: times6Star,
          star5: times5Star,
          star4: times4Star,
          star3: times4Star
        },
        countNoRepetition: {
          star6: Object.keys(this.repetitionRate(data.star6)[0]).length,
          star5: Object.keys(this.repetitionRate(data.star5)[0]).length,
          star4: Object.keys(this.repetitionRate(data.star4)[0]).length,
          star3: Object.keys(this.repetitionRate(data.star3)[0]).length,
        }
      };
    },
    getCurrentDate() {
      let date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      return year + "/" + (month >= 10 ? month : "0" + month) + "/" + (day >= 10 ? day : "0" + day);
    },
    cleanDate() {
      this.dateLimit = ref({from: this.getCurrentDate(), to: this.getCurrentDate()});
    },
    setTransparency(element) {
      console.log(element)
    },
    async exportData() {
      let data = {
        "poolsData": await readLocalStorage("ArknightsCardInformation")
      }
      const dataUrl = `data:,${JSON.stringify(data, null, 4)}`;
      download(dataUrl, 'exported_data.json')
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
        if (data.hasOwnProperty("poolsData")) {
          let merged = await mergeData(data.poolsData);
          let mergedData = merged[0];
          mergedData.sort(function (a, b) {
            return b.timestamp - a.timestamp
          });
          chrome.storage.local.set({"ArknightsCardInformation": mergedData}, () => {
          });
          let pools = [];
          mergedData.forEach(item => {
            if (!pools.includes(item.pool)) pools.push(item.pool);
          });
          chrome.storage.local.set({"pools": pools}, () => {
          });
          Notify.create({
            type: 'positive',
            message: '成功导入数据 ' + merged[1] + ' 条'
          })
          await core.updateInformation();
          await core.getPoolsInfo();
          if (core.shownMode === "2") {
            await core.showAll();
          } else {
            await core.getPoolsInfo();
            core.poolsChoose = "All";
          }
        } else {
          Notify.create({
            type: 'negative',
            message: '导入数据失败，请检查文件是否正确'
          })
        }
      };
      reader.readAsText(file);
    },
    refreshData() {
      chrome.runtime.sendMessage({Type: "refresh"}, function (_) {
        setTimeout(() => {
          location.reload();
        }, 1000);
      });
    },
    async checkLogin() {
      this.login = await readLocalStorage("login");
      if (!this.login) {
        const core = this;
        this.$q.dialog({
          title: 'Alert',
          message: '鹰角网站未登录，无法获取数据，请先登录'
        }).onOk(() => {
          core.refreshData();
        })
      }
    },
    getUpdateInfo() {
      let repo_url = "https://api.github.com/repos/DuskXi/ArkRecord/releases";
      api.get(repo_url)
        .then(async (response) => {
          let data = response.data;
          let index = 0;
          data.forEach(element => {
            let info = {
              time: element["created_at"],
              body: element["body"],
              url: element["url"],
              name: element["name"],
              tag_name: element["tag_name"]
            }
            this.updateInfo.push(info);
            this.updateInfoOptions.push({label: info.name, value: index});
            index++;
          })
          if (this.updateInfoOptions.length > 0) {
            this.updateInfoChoose = this.updateInfoOptions[0];
            let last_version = await readLocalStorage("lastversion")
            if (last_version == null || last_version === '' || last_version !== this.updateInfo[0].name) {
              chrome.storage.local.set({"lastversion": this.updateInfo[0].name}, () => {
              });
              this.showUpdateInfo();
            }
          }
        });
    },
    showUpdateInfo() {
      this.customDialogModel = true;
    }
  },
  mounted() {
    console.log(this.version);

    this.getUpdateInfo();
    this.checkLogin();
    this.updateInformation();
    this.getPoolsInfo();
    this.dateLimit["from"] = this.getCurrentDate();
    this.dateLimit["to"] = this.getCurrentDate();
    this.$watch(
      (vm) => [vm.poolsChoose, vm.dateLimit.from, vm.dateLimit.to, vm.enableTimeLimit],
      (val) => {
        if (this.shownMode === "3")
          this.showNormal();
        else if (val[3]) {
          this.updateInformation({"poolLimit": val[0], "datetimeLimit": {from: new Date(val[1]), to: new Date(val[2])}});
        } else {
          this.updateInformation({"poolLimit": val[0]});
        }
      })


    chrome.runtime.onMessage.addListener(
      function (request, _) {
        if (request.hasOwnProperty("Message")) {
          if (request.Message === "refreshed") {
            location.reload();
          }
        }
      }
    );
  },
  watch: {
    "shownMode": function (val) {
      if (val === "2") {
        this.showAll();
      } else if (val === "3") {
        this.showNormal();
      } else {
        this.getPoolsInfo();
        this.poolsChoose = "All";
      }
    },
    "updateInfoChoose": function (val) {
      if (this.customDialogModel) {
        this.customDialogModel = false;
        setTimeout(() => this.customDialogModel = true, 150);
      }
    }
  }
});

console.log("loaded");
</script>
<style>


body {
  background: url(/www/background.jpg) no-repeat center fixed;
  background-size: cover;
}

.mainBody {
  background-color: rgba(255, 255, 255, 0.65);

}
</style>
