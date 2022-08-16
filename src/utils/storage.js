
import {Connector} from 'indexeddb-orm/dist/connection/connector';

async function readLocalStorage(key) {
  return new Promise((resolve, _) => {
    chrome.storage.local.get([key], function (result) {
      if (result[key] === undefined) {
        resolve(null);
      } else {
        resolve(result[key]);
      }
    });
  });
}

async function writeLocalStorage(key, value) {
  return new Promise((resolve, _) => {
    chrome.storage.local.set({[key]: value}, function () {
      resolve();
    });
  });
}

async function listLocalStorageKeys() {
  return new Promise((resolve, _) => {
    chrome.storage.local.get(null, function (items) {
      resolve(Object.keys(items));
    });
  });
}

async function readAllLocalStorage() {
  return new Promise((resolve, _) => {
    chrome.storage.local.get(null, function (items) {
      resolve(items);
    });
  });
}

async function removeLocalStorage(key) {
  await new Promise((resolve, _) => {
    chrome.storage.local.remove([key], () => {
      resolve();
    })
  });
}


export {readLocalStorage, writeLocalStorage, listLocalStorageKeys, readAllLocalStorage, removeLocalStorage};
