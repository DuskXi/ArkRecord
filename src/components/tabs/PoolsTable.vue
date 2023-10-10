<template>
  <div class="q-gutter-sm">
    <q-toggle v-model="allowStandardPool" label="允许统计标准寻访"/>
    <q-toggle v-model="enableDetailsCount" label="显示详细统计"/>
    <q-toggle v-model="enableNewCharShow" label="显示新增角色"/>
    <q-toggle v-model="enableTimeLine" label="启用时间线"/>
  </div>
  <div class="text-h4" v-if="noData">此页面无相应类型数据</div>
  <q-card style="background-color: rgba(255,255,255, 0.4)" v-else>
    <q-tabs v-model="shownTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
      <q-tab v-for="(pool, index) in pools" :key="index" :name="index" :label="pool.name"/>
    </q-tabs>
    <q-separator/>
    <q-tab-panels v-model="shownTab" style="background-color: rgba(255,255,255, 0.1)" animated>
      <q-tab-panel v-for="(pool, index) in pools" :key="index" :name="index">
        <div class="text-h6">样本数量: {{ pool.records.length }}</div>
        <div class="q-gutter-sm" v-if="enableNewCharShow">
          <div class="column inline" v-for="(chars, index) in getNewCharacters(pool)" :key="index">
            <div class="col" style="background-color: rgba(255,255,255, 0.3)">
              <q-avatar rounded size="100px">
                <img :src="characterInfo[chars.character] ? characterInfo[chars.character].image: ''"/>
                <q-badge floating color="red">new!</q-badge>
                <q-badge class="absolute-bottom item-center" style="transform: scale(0.8); background-color: rgba(0,0,0,0)"><span>{{ chars.star }}</span></q-badge>
              </q-avatar>
            </div>
            <div class="col text-center">{{ chars.character }}</div>
          </div>
        </div>
        <div class="text-h4 vertical-middle text-red-8" v-if="enableNewCharShow && getNewCharacters(pool).length === 0">无新干员</div>
        <q-markup-table style="background-color: rgba(255,255,255, 0.0)" class="no-box-shadow">
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
  <time-line v-if="shownTab < pools.length && enableTimeLine" :pool="pools[shownTab]"/>
</template>

<script>
import {readLocalStorage, UserData} from "src/utils/storage";
import {loadPools} from "src/utils/data";
import TimeLine from "components/functional/TimeLine.vue";
import {syncCharactersInformation} from "src/utils/CharacterInfo";
import {Notify} from "quasar";

export default {
  name: "PoolsTable",
  components: {
    TimeLine,
  },
  methods: {
    async loadData() {
      let active = await readLocalStorage("active");
      let userData = new UserData(active);
      await userData.initialize();
      // let rawData = await readLocalStorage(this.bilibili ? "ArknightsCardInformationB" : "ArknightsCardInformation");
      let rawData = userData.data.poolData;
      if (rawData.length === 0) {
        this.noData = true;
        return;
      }
      this.poolsDict = loadPools(rawData, this.allowStandardPool);
      this.pools = Object.values(this.poolsDict);
      this.pools.sort((a, b) => {
        return b.getLastUpdate() - a.getLastUpdate();
      });
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
    let characterInfo = await syncCharactersInformation(false, () => Notify.create({type: 'positive', message: '正在更新干员信息和图片缓存', timeout: 3000}));
    characterInfo.forEach(info => {
      this.characterInfo[info.name] = info;
    });
    await this.loadData();
    if (this.pools.length > 0) {
      this.shownTab = 0; //this.pools[0].name;
    }
  },
  watch: {
    allowStandardPool: async function (val) {
      await this.loadData();
      if (!val && this.shownTab === "常驻标准寻访")
        this.shownTab = 0;//this.pools[0].name;
    },
  },
  props: {
    bilibili: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    shownTab: 0,
    pools: [],
    poolsDict: {},
    allowStandardPool: false,
    shownTabKey: new Date().getTime(),
    enableDetailsCount: true,
    newCharacters: [],
    enableNewCharShow: true,
    characterInfo: {},
    enableTimeLine: true,
    noData: false,
  })
}
</script>

<style scoped>

</style>
