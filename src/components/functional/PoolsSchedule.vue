<template>

  <q-btn color="secondary" label="从PRTS获取数据" @click="loadSchedule" v-if="waitData.length > 0"></q-btn>
  <div class="text-h6 vertical-middle">缓存卡池时间数据: {{ countPools }} 个卡池</div>
  <div class="q-gutter-sm">
    <q-badge color="blue" v-for="(value, index) in poolsScheduleYears" :key="index">{{ value }}</q-badge>
    <q-badge color="red" v-for="(value, index) in waitData" :key="index">{{ value }}未拉取数据</q-badge>
    数据来源: <a href="https://prts.wiki/w/卡池一览/常驻标准寻访" class="doc-link">prts.wiki
    <span class="q-icon" aria-hidden="true" role="presentation">
      <svg viewBox="0 0 24 24">
        <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"></path>
      </svg>
    </span>
  </a>
  </div>
  <q-linear-progress indeterminate v-if="loading"/>
</template>

<script>
import {getPoolsSchedule} from "src/utils/NormalPoolsSchedule";
import {readLocalStorage, writeLocalStorage} from "src/utils/storage";
import {computed} from "vue";

export default {
  name: "PoolsSchedule",
  methods: {
    async loadSchedule() {
      this.loading = true;
      let cachedYears = await readLocalStorage("PoolsScheduleYears");
      let currentYear = new Date().getFullYear();
      let occupiedDate = []
      let results = [];
      if (cachedYears === null) {
        cachedYears = [];
      } else {
        results = await readLocalStorage("PoolsSchedule");
        this.poolsScheduleYears = cachedYears.map(year => year);
        occupiedDate = results.map(result => result.start);
      }
      for (let i = this.startYear; i <= currentYear; i++)
        if (!cachedYears.includes(i)) {
          let result = await getPoolsSchedule(i);
          result.forEach(item => {
            if (!occupiedDate.includes(item.start)) {
              results.push(item);
              occupiedDate.push(item.start);
            }
          });
          this.poolsScheduleYears.push(i);
          this.countPools = results.length;
          if (this.waitData.includes(i)) {
            this.waitData.splice(this.waitData.indexOf(i), 1);
          }
        }
      this.scheduleUpdate = results;
      this.poolsScheduleYears.sort((a, b) => a - b);
      this.countPools = results.length;
      await writeLocalStorage("PoolsScheduleYears", this.poolsScheduleYears);
      await writeLocalStorage("PoolsSchedule", results);
      this.loading = false;
    },
  },
  async mounted() {
    let currentYear = new Date().getFullYear();
    let cachedYears = await readLocalStorage("PoolsScheduleYears");
    if (cachedYears != null) {
      this.poolsScheduleYears = await readLocalStorage("PoolsScheduleYears");
      this.countPools = (await readLocalStorage("PoolsSchedule")).length;
    }
    for (let i = this.startYear; i <= currentYear; i++)
      if (!this.poolsScheduleYears.includes(i)) {
        this.waitData.push(i);
      }
  },
  emits: ['update:schedule'],
  props: {
    schedule: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    progress: 0,
    loading: false,
    startYear: 2019,
    poolsScheduleYears: [],
    countPools: 0,
    waitData: [],
  }),
  setup(props, {emit}) {
    const scheduleUpdate = computed({
      get: () => props.schedule,
      set: (val) => {
        emit('update:schedule', val);
      }
    });
    return {
      scheduleUpdate
    }
  }
}
</script>

<style>

</style>
