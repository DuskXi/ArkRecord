import {load} from 'cheerio'
import {api} from "boot/axios";

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
      image: element["attribs"]["data-icon"],
      imageVertical: element["attribs"]["data-half"],
    }
    result.push(data);
  })
  return result;
}

async function syncCharactersInformation(){
  let htmlText = await requestBaseData();
  let result = await parsePRTSHtml(htmlText);
}

export {
  syncCharactersInformation
}
