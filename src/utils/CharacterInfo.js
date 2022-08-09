import {load} from 'cheerio'
import {api} from "boot/axios";
import {readLocalStorage, writeLocalStorage} from "./storage.js";
import * as https from "https";

const url = "https://prts.wiki/api.php?action=parse&format=json&page=干员一览"

async function requestBaseData() {
  let result = "";
  await api.get(url)
    .then(async (response) => {
      if (response.data.hasOwnProperty("parse")) {
        result = response.data["parse"]["text"]["*"];
      }
    });
  return result;
}

async function parsePRTSHtml(htmlText) {
  const $ = load(htmlText);
  const list = $('div.smwdata');
  let result = [];
  list.each((index, element) => {
    let data = {
      name: element["attribs"]["data-cn"],
      nameEn: element["attribs"]["data-en"],
      image: filterUrl(element["attribs"]["data-icon"]),
      imageVertical: filterUrl(element["attribs"]["data-half"]),
      sortId: element["attribs"]["data-sort_id"],
    }
    result.push(data);
  })
  result.sort((a, b) => a.sortId - b.sortId);
  return result;
}

function filterUrl(text) {
  let matched = text.match(/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/g)
  if (matched.length > 0)
    return "https://" + matched[0];
  else
    return text;
}

async function syncCharactersInformation() {
  let charactersInformation = await readLocalStorage("charactersInformation");
  if (charactersInformation === null || new Date(charactersInformation.last) - new Date() > 1000 * 60 * 60 * 24) {
    let htmlText = await requestBaseData();
    let result = await parsePRTSHtml(htmlText);
    let data = {
      last: new Date(),
      characters: result
    }
    await writeLocalStorage("charactersInformation", data);
    charactersInformation = data;
  }
  return charactersInformation.characters;
}

export {
  syncCharactersInformation
}
