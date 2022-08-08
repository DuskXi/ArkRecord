<template>
  <div class="q-gutter-sm">
    <q-btn-toggle rounded class="my-custom-toggle" toggle-color="primary" color="white" text-color="primary" v-model="analyzeMode" :options="[{label: '六星', value: '六星'},{label: '五星', value: '五星'}]"/>
  </div>
  <q-badge color="blue"> 总体分析:</q-badge>
  <div class="row" v-if="drawCardSets.length > 0">
    <div class="col-1">
      <div class="text-h5 vertical-middle"> 当前阶段:</div>
    </div>
    <div class="col-11">
      <div class="text-h6 vertical-middle">已经 <span style="color: red">{{ drawCardSets[drawCardSets.length - 1].records.length }}</span> 次没有出{{ analyzeMode }}了</div>
      <div class="text-h6 vertical-middle">{{ analyzeMode }}理论预期需要 <span style="color: red">{{ analyzeMode === '六星' ? expectedStar6 : expectedStar5 }}</span> 次抽出</div>
      <div class="text-h6 vertical-middle" v-if="drawCardSets[drawCardSets.length-1].records.length > (analyzeMode === '六星' ? expectedStar6 : expectedStar5)">现在较为脸黑, 比预期值多花了 <span
        style="color: red">{{ (drawCardSets[drawCardSets.length - 1].records.length - (analyzeMode.value === '六星' ? expectedStar6 : expectedStar5)).toFixed(2) }}</span>
        抽还没出
      </div>
      <div class="text-h6 vertical-middle" v-if="drawCardSets[drawCardSets.length-1].records.length <= (analyzeMode === '六星' ? expectedStar6 : expectedStar5)">
        距离预期值(预期出{{ analyzeMode }}的次数)还差
        <span style="color: red">{{ (expectedStar6 - drawCardSets[drawCardSets.length - 1].records.length).toFixed(2) }}</span> 抽
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col-2">
      <div class="text-h5 vertical-middle">欧非情况(全部数据):</div>
    </div>
    <div class="col-10">
      <div :class="'text-h6 vertical-middle '+luckyValue[1]">{{ luckyValue[0] }}</div>
    </div>
  </div>
  <div class="row">
    <div class="col-2">
      <div class="text-h5 vertical-middle"> 欧非情况(近期30天数据):</div>
    </div>
    <div class="col-10">
      <div :class="'text-h6 vertical-middle '+luckyValueRecent[1]">{{ luckyValueRecent[0] }}</div>
    </div>
  </div>

  <q-badge color="blue"> 抽卡片段分析:</q-badge>
  <q-select style="margin-top: 20px;" filled v-model="setChoose" :options="setsOptions" label="抽卡片段"/>
  <div class="row" v-if="setChoose !=null">
    <div class="col-1">
      <div class="text-h5 vertical-middle"> 统计学分析:</div>
    </div>
    <div class="col-11">
      <div class="text-h6 vertical-middle">
        在 <span style="color: red">{{ setChoose.value.records.length }}</span>
        抽中获得一个{{ analyzeMode }}这个整体事件的发生概率(二项分布)为
        <span style="color: deepskyblue">{{ (star6DistributionTable[setChoose.value.records.length + 1] * 100).toFixed(2) }}%</span>
      </div>
      <div class="text-h6 vertical-middle">
        {{ analyzeMode }}理论预期需要 <span style="color: red">{{ analyzeMode === '六星' ? expectedStar6 : expectedStar5 }}</span> 次抽出
      </div>
      <div class="text-h6 vertical-middle" v-if="setChoose.value.records.length !== (analyzeMode === '六星' ? expectedStar6 : expectedStar5)">
        这次抽卡:
        <span :class="luckyValueChoose[1]">{{ luckyValueChoose[0] }}</span>
        , 比预期值{{ setChoose.value.records.length < (analyzeMode === '六星' ? expectedStar6 : expectedStar5) ? '少' : '多' }}花了
        <span style="color: red">{{ abs((expectedStar6 - setChoose.value.records.length).toFixed(2)) }}</span> 抽 ({{ (100 * setChoose.value.records.length / expectedStar6).toFixed(2) }}%)
      </div>
      <div class="text-h6 vertical-middle" v-if="setChoose.value.records.length === (analyzeMode === '六星' ? expectedStar6 : expectedStar5)">这次抽卡中规中矩, 和理论预期值相符</div>
    </div>
  </div>
  <q-badge color="blue"> 卡池欧非度分析(试验):</q-badge>
  <q-select style="margin-top: 20px;" filled v-model="poolChoose" :options="poolsOptions" label="卡池选择"/>
  <div class="row" v-if="poolChoose !=null" :key="poolSummaryKey">
    <div class="col-1"></div>
    <div class="col-11">
      <div class="text-h6 vertical-middle"> 总计<span style="color: red">{{ poolChoose.value.records.length }}</span>抽</div>
      <div class="text-h6 vertical-middle"> 其中六星: <span style="color: red">{{ poolChoose.value.star6.length }}</span>抽
        , 占比: <span style="color: deepskyblue">{{ (100 * poolChoose.value.star6.length / poolChoose.value.records.length).toFixed(2) }}%</span></div>
      <div class="text-h6 vertical-middle"> 其中五星: <span style="color: red">{{ poolChoose.value.star5.length }}</span>抽
        , 占比: <span style="color: deepskyblue">{{ (100 * poolChoose.value.star5.length / poolChoose.value.records.length).toFixed(2) }}%</span></div>

      <div class="row">
        <div class="col-1">
          <div class="text-h6 vertical-middle"> 欧非情况:</div>
        </div>
        <div class="col-11">
          <div class="text-h6 vertical-middle"> 六星:<span :class="poolLuckyValue6[1]">{{ poolLuckyValue6[0] }}</span></div>
          <div class="text-h6 vertical-middle"> 五星:<span :class="poolLuckyValue5[1]">{{ poolLuckyValue5[0] }}</span></div>
          <div class="text-h6 vertical-middle"> 综合:<span :class="poolLuckyValue[1]">{{ poolLuckyValue[0] }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {readLocalStorage} from "src/utils/storage";
import {buildTotalData, loadPools} from "src/utils/data";
import {buildSet, generateStar6DistributionTable, getExpectedRemainToGetStar6, getExpectedRemainToGetStar5} from "src/utils/analyze";
import {generateSpace, getStringSpaceLength} from "src/utils/utils";


export default {
  name: "StatisticsAnalyze",
  components: {},
  methods: {
    abs(number) {
      return Math.abs(number);
    },
    average(array) {
      return this.sum(array) / array.length;
    },
    sum(array) {
      return array.reduce((a, b) => a + b, 0);
    },
    async loadData() {
      let rawData = await readLocalStorage(this.bilibili ? "ArknightsCardInformationB" : "ArknightsCardInformation");
      this.poolsDict = loadPools(rawData);
      this.pools = Object.values(this.poolsDict);
      this.poolsOptions = this.pools.map(pool => ({value: pool, label: pool.name})).filter(pool => pool.label !== "常驻标准寻访");
      this.totalPool = buildTotalData(this.pools);
      this.pools.sort((a, b) => {
        return b.getLastUpdate() - a.getLastUpdate();
      });
      this.drawCardSets = buildSet(this.totalPool);
    },
    init() {
      this.star6DistributionTable = generateStar6DistributionTable();
      this.expectedStar6 = getExpectedRemainToGetStar6().toFixed(2);
      this.expectedStar5 = getExpectedRemainToGetStar5().toFixed(2);
      this.drawCardSets.sort((a, b) => {
        return b.records[0].timestamp - a.records[0].timestamp;
      });

      this.setsOptions = [];
      for (let i = 0; i < this.drawCardSets.length; i++) {
        if (this.drawCardSets[i].current)
          continue;
        let lenSpace1 = 10;
        let lenSpace2 = 15;
        let character = this.drawCardSets[i].aim.character;
        let before = (this.drawCardSets[i].records.length - 1).toString();
        let label = `干员: ${
          character + generateSpace(lenSpace1 - getStringSpaceLength(character))}, 前导: ${before}抽, ${
          generateSpace(lenSpace2 - getStringSpaceLength(before)) + new Date(this.drawCardSets[i].aim.timestamp).toLocaleString()}`;
        this.setsOptions.push({label: label, value: this.drawCardSets[i]});
      }
      this.setChoose = this.setsOptions[0];
      this.poolChoose = this.poolsOptions[0];

      this.luckyValue = this.getLuckyValue(this.drawCardSets);
      this.luckyValueRecent = this.getLuckyValue(this.drawCardSets.filter(set => set.records[0].timestamp > Date.now() - (1000 * 60 * 60 * 24 * 30)));
    },
    getLuckyValue(drawCardSets) {
      let lengths = drawCardSets.map(set => {
        return set.current ? 0 : set.records.length
      })
      let avg = this.average(lengths);
      let expected = (this.analyzeMode === '六星' ? this.expectedStar6 : this.expectedStar5);
      let luckyRate = (expected - avg) / expected;
      return this.luckyValueTable(luckyRate);
    },
    luckyValueTable(luckyRate) {
      if (luckyRate === 0)
        return ["概率学显灵了!", "text-blue-grey-10"];
      else if (0 < luckyRate && luckyRate < 0.2)
        return ["小欧", "text-orange-5"]
      else if (0.2 <= luckyRate && luckyRate < 0.4)
        return ["欧", "text-orange-6"]
      else if (0.4 <= luckyRate && luckyRate < 0.5)
        return ["很欧", "text-orange-7"]
      else if (0.5 <= luckyRate && luckyRate < 0.7)
        return ["欧皇", "text-orange-8"]
      else if (0.7 <= luckyRate)
        return ["欧皇Plus", "text-orange-9"]
      else if (-0.2 <= luckyRate && luckyRate < 0)
        return ["小非", "text-blue-grey-6"]
      else if (-0.4 <= luckyRate && luckyRate < -0.2)
        return ["非", "text-blue-grey-7"]
      else if (-0.6 <= luckyRate && luckyRate < -0.4)
        return ["很非", "text-blue-grey-8"]
      else if (-0.9 <= luckyRate && luckyRate < -0.6)
        return ["非酋", "text-blue-grey-9"]
      else if (luckyRate < -0.9)
        return ["非洲皇帝", "text-blue-grey-10"]
      else
        return ["无数据", "text-blue-grey-10"]
    }
  },
  async mounted() {
    await this.loadData();
    this.init();
  },
  watch: {
    analyzeMode: function (val) {
      this.drawCardSets = buildSet(this.totalPool, val === '六星' ? 6 : 5);
      this.init();
    },
    setChoose: function (val) {
      this.luckyValueChoose = this.getLuckyValue([val.value]);
    },
    poolChoose: function (val) {
      let average5 = val.value.star5.length / val.value.records.length;
      let average6 = val.value.star6.length / val.value.records.length;
      let luckyRate5 = (this.expectedStar5 - (1 / average5)) / this.expectedStar5;
      let luckyRate6 = (this.expectedStar6 - (1 / average6)) / this.expectedStar6;
      this.poolLuckyValue5 = this.luckyValueTable(luckyRate5);
      this.poolLuckyValue6 = this.luckyValueTable(luckyRate6);
      this.poolLuckyValue = this.luckyValueTable((luckyRate5 * 0.3) + (luckyRate6 * 0.7));
      this.poolSummaryKey = new Date().getTime();
    }
  },
  props: {
    bilibili: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    analyzeMode: '六星',
    pools: [],
    poolsDict: {},
    poolsOptions: [],
    poolChoose: null,
    drawCardSets: [],
    setChoose: null,
    setsOptions: [],
    star6DistributionTable: [],
    expectedStar6: 0,
    expectedStar5: 0,
    distributionSeries: [],
    distributionXAsis: [],
    distributionColors: [],
    luckyValue: '',
    luckyValueRecent: '',
    luckyValueChoose: '',
    poolLuckyValue5: '',
    poolLuckyValue6: '',
    poolLuckyValue: '',
    poolSummaryKey: new Date().getTime(),
  }),
}
</script>

<style scoped>

</style>
