<template>
  <q-markup-table>
<!--    <thead>-->
<!--    <tr>-->
<!--      <th class="text-left">Key</th>-->
<!--      <th class="text-right">Value</th>-->
<!--    </tr>-->
<!--    </thead>-->
<!--    <tbody>-->
<!--    <tr v-for="(value, index) in shownData" :key="index">-->
<!--      <td class="text-left">{{ value.key }}</td>-->
<!--      <td class="text-right">{{ value.value.length > 180 ? value.value.substring(0, 180) : value.value}}</td>-->
<!--    </tr>-->
<!--    </tbody>-->
  </q-markup-table>
</template>

<script>
import {readAllLocalStorage} from "src/utils/storage";

export default {
  name: "DebugTools",
  data: () => ({
    data: {},
    shownData: []
  }),
  methods: {
    async loadData() {
      let rawData = await readAllLocalStorage();
      this.data = rawData;
      this.shownData = [];
      Object.keys(rawData).forEach(key => {
        this.shownData.push({
          key: key,
          value: JSON.stringify(rawData[key])
        });
      });
    },
  },
  async mounted() {
    await this.loadData();
  }
}
</script>

<style scoped>

</style>
