<template>
  <q-btn :color="messagesUnread.length > 0? 'secondary':'primary'" style="margin-left: 10px;" @click="onDialogClick" label="作者通讯">
    <q-badge color="orange" v-if="messagesUnread.length > 0">
      新通讯！
    </q-badge>
  </q-btn>

  <q-dialog v-model="dialog">
    <q-card :style="$q.screen.gt.sm? 'width: 1000px; max-width: 70vw;':'width: 96vw;'">
      <q-card-section>
        <div class="text-h6">通讯</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-select v-model="messageChoose" :options="messageOptions" label="通讯选择"/>
        <q-markdown v-if="messageChoose != null && initialized" style="margin-top: 10px" :key="keyMarkdown">
          {{ serverMessages[messageChoose.value].content }}
        </q-markdown>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {api} from 'src/boot/axios';
import {readLocalStorage, writeLocalStorage} from "src/utils/storage";

export default {
  name: "AuthorMessage",
  data: () => ({
    dialog: false,
    messagesRead: [],
    messagesUnread: [],
    serverMessages: [],
    messageWithContent: [],
    messageOptions: [],
    messageChoose: null,
    initialized: false,
    keyMarkdown: new Date().getTime(),
  }),
  methods: {
    async loadMessages() {
      let url = 'https://api.github.com/repos/duskxi/arkrecord/contents/message?ref=message';
      let response = await api.get(url);
      let data = response.data;
      let messages = [];
      data.forEach(element => {
        messages.push({
          name: element.name,
          path: element.path,
          url: element['download_url'],
          unread: true
        });
      });
      this.serverMessages = messages;
    },
    async getUnreadMessages() {
      for (let i = 0; i < this.serverMessages.length; i++)
        if (this.messagesRead.includes(this.serverMessages[i].name))
          this.serverMessages[i].unread = false;
      return this.serverMessages.filter(message => message.unread).map(message => message.name);
    },
    async loadReadMessages() {
      this.messagesRead = await readLocalStorage('messagesRead');
      if (!this.messagesRead)
        this.messagesRead = [];
    },
    async saveMessagesRead() {
      await writeLocalStorage('messagesRead', this.messagesRead.map(message => message));
    },
    async downloadContent() {
      for (let i = 0; i < this.serverMessages.length; i++) {
        let url = this.serverMessages[i].url;
        let response = await api.get(url);
        this.serverMessages[i].content = response.data;
      }
    },
    async init() {
      await this.loadReadMessages();
      await this.loadMessages();
      this.messagesUnread = await this.getUnreadMessages();
      let index = 0;
      this.messageOptions = [];
      this.serverMessages.forEach(message => {
        this.messageOptions.push({label: this.messagesUnread.includes(message.name) ? `${message.name} (未读)` : message.name, value: index});
        index++;
      });
      await this.downloadContent();
      if (this.messageOptions.length > 0)
        this.messageChoose = this.messageOptions[this.messageOptions.length - 1];
    },
    async onDialogClick() {
      this.dialog = true;
      if (this.messageChoose !== null) {
        let message = this.serverMessages[this.messageChoose.value];
        if (this.messagesUnread.includes(message.name)) {
          this.messagesUnread.splice(this.messagesUnread.indexOf(message.name), 1);
          this.messagesRead.push(message.name);
          await this.saveMessagesRead();
          await this.init();
        }
      }
    }
  },
  async mounted() {
    await this.init();
    this.initialized = true;
  },
  watch: {
    messageChoose: {
      async handler(newVal, oldVal) {
        if (newVal != null && this.dialog) {
          let message = this.serverMessages[newVal.value];
          if (this.messagesUnread.includes(message.name)) {
            this.messagesUnread.splice(this.messagesUnread.indexOf(message.name), 1);
            this.messagesRead.push(message.name);
            await this.saveMessagesRead();
            await this.init();
          }
        }
        this.keyMarkdown = new Date().getTime();
      },
      deep: true
    }
  }
}
</script>

<style scoped>

</style>
