<template>
  <q-page class="flex flex-center -primary mainBody">
    <div class="column" style="width: 65%">
      <div class="col" style="margin-bottom: 20px;">

        <div class="text-h3 vertical-middle	">ArkRecord Dev页</div>
        <div class="text-h5 vertical-middle	">爬虫数据:</div>
        <poolsSchedule v-model:schedule="schedule"></poolsSchedule>
        <q-btn color="secondary" label="同步" @click="test"></q-btn>
      </div>
    </div>
  </q-page>
</template>

<script>
import config from '../../package.json';
import PoolsSchedule from "components/functional/PoolsSchedule.vue";
import {syncCharactersInformation} from "src/utils/CharacterInfo";

export default {
  name: "TestPages",
  components: {
    poolsSchedule: PoolsSchedule,
  },
  data: () => ({
    version: config.version,
    schedule: []
  }),
  methods: {
    async test() {
      console.log(await syncCharactersInformation());
    }
  },
  watch: {
    'schedule': function (val) {
      console.log(val);
    }
  }
}
</script>

<style>

</style>
