<template>
  <q-page class="mainBody q-px-md" :class="$q.screen.gt.sm ? 'flex flex-center': ''">
    <div class="row-lg" :style="$q.screen.gt.sm ? 'width: 80%': ''">
      <div class="col" style="margin-bottom: 20px;">

        <div class="text-h3 vertical-middle	">ArkRecord Dev页</div>
        <debugTools style="background-color:rgba(255,255,255, 0.5)"/>
      </div>
    </div>
  </q-page>
</template>

<script>
import config from '../../package.json';
import DebugTools from 'components/functional/DebugTools.vue';
import {syncCharactersInformation} from "src/utils/CharacterInfo";

export default {
  name: "DebugPages",
  components: {
    debugTools: DebugTools
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
