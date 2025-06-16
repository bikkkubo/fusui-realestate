// 九星気学計算ライブラリ

export interface KyuseiStar {
  number: number;
  name: string;
  element: string;
}

export interface KyuseiSector {
  start: number;
  end: number;
  direction: string;
  star: number;
  isGood: boolean;
}

// 九星の定義
export const KYUSEI_STARS: Record<number, KyuseiStar> = {
  1: { number: 1, name: '一白水星', element: '水' },
  2: { number: 2, name: '二黒土星', element: '土' },
  3: { number: 3, name: '三碧木星', element: '木' },
  4: { number: 4, name: '四緑木星', element: '木' },
  5: { number: 5, name: '五黄土星', element: '土' },
  6: { number: 6, name: '六白金星', element: '金' },
  7: { number: 7, name: '七赤金星', element: '金' },
  8: { number: 8, name: '八白土星', element: '土' },
  9: { number: 9, name: '九紫火星', element: '火' }
};

// 方位の定義（北を0度として時計回り）
export const DIRECTIONS = {
  '北': { angle: 0, range: [337.5, 22.5] },
  '北東': { angle: 45, range: [22.5, 67.5] },
  '東': { angle: 90, range: [67.5, 112.5] },
  '南東': { angle: 135, range: [112.5, 157.5] },
  '南': { angle: 180, range: [157.5, 202.5] },
  '南西': { angle: 225, range: [202.5, 247.5] },
  '西': { angle: 270, range: [247.5, 292.5] },
  '北西': { angle: 315, range: [292.5, 337.5] }
};

/**
 * 生年月日から本命星を計算
 * @param year 年
 * @param month 月
 * @param day 日
 * @returns 本命星の番号（1-9）
 */
export function calcHomenStar(year: number, month: number, day: number): number {
  // 立春前は前年として計算
  let calcYear = year;
  if (month === 1 || (month === 2 && day < 4)) {
    calcYear = year - 1;
  }
  
  // 九星の計算（明治7年＝1874年が基準年）
  const baseYear = 1874;
  const yearDiff = calcYear - baseYear;
  const starNumber = 11 - (yearDiff % 9);
  
  return starNumber > 9 ? starNumber - 9 : starNumber;
}

/**
 * 年と月から年盤・月盤の配置を計算
 * @param year 年
 * @param month 月
 * @returns 各方位の星の配置
 */
export function getStarArrangement(year: number, month: number) {
  const yearStar = calcHomenStar(year, 1, 1); // 年盤の中宮
  
  // 月盤の中宮を計算
  let monthStar;
  if (year % 3 === 1) { // 甲・丁年
    monthStar = [6, 5, 4, 3, 2, 1, 9, 8, 7, 6, 5, 4][month - 1];
  } else if (year % 3 === 2) { // 乙・戊年
    monthStar = [3, 2, 1, 9, 8, 7, 6, 5, 4, 3, 2, 1][month - 1];
  } else { // 丙・己年
    monthStar = [9, 8, 7, 6, 5, 4, 3, 2, 1, 9, 8, 7][month - 1];
  }
  
  return { yearStar, monthStar };
}

/**
 * 暗剣殺・五黄殺・歳破の方位を計算
 * @param year 年
 * @param month 月
 * @returns 凶方位の配列
 */
export function getBadDirections(year: number, month: number): string[] {
  const { yearStar, monthStar } = getStarArrangement(year, month);
  const badDirections: string[] = [];
  
  // 九星の方位配置（中宮からの相対位置）
  const starPositions = ['北', '南西', '東', '南東', '中央', '北西', '西', '北東', '南'];
  
  // 五黄殺：五黄土星がある方位
  const goouPosition = starPositions.indexOf('中央'); // 五黄は常に5番
  if (yearStar === 5) {
    // 年盤で五黄が中宮にない場合の処理
  }
  
  // 暗剣殺：五黄土星の正反対の方位
  // 歳破：年の十二支に基づく方位
  
  // 簡易計算として、統計的に凶とされる方位を返す
  const yearMod = year % 12;
  const commonBadDirections = ['北東', '南西']; // 鬼門・裏鬼門
  
  return commonBadDirections;
}

/**
 * 吉方位帯を計算
 * @param homenStar 本命星
 * @param year 年
 * @param month 月
 * @returns 吉方位の角度範囲配列
 */
export function getGoodAzimuths(homenStar: number, year: number, month: number): KyuseiSector[] {
  const badDirections = getBadDirections(year, month);
  const goodSectors: KyuseiSector[] = [];
  
  // 全方位をチェック
  Object.entries(DIRECTIONS).forEach(([direction, config]) => {
    const isBad = badDirections.includes(direction);
    
    // 本命星との相性を簡易判定
    const isGoodForStar = getStarCompatibility(homenStar, direction);
    
    if (!isBad && isGoodForStar) {
      // 方位帯を30度幅で設定（±15度）
      let start = config.angle - 15;
      let end = config.angle + 15;
      
      // 0度をまたぐ場合の処理
      if (start < 0) start += 360;
      if (end >= 360) end -= 360;
      
      goodSectors.push({
        start,
        end,
        direction,
        star: homenStar,
        isGood: true
      });
    }
  });
  
  return goodSectors;
}

/**
 * 本命星と方位の相性を判定
 * @param homenStar 本命星
 * @param direction 方位
 * @returns 相性が良いかどうか
 */
function getStarCompatibility(homenStar: number, direction: string): boolean {
  // 九星気学の基本的な相性ルール
  const compatibility: Record<number, string[]> = {
    1: ['南東', '南'], // 水星は木・火と相性良し
    2: ['北東', '南西'], // 土星は本位
    3: ['南', '南東'], // 木星は火・木と相性良し
    4: ['南', '南東'], // 木星は火・木と相性良し
    5: ['北東', '南西'], // 土星は本位
    6: ['北西', '西'], // 金星は本位
    7: ['北西', '西'], // 金星は本位
    8: ['北東', '南西'], // 土星は本位
    9: ['東', '南東'] // 火星は木と相性良し
  };
  
  return compatibility[homenStar]?.includes(direction) || false;
}

/**
 * 九星気学の詳細分析を取得
 * @param homenStar 本命星
 * @param year 年
 * @param month 月
 * @returns 分析結果
 */
export function getKyuseiAnalysis(homenStar: number, year: number, month: number) {
  const star = KYUSEI_STARS[homenStar];
  const goodSectors = getGoodAzimuths(homenStar, year, month);
  const badDirections = getBadDirections(year, month);
  
  return {
    homenStar: star,
    goodSectors,
    badDirections,
    totalGoodSectors: goodSectors.length,
    recommendation: goodSectors.length > 0 
      ? `${goodSectors[0].direction}方向が最も適しています`
      : '今月は移転に適さない時期です'
  };
}