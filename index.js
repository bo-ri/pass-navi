const getUnivStatus = require('./libs/getUnivStatus');
const getUnivData = require('./libs/getUnivData');
async function main () {
  await getUnivStatus.getUnivStatus();
  console.log('finish');
  // await getUnivData.getUnivData();
  console.log('finish');
}

main();
