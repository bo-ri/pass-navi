const puppeteer = require('puppeteer');
const getUnivStatus = require('./getUnivStatus');
const TARGET_UNIVS = getUnivStatus.TARGET_UNIVS;

const TAGS = {
  location_info: '.univcontent > .inner-univcontent > .section'
};

// 常識の範囲内でsleepを挟む
function sleep (delay) {
  return new Promise(resolve => setTimeout(resolve, delay));
} 

async function getAllData (page, link) {
  return new Promise(async(resolve, reject) => {
    await page.click(link);
    await page.waitFor('.body-area');     // 対象のページに遷移してコンテンツがレンダリングされるのを待つ
    const univ_data = await page.evaluate((selector) => {
      const regex = /学部一覧|キャンパス所在地|問合せ先|学生数・教員数|特色/;
      const list = Array.from(document.querySelectorAll(selector));
      let data = [];
      for (let i = 0; i < list.length; i++) {
        if (regex.test(list[i].getElementsByTagName('h4')[0].textContent)){
          continue;
        }
        const element = {
          title: list[i].getElementsByTagName('h4')[0].textContent,
          content: list[i].getElementsByClassName('body-area acc-body')[0].textContent
        }
        data.push(element);
      }
      return data;
    }, TAGS.location_info);
    resolve(univ_data);
  })
}

exports.getUnivData = async function (univs = TARGET_UNIVS) {
  return new Promise(async(resolve, reject) => {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    const data = [];
    for(let i = 0; i < univs.length; i++) {
      console.log(univs[i]);
      const univ_data_link = await getUnivStatus.searchUniv(page, TARGET_UNIVS[i]);
      const univ_data = await getAllData(page, univ_data_link);
      // console.log(univ_data);
      data.push(univ_data);
      sleep(1000);
    }
    browser.close();
    resolve(data);
  })
}
