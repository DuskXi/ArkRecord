<template>
  <q-page class="flex flex-center -primary mainBody">
    <div class="column" style="width: 65%">
      <div class="col" style="margin-bottom: 20px;">

        <div class="text-h3 vertical-middle	">ArkRecord Dev页</div>
        <div class="text-h5 vertical-middle	">爬虫数据:</div>
        <q-btn color="primary" label="执行" @click="loadPRTSData"/>
      </div>
    </div>
  </q-page>
</template>

<script>
import config from '../../package.json';
import {api} from "boot/axios";
import {parsePRTSHtml, getPoolsSchedule} from "../utils/NormalPoolsSchedule";

export default {
  name: "TestPages",
  data: () => ({
    version: config.version,
    startYear: 2019
  }),
  methods: {
    async loadPRTSData() {
      let currentYear = new Date().getFullYear();
      let results = [];
      for (let i = this.startYear; i <= currentYear; i++) {
        let result = getPoolsSchedule(i);
        results = results.concat(result);
      }
      return results;
    }
  },
}
</script>

<style>
body {
  background: url(/www/background.jpg) no-repeat center fixed;
  background-size: cover;
}

.mainBody {
  background-color: rgba(255, 255, 255, 0.65);
}
</style>
