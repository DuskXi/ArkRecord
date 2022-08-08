<template>
  <q-timeline color="secondary">
    <!--    <q-timeline-entry heading>-->
    <!--      {{ pool != null ? pool.name : '' }}-->
    <!--    </q-timeline-entry>-->

    <q-timeline-entry
      v-for="(item, index) in line"
      :key="index"
      :title="item.title"
      :subtitle="item.date.toLocaleString()"
      :color="item.color"
    >
      <div>
        {{ item.content }} {{ item.isFirstTimes ? '(第一次出货)' : '' }}
      </div>
    </q-timeline-entry>
  </q-timeline>
</template>

<script>
import {Pool} from "src/utils/data";
import {ref, watch} from 'vue'

export default {
  name: "TimeLine",
  methods: {
    /**
     *
     * @param {Pool} pool
     */
    update() {
      this.line = [];
      this.pool.sortUp();
      this.pool.records.forEach(record => {
        this.line.push({
          date: new Date(record.timestamp),
          title: record.star + "星",
          isFirstTimes: record.isFirstTimes,
          content: record.character,
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
    }
  },
  mounted() {

  },
  props: {
    pool: {
      type: Pool,
      default: null
    }
  },
  watch: {
    pool: {
      handler(val) {
        this.update();
      },
      immediate: true
    }
  },
  data: () => ({
    line: [],
  }),
}
</script>

<style>

</style>
