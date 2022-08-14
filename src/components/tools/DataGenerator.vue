<template>

  <div class="q-gutter-sm">
    数量:
    <q-input v-model="number" label="数量"/>
  </div>
  <div class="q-gutter-sm">
    生成率:
    <q-input v-model="number" label="数量"/>
  </div>
  <q-btn color="primary" label="生成虚拟数据"/>
</template>

<script>
export default {
  name: "DataGenerator",
  data: () => ({
    number: 100
  }),
}
</script>

<style scoped>

</style>
