<template>
  <q-page class="mainBody q-px-md" :class="$q.screen.gt.sm ? 'flex flex-center': ''">
    <div class="row">
      <div class="col" style="margin-bottom: 20px;">

        <div class="text-h3 vertical-middle	">ArkRecord Dev页</div>
        <div class="text-h5 vertical-middle	">爬虫数据:</div>
        <stoneAndRecharge />
        <debugTools />
<!--        <q-btn color="secondary" label="同步" @click="test"></q-btn>-->
      </div>
    </div>
  </q-page>
</template>

<script>
import config from '../../package.json';
import DebugTools from 'components/functional/DebugTools.vue';
import StoneAndRecharge from "components/tabs/StoneAndRecharge.vue";
import {syncCharactersInformation} from "src/utils/CharacterInfo";

export default {
  name: "TestPages",
  components: {
    debugTools: DebugTools,
    stoneAndRecharge: StoneAndRecharge
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
