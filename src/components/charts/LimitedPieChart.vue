<template>

  <div class="q-gutter-sm">
    <q-toggle v-model="enableDateLimiter" label="启用时间限制"/>
  </div>
  <div class="q-pa-md" v-if="enableDateLimiter">
    <q-btn icon="event" round color="primary">
      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
        <!--        @before-show="updateProxy"-->
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
  <div class="q-gutter-sm">
    <q-toggle v-model="allowStandardPool" label="允许统计标准寻访"/>
    <q-checkbox v-for="(_value, name, index) in poolsLimiter" :label="name" v-model="poolsLimiter[name]" :key="index" color="orange"/>
  </div>
  <div class="row">
    <div class="items-center">
      <div class="text-h5 vertical-middle	">普通分布:</div>
      <div class="text-h6 vertical-middle	">共计: {{ sum(series) }}</div>
      <apexchart type="pie" :options="chartOptions" width="380" :series="series" :key="chartKey"></apexchart>
    </div>
    <div class="flex-break"></div>
    <div class="items-center">
      <div class="text-h5 vertical-middle	">去重数据:</div>
      <div class="text-h6 vertical-middle	">共计: {{ sum(seriesWithoutRepeat) }}</div>
      <apexchart type="pie" :options="chartOptions" width="380" :series="seriesWithoutRepeat" :key="chartWithoutRepeatKey"></apexchart>
    </div>
  </div>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";
import {ref} from 'vue'

export default {
  name: "LimitedPieChart",
  components: {
    apexchart: VueApexCharts,
  },
  methods: {
    sum(array) {
      let result = 0;
      array.forEach(element => {
        result += element;
      });
      return result;
    },
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
    generatePoolsLimiter() {
      this.poolsLimiter = {};
      this.pools.forEach(pool => {
        if ((pool.name !== "常驻标准寻访" || this.allowStandardPool) && this.hasInTimeLimiter(pool))
          this.poolsLimiter[pool.name] = true;
      });
    },
    generateSeries(withoutRepeat = false) {
      let series = [0, 0, 0, 0];
      let stars = {"star6": 0, "star5": 1, "star4": 2, "star3": 3};
      this.pools.forEach(pool => {
        if (Object.keys(this.poolsLimiter).length === 0 || this.poolsLimiter[pool.name]) {
          for (let key in stars) {
            let index = stars[key];
            let temp = pool[key].filter(record => this.isInTimeLimiter(record));
            let tempWithoutRepeat = [];
            temp.forEach(record => {
              if (!tempWithoutRepeat.includes(record.character))
                tempWithoutRepeat.push(record.character);
            });
            series[index] += withoutRepeat ? tempWithoutRepeat.length : temp.length;
          }
        }
      });
      if (withoutRepeat)
        this.seriesWithoutRepeat = series;
      else
        this.series = series;
      this.reloadChart();
      this.reloadChart(withoutRepeat);
    },
    reloadChart(withoutRepeat = false) {
      if (withoutRepeat)
        this.chartWithoutRepeatKey = new Date().getTime();
      else
        this.chartKey = new Date().getTime();
    },
    setMinAngleToShowLabel() {
      this.chartOptions.plotOptions.pie.minAngleToShowLabel = 0;
      this.reloadChart();
    },
    onDateLimiterChange() {
      this.start = new Date(this.dateLimiter.from);
      this.start.setHours(0, 0, 0, 0);
      this.end = new Date(this.dateLimiter.to);
      this.end.setHours(23, 59, 59, 999);
      this.generatePoolsLimiter();
      this.generateSeries();
      this.generateSeries(true);
    }
  },
  mounted() {
    this.setMinAngleToShowLabel();
  },
  props: {
    pools: {Array, default: []},
    detail: {type: Boolean, default: false,},
    count: {type: Boolean, default: false,},
  },
  watch: {
    pools: function (val) {
      this.poolsList = val.slice();
      this.generatePoolsLimiter();
      this.generateSeries();
      this.generateSeries(true);
    },
    allowStandardPool: function () {
      this.generatePoolsLimiter();
      this.generateSeries();
      this.generateSeries(true);
    },
    enableDateLimiter: function (val) {
      if (!val) {
        this.generatePoolsLimiter();
        this.generateSeries();
        this.generateSeries(true);
      }
    },
    poolsLimiter: {
      handler() {
        if (!this.loading) {
          this.generateSeries();
          this.generateSeries(true);
        }
      },
      deep: true
    },

  },
  data: () => ({
    start: new Date(),
    end: new Date(),
    enableDateLimiter: false,
    dateLimiter: ref({from: new Date(), to: new Date()}),
    poolsLimiter: {},
    allowStandardPool: false,
    poolsList: {},
    chartKey: new Date().getTime(),
    chartWithoutRepeatKey: new Date().getTime(),
    series: [],
    seriesWithoutRepeat: [],
    chartOptions: {
      chart: {
        width: 380,
        type: 'pie',
      },
      labels: ["6星", "5星", "4星", "3星"],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {position: 'bottom'},
        }
      }],
      plotOptions: {
        pie: {
          dataLabels: {
            minAngleToShowLabel: 5,
          }
        }
      }
    },
  })

}
</script>

<style scoped>

</style>
