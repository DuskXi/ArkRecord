<template>
  <q-page class="flex flex-center -primary mainBody ">
    <div class="column" style="width: 65%">
      <div class="col" style="margin-bottom: 20px;">
        <div class="text-h3 vertical-middle	">ArkRecord
          <q-badge color="primary">{{ version }}</q-badge>
        </div>

        <div class="text-caption vertical-middle"> ArkRecord 不会收集上传你的任何信息数据，所有从鹰角网站获取的数据都只会保存在本地。</div>
      </div>
      <div class="q-gutter-sm">
        <q-badge :color="login?'green':'orange'">官服: {{ login ? '已' : '未' }}登录</q-badge>
        <q-badge :color="loginB?'green':'orange'">B服: {{ loginB ? '已' : '未' }}登录</q-badge>
      </div>
      <div class="q-gutter-sm" v-if="loginB">
        <q-toggle v-model="bilibili" label="B服"/>
      </div>
      <br v-else/>
      <div class="col" style="margin-bottom: 20px;">
        <q-btn-toggle style="margin-bottom: 20px; opacity: .85" spread no-caps rounded unelevated
                      v-model="shownMode" :options="showOptions" class="my-custom-toggle" toggle-color="primary" color="white" text-color="primary"/>
      </div>
      <div class="col" style="margin-bottom: 20px; " :key="containerKey" v-if="pools.length > 0">
        <totalTable v-if="shownMode === '1'" :bilibili="bilibili"></totalTable>
        <poolsTable v-if="shownMode === '2'" :bilibili="bilibili"></poolsTable>
        <normalSplitTable v-if="shownMode === '3'" :bilibili="bilibili"></normalSplitTable>
        <chartShow v-if="shownMode === '4'" :bilibili="bilibili"></chartShow>
        <statisticsAnalyze v-if="shownMode === '5'" :bilibili="bilibili"></statisticsAnalyze>
      </div>
      <div class="text-h5 vertical-middle	" v-else>
        无数据, 请从右下角导入或者在登录后点击右下角的刷新按钮
      </div>
      <div class="col" style="margin-bottom: 20px; ">
        <screen-shot></screen-shot>
        <data-manager :dataUpdated="dataUpdated" @update:dataUpdated="dataUpdated = $event" :bilibili="bilibili"/>
        <information-set/>
      </div>
    </div>

  </q-page>
  <!-- Notice lang="sass" -->

</template>

<script>
import config from '../../package.json';
import {loadPools} from '../utils/data';
import {readLocalStorage} from '../utils/storage';
import {defineComponent} from "vue";
import ChartShow from "components/ChartShow.vue";
import PoolsTable from "components/PoolsTable.vue";
import TotalTable from "components/TotalTable.vue";
import NormalSplitTable from "components/NormalSplitTable.vue";
import StatisticsAnalyze from "components/StatisticsAnalyze.vue";
import ScreenShot from "components/functional/ScreenShot.vue";
import DataManager from "components/DataManager.vue";
import InformationSet from "components/InformationSet.vue";

export default defineComponent({
  name: "TestPage",
  components: {
    chartShow: ChartShow,
    poolsTable: PoolsTable,
    totalTable: TotalTable,
    normalSplitTable: NormalSplitTable,
    statisticsAnalyze: StatisticsAnalyze,
    screenShot: ScreenShot,
    dataManager: DataManager,
    informationSet: InformationSet
  },
  data: () => ({
    version: config.version,
    pools: [],
    poolsDict: {},
    shownMode: "1",
    showOptions: [{label: '有限选择', value: '1'}, {label: '全部列出', value: '2'}, {label: '纯常驻寻访', value: '3'}, {label: '图表', value: '4'}, {label: '统计学分析', value: '5'}],
    bilibili: false,
    login: false,
    loginB: false,
    containerKey: new Date().getTime(),
    dataUpdated: new Date().getTime(),
  }),
  methods: {
    async loadData() {
      let rawData = await readLocalStorage(this.bilibili ? "ArknightsCardInformationB" : "ArknightsCardInformation");
      this.poolsDict = loadPools(rawData);
      this.pools = Object.values(this.poolsDict);
      this.pools.sort((a, b) => {
        return b.getLastUpdate() - a.getLastUpdate();
      });
    },
    async loginCheck() {
      let login = await readLocalStorage("login");
      let loginB = await readLocalStorage("loginB");
      this.login = login;
      this.loginB = loginB;
      if (loginB && !login)
        this.bilibili = true;
    }
  },
  watch: {
    bilibili: function () {
      this.loadData();
      this.containerKey = new Date().getTime();
    },
    dataUpdated: function () {
      console.log("Data Updated");
      console.log(this);
      this.loadData();
      this.containerKey = new Date().getTime();
    }
  },
  mounted() {
    this.loginCheck()
    this.loadData()
    chrome.storage.local.set({"indexVisited": true});
  }
})
</script>

<style>
</style>
