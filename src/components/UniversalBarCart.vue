<template>
  <apexchart type="line" height="350" :options="chartOptions" :series="seriesArray" :key="chartKey"></apexchart>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";

export default {
  name: "UniversalBarCart",
  components: {
    apexchart: VueApexCharts,
  },
  methods: {
    reloadChart() {
      this.chartKey = new Date().getTime();
    }
  },
  props: {
    series: {
      type: Array,
      required: true,
    },
    xaxis: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    colors: {
      type: Array,
      required: true,
    },
  },
  watch: {
    series: function (val) {
      this.seriesArray = val;
      this.reloadChart();
    },
    xaxis: function (val) {
      this.chartOptions.xaxis.categories = val;
      this.reloadChart();
    },
    title: function (val) {
      this.chartOptions.title.text = val;
      this.reloadChart();
    },
    colors: function (val) {
      //this.chartOptions.colors = val;
      //this.reloadChart();
    },
  },
  data: () => ({
    chartKey: new Date().getTime(),
    seriesArray: [],
    chartOptions: {
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      title: {
        text: 'Product Trends by Month',
        align: 'left'
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5
        },
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      },
      tooltip: {
        shared: false,
        y: {
          formatter: function (val) {
            return val.toFixed(2) + "%"
          }
        }
      },
    },

  })
}
</script>

<style scoped>

</style>
