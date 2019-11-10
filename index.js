const getUnivStatus = require('./libs/getUnivStatus');

async function main () {
  await getUnivStatus.getUnivStatus();
  console.log('finish');
}

main();