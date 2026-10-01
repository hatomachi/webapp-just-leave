import { DayType } from '../types';

/**
 * 日本の祝日判定 (内閣府告示ベースの主要祝日およびハッピーマンデー計算)
 */
export function isJapaneseHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = date.getDay(); // 0: Sun, 1: Mon, ...

  // 固定祝日
  if (month === 1 && day === 1) return true; // 元日
  if (month === 2 && day === 11) return true; // 建国記念の日
  if (month === 2 && day === 23) return true; // 天皇誕生日
  if (month === 4 && day === 29) return true; // 昭和の日
  if (month === 5 && day === 3) return true; // 憲法記念日
  if (month === 5 && day === 4) return true; // みどりの日
  if (month === 5 && day === 5) return true; // こどもの日
  if (month === 8 && day === 11) return true; // 山の日
  if (month === 11 && day === 3) return true; // 文化の日
  if (month === 11 && day === 23) return true; // 勤労感謝の日

  // 春分の日 (簡易計算: 3/20 or 3/21)
  if (month === 3 && day === Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4))) {
    return true;
  }
  // 秋分の日 (簡易計算: 9/22 or 9/23)
  if (month === 9 && day === Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4))) {
    return true;
  }

  // ハッピーマンデー (第2月曜 / 第3月曜)
  // 成人の日: 1月第2月曜日
  if (month === 1 && dayOfWeek === 1 && day >= 8 && day <= 14) return true;
  // 海の日: 7月第3月曜日
  if (month === 7 && dayOfWeek === 1 && day >= 15 && day <= 21) return true;
  // 敬老の日: 9月第3月曜日
  if (month === 9 && dayOfWeek === 1 && day >= 15 && day <= 21) return true;
  // スポーツの日: 10月第2月曜日
  if (month === 10 && dayOfWeek === 1 && day >= 8 && day <= 14) return true;

  // 振替休日判定: 日曜が祝日だった場合、その直後の平日が振替休日
  if (dayOfWeek === 1) {
    const yesterday = new Date(year, month - 1, day - 1);
    if (isJapaneseHoliday(yesterday)) return true;
  }

  return false;
}

/**
 * 今日の種別（平日/土曜/休日）を判定
 */
export function getDayType(date: Date): DayType {
  if (isJapaneseHoliday(date)) {
    return 'holiday';
  }
  const day = date.getDay();
  if (day === 0) return 'holiday';
  if (day === 6) return 'saturday';
  return 'weekday';
}

/**
 * Date オブジェクトと HH:MM から今日の該当列車の日時を生成
 * （深夜24時以降・早朝の対応も考慮）
 */
export function getTrainDateTime(now: Date, hour: number, minute: number): Date {
  const trainTime = new Date(now.getTime());
  
  // 東西線の運行は朝5時〜深夜25時(翌1時)頃まで
  // もし現在の時刻が深夜1時〜4時で、列車の時刻が5時以降なら「今日の朝」
  // もし現在時刻が23時で、列車の時刻が0時〜1時台なら「翌日の深夜」
  const currentHour = now.getHours();
  
  if (hour < 4 && currentHour >= 4) {
    // 翌日の深夜0時台〜1時台
    trainTime.setDate(trainTime.getDate() + 1);
  } else if (hour >= 4 && currentHour < 4) {
    // 前日の夕方〜夜のダイヤ（深夜に前日分を参照しているケース）
    trainTime.setDate(trainTime.getDate() - 1);
  }
  
  trainTime.setHours(hour, minute, 0, 0);
  return trainTime;
}

/**
 * 残り秒数を "03:45" や "1時間12分" などの読みやすい文字列にフォーマット
 */
export function formatRemainingSeconds(seconds: number): {
  isNegative: boolean;
  minutes: number;
  seconds: number;
  display: string;
} {
  const isNegative = seconds < 0;
  const absSec = Math.abs(seconds);
  const m = Math.floor(absSec / 60);
  const s = absSec % 60;

  let display = '';
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const remM = m % 60;
    display = `${h}時間${remM}分`;
  } else {
    display = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  return {
    isNegative,
    minutes: m,
    seconds: s,
    display,
  };
}
