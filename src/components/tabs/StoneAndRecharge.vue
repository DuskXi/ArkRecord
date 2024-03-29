<template>
  <div :class="$q.screen.lt.md?'':'row'">
    <div class="col-sm-12 col-md-6 q-pa-md">
      <q-table :title="`源石记录(${rowsStone.length}条)`" style="background-color: rgba(255,255,255,0.2)" :dense="$q.screen.lt.md"
               :rows="rowsStone" :columns="columnsStone" row-key="name">
        <template v-slot:top-right>
          <q-btn
            color="primary"
            icon-right="archive"
            label="导出为csv"
            no-caps
            @click="() => exportTable(1)"
          />
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.name === "time" ? new Date(col.value).toLocaleString() : (col.name === "change" ? col.value > 0 ? "+" + col.value : col.value : col.value) }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <div class="col-sm-12 col-md-6 q-pa-md">
      <q-table :title="`充值(${rowsRecharge.length}条)`" style="background-color: rgba(255,255,255,0.2)" :dense="$q.screen.lt.md"
               :rows="rowsRecharge" :columns="columnsRecharge" row-key="name">
        <template v-slot:top-right>
          <q-btn
            color="primary"
            icon-right="archive"
            label="导出为csv"
            no-caps
            @click="() => exportTable(2)"
          />
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.name === "time" ? new Date(col.value).toLocaleString() : col.value }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>


  <q-btn icon="event" round color="primary">
    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
      <q-date v-model="timeLimiterProxy" range>
        <div class="row items-center justify-end q-gutter-sm">
          <q-btn label="Cancel" color="primary" flat v-close-popup/>
          <q-btn label="OK" color="primary" @click="onDateLimiterChange" flat v-close-popup/>
        </div>
      </q-date>
    </q-popup-proxy>
  </q-btn>
  <div class="q-mb-sm">
    <q-badge color="teal">
      时间区间: {{ timeLimiter.from.toLocaleString() }} - {{ timeLimiter.to.toLocaleString() }}
    </q-badge>
    <div class="text-h5 vertical-middle"> 时长: {{ ((timeLimiter.to - timeLimiter.from) / (1000 * 60 * 60 * 24)).toFixed(2) }} 天</div>
  </div>

  <q-table title="分析" style="background-color: rgba(255,255,255,0.2)" :dense="$q.screen.lt.md" :pagination="initialPagination"
           :rows="rowsDisplay" :columns="columnsDisplay" row-key="name">
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="key" :props="props">
          {{ props.row.key }}
        </q-td>
        <q-td key="value" :props="props">
          <q-badge :color="negative.includes(props.row.key)? 'red':'green' ">
            {{ props.row.value }}
          </q-badge>
        </q-td>
      </q-tr>
    </template>
  </q-table>

</template>

<script>
import config from '../../../package.json';
import {readLocalStorage} from "src/utils/storage";
import {ref} from "vue";
import {exportFile} from "quasar";

let dateToString = (date) => `${date.getFullYear()}/${((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1)}/${(date.getDate() < 10 ? '0' : '') + date.getDate()}`

export default {
  name: "StoneAndRecharge",
  data: () => ({
    version: config.version,
    stone: [],
    recharge: [],
    columnsStone: [
      {name: 'time', align: 'center', label: '时间', field: 'time', sortable: true},
      {name: 'operation', align: 'center', label: '操作', field: 'operation', sortable: false},
      {name: 'change', align: 'center', label: '变化', field: 'change', sortable: true},
      {name: 'remain', align: 'center', label: '变化后剩余', field: 'remain', sortable: true},
      {name: 'platform', align: 'center', label: '平台', field: 'platform', sortable: true},
    ],
    rowsStone: [],
    columnsRecharge: [
      {name: 'time', align: 'center', label: '时间', field: 'time', sortable: true},
      {name: 'orderId', align: 'center', label: '订单号', field: 'orderId', sortable: true},
      {name: 'productName', align: 'center', label: '名称', field: 'productName', sortable: true},
      {name: 'amount', align: 'center', label: '价格', field: 'amount', sortable: true},
    ],
    rowsRecharge: [],
    columnsDisplay: [
      {name: 'key', align: 'center', label: '描述', field: 'key', sortable: true},
      {name: 'value', align: 'center', label: '内容', field: 'value', sortable: true},
    ],
    rowsDisplay: [],
    displayData: {},
    negative: ['源石支出'],
    timeLimiter: {from: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30), to: new Date()},
    timeLimiterProxy: ref({from: dateToString(new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30)), to: dateToString(new Date())}),
    initialPagination: {
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: 100
    }
  }),
  props: {
    bilibili: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  methods: {
    async loadData() {
      let stone = await readLocalStorage(this.bilibili ? "StoneBilibili" : "StoneOfficial");
      let recharge = await readLocalStorage(this.bilibili ? "RechargeBilibili" : "RechargeOfficial");
      this.stone = stone != null ? stone : [];
      this.recharge = recharge != null ? recharge : [];
      this.stone.sort((a, b) => a.timestamp - b.timestamp).reverse();
      this.recharge.sort((a, b) => a.timestamp - b.timestamp).reverse();
    },
    async generateStoneTableData() {
      this.rowsStone = [];
      this.stone.forEach(value => {
        let change = parseInt(value.changes[0].after) - parseInt(value.changes[0].before);
        this.rowsStone.push({
          time: value.timestamp * 1000,
          operation: value.operation,
          change: change,
          remain: value.changes[0].after,
          platform: value.changes[0].type
        });
      });
    },
    async generateRechargeTableData() {
      this.rowsRecharge = [];
      this.recharge.forEach(value => {
        this.rowsRecharge.push({
          time: value.timestamp * 1000,
          orderId: value.orderId,
          productName: value.productName,
          amount: value.amount / 100
        });
      });
    },
    async generateDisplayData() {
      let negative = ['源石支出'];
      let filteredStone = this.rowsStone.filter(value => new Date(value.time) >= this.timeLimiter.from && new Date(value.time) <= this.timeLimiter.to);
      let filteredRecharge = this.rowsRecharge.filter(value => new Date(value.time) >= this.timeLimiter.from && new Date(value.time) <= this.timeLimiter.to);
      filteredStone.sort((a, b) => new Date(a.time) - new Date(b.time));
      filteredRecharge.sort((a, b) => new Date(a.time) - new Date(b.time));
      this.displayData = {};
      this.displayData["源石记录数"] = filteredStone.length;
      this.displayData["充值记录数"] = filteredRecharge.length;
      this.displayData["源石收入"] = filteredStone.reduce((acc, value) => parseInt(value.change) >= 0 ? acc + parseInt(value.change) : acc, 0);
      this.displayData["源石支出"] = filteredStone.reduce((acc, value) => parseInt(value.change) < 0 ? acc + Math.abs(parseInt(value.change)) : acc, 0);
      this.displayData["源石净收入"] = this.displayData["源石收入"] - this.displayData["源石支出"];
      this.displayData["源石完成关卡收入"] = filteredStone.filter(value => value.operation.indexOf("首次通过") !== -1).reduce((acc, value) => acc + parseInt(value.change), 0);
      this.displayData["源石充值收入"] = this.displayData["源石收入"] - this.displayData["源石完成关卡收入"];
      this.displayData["充值总额"] = filteredRecharge.reduce((acc, value) => acc + value.amount, 0);
      this.displayData["用于购买皮肤的源石"] = filteredStone.filter(value => value.operation === "购买时装").reduce((acc, value) => acc + Math.abs(parseInt(value.change)), 0);
      this.displayData["用于兑换理智的源石"] = filteredStone.filter(value => value.operation === "兑换理智").reduce((acc, value) => acc + Math.abs(parseInt(value.change)), 0);
      this.displayData["用于兑换合成玉的源石"] = filteredStone.filter(value => value.operation === "兑换合成玉").reduce((acc, value) => acc + Math.abs(parseInt(value.change)), 0);
      this.displayData["充值获得的源石在源石收入中的占比"] = ((this.displayData["源石充值收入"] / this.displayData["源石收入"]) * 100).toFixed(2) + "%";
      if (this.displayData["源石净收入"] < 0)
        negative.push("源石净收入");
      this.negative = negative;
      this.rowsDisplay = [];
      Object.keys(this.displayData).forEach(key => {
        this.rowsDisplay.push({key: key, value: this.displayData[key]});
      })
    },
    onDateLimiterChange() {
      console.log(this.timeLimiterProxy);
      let from = new Date(this.timeLimiterProxy.from);
      let to = new Date(this.timeLimiterProxy.to);
      this.timeLimiter = {from: from, to: to};
      this.generateDisplayData();
    },
    exportTable(type) {
      // naive encoding to csv format
      const content = [(type === 1 ? this.columnsStone : this.columnsRecharge).map(col => this.wrapCsvValue(col.label))].concat(
        (type === 1 ? this.rowsStone : this.rowsRecharge).map(row => (type === 1 ? this.columnsStone : this.columnsRecharge).map(col => this.wrapCsvValue(
          typeof col.field === 'function'
            ? col.field(row)
            : row[col.field === void 0 ? col.name : col.field],
          col.format,
          row
        )).join(','))
      ).join('\r\n')

      const status = exportFile(
        'table-export.csv',
        "\uFEFF" + content,
        'text/csv'
      )

      if (status !== true) {
        $q.notify({
          message: 'Browser denied file download...',
          color: 'negative',
          icon: 'warning'
        })
      }
    },
    wrapCsvValue(val, formatFn, row) {
      let formatted = formatFn !== void 0
        ? formatFn(val, row)
        : val

      formatted = formatted === void 0 || formatted === null
        ? ''
        : String(formatted)

      formatted = formatted.split('"').join('""')
      /**
       * Excel accepts \n and \r in strings, but some other CSV parsers do not
       * Uncomment the next two lines to escape new lines
       */
      // .split('\n').join('\\n')
      // .split('\r').join('\\r')

      return `"${formatted}"`
    }
  },
  async mounted() {
    await this.loadData();
    await this.generateStoneTableData();
    await this.generateRechargeTableData();
    await this.generateDisplayData();
  },


}
</script>

<style>

</style>
