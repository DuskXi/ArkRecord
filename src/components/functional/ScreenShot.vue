<template>
  <q-btn color="primary" @click="print" :label="label"/>
  <q-dialog v-model="imageShow">
    <q-card style="width: 60vw; max-width: 90vw; background-color: rgba(127,127,127,.5)">

      <q-card-section class="q-pt-none">
        <br/>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-img :src="imageDataUrl" style="width: 100%;" ref="image"/>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="OK" color="primary" v-close-popup/>
        <q-btn label="下载" @click="download" color="primary" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import html2canvas from 'html2canvas';
import {exportFile} from 'quasar'

export default {
  name: "ScreenShot",
  props: {
    label: {
      type: String,
      default: "点击打印页面"
    },
    element: {
      type: HTMLElement,
      default: document.body
    }
  },
  methods: {
    print() {
      html2canvas(this.element).then(canvas => {
        this.imageDataUrl = canvas.toDataURL();
        this.imageShow = true;
        this.$q.loading.hide()
      });
      this.$q.loading.show({
        message: '正在渲染...'
      });
    },
    download() {
      exportFile('screenshot.png', Uint8Array.from(atob(this.imageDataUrl.split(',')[1]), c => c.charCodeAt(0)), 'image/png');
    }
  },
  data: () => ({
    imageDataUrl: null,
    imageShow: false,
  })
}
</script>

<style scoped>

</style>
