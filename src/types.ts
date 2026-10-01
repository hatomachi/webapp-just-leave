export type DayType = 'weekday' | 'saturday' | 'holiday';

export interface Train {
  hour: number;
  minute: number;
  timeStr: string; // 'HH:MM'
  kind: string; // '快速' | '各駅停車' etc.
  isRapid: boolean;
  destination: string; // '西船橋' | '津田沼' | '東葉勝田台' etc.
}

export interface TimetableData {
  station: string;
  direction: string;
  updatedAt: string;
  schedules: {
    weekday: Train[];
    saturday: Train[];
    holiday: Train[];
  };
}

export interface NextTrainInfo {
  train: Train;
  departureTime: Date; // 木場駅の発車日時
  officeLeaveTime: Date; // オフィスを出るべきリミット日時 (departureTime - walkMinutes)
  diffSeconds: number; // オフィス出発リミットまでの残り秒数 (負なら過ぎている)
  trainDiffSeconds: number; // 木場駅発車までの残り秒数
  isLate: boolean; // オフィス出発リミットを過ぎているか
}

export interface UserSettings {
  walkMinutes: number; // デフォルト 10
  dayTypeOverride: 'auto' | DayType;
  filterOnlyRapid: boolean; // 快速のみ表示するか
  soundAlert: boolean;
}
