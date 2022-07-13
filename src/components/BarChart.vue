<template>
  <div class="q-gutter-sm">
    <q-toggle v-model="allowStandardPool" label="允许统计标准寻访"/>
    <q-checkbox v-for="(name, index) in enablePools" :label="name" v-model="enablePools[name]" :key="index" color="orange"/>
  </div>
  <apexchart ref="bar" type="bar" :height="height" :options="chartOptions" :series="series" :key="chartKey"></apexchart>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";

export default {
  name: "BarChart",
  components: {
    apexchart: VueApexCharts,
  },
  methods: {
    generateEnablePools() {
      let enablePools = {};
      this.pools.forEach(pool => {
        if (pool.name !== "常驻标准寻访" || this.allowStandardPool)
          enablePools[pool.name] = true;
      });
      this.enablePools = enablePools;
    },
    generateSeries() {
      let series = [
        {"name": "6星", "data": []},
        {"name": "5星", "data": []},
        {"name": "4星", "data": []},
        {"name": "3星", "data": []},
      ];
      let xaxis = [];
      let details = [[], [], [], []];
      let stars = {"star6": 0, "star5": 1, "star4": 2, "star3": 3};
      this.poolsList.forEach(element => {
        if ((element.name !== "常驻标准寻访" || this.allowStandardPool) && this.enablePools[element.name]) {
          xaxis.push(element.name);
          for (let name in stars) {
            series[stars[name]]["data"].push(element[name].length);
            let detail = [];
            element[name].forEach(record => {
              if (!detail.hasOwnProperty(record.character))
                detail[record.character] = 1;
              else
                detail[record.character] += 1;
            });
            details[stars[name]].push(detail);
          }
        }
      });
      this.series = series;
      this.xaxis = xaxis;
      this.details = details;
      this.reloadChart();
    },
    yFormatter(value, {seriesIndex, dataPointIndex}) {
      let data = this.details[seriesIndex][dataPointIndex];
      let charInfo = "";
      let i = 0;
      for (let key in data) {
        let value = data[key];
        charInfo += `${key}${this.count ? ': ' + value : ''}${i < data[key].length ? ',' : ''} `;
        i++
      }
      return value + "个 " + (this.detail ? charInfo : '');
    },
    reloadChart() {
      this.chartOptions.xaxis.categories = this.xaxis;
      this.chartOptions.tooltip.y.formatter = this.yFormatter;
      this.chartKey = new Date().getTime();
    }
  },
  created() {
  },
  mounted() {
  },
  unmounted() {
  },
  props: {
    pools: Array,
    height: {type: String, default: "350"},
    detail: {type: Boolean, default: false},
    count: {type: Boolean, default: false},
  },
  watch: {
    pools: function (val) {
      this.poolsList = val.slice();
      this.loading = true;
      this.generateEnablePools();
      this.generateSeries();
      this.loading = false;
    },
    allowStandardPool: function () {
      this.loading = true;
      this.generateEnablePools();
      this.generateSeries();
      this.loading = false;
    },
    enablePools: {
      handler() {
        if (!this.loading)
          this.generateSeries();
      },
      deep: true
    },
    height: function () {
      this.chartKey = new Date().getTime();
    },
  },
  data: () => ({
    loading: false,
    poolsList: [],
    enablePools: {},
    allowStandardPool: false,
    chartKey: new Date().getTime(),
    series: [
      {"name": "6星", "data": []},
      {"name": "5星", "data": []},
      {"name": "4星", "data": []},
      {"name": "3星", "data": []}
    ],
    chartOptions: {
      chart: {
        type: 'bar',
        height: 400,
        stacked: true,
        stackType: '100%'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
            offsetX: -10,
            offsetY: 0
          }
        }
      }],
      xaxis: {
        categories: [],
      },
      fill: {
        opacity: 1
      },
      legend: {
        position: 'right',
        offsetX: 0,
        offsetY: 50
      },
      tooltip: {
        y: {}
      },
    },

  }),
}
</script>

<style scoped>

</style>
