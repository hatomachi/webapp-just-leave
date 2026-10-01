import { DayType, NextTrainInfo, TimetableData } from '../types';
import { getDayType, getTrainDateTime } from './dateHelper';

export interface CalculatedTrains {
  activeDayType: DayType;
  primaryRapid: NextTrainInfo | null; // 今最も狙うべき次の快速
  nextRapids: NextTrainInfo[]; // その後の快速（2本目以降）
  upcomingAllTrains: NextTrainInfo[]; // 快速・各停含む直近の電車
  lastDepartedRapid: NextTrainInfo | null; // 直近で出発リミットを少し過ぎた快速（走れば間に合うかも）
}

/**
 * 現在時刻と徒歩分数から、乗るべき快速および前後の列車状況を算出
 */
export function calculateUpcomingTrains(
  timetable: TimetableData,
  now: Date,
  walkMinutes: number,
  dayTypeOverride: 'auto' | DayType = 'auto'
): CalculatedTrains {
  const activeDayType = dayTypeOverride === 'auto' ? getDayType(now) : dayTypeOverride;
  const schedule = timetable.schedules[activeDayType] || timetable.schedules.weekday;

  const walkMs = walkMinutes * 60 * 1000;
  const nowMs = now.getTime();

  // 各列車に対して「木場発車日時」と「オフィス出発リミット日時」を計算
  const trainInfos: NextTrainInfo[] = schedule.map((train) => {
    const departureTime = getTrainDateTime(now, train.hour, train.minute);
    const officeLeaveTime = new Date(departureTime.getTime() - walkMs);
    const diffSeconds = Math.floor((officeLeaveTime.getTime() - nowMs) / 1000);
    const trainDiffSeconds = Math.floor((departureTime.getTime() - nowMs) / 1000);

    return {
      train,
      departureTime,
      officeLeaveTime,
      diffSeconds,
      trainDiffSeconds,
      isLate: diffSeconds < 0,
    };
  });

  // まだ駅を発車していない電車（駅発車まで0秒以上）に絞り込み、発車順にソート
  const upcomingStations = trainInfos
    .filter((info) => info.trainDiffSeconds >= 0)
    .sort((a, b) => a.departureTime.getTime() - b.departureTime.getTime());

  // 快速のみを抽出
  const upcomingRapids = upcomingStations.filter((info) => info.train.isRapid);

  // 「今から普通に歩いてオフィスを出れば間に合う快速 (diffSeconds >= 0)」
  const validRapids = upcomingRapids.filter((info) => info.diffSeconds >= 0);

  // 「オフィス出発リミットを直前（例: 3分以内）に過ぎたが、駅発車にはまだ間に合う快速」
  // （早歩き・ダッシュすれば乗れるかもしれない枠）
  const justMissedRapids = upcomingRapids
    .filter((info) => info.diffSeconds < 0 && info.diffSeconds >= -180 && info.trainDiffSeconds > 60)
    .sort((a, b) => b.diffSeconds - a.diffSeconds);

  const lastDepartedRapid = justMissedRapids.length > 0 ? justMissedRapids[0] : null;

  // メインの快速: 通常間に合う最初の快速
  let primaryRapid: NextTrainInfo | null = validRapids.length > 0 ? validRapids[0] : null;
  let nextRapids: NextTrainInfo[] = validRapids.slice(1, 5);

  // もし通常間に合う快速がない場合（深夜など）、直近の発車快速をフォールバック
  if (!primaryRapid && upcomingRapids.length > 0) {
    primaryRapid = upcomingRapids[0];
    nextRapids = upcomingRapids.slice(1, 5);
  }

  // 直近の全列車（各停含む、最大6本）
  const upcomingAllTrains = upcomingStations.slice(0, 6);

  return {
    activeDayType,
    primaryRapid,
    nextRapids,
    upcomingAllTrains,
    lastDepartedRapid,
  };
}
