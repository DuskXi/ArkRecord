<template>
  <div class="text-h5 vertical-middle	">卡池时间线:</div>
  <div class="q-gutter-sm">
    <q-toggle v-model="reserve" label="反转顺序"/>
    <q-toggle v-model="generalizeStar34" label="收起3/4星"/>
    <q-toggle v-if="!generalizeStar34" v-model="generalizeStar3" label="收起3星"/>
    <q-toggle v-if="!disableThumbnail" v-model="noRepeat" label="去重"/>
    <q-toggle v-model="disableThumbnail" label="不显示折叠的图片"/>
    <q-toggle v-model="print" label="启用截图"/>
    <screen-shot v-if="print" label="点击截图(全屏)" :key="screenShotKey"/>
    <screen-shot v-if="print" label="点击截图(仅限时间线)" :element="getTimeLineElement()" :key="screenShotKey"/>
    数据来源: <a href="https://prts.wiki/w/卡池一览/常驻标准寻访" class="doc-link">prts.wiki
    <span class="q-icon" aria-hidden="true" role="presentation">
      <svg viewBox="0 0 24 24">
        <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"></path>
      </svg>
    </span>
  </a>
  </div>
  <div :style="mainBodyStyle">
    <q-timeline :layout="$q.screen.lt.sm ? 'dense' : ($q.screen.lt.md ? 'comfortable' : 'loose')" color="secondary" id="timeline">
      <q-timeline-entry v-if="pool != null" heading>
        {{ pool.name }} 时间线
      </q-timeline-entry>

      <q-timeline-entry
        :title=" (item.type === 'single' ? item.star : item.type)  +'星'"
        :subtitle="item.type === 'single' ? item.date.toLocaleString() : item.date[0].toLocaleString() + ' - ' + item.date[1].toLocaleString()"
        :color="item.color"
        v-for="(item, index) in line"
        :key="index"
      >
        <div>
          <div class="text-h5 vertical-middle"> {{ item.character }}</div>
          <q-intersection v-if="!print">
            <q-img loading="lazy" v-if="Object.keys(characterInfo).length > 0 && item.type === 'single'"
                   :src="characterInfo[item.character].image"
                   spinner-color="white" style="height: 120px; max-width: 120px; font-size: 1px">
              <div class="absolute-bottom text-subtitle6 text-center q-pa-xs">{{ item.starStr }}</div>
            </q-img>
            <div v-if="!disableThumbnail && item.type !== 'single' && Object.keys(characterInfo).length > 0">
              <q-img v-for="(character, index) in item.characters"
                     :key="character" :ref="item.images[index]"
                     :src="item.images[index]"
                     pinner-color="white" style="height: 100px; max-width: 100px">
                <div class="absolute-bottom text-center q-pa-xs" style="font-size: 1px"> {{ item.stars[index] }}</div>
              </q-img>
            </div>
          </q-intersection>
          <div v-else>
            <q-img v-if="Object.keys(characterInfo).length > 0 && item.type === 'single'"
                   :src="characterInfo[item.character].image"
                   spinner-color="white" style="height: 120px; max-width: 120px; font-size: 1px">
              <div class="absolute-bottom text-subtitle6 text-center q-pa-xs">{{ item.starStr }}</div>
            </q-img>
            <div v-if="!disableThumbnail && item.type !== 'single' && Object.keys(characterInfo).length > 0">
              <q-img v-for="(character, index) in item.characters"
                     :key="character" :ref="item.images[index]"
                     :src="item.images[index]"
                     pinner-color="white" style="height: 100px; max-width: 100px">
                <div class="absolute-bottom text-center q-pa-xs" style="font-size: 1px"> {{ item.stars[index] }}</div>
              </q-img>
            </div>
          </div>
        </div>
      </q-timeline-entry>
    </q-timeline>
  </div>
</template>

<script>
import {Pool} from "src/utils/data";
import {syncCharactersInformation} from "src/utils/CharacterInfo";
import ScreenShot from "components/functional/ScreenShot.vue";

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
      this.pool.records.forEach(record => {
        this.line.push({
          date: new Date(record.timestamp),
          star: record.star,
          isFirstTimes: record.isFirstTimes,
          character: record.character,
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
      });
    },
    generalize() {
      this.update();
      let temp = [];
      let newLine = [];
      let star = 3;
      if (!this.generalizeStar3 && !this.generalizeStar34) {
        if (this.reserve)
          this.line.reverse();
        return;
      } else {
        if (this.generalizeStar34)
          star = 4;
      }
      let index = 0;
      this.line.forEach(item => {
        if (item.star === 3 || (item.star === 4 && star === 4)) {
          temp.push(item);
        } else {
          newLine.push(item);
        }
        if (temp.length > 0 && !(item.star === 3 || (item.star === 4 && star === 4)) || index === this.line.length - 1) {
          let start = temp[0].date.getTime();
          let end = temp[0].date.getTime();
          let star3 = 0;
          let star4 = 0;
          let characters = [];
          let characterNoRepeat = [];
          let images = [];
          let stars = [];
          temp.forEach(element => {
            start = Math.min(start, element.date.getTime());
            end = Math.max(end, element.date.getTime());
            star3 += element.star === 3 ? 1 : 0;
            star4 += element.star === 4 ? 1 : 0;
            if (!characters.includes(element.character) || !this.noRepeat) {
              characters.push(element.character);
              images.push(this.characterInfo[element.character].image);
              stars.push(element.star === 3 ? "⭐⭐⭐" : "⭐⭐⭐⭐");
            }
            if (!characterNoRepeat.includes(element.character))
              characterNoRepeat.push(element.character);
          })
          newLine.push({
            date: [new Date(start), new Date(end)],
            star3: star3,
            star4: star4,
            characters: characters,
            images: images,
            stars: stars,
            type: star === 4 ? "3/4" : "3",
            character: (() => {
              let char = "";
              for (let i = 0; i < characterNoRepeat.length; i++) {
                char += characterNoRepeat[i];
                if (i < characterNoRepeat.length - 1)
                  char += ", ";
              }
              return char;
            })()
          })
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
  },
  async mounted() {
    this.screenShotKey = new Date().getTime();
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
        let characterInfo = await syncCharactersInformation();
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
    noRepeat() {
      this.generalize();
    },
    print(val) {
      if (val)
        this.mainBodyStyle = "";
      else
        this.mainBodyStyle = "overflow-x:hidden; overflow-y:scroll; max-height: 60vh";
    },
    reserve() {
      this.generalize();
    }
  },
  data: () => ({
    line: [],
    characterInfo: {},
    generalizeStar34: false,
    generalizeStar3: false,
    noRepeat: true,
    disableThumbnail: false,
    print: false,
    screenShotKey: new Date().getTime(),
    mainBodyStyle: "overflow-x:hidden; overflow-y:scroll; max-height: 60vh",
    reserve: false,
  }),
}
</script>

<style>

</style>
