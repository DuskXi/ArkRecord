<template>
  <div class="text-h5 vertical-middle	">卡池时间线:</div>
  <div class="q-gutter-sm">
    <q-toggle v-model="reserve" label="反转顺序"/>
    <q-toggle v-model="generalizeStar345" label="收起3/4/5星"/>
    <q-toggle v-if="!generalizeStar345" v-model="generalizeStar34" label="收起3/4星"/>
    <q-toggle v-if="!generalizeStar34 && !generalizeStar345" v-model="generalizeStar3" label="收起3星"/>
    <q-toggle v-if="!disableThumbnail" v-model="noRepeat" label="去重"/>
    <q-toggle v-if="generalizeStar3 || generalizeStar34 || generalizeStar345" v-model="disableThumbnail" label="不显示折叠的图片"/>
    <q-toggle v-if="generalizeStar3 || generalizeStar34 || generalizeStar345" v-model="disableList" label="折叠干员名单"/>
    <q-toggle v-if="!print" v-model="enableBackground" label="启用自定义背景"/>
    <q-toggle v-if="print || enableBackground" v-model="repeatBackground" label="重复背景"/>
    <q-toggle v-model="print" label="启用截图"/>
    <screen-shot v-if="print" label="点击截图(全屏)" :key="screenShotKey"/>
    <screen-shot v-if="print" label="点击截图(仅限时间线)" :element="getTimeLineElement()" :key="screenShotKey"/>
    <div class="row inline">
      <div class="text-center vertical-middle">
        图片数据来源:
        <a href="https://prts.wiki/w/卡池一览/常驻标准寻访" class="doc-link">prts.wiki
          <span class="q-icon" aria-hidden="true" role="presentation">
      <svg viewBox="0 0 24 24">
        <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"></path>
      </svg>
    </span>
        </a></div>
    </div>
    <q-btn color="warning" label="强制刷新图片数据" @click="forceRefresh"/>
  </div>
  <div :style="mainBodyStyle">
    <div :style="backgroundStyle" id="timeline">
      <q-timeline :layout="$q.screen.lt.sm ? 'dense' : ($q.screen.lt.md ? 'comfortable' : 'loose')" color="secondary" :style="timeLineStyle">
        <q-timeline-entry v-if="pool != null" heading>
          {{ pool.name }} 时间线
        </q-timeline-entry>

        <q-timeline-entry
          :title=" (item.type === 'single' ? item.star : item.type)  +'星'"
          :subtitle="item.type === 'single' ? item.date.toLocaleString() : item.date[0].toLocaleString() + ' - ' + item.date[1].toLocaleString()"
          :color="item.color"
          v-for="(item, index) in line"
          :key="index">
          <div>
            <div class="text-h5 vertical-middle">第 <span class="text-red-8">{{ item.count }}</span> 抽 {{ item.type !== 'single' ? `(共${item.number}个干员)` : '' }}</div>
            <div class="text-h5 vertical-middle">
              <span v-if="item.type === 'single'"> {{ item.character }} </span>
              <q-badge color="red" v-if="item.isNew">New!</q-badge>
              <span v-if="item.type === 'single' || disableList"></span>
              <span v-else v-for="(star, char, index) in item.characterNoRepeat" :key="index">
              <span :class="star === 3 ? 'text-teal-6' : (star === 4 ? 'text-purple-6' : 'text-amber-7')">{{ char }}</span>,
            </span>
            </div>
            <q-intersection v-if="!print">
              <q-img loading="lazy" v-if="Object.keys(characterInfo).length > 0 && item.type === 'single'"
                     :src="characterInfo[item.character].image"
                     spinner-color="white" style="height: 120px; max-width: 120px">
                <div class="absolute-bottom text-subtitle6 text-center q-pa-xs">
                  <div class="absolute-top" style="transform: scale(0.8);"> {{ item.starStr }}</div>
                </div>
              </q-img>
              <div v-if="!disableThumbnail && item.type !== 'single' && Object.keys(characterInfo).length > 0">
                <q-img v-for="(character, index) in item.characters"
                       :key="character" :ref="item.images[index]"
                       :src="item.images[index]"
                       pinner-color="white" style="height: 100px; max-width: 100px">
                  <div class="absolute-bottom text-center q-pa-xs" style="">
                    <div class="absolute-top" style="transform: scale(0.8)"> {{ item.stars[index] }}</div>
                  </div>
                </q-img>
              </div>
            </q-intersection>
            <div v-else>
              <q-img v-if="Object.keys(characterInfo).length > 0 && item.type === 'single'"
                     :src="characterInfo[item.character].image"
                     spinner-color="white" style="height: 120px; max-width: 120px;">
                <div class="absolute-bottom text-subtitle6 text-center q-pa-xs" style="">
                  <div class="absolute-top" style="transform: scale(0.8)"> {{ item.starStr }}</div>
                </div>
              </q-img>
              <div v-if="!disableThumbnail && item.type !== 'single' && Object.keys(characterInfo).length > 0">
                <q-img v-for="(character, index) in item.characters"
                       :key="character" :ref="item.images[index]"
                       :src="item.images[index]"
                       pinner-color="white" style="height: 100px; max-width: 100px">
                  <div class="absolute-bottom text-center q-pa-xs" style="">
                    <div class="absolute-top" style="transform: scale(0.8)"> {{ item.stars[index] }}</div>
                  </div>
                </q-img>
              </div>
            </div>
          </div>
        </q-timeline-entry>
      </q-timeline>
    </div>
  </div>
</template>

<script>
import {Pool} from "src/utils/data";
import {syncCharactersInformation} from "src/utils/CharacterInfo";
import ScreenShot from "components/functional/ScreenShot.vue";
import global from "src/utils/largeFileStorage";
import {Notify} from "quasar";
import {readLocalStorage} from "src/utils/storage";

export default {
  name: "TimeLine",
  components: {
    ScreenShot
  },
  methods: {
    getTimeLineElement() {
      return document.getElementById("timeline");
    },
    update() {
      this.line = [];
      this.pool.sortUp();
      let count = 1;
      this.pool.records.forEach(record => {
        this.line.push({
          date: new Date(record.timestamp),
          star: record.star,
          isFirstTimes: record.isFirstTimes,
          character: record.character,
          count: count,
          isNew: record.isFirstTimes,
          type: "single",
          starStr: (() => {
            let str = "";
            for (let i = 0; i < record.star; i++)
              str += "⭐"; // ★
            return str;
          })(),
          color: (() => {
            switch (record.star) {
              case 3:
                return "white";
              case 4:
                return "purple";
              case 5:
                return "orange";
              case 6:
                return "red";
            }
          })()
        });
        count++;
      });
    },
    generalize() {
      this.update();
      let temp = [];
      let newLine = [];
      let star = 3;
      if (!this.generalizeStar3 && !this.generalizeStar34 && !this.generalizeStar345) {
        if (this.reserve)
          this.line.reverse();
        return;
      } else {
        if (this.generalizeStar34)
          star = 4;
        if (this.generalizeStar345)
          star = 5;
      }
      let index = 0;
      this.line.forEach(item => {
        if (item.star === 3 || (item.star === 4 && star >= 4) || (item.star === 5 && star === 5)) {
          temp.push(item);
        }
        if (temp.length > 0 && (!(item.star === 3 || (item.star === 4 && star >= 4) || (item.star === 5 && star === 5)) || (index === this.line.length - 1))) {
          let start = temp[0].date.getTime();
          let end = temp[temp.length - 1].date.getTime();
          let countStart = temp[0].count;
          let countEnd = temp[temp.length - 1].count;
          let star3 = 0;
          let star4 = 0;
          let star5 = 0;
          let characters = [];
          let characterNoRepeat = {};
          let images = [];
          let stars = [];
          temp.forEach(element => {
            start = Math.min(start, element.date.getTime());
            end = Math.max(end, element.date.getTime());
            star3 += element.star === 3 ? 1 : 0;
            star4 += element.star === 4 ? 1 : 0;
            star5 += element.star === 5 ? 1 : 0;
            if (!characters.includes(element.character) || !this.noRepeat) {
              characters.push(element.character);
              images.push(this.characterInfo[element.character].image);
              stars.push(element.star === 3 ? "⭐⭐⭐" : (element.star === 4 ? "⭐⭐⭐⭐" : "⭐⭐⭐⭐⭐"));
            }
            if (!Object.keys(characterNoRepeat).includes(element.character))
              characterNoRepeat[element.character] = element.star;
          })
          newLine.push({
            date: [new Date(start), new Date(end)],
            star3: star3,
            star4: star4,
            star5: star5,
            characters: characters,
            images: images,
            stars: stars,
            count: `${countStart}-${countEnd}`,
            number: temp.length,
            isNew: false,
            type: star === 3 ? "3" : (star === 4 ? "3/4" : "3/4/5"),
            characterNoRepeat: characterNoRepeat,
            character: (() => {
              let char = "";
              let keys = Object.keys(characterNoRepeat)
              for (let i = 0; i < keys.length; i++) {
                char += `<span class="${characterNoRepeat[keys[i]] === 3 ? 'text-grey-1' : (characterNoRepeat[keys[i]] === 4 ? 'text-purple-6' : 'text-amber-7')}">${keys[i]}</span>`;
                // if (i < characterNoRepeat.length - 1)
                //   char += ", ";
              }
              return char;
            })()
          });
          temp = [];
        }
        if (!(item.star === 3 || (item.star === 4 && star >= 4) || (item.star === 5 && star === 5))) {
          newLine.push(item);
        }
        index++;
      });
      newLine.sort((a, b) => {
        let timeA = a.type === "single" ? a.date : a.date[1].getTime();
        let timeB = b.type === "single" ? b.date : b.date[1].getTime();
        return timeA - timeB;
      })
      if (this.reserve)
        newLine.reverse();
      this.line = newLine;
    },
    async forceRefresh() {
      this.print = false;
      let characterInfo = await syncCharactersInformation(true);
      characterInfo.forEach(info => {
        this.characterInfo[info.name] = info;
      });
      this.update();
      this.generalize()
    },
    async onBackgroundChange() {
      let backgroundKey = await readLocalStorage('timeLineBackground');
      if (backgroundKey != null && this.enableBackground) {
        let result = await global.storage.query(backgroundKey);
        if (result.length > 0) {
          if (this.repeatBackground)
            this.backgroundStyle = `background: url(${result[0].base64}) top; background-size: none; background-repeat: repeat-y;`;
          else
            this.backgroundStyle = `background: url(${result[0].base64}) no-repeat top; background-size: cover;`;
          this.timeLineStyle = "background-color: rgba(250,250,250,0.4);";
        }
      } else {
        this.backgroundStyle = "background-color: rgba(255,255,255,0)"
        this.timeLineStyle = "";
      }
    }
  },
  async mounted() {
    this.screenShotKey = new Date().getTime();
    console.log(global.storage.objectId);
    global.listeners.push(this.onBackgroundChange);
    try {
      await this.onBackgroundChange();
    } catch (e) {
      console.log(e);
      console.log("初始化自定义时间线背景失败");
      this.backgroundStyle = "background-color: rgba(255,255,255,0)"
      this.timeLineStyle = "";
    }
  },
  async beforeUnmount() {
    global.listeners.splice(global.listeners.indexOf(this.onBackgroundChange), 1);
  },
  props: {
    pool: {
      type: Pool,
      default: null
    },
    height: {
      type: Number,
      default: null
    }
  },
  watch: {
    pool: {
      async handler() {
        this.print = false;
        let characterInfo = await syncCharactersInformation(false, () => Notify.create({type: 'positive', message: '正在更新干员信息和图片缓存', timeout: 3000}));
        characterInfo.forEach(info => {
          this.characterInfo[info.name] = info;
        });
        this.update();
        this.generalize()
      },
      immediate: true
    },
    height: {
      handler(val) {
        if (val != null) {
        }
      },
      immediate: true
    },
    generalizeStar34() {
      this.generalize();
    },
    generalizeStar3() {
      this.generalize();
    },
    generalizeStar345() {
      this.generalize();
    },
    noRepeat() {
      this.generalize();
    },
    print(val) {
      if (val)
        this.mainBodyStyle = "";
      else
        this.mainBodyStyle = "overflow-x:hidden; overflow-y:scroll; max-height: 60vh;";
      this.enableBackground = true;
      this.onBackgroundChange();
    },
    repeatBackground() {
      this.onBackgroundChange();
    },
    enableBackground() {
      this.onBackgroundChange();
    },
    reserve() {
      this.generalize();
    }
  },
  data: () => ({
    line: [],
    characterInfo: {},
    generalizeStar345: false,
    generalizeStar34: false,
    generalizeStar3: false,
    disableList: false,
    noRepeat: true,
    repeatBackground: false,
    enableBackground: false,
    disableThumbnail: false,
    print: false,
    screenShotKey: new Date().getTime(),
    mainBodyStyle: "overflow-x:hidden; overflow-y:scroll; max-height: 60vh;",
    backgroundStyle: "background-color: rgba(255,255,255,0)",
    timeLineStyle: "",
    reserve: false,
  }),
}
</script>

<style>

</style>
