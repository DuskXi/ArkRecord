<template>
  <div class="text-h4" v-if="noData">此页面无相应类型数据</div>
  <div v-else>
    <div class="text-h5 vertical-middle	">时间-各项干员数量</div>
    <div class="q-gutter-sm">
      <q-toggle v-model="enableTimeChartDetails" label="显示详情"/>
      <q-toggle v-if="enableTimeChartDetails" v-model="enableTimeChartCount" label="详细统计"/>
    </div>
    <lineChart :pools="pools" :detail="enableTimeChartDetails" :count="enableTimeChartCount"></lineChart>

    <div ref="printMe">
      <div class="text-h5 vertical-middle	">卡池出货比例</div>
      <div class="q-gutter-sm">
        <q-toggle v-model="enablePoolsBarChartDetails" label="显示详情"/>
        <q-toggle v-if="enablePoolsBarChartDetails" v-model="enablePoolsBarChartCount" label="详细统计"/>
      </div>
      <barChart :pools="pools" :detail="enablePoolsBarChartDetails" :count="enablePoolsBarChartCount"></barChart>
    </div>
    <div class="text-h5 vertical-middle	">自定义限制饼图</div>
    <pieChart :pools="pools"></pieChart>
  </div>
</template>

<script>
import {readLocalStorage, UserData} from "src/utils/storage";
import {loadPools} from "src/utils/data";
import LineChart from "components/charts/LineChart.vue";
import BarChart from "components/charts/BarChart.vue";
import LimitedPieChart from "components/charts/LimitedPieChart.vue";

var details;

export default {
  name: "ChartShow",
  components: {
    lineChart: LineChart,
    barChart: BarChart,
    pieChart: LimitedPieChart
  },
  methods: {
    async loadData() {
      let userData = new UserData(await readLocalStorage('active'));
      await userData.initialize();
      let rawData = userData.data.poolData; // await readLocalStorage(this.bilibili ? "ArknightsCardInformationB" : "ArknightsCardInformation");
      if (rawData.length === 0) {
        this.noData = true;
        return;
      }
      this.poolsDict = loadPools(rawData);
      this.pools = Object.values(this.poolsDict);
      this.pools.sort((a, b) => {
        return b.getLastUpdate() - a.getLastUpdate();
      });
    },
  },
  async created() {
    await this.loadData();
  },
  props: {
    bilibili: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    output: null,
    enableTimeChartDetails: true,
    enableTimeChartCount: false,
    enablePoolsBarChartDetails: true,
    enablePoolsBarChartCount: false,
    pools: [],
    poolsDict: {},
    noData: false,
  })
}
</script>

<style>

</style>
