import {v4 as uuidV4} from 'uuid';

class LargeFileStorage {
  constructor(dataBaseName = "ArkRecordDataBase", version = 1) {
    this.db = null;
    this.version = version;
    this.initialized = false;
    this.objectId = uuidV4();
    this.dataBaseOpened = false;
    this.dataBaseName = dataBaseName;
    let object = this;
    this.open().then(_ => {
      console.log("数据库初始化完成");
      object.initialized = true;
    });
  }

  async open() {
    let request = window.indexedDB.open(this.dataBaseName, this.version);
    request.onupgradeneeded = function (event) {
      console.log('开始创建数据表')
      let db = event.target.result;
      if (!db.objectStoreNames.contains('ImageStore')) {
        let objectStore = db.createObjectStore("ImageStore", {keyPath: "key", autoIncrement: true});
        objectStore.createIndex("value", "value", {unique: false});
      }
      console.log('数据表创建完成')
    }
    this.db = await new Promise((resolve, reject) => {
      request.onerror = function (event) {
        console.log('无法初始化大文件存储');
        console.log('indexedDB: ' + this.dataBaseName + ':' + this.version + ' 打开失败');
        console.log(event);
        resolve(null);
      };
      request.onsuccess = function (event) {
        resolve(request.result);
      }
    });
    if (this.db != null)
      this.dataBaseOpened = true;
  }

  async write(key, value) {
    let request = this.db.transaction(["ImageStore"], 'readwrite')
      .objectStore("ImageStore")
      .add({key: key, value: value});
    return await new Promise((resolve, reject) => {
      request.onerror = function (event) {
        resolve(false);
      }
      request.onsuccess = function (event) {
        resolve(true);
      }
    });
  }

  async read() {
    let request = this.db.transaction(["ImageStore"], 'readwrite')
      .objectStore("ImageStore")
      .getAll();
    return await new Promise((resolve, reject) => {
      request.onerror = function (event) {
        resolve(null);
      }
      request.onsuccess = function (event) {
        resolve(event.target.result.map(item => item.value));
      }
    });
  }

  async get(key) {
    let objectStore = this.db.transaction("ImageStore").objectStore("ImageStore");
    return await new Promise((resolve, reject) => {
      objectStore.openCursor().onsuccess = function (event) {
        let content = event.target.result;
        if (content) {
          if (content.key === key)
            resolve(content.value);
        } else reject();
      }
    });
  }

  async query(key) {
    let objectStore = this.db.transaction("ImageStore").objectStore("ImageStore");
    let results = [];
    await new Promise((resolve, reject) => {
      objectStore.openCursor().onsuccess = function (event) {
        let content = event.target.result;
        if (content) {
          if (content.key === key)
            results.push(content.value.value);
          content.continue();
        } else {
          resolve();
        }
      }
    });
    return results;
  }

  async keyList() {
    let objectStore = this.db.transaction(["ImageStore"], 'readwrite').objectStore("ImageStore");
    objectStore.getAllKeys();
    return new Promise((resolve, reject) => {
      objectStore.getAllKeys().onsuccess = function (event) {
        resolve(event.target.result);
      }
      objectStore.getAllKeys().onerror = function (event) {
        resolve(null);
      }
    });
  }

  async remove(key) {
    let request = this.db.transaction(["ImageStore"], 'readwrite').objectStore("ImageStore").delete(key);
    return new Promise((resolve, reject) => {
      request.onerror = function (event) {
        resolve(false);
      }
      request.onsuccess = function (event) {
        resolve(true);
      }
    });
  }
}

var storage = new LargeFileStorage();
var listeners = [];

function callListeners() {
  listeners.forEach(listener => {
    listener();
  });
}

export default {LargeFileStorage, storage, callListeners, listeners};
