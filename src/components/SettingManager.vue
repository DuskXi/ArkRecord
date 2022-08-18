<template>
  <q-dialog v-model="dialog" persistent>
    <q-card style="width: 1500px; max-width: 90vw;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">设置</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none q-pa-md">
        <q-list padding bordered class="rounded-borders">
          <q-expansion-item dense dense-toggle expand-separator icon="wallpaper" label="背景设置" :default-opened="true">
            <q-card>
              <q-card-section>
                <q-file v-model="files" label="点击加载本地图片" filled multiple style=""/>
                <q-btn v-if="imageListTemp.length > 0" color="warning" class="full-width" style="margin-top: 20px;" label="移除当前图片" @click="removeTemp"/>
                <q-carousel :swipeable="$q.platform.has.touch" :vertical="!$q.platform.has.touch" :ratio="16/9" :animated="true" :thumbnails="true" style="height: 60vh; margin-top: 20px;"
                            v-if="imageListTemp.length > 0" v-model="slideTemp" :key="imageListTempKey" @mousewheel.prevent="handleScroll($event, true)">
                  <q-carousel-slide v-for="(value, i) in imageListTemp" :key="i" :name="i" :img-src="value['base64']"/>
                </q-carousel>
                <q-btn v-if="imageListTemp.length > 0" color="primary" class="full-width" style="margin-top: 20px;" label="保存这些图片到背景库" @click="saveImage"/>

                <div class="text-h5 vertical-middle">背景库:</div>
                <q-carousel :swipeable="$q.platform.has.touch" :vertical="!$q.platform.has.touch" v-model="slide" @mousewheel.prevent="handleScroll($event, false)"
                            :ratio="16/9" :animated="true" :thumbnails="true" style="height: 60vh">
                  <q-carousel-slide v-for="(value, i) in imageList" :key="i" :name="i" :img-src="value['thumbnails']">
                    <q-badge color="orange" class="absolute-top-right" style="margin-top: 20px; margin-right: 20px;">{{ sizeToString(value.size) }}</q-badge>
                  </q-carousel-slide>
                </q-carousel>
                <q-btn v-if="imageList.length > 0" color="warning" class="full-width" style="margin-top: 20px;" label="移除当前图片" @click="removeImage"/>
                <q-btn v-if="imageList.length > 0" color="primary" class="full-width" style="margin-top: 20px;" label="设置为主背景" @click="setToMainBackground"/>
                <q-btn v-if="imageList.length > 0" color="primary" class="full-width" style="margin-top: 20px;" label="设置为时间线背景" @click="setToTimeLineBackground"/>
                <q-btn v-if="imageList.length > 0" color="warning" class="full-width" style="margin-top: 20px;" label="清除时间线背景" @click="cleanTimeLineBackground"/>
                <q-btn v-if="imageList.length > 0" color="warning" class="full-width" style="margin-top: 20px;" label="清除主背景" @click="cleanMainBackground"/>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </q-card-section>


      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat label="OK" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-btn round :class="css" color="primary" icon="settings" @click="dialog = true"/>
</template>

<script>
import global from "src/utils/largeFileStorage";
import {writeLocalStorage} from "src/utils/storage";

export default {
  name: "SettingManager",
  data: () => ({
    dialog: false,
    imageList: [],
    imageListTemp: [],
    imageListTempKey: new Date().getTime(),
    slide: 0,
    slideTemp: 0,
    files: [],
  }),
  methods: {
    async loadImageList() {
      this.imageList = await global.storage.read();
      for (let i = 0; i < this.imageList.length; i++) {
        this.imageList[i]['thumbnails'] = await this.getThumbnails(this.imageList[i]['base64']);
      }
    },
    removeTemp() {
      this.imageListTemp.splice(this.slideTemp, 1);
      if (this.imageListTemp.length === this.slideTemp)
        this.slideTemp = this.imageListTemp.length - 1;
    },
    async saveImage() {
      this.slideTemp = 0;
      while (this.imageListTemp.length > 0) {
        let temp = this.imageListTemp.pop();
        await global.storage.write(temp.name, JSON.parse(JSON.stringify(temp)));
        this.imageList.push(temp);
      }
    },
    async removeImage() {
      await global.storage.remove(this.imageList[this.slide].name);
      this.imageList.splice(this.slide, 1);
      if (this.imageList.length === this.slide)
        this.slide = this.imageList.length - 1;
    },
    async setToMainBackground() {
      await writeLocalStorage('mainBackground', this.imageList[this.slide].name);
      global.callListeners();
    },
    async setToTimeLineBackground() {
      await writeLocalStorage('timeLineBackground', this.imageList[this.slide].name);
      global.callListeners();
    },
    async cleanTimeLineBackground() {
      await writeLocalStorage('timeLineBackground', null);
      global.callListeners();
    },
    async cleanMainBackground() {
      await writeLocalStorage('mainBackground', null);
      global.callListeners();
    },
    getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
      })
    },
    async getThumbnails(base64, maxWidth = 1280, maxHeight = 720) {
      let img = new Image();
      img.src = base64;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      let rate = Math.min(img.width / maxWidth, img.height / maxHeight);
      let canvas = document.createElement("canvas");
      let w = img.width / rate;
      let h = img.height / rate;
      canvas.setAttribute("width", w);
      canvas.setAttribute("height", h);
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      return canvas.toDataURL("image/jpg");
    },
    handleScroll(e, temp = false) {
      let direction = e.deltaY > 0 ? 'down' : 'up';
      let result = temp ? this.slideTemp : this.slide;
      let length = temp ? this.imageListTemp.length : this.imageList.length;
      if (direction === 'down' && e.deltaY >= 125)
        if (result < length - 1)
          result++;
        else
          result = 0;
      if (direction === 'up' && e.deltaY <= -125)
        if (result !== 0)
          result -= 1;
        else if (result === 0)
          result = length - 1;
      if (temp)
        this.slideTemp = result;
      else
        this.slide = result;
    },
    sizeToString(size) {
      let unit = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      let i = 0;
      while (size > 1024) {
        size /= 1024;
        i++;
      }
      return size.toFixed(2) + ' ' + unit[i];
    }
  },
  mounted() {
    console.log(global.storage.objectId);
    this.loadImageList();
  },
  props: {
    css: {
      type: String,
      default: "",
    },
  },
  watch: {
    async files(val) {
      for (let i = 0; i < val.length; i++) {
        let base64 = await this.getBase64(val[i]);
        this.imageListTemp.push({
          base64: base64,
          name: val[i].name,
          size: val[i].size,
        });
      }
      for (let i = 0; i < this.imageListTemp.length; i++) {
        this.imageListTemp[i]['thumbnails'] = await this.getThumbnails(this.imageListTemp[i]['base64']);
      }
    }
  }
}
</script>

<style>

</style>
