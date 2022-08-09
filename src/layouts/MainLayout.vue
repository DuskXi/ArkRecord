<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script>
import {defineComponent, ref} from 'vue'

export default defineComponent({
  name: 'MainLayout',

  components: {},

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

::-webkit-scrollbar-track{
  background-color: transparent;
}

body {
  background: url(/www/background.jpg) no-repeat center fixed;
  background-size: cover;
}

.mainBody {
  background-color: rgba(255, 255, 255, 0.65);
}
</style>
