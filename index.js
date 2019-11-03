const puppeteer = require('puppeteer');

// const prefacture = /北海道|青森県|秋田県|宮城県|山形県|福島県|岩手県|東京都|埼玉県|神奈川県|千葉県|栃木県|群馬県|茨城県|新潟県|富山県|石川県|福井県|長野県|岐阜県|愛知県|静岡県|山梨県|滋賀県|京都府|大阪府|兵庫県|奈良県|三重県|和歌山県|鳥取県|島根県|広島県|岡山県|山口県|愛媛県|高知県|香川県|徳島県|福岡県|佐賀県|長崎県|大分県|熊本県|宮崎県|鹿児島県|沖縄県/;
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
  // location_info: 'section > .body-area.acc-body',
  location_info: '.section'
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

// 取得した偏差値の平均を計算して数値にキャストする
function castDeviationAverage (deviation_values) {
  for (let i = 0; i < deviation_values.length; i++) {
    let deviation = deviation_values[i].deviation;
    deviation = deviation.split('：')[1];
    if (/〜/.test(deviation)) {
      const lower = Number(deviation.split('〜')[0]);
      const upper = Number(deviation.split('〜')[1]);
      const average = (upper + lower) / 2;
      deviation_values[i].deviation = average;
    } else {
      const average = Number(deviation);
      deviation_values[i].deviation = average;
    }
  }
  return deviation_values;
}

// キャンパス所在地を取得
async function getCampusLocations (page) {
  return new Promise(async (resolve, reject) => {
    const campus_locations = await page.evaluate((selector) => {

      // 文章の中から都道府県と市区町村，対応する学部を取得
      // evaluateの中はchromeで実行されるからevaluateの中で使うならここで定義しないといけない
      const getAddress = function (str) {
        const prefacture = /北海道|青森県|秋田県|宮城県|山形県|福島県|岩手県|東京都|埼玉県|神奈川県|千葉県|栃木県|群馬県|茨城県|新潟県|富山県|石川県|福井県|長野県|岐阜県|愛知県|静岡県|山梨県|滋賀県|京都府|大阪府|兵庫県|奈良県|三重県|和歌山県|鳥取県|島根県|広島県|岡山県|山口県|愛媛県|高知県|香川県|徳島県|福岡県|佐賀県|長崎県|大分県|熊本県|宮崎県|鹿児島県|沖縄県/;
        const sentences = str.split('\n');
        let faculty = '';
        let address = '';
        for (let i = 0; i < sentences.length; i++) {
          if (/学部/.test(sentences[i])) {
            faculty = sentences[i];
          } else if (prefacture.test(sentences[i])) {
            address = sentences[i];
          }
        }
        return {
          faculty: faculty.trim(),
          address: address.trim()
        };
      }

      const list = Array.from(document.querySelectorAll(selector));

      // filter selectorクラスが複数あるからその下の要素の中身を見てキャンパス所在地だけ取得
      var campus_element;
      for (let i = 0; i < list.length; i++) {
        const title = list[i].getElementsByClassName('ttls')[0].textContent;
        console.log(title);
        if (title === 'キャンパス所在地') {
          campus_element = list[i];
        }
      }
      let data = [];
      const campus_names = campus_element.getElementsByClassName('ttlss');
      const campus_locations = campus_element.getElementsByTagName('p');

      for (let i = 0; i < campus_names.length; i++) {
        const element = {
          campus: campus_names[i].textContent,
          // location: campus_locations[i].textContent
          location: getAddress(campus_locations[i].textContent)
        };
        data.push(element);
      }
      return data;
    }, TAGS.location_info);
    resolve(campus_locations);
  })
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
  let deviation_values = await searchUnivDeviationValue(page, univ_data_link);
  deviation_values = castDeviationAverage(deviation_values);
  const campus_locations = await getCampusLocations(page);
  console.log('campus locations: ', campus_locations);
  browser.close();
}

main();