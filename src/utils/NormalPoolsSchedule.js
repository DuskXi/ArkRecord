import {load} from 'cheerio'
import {api} from "boot/axios";

const baseUrl = "https://api.kaltsit.dev/prts/api.php?action=parse&format=json&page=卡池一览/常驻标准寻访";

async function getPoolsSchedule(year) {
  let results = [];
  let timeZoneOffset = new Date().getTimezoneOffset() * 60000 + 8 * 3600000;
  let requestUrl = baseUrl + "/" + year;
  await api.get(requestUrl)
    .then(async (response) => {
      if (response.data.hasOwnProperty("parse")) {
        let htmlText = response.data["parse"]["text"]["*"];
        let result = parsePRTSHtml(htmlText);
        result.forEach(element => {
          let regResult = element[0].match(/(\d{4}-[01]\d-[0-3]\d\x20[0-2]\d:[0-5]\d(:[0-5]\d)*(?:\.\d+)?Z?)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d(:[0-5]\d)*(?:\.\d+)?Z?)/gm);
          if (regResult != null && regResult.length > 1) {
            let start = new Date(Date.parse(regResult[0]) - timeZoneOffset);
            let end = new Date(Date.parse(regResult[1]) - timeZoneOffset);
            results.push({
              start: start.toUTCString(),
              end: end.toUTCString(),
              imageUrl: element[1]
            });
          }
        });
      }
    })
  return results;
}

function parsePRTSHtml(htmlText) {
  const $ = load(htmlText);
  const table = $('table');
  let trList = table.find('tr');
  let result = [];
  trList.each((index, tr) => {
    try {
      if (index !== 0) {
        let tdList = $(tr).find('td');
        let imageUrl = tdList.eq(1).find('img').attr('srcset');
        let imageUrls = "";
        if (imageUrl == null) {
          imageUrl = tdList.eq(1).find('img').attr('src');
          imageUrls = [imageUrl];
        } else
          imageUrls = imageUrl.match(/(\/[-a-zA-Z0-9@:%_+.~#?&/=]+)/g)
        let finalString = '';
        tdList[2].children.forEach((child) => {
          if (child.type === "text") {
            finalString += " " + child.data;
          }
        })
        result.push([finalString, "https://prts.wiki" + imageUrls[imageUrls.length - 1]]);
      }
    } catch (e) {
      console.log(e);
      console.log("Skip row " + index);
    }
  });
  return result;
}

export {
  parsePRTSHtml,
  getPoolsSchedule
}
