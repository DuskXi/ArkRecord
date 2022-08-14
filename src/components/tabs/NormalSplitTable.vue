<template>
  <poolsSchedule v-model:schedule="schedule"></poolsSchedule>
  <div class="q-gutter-sm" v-if="schedule.length <= 0">
    <div class="text-h6 vertical-middle	">合并统计(自动合并勾选的相邻选项) :</div>
    <q-checkbox v-for="(pool, index) in rawSplitPools" :label="pool.name" v-model="mergeOptions[pool.name]" :key="index" color="orange">
      <q-tooltip v-if="enableDetailsCheckBox">
        {{ enableDetailsCount ? pool.getStatisticalInformation()[0].showTextCount : pool.getStatisticalInformation()[0].showText }} +
        {{ enableDetailsCount ? pool.getStatisticalInformation()[1].showTextCount : pool.getStatisticalInformation()[1].showText }}
      </q-tooltip>
    </q-checkbox>
  </div>
  <div class="q-gutter-sm">
    <q-toggle v-model="enableDetailsCount" label="显示详细统计"/>
    <q-toggle v-model="enableDetailsCheckBox" label="复选框悬停预览" v-if="schedule.length <= 0"/>
    <q-toggle v-model="enableImage" label="显示卡池图片" v-if="schedule.length > 0"/>
    <q-toggle v-model="enableNewCharShow" label="显示新增角色"/>
  </div>
  <q-card style="background-color: rgba(255,255,255, 0.4)">
    <q-tabs v-model="shownTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
      <q-tab v-for="(pool, index) in splitPools" :key="index" :name="index" :label="pool.name">
        <q-tooltip>
          {{ ranges[index][0].toLocaleString() }} - {{ ranges[index][1].toLocaleString() }}
        </q-tooltip>
      </q-tab>
    </q-tabs>
    <q-separator/>
    <q-tab-panels v-model="shownTab" style="background-color: rgba(255,255,255, 0.1)" animated>
      <q-tab-panel v-for="(pool, index) in splitPools" :key="index" :name="index">
        <div class="q-gutter-sm">
          <q-img :src="imageUrls[index]" spinner-color="white" style=" max-width: 350px" fit="scale-down" v-if="schedule.length > 0 && enableImage"/>
          <div v-if="!enableNewCharShow"></div>
          <div v-else class="column inline" v-for="(chars, index) in getNewCharacters(pool)" :key="index">
            <div class="col" style="background-color: rgba(255,255,255, 0.3)">
              <q-avatar rounded size="100px">
                <img :src="characterInfo[chars.character].image"/>
                <q-badge floating color="red">new!</q-badge>
                <q-badge class="absolute-bottom item-center" style="transform: scale(0.8); background-color: rgba(0,0,0,0)"><span>{{ chars.star }}</span></q-badge>
              </q-avatar>
            </div>
            <div class="col text-center">{{ chars.character }}</div>
          </div>
          <div class="text-h4 vertical-middle text-red-8" v-if="enableNewCharShow && getNewCharacters(pool).length === 0">无新干员</div>
        </div>
        <div class="text-h5">样本数量: {{ pool.records.length }}</div>
        <q-markup-table :grid="$q.screen.lt.md" style="background-color: rgba(255,255,255, 0.0)" class="no-box-shadow">
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
  <time-line v-if="shownTab < splitPools.length" :pool="splitPools[shownTab]"/>
</template>

<script>
import {readLocalStorage} from "src/utils/storage";
import {buildTotalData, loadPools, splitNormalPools, mergePools, splitNormalPoolsBySchedule} from "src/utils/data";
import PoolsSchedule from "components/functional/PoolsSchedule.vue";
import TimeLine from "components/functional/TimeLine.vue";
import {syncCharactersInformation} from "src/utils/CharacterInfo";

export default {
  name: "NormalSplitTable",
  components: {
    poolsSchedule: PoolsSchedule,
    timeLine: TimeLine
  },
  methods: {
    async loadData() {
      let rawData = await readLocalStorage(this.bilibili ? "ArknightsCardInformationB" : "ArknightsCardInformation");
      this.poolsDict = loadPools(rawData, this.allowStandardPool);
      this.pools = Object.values(this.poolsDict);
      this.totalPool = buildTotalData(this.pools);
      this.rawSplitPools = splitNormalPools(this.totalPool);
      this.mergeOptions = {};
      this.rawSplitPools.forEach(pool => {
        this.mergeOptions[pool.name] = false;
      });
      this.pools.sort((a, b) => {
        return b.getLastUpdate() - a.getLastUpdate();
      });
      this.splitPools = this.rawSplitPools;
    },
    rebuildSpiltPools() {
      let newSplitPools = [];
      let i = 0;
      while (i < this.rawSplitPools.length) {
        if (this.mergeOptions[this.rawSplitPools[i].name]) {
          let nextPool = i + 1 < this.rawSplitPools.length ? this.rawSplitPools[i + 1] : null;
          let mergeList = [this.rawSplitPools[i]];
          while (nextPool != null && this.mergeOptions[nextPool.name]) {
            i++;
            mergeList.push(nextPool);
            nextPool = i + 1 < this.rawSplitPools.length ? this.rawSplitPools[i + 1] : null;
          }
          if (mergeList.length > 1) {
            let merged = mergePools(mergeList, "");
            let startDate = new Date(merged.first()).toLocaleDateString();
            let startTime = new Date(merged.first()).toLocaleTimeString();
            let endDate = new Date(merged.last()).toLocaleDateString();
            let endTime = new Date(merged.last()).toLocaleTimeString();
            merged.name = startDate === endDate ? `${startDate} ${startTime}-${endTime}` : `${startDate} ${startTime}-${endDate} ${endTime}`;
            newSplitPools.push(merged);
          } else {
            newSplitPools.push(this.rawSplitPools[i]);
          }
        } else
          newSplitPools.push(this.rawSplitPools[i]);
        i++;
      }
      this.splitPools = newSplitPools;
    },
    getNewCharacters(pool) {
      let chars = [];
      let count = 0;
      pool.records.forEach(record => {
        count++;
        if (record.isFirstTimes) {
          chars.push({
            character: record.character,
            star: this.starStr(record.star),
            count: count,
          });
        }
      });
      return chars;
    },
    starStr(star) {
      let str = "";
      for (let i = 0; i < star; i++) {
        str += "⭐";
      }
      return str;
    }
  },
  async mounted() {
    let characterInfo = await syncCharactersInformation();
    characterInfo.forEach(info => {
      this.characterInfo[info.name] = info;
    });
    await this.loadData();
    if (this.splitPools.length > 0) {
      this.shownTab = 0; //this.splitPools[0].name;
    }
  },
  watch: {
    mergeOptions: {
      handler() {
        this.rebuildSpiltPools();
        if (this.splitPools.length > 0 && !this.splitPools.map(pool => pool.name).includes(this.shownTab)) {
          this.shownTab = 0; //this.splitPools[0].name;
        }
      },
      deep: true
    },
    schedule: {
      handler() {
        let result = splitNormalPoolsBySchedule(this.totalPool, this.schedule);
        this.splitPools = result.pools;
        this.imageUrls = result.imagesUrls;
        this.ranges = result.range;
        this.enableImage = true;
        if (this.splitPools.length > 0) {
          this.shownTab = 0; //this.splitPools[0].name;
        }
      },
      deep: true
    }
  },
  props: {
    bilibili: {
      type: Boolean,
      default: false
    },
  },
  data: () => ({
    shownTab: 0,
    pools: [],
    poolsDict: {},
    totalPool: null,
    splitPools: [],
    mergeOptions: {},
    rawSplitPools: [],
    shownTabKey: new Date().getTime(),
    enableDetailsCount: true,
    enableDetailsCheckBox: false,
    schedule: [],
    imageUrls: [],
    ranges: [],
    enableImage: false,
    enableNewCharShow: true,
    characterInfo: {}
  })
}
</script>

<style scoped>

</style>
