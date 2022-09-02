<template>
  <div class="q-pa-md q-gutter-sm absolute-bottom-left">
    <q-btn round color="primary" icon="info" @click="showUpdateInfo()"/>
  </div>

  <q-dialog v-model="customDialogModel">
    <q-card :style="$q.screen.gt.sm? 'width: 1500px; max-width: 75vw;':'width: 95vw;'">
      <q-card-section>
        <div class="text-h6">更新日志</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-select v-model="updateInfoChoose" :options="updateInfoOptions" label="发布信息版本选择"/>

        <div class="text-h6">发布日期: {{ new Date(updateInfo[updateInfoChoose.value].time).toLocaleString() }}</div>

        <div class="text-h6">Github页面: <a :href="updateInfo[updateInfoChoose.value].url">{{ updateInfo[updateInfoChoose.value].url }}</a></div>

        <div class="text-h6" v-if="versionType === 'new'">当前软件包版本: {{ version }}, 最新tag版本: {{ updateInfo[0].tag_name }}, 有更新，如果你是本地安装的，请前往发布页面下载最新版本更新扩展</div>

        <div class="text-h6" v-if="versionType === 'newest'">前软件包版本为最新: {{ version }}</div>

        <div class="text-h6" v-if="versionType === 'dev'">前软件包版本为 : {{ version }} 高于最新tag版本: {{ updateInfo[0].tag_name }} 或者位数不相符，本版本为开发版本</div>

        <q-markdown v-if="updateInfoChoose != null" style="margin-top: 10px">
          {{ updateInfo[updateInfoChoose.value].body }}
        </q-markdown>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {api} from "boot/axios";
import {ref} from "vue";
import config from '../../../package.json';
import {readLocalStorage} from "src/utils/storage";

export default {
  name: "InformationSet",
  methods: {
    showUpdateInfo() {
      this.customDialogModel = true;
    },
    async getUpdateInfo() {
      let repo_url = "https://api.github.com/repos/DuskXi/ArkRecord/releases";
      await api.get(repo_url)
        .then(async (response) => {
          let data = response.data;
          let index = 0;
          data.forEach(element => {
            let info = {
              time: element["created_at"],
              body: element["body"],
              url: element["html_url"],
              name: element["name"],
              tag_name: element["tag_name"]
            }
            this.updateInfo.push(info);
            this.updateInfoOptions.push({label: info.name, value: index});
            index++;
          })
          if (this.updateInfoOptions.length > 0) {
            this.updateInfoChoose = this.updateInfoOptions[0];
            let last_version = await readLocalStorage("lastversion")
            if (last_version == null || last_version === '' || last_version !== this.updateInfo[0].name) {
              chrome.storage.local.set({"lastversion": this.updateInfo[0].name});
              this.showUpdateInfo();
            }
          }
        });
    },
    compareVersion() {
      let version = config.version;
      let last_version = this.updateInfo[0].tag_name;
      let local_version = version.replace("v", "").split('.');
      let remote_version = last_version.replace("v", "").split('.');
      let local_len = local_version.length;
      let remote_len = remote_version.length;


      if (remote_len !== local_len) {
        this.versionType = "dev";
        return;
      }

      let local = 0;
      let remote = 0;
      remote_version.reverse();
      for (let i = 0; i < remote_version.length; i++)
        local += parseInt(local_version[i]) * (10 ** i);
      for (let i = 0; i < remote_version.length; i++)
        remote += parseInt(remote_version[i]) * (10 ** i);
      if (local < remote) {
        this.versionType = "new";
      } else if (local === remote) {
        this.versionType = "newest";
      } else
        this.versionType = "dev";
    }
  },
  async mounted() {
    await this.getUpdateInfo();
    this.compareVersion();
  },
  data: () => ({
    version: config.version,
    updateInfo: [],
    customDialogModel: false,
    updateInfoChoose: ref(null),
    updateInfoOptions: [],
    updateInfoLoading: false,
    versionType: "dev"
  }),
  watch: {
    "updateInfoChoose": function (val) {
      if (this.customDialogModel) {
        this.customDialogModel = false;
        setTimeout(() => this.customDialogModel = true, 150);
      }
    }
  }
}
</script>

<style scoped>

</style>
