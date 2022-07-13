<template>
  <div class="q-gutter-sm">
    <q-toggle v-model="allowStandardPool" label="允许统计标准寻访"/>
    <q-toggle v-model="enableDetailsCount" label="显示详细统计"/>
  </div>
  <q-card style="background-color: rgba(255,255,255, 0.4)">
    <q-tabs v-model="shownTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
      <q-tab v-for="(pool, index) in pools" :key="index" :name="pool.name" :label="pool.name"/>
    </q-tabs>
    <q-separator/>
    <q-tab-panels v-model="shownTab" style="background-color: rgba(255,255,255, 0.1)" animated>
      <q-tab-panel v-for="(pool, index) in pools" :key="index" :name="pool.name">
        <div class="text-h6">样本数量: {{ pool.records.length }}</div>
        <q-markup-table style="background-color: rgba(255,255,255, 0.6)">
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
          <tr v-for="data in pool.getStatisticalInformation()" :key="data.showTextCount">
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
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script>
import {readLocalStorage} from "src/utils/storage";
import {loadPools} from "src/utils/data";

export default {
  name: "PoolsTable",
  methods: {
    async loadData() {
      let rawData = await readLocalStorage("ArknightsCardInformation");
      this.poolsDict = loadPools(rawData, this.allowStandardPool);
      this.pools = Object.values(this.poolsDict);
      this.pools.sort((a, b) => {
        return b.getLastUpdate() - a.getLastUpdate();
      });
    },
  },
  async mounted() {
    await this.loadData();
    if (this.pools.length > 0) {
      this.shownTab = this.pools[0].name;
    }
  },
  watch:{
    allowStandardPool:async function(val) {
      await this.loadData();
      if (!val && this.shownTab === "常驻标准寻访")
        this.shownTab = this.pools[0].name;
    }
  },
  props: {
  },
  data: () => ({
    shownTab: "",
    pools: [],
    poolsDict: {},
    allowStandardPool: false,
    shownTabKey: new Date().getTime(),
    enableDetailsCount: true,
  })
}
</script>

<style scoped>

</style>
