<template>
  <q-select filled v-model="poolsChoose" :options="poolsOptions" label="指定池子"/>

  <div class="q-gutter-sm">
    <q-toggle v-model="enableDetailsCount" label="显示详细统计"/>
    <q-toggle v-model="enableDateLimiter" label="启用时间限制"/>
  </div>
  <div class="q-pa-md" v-if="enableDateLimiter">
    <q-btn icon="event" round color="primary">
      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
        <q-date v-model="dateLimiter" range>
          <div class="row items-center justify-end q-gutter-sm">
            <q-btn label="Cancel" color="primary" flat v-close-popup/>
            <q-btn label="OK" color="primary" @click="onDateLimiterChange" flat v-close-popup/>
          </div>
        </q-date>
      </q-popup-proxy>
    </q-btn>
    <div class="q-mb-sm">
      <q-badge color="teal">
        时间区间: {{ start.toLocaleString() }} - {{ end.toLocaleString() }}
      </q-badge>
    </div>
  </div>
  <div class="text-h6" v-if="mainPool !=null">样本数量: {{ getPool().records.length }}</div>
  <q-markup-table v-if="mainPool !=null" style="background-color: rgba(255,255,255, 0.6)">
    <thead>
    <tr>
      <th class="text-center">干员类型</th>
      <th class="text-center">数量统计</th>
      <th class="text-center">去重统计</th>
      <th class="text-center">出货概率</th>
      <th class="text-center">平均重复率</th>
      <th class="text-center">出货所需</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="data in getPool().getStatisticalInformation()" :key="data.showTextCount">
      <q-tooltip>{{ enableDetailsCount ? data.showTextCount : data.showText }}</q-tooltip>
      <td class="text-center">{{ data.type }}</td>
      <td class="text-center">{{ data.count }}</td>
      <td class="text-center">{{ data.countWithoutRepeat }}</td>
      <td class="text-center">{{ (data.probability * 100).toFixed(4) }}%</td>
      <td class="text-center">{{ (data.repeatRate * 100).toFixed(4) }}%</td>
      <td class="text-center">{{ (1 / data.probability).toFixed(3) }} 抽</td>
    </tr>
    </tbody>
  </q-markup-table>
</template>

<script>
import {readLocalStorage} from "src/utils/storage";
import {buildTotalData, loadPools, filterInTime} from "src/utils/data";
import {ref} from "vue";

export default {
  name: "TotalTable",
  methods: {
    isInTimeLimiter(record) {
      if (!this.enableDateLimiter)
        return true;
      let date = new Date(record.timestamp);
      return date >= this.start && date <= this.end;
    },
    hasInTimeLimiter(pool) {
      for (let i = 0; i < pool.records.length; i++) {
        if (this.isInTimeLimiter(pool.records[i]))
          return true;
      }
    },
    async loadData() {
      let rawData = await readLocalStorage(this.bilibili ? "ArknightsCardInformationB" : "ArknightsCardInformation");
      if (this.enableDateLimiter)
        rawData = filterInTime(rawData, this.start, this.end);
      this.poolsDict = loadPools(rawData);
      this.pools = Object.values(this.poolsDict);
      this.mainPool = buildTotalData(this.pools);
      this.pools.sort((a, b) => {
        return b.getLastUpdate() - a.getLastUpdate();
      });
      this.poolsOptions = ['All'];
      this.pools.forEach(pool => {
        this.poolsOptions.push(pool.name);
      });
    },
    getPool() {
      if (this.poolsChoose == null || this.poolsChoose === "All")
        return this.mainPool;
      else
        return this.poolsDict[this.poolsChoose];
    },
    onDateLimiterChange() {
      this.start = new Date(this.dateLimiter.from);
      this.end = new Date(this.dateLimiter.to);
      this.loadData();
    },
  },
  async mounted() {
    await this.loadData();
  },
  watch: {
    enableDateLimiter: function (val) {
      if (!val)
        this.loadData();
    }
  },
  props: {
    bilibili: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    pools: [],
    poolsDict: {},
    mainPool: null,
    poolsChoose: "All",
    poolsOptions: ['All'],
    enableDetailsCount: false,
    enableDateLimiter: false,
    dateLimiter: ref({from: new Date(), to: new Date()}),
    start: new Date(),
    end: new Date(),
  }),
}
</script>

<style scoped>

</style>
