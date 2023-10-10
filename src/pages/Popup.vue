<template>
  <q-page style="min-width: 35px">
    <div class="column items-center">
      <div class="col items-center">
        <q-btn style="margin-top:20px;margin-bottom:20px;" color="primary" icon="info" label="查看详细数据" @click="gotoInformationPage">
          <q-badge color="orange" v-if="hasNew">有更新！</q-badge>
        </q-btn>
      </div>
      <div class="col items-center">
        <q-markup-table>
          <thead>
          <tr>
            <th class="text-left">#</th>
            <th class="text-right">干员类型</th>
            <th class="text-right">出货概率</th>
            <th class="text-right">平均重复率</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="info in totalInfos" :key="info.id">
            <td class="text-left">{{ info.id }}</td>
            <td class="text-right">{{ info.type }}</td>
            <td class="text-right">{{ (info.probability * 100).toFixed(4) }}%</td>
            <td class="text-right">{{ (info.repetition * 100).toFixed(4) }}%</td>
          </tr>
          </tbody>
        </q-markup-table>
      </div>
      <div class="col items-center">
        <div class="row" style="margin-top: 20px">
          <div class="col-6 items-center">
            <div class="row">
              <q-badge :color="loginO?'green':'orange'">官服: {{ loginO ? '已' : '未' }}登录</q-badge>
              <div class="flex-break"></div>
              <a v-if="!loginO" href="https://ak.hypergryph.com/user/home" target="_blank"> 点击前往
                <q-icon name="open_in_new"/>
              </a>
            </div>
          </div>
          <div class="col-6 items-center">
            <div class="row">
              <q-badge :color="loginB?'green':'orange'">B服: {{ loginB ? '已' : '未' }}登录</q-badge>
              <div class="flex-break"></div>
              <a v-if="!loginB" href="https://ak.hypergryph.com/user/bilibili/home" target="_blank"> 点击前往
                <q-icon name="open_in_new"/>
              </a>
            </div>
          </div>
        </div>
        <div class="text-h6 vertical-middle" style="color: red; margin-top: 20px;margin-bottom: 20px;" v-if="!login">鹰角网站未登录</div>
        <q-btn style="width: 100%; margin-bottom: 20px;" color="primary" label="点击刷新数据" @click="update"/>
      </div>
    </div>

  </q-page>
</template>

<script>

import {defineComponent} from "vue";
import {Dialog, Notify} from 'quasar'
import {useQuasar} from 'quasar'

const readLocalStorage = async (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function (result) {
      if (result[key] === undefined) {
        resolve(null);
      } else {
        resolve(result[key]);
      }
    });
  });
};

export default defineComponent({
  name: "PageIndex",
  data: () => ({
    show: "Quasar",
    totalInfos: [],
    login: false,
    loginO: false,
    loginB: false,
    hasNew: false,
  }),
  methods: {
    async loginCheck() {
      let loginO = await readLocalStorage("login");
      let loginB = await readLocalStorage("loginB");
      this.loginO = loginO;
      this.loginB = loginB;
      this.login = loginO || loginB;
    },
    gotoInformationPage() {
      let newURL = "www/index.html#/";
      chrome.tabs.create({url: newURL});
    },
    async updateInformation() {
      let probability = await this.getProbabilityInfo({});
      let rateInfo = this.calculateRate(probability);
      this.totalInfos = [];
      this.totalInfos.push({probability: rateInfo.probability.star6, repetition: rateInfo.repetitionRate.star6, type: '6星', id: 0});
      this.totalInfos.push({probability: rateInfo.probability.star5, repetition: rateInfo.repetitionRate.star5, type: '5星', id: 1});
      this.totalInfos.push({probability: rateInfo.probability.star4, repetition: rateInfo.repetitionRate.star4, type: '4星', id: 2});
      this.totalInfos.push({probability: rateInfo.probability.star3, repetition: rateInfo.repetitionRate.star3, type: '3星', id: 3});
      console.log(this.totalInfos);
    },
    async getProbabilityInfo(options = {}) {
      let datetimeLimit = new Date("2019-1-1");
      let timesLimit = -1;
      let poolLimit = null;
      if (options.hasOwnProperty("datetimeLimit")) datetimeLimit = options.datetimeLimit;
      if (options.hasOwnProperty("timesLimit")) timesLimit = options.timesLimit;
      if (options.hasOwnProperty("poolLimit")) poolLimit = options.poolLimit;
      let data = await readLocalStorage("ArknightsCardInformation");
      let count = 0;
      let result = {star6: [], star5: [], star4: [], star3: []};
      data.forEach(group => {
        let timeOffset = new Date().getTimezoneOffset() * 60 * 1000;
        let time = new Date((group.timestamp * 1000) + timeOffset);
        if (time > datetimeLimit) {
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
        }
      };
    },
    async update() {
      chrome.runtime.sendMessage({Type: "refresh", initiative: true}, function (response) {
        location.reload();
      });
    }
  },
  async mounted() {
    chrome.runtime.onMessage.addListener(
      function (request, sender, sendResponse) {
        if (request.type === "statusUpdate") {
          Notify.create({
            type: 'positive',
            message: '状态更新: ' + request.message,
            timeout: 2000
          })
        }
        sendResponse({});
      }
    );

    console.log("mounted");
    await this.updateInformation();
    await this.loginCheck();
    let last_version = await readLocalStorage("lastversion")
    console.log(last_version);
    this.hasNew = (await readLocalStorage("indexVisited")) !== true || last_version === null;
  }
})
;

console.log("loaded");
</script>
