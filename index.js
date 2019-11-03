const puppeteer = require('puppeteer');

const TARGET_UNIVS = [
  '青山学院大学',
  '明治大学',
  '立教大学',
  '中央大学',
  '法政大学',
  '早稲田大学',
  '慶應義塾大学',
  '上智大学',
  '日本大学',
  '東洋大学',
  '駒澤大学',
  '専修大学',
  '成蹊大学',
  '成城大学',
  '明治学院大学',
  '学習院大学',
  '獨協大学',
  '国学院大学',
  '武蔵大学',
  '東京理科大学',
  '国際基督教大学'
];

const PASS_NAVI_URL = 'https://passnavi.evidus.com';

// サイト上で操作するタグ
const TAGS = {
  // top page
  search_text_area: 'input[name="university-name"]',
  search_button: '#search-button-top',
  // search result page
  target_univ_link: '.ttl-university > a',
  // individual university page
  deviation_value: 'ul > li > .clip-set > .text-area > a',
  // deviation_value: 'ul > li > .clip-set > .text-area > a > flex_box'
};

// 上のリストの大学を検索して遷移先のアンカータグ取得
async function searchUniv (page, univ_name) {
  return new Promise(async function (resolve, reject) {
    await page.goto(PASS_NAVI_URL);
    // テキスト入力
    await page.type(TAGS.search_text_area, univ_name);
    await page.click(TAGS.search_button);
    await page.waitForSelector('.ttl-university');
    // 大学詳細へのリンク踏むところ
    // アンカーのhref属性を取得する
    const univ_page = await page.evaluate((selector) =>{
      return document.querySelector(selector).getAttribute('href');
    }, TAGS.target_univ_link);

    const univ_data_link = `a[href="${univ_page}"]`;
    resolve(univ_data_link);
  });
}

// 大学のページに移動して偏差値のリストを取得する
async function searchUnivDeviationValue (page, univ_data_link) {
  return new Promise(async (resolve, reject) => {
    // let diviations = [];
    await page.click(univ_data_link);
    await page.waitFor('.body-area');
    const deviations = await page.evaluate((selector) => {
      const list = Array.from(document.querySelectorAll(selector));
      let data = [];
      for (let i = 0; i < list.length; i++) {
        const element = {
          department: list[i].getElementsByClassName('faculty')[0].textContent,
          deviation: list[i].getElementsByClassName('value')[0].textContent
        };
        data.push(element);
      }
      return data;
    }, TAGS.deviation_value);
    resolve(deviations);
  });
}

async function main () {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  // for (let i = 0; i < TARGET_UNIVS.length; i++) {
  //   const univ_data_link = await searchUniv(page, TARGET_UNIVS[i]);
  //   const 
  // }
  const univ_data_link = await searchUniv(page, '青山学院大学');
  const deviation_values = await searchUnivDeviationValue(page, univ_data_link);
  console.log('deviation values: ', deviation_values);
  browser.close();
}

main();