import { boot } from 'quasar/wrappers'
import JsonViewer from 'vue-json-viewer'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async (/* { app, router, ... } */) => {
  // something to do
  app.Use(JsonViewer)
  app.component('JsonViewer', JsonViewer)
})
