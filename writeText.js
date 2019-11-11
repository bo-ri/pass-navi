const getUnivData = require('./libs/getUnivData');
const fs = require('fs');
const TARGET_UNIVS = require('./libs/getUnivStatus').TARGET_UNIVS;
async function main () {
  const univ_data = await getUnivData.getUnivData();
  let str = '';

  for (let i = 0; i < univ_data.length; i++) {
    for (let j = 0; j < univ_data[i].length; j++) {
      str += univ_data[i][j].content.trim() + '\n';
    }
    fs.writeFileSync('./../analyze/passnavi_data/' + TARGET_UNIVS[i] + '.txt', str); 
    str = '';
  }
  console.log(str);
}

main();