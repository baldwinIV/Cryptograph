// 업데이트 당시 시간 구하는 함수
function getCurrentTime() {
  const curr = new Date();
  const utcCurr = curr.getTime() + curr.getTimezoneOffset() * 60 * 1000;
  const diffFromKst = 9 * 60 * 60 * 1000;
  const kstCurr = new Date(utcCurr + diffFromKst);
  const dateString = `${
    kstCurr.getMonth() + 1
  }/${kstCurr.getDate()} ${kstCurr.getHours()}시`;
  return dateString;
}

const priceUnit = { 10000: '만', 100000000: '억', 1000000000000: '조' };

// 시가총액 변환하는 함수
function transPrice(price) {
  let unit = 10000;
  if (price < unit) {
    return Math.floor(price * 100) / 100 + '';
  }
  while (unit < Number.MAX_SAFE_INTEGER) {
    if (price >= unit && price < unit * 10000) {
      return Math.floor((price * 100) / unit) / 100 + priceUnit[unit];
    }
    unit *= 10000;
  }
  return price;
}

module.exports = { getCurrentTime, transPrice };
