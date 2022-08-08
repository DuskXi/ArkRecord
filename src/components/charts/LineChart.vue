<template>
  <apexchart type="area" height="350" :options="chartOptions" :series="series"></apexchart>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";
import {readLocalStorage} from "src/utils/storage";
import {loadPools, buildTotalData} from "src/utils/data";

var details;
var enableDetails = false;
var enableCount = false;

export default {
  name: "LineChart",
  components: {
    apexchart: VueApexCharts,
  },
  methods: {
    async loadData() {
      let rawData = await readLocalStorage("ArknightsCardInformation");
      this.poolsDict = loadPools(rawData);
      this.poolsList = Object.values(this.poolsDict);
      this.poolsList.sort((a, b) => {
        return b.getLastUpdate() - a.getLastUpdate();
      });
    },
    generateSeries() {
      let series = [];
      details = [];
      let totalData = buildTotalData(this.pools);
      totalData.sortUp();
      let typeList = ['star6', 'star5', 'star4', 'star3'];
      typeList.forEach(element => {
        let records = totalData[element];
        let recordsListInTime = {};
        let detailsListInTime = {};
        records.forEach(record => {
          let timestamp = record.timestamp;
          let dateString = new Date(timestamp).toLocaleDateString();
          if (!recordsListInTime.hasOwnProperty(dateString)) {
            recordsListInTime[dateString] = 1;
            detailsListInTime[dateString] = {};
          } else {
            recordsListInTime[dateString] += 1;
          }
          if (!detailsListInTime[dateString].hasOwnProperty(record.character))
            detailsListInTime[dateString][record.character] = 1;
          else
            detailsListInTime[dateString][record.character] += 1;
        });
        let name = element.replace('star', '') + "星";
        let data = [];
        let detail = [];
        for (let key in recordsListInTime) {
          data.push({
            x: new Date(key),
            y: recordsListInTime[key],
          });
          detail.push(detailsListInTime[key]);
        }
        series.push({
          name: name,
          data: data,
        });
        details.push(detail);
      });
      this.series = series;
    }
  },
  async mounted() {
    enableDetails = this.detail;
    this.poolsList = this.pools.slice();
    if (this.poolsList == null || this.poolsList.length === 0)
      await this.loadData();
    await this.generateSeries();
  },
  props: {
    pools: {Array, default: []},
    detail: {type: Boolean, default: false,},
    count: {type: Boolean, default: false,},
  },
  watch: {
    detail: function (val) {
      enableDetails = val;
    },
    pools: function (val) {
      this.poolsList = val.slice();
      this.generateSeries();
    },
    count: function (val) {
      enableCount = val;
    },
  },
  data: () => ({
    poolsDict: {},
    poolsList: [],
    details: [],
    series: [],
    chartOptions: {
      chart: {
        type: 'area',
        stacked: false,
        height: 350,
        zoom: {
          type: 'x',
          enabled: true,
          autoScaleYaxis: true
        },
        toolbar: {
          autoSelected: 'zoom'
        }
      },
      dataLabels: {
        enabled: false
      },
      markers: {
        size: 0,
      },
      title: {
        text: '每日抽卡结果统计',
        align: 'left'
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.5,
          opacityTo: 0,
          stops: [0, 90, 100]
        },
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return val.toFixed(0);
          },
        },
        title: {
          text: '数量'
        },
      },
      xaxis: {
        type: 'datetime',
      },
      tooltip: {
        shared: false,
        y: {
          formatter: function (val, opt) {
            let characters = '';
            let data = details[opt.seriesIndex][opt.dataPointIndex];
            let i = 0;
            for (let key in data) {
              characters += key + (enableCount ? `: ${data[key]}` : '') + (data.length - 1 === i ? '' : ', ');
              i++;
            }
            return enableDetails ? val + "个, 详细名单: " + characters : val + "个";
          },
        }
      }
    },

  })
}
</script>

<style>

</style>
