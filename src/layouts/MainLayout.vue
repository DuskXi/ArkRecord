<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script>
import {defineComponent, ref} from 'vue'
import global from "src/utils/largeFileStorage";
import {readLocalStorage, writeLocalStorage} from "src/utils/storage";

export default defineComponent({
  name: 'MainLayout',

  components: {},

  mounted() {
    console.log(global.storage.objectId);
    global.listeners.push(this.onBackgroundChange);
    try {
      this.onBackgroundChange();
    } catch (e) {
      console.log(e);
      console.log("初始化自定义背景失败");
      document.body.setAttribute('style', `background: url(/www/background.jpg) no-repeat center fixed; background-size: cover;`);
    }
  },

  methods: {
    changeBackground(base64) {
      document.body.setAttribute('style', `background: url(${base64}) no-repeat center fixed; background-size: cover;`);
    },
    async onBackgroundChange() {
      let backgroundKey = await readLocalStorage('mainBackground');
      if (backgroundKey != null) {
        let result = await global.storage.query(backgroundKey);
        if (result.length > 0)
          this.changeBackground(result[0].base64);
      } else
        document.body.setAttribute('style', `background: url(/www/background.jpg) no-repeat center fixed; background-size: cover;`);
    }
  },

  setup() {
    const leftDrawerOpen = ref(false)

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
})
</script>

<style>
::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-track-piece {
  background-color: transparent;
  -webkit-border-radius: 6px;
}

::-webkit-scrollbar-thumb:vertical {
  height: 12px;
  background-color: #868686;
  -webkit-border-radius: 6px;
}

::-webkit-scrollbar-thumb:horizontal {
  width: 12px;
  background-color: #a7a7a7;
  -webkit-border-radius: 6px;
}

::-webkit-scrollbar-thumb:vertical:hover, ::-webkit-scrollbar-thumb:horizontal:hover {
  /*background-color: #808080;*/
  background-color: transparent;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

body {
  background: url(/www/background.jpg) no-repeat center fixed;
  background-size: cover;
}

.mainBody {
  background-color: rgba(255, 255, 255, 0.65);
}

.mainBody {
  background-color: rgba(255, 255, 255, 0.65);
}
</style>
