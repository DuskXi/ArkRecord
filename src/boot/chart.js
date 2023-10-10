
import { boot } from 'quasar/wrappers'
import VueApexCharts from "vue3-apexcharts";

export default ({ app, router, store }) => {
  // something to do
  app.use(VueApexCharts)
  app.component('ApexChart', VueApexCharts);
}
