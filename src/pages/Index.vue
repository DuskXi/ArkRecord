<template>
  <q-page class="flex flex-center">

    <div class="column" style="width: 65%">
      <div class="col" style="margin-bottom: 20px;">
        <q-select filled v-model="poolsChoose" :options="pools" label="指定池子"/>
        <q-item-label>样本数量: {{ numberCount >= 0 ? numberCount : "未知" }}</q-item-label>

        <q-btn-toggle v-model="shownModel" spread class="my-custom-toggle" no-caps rounded unelevated toggle-color="primary" color="white" text-color="primary"
                      :options="[  {label: '有限选择', value: '1'}, {label: '全部列出', value: '2'} ]"/>

        <div class="q-pa-md" style="max-width: 100%">
          <q-list bordered class="rounded-borders">
            <q-expansion-item
              expand-separator
              icon="perm_identity"
              label="时间区间"
              :caption='enableTimeLimit? "从: "+dateLimit["from"]  +"到: "+dateLimit["to"] :"未启用"'>
              <q-card>
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
    </div>

  </q-page>
</template>

<script>
import {defineComponent} from "vue";
import {ref} from "vue";
import async from "async";

const readLocalStorage = async (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function (result) {
      if (result[key] === undefined) {
        resolve([]);
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
    poolsChoose: ref(null),
    pools: [],
    numberCount: -1,
    dateLimit: ref({from: '2019/01/01', to: '2019/01/01'}),
    enableTimeLimit: ref(false),
    shownModel: ref("1"),
  }),
  methods: {
    async updateInformation(options = {}) {
      let probability = await this.getProbabilityInfo(options);
      let rateInfo = this.calculateRate(probability);
      this.totalInfos = [];
      this.totalInfos.push({probability: rateInfo.probability.star6, repetition: rateInfo.repetitionRate.star6, type: '6星', id: 0});
      this.totalInfos.push({probability: rateInfo.probability.star5, repetition: rateInfo.repetitionRate.star5, type: '5星', id: 1});
      this.totalInfos.push({probability: rateInfo.probability.star4, repetition: rateInfo.repetitionRate.star4, type: '4星', id: 2});
      this.totalInfos.push({probability: rateInfo.probability.star3, repetition: rateInfo.repetitionRate.star3, type: '3星', id: 3});
      this.numberCount = probability.count;
      console.log(this.totalInfos);
    },
    async showAll(){
      let pools = await readLocalStorage("pools");
      this.pools = pools;
      this.poolsChoose = ref(pools[0]);

    },
    async getPoolsInfo() {
      let result = await readLocalStorage('ArknightsCardInformation');
      this.pools = [];
      result.forEach(item => {
        if (!this.pools.includes(item.pool))
          this.pools.push(item.pool);
      });
    },
    async getProbabilityInfo(options = {}) {
      let datetimeLimit = {from: new Date("2019-1-1"), "to": new Date()};
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
        if (time > datetimeLimit.from && time < datetimeLimit.to) {
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
    getCurrentDate() {
      let date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      return year + "/" + (month >= 10 ? month : "0" + month) + "/" + (day >= 10 ? day : "0" + day);
    },
    cleanDate(date) {
      this.dateLimit = ref({from: this.getCurrentDate(), to: this.getCurrentDate()});
    },
  },
  mounted() {
    console.log("mounted");
    this.updateInformation();
    this.getPoolsInfo();
    this.dateLimit["from"] = this.getCurrentDate();
    this.dateLimit["to"] = this.getCurrentDate();
    this.$watch(
      (vm) => [vm.poolsChoose, vm.dateLimit.from, vm.dateLimit.to, vm.enableTimeLimit],
      (val) => {
        if (val[3]) {
          this.updateInformation({"poolLimit": val[0], "datetimeLimit": {from: new Date(val[1]), to: new Date(val[2])}});
        } else {
          this.updateInformation({"poolLimit": val[0]});
        }
      })
  },
  watch: {}
});

console.log("loaded");
</script>
