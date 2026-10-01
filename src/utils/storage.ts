import { TimetableData, UserSettings } from '../types';
import defaultTimetable from '../data/defaultTimetable.json';

const STORAGE_KEY_DATA = 'kiba_timetable_data_v1';
const STORAGE_KEY_SYNC_MONTH = 'kiba_timetable_synced_month';
const STORAGE_KEY_SETTINGS = 'kiba_timetable_settings_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  walkMinutes: 10,
  dayTypeOverride: 'auto',
  filterOnlyRapid: true, // デフォルトで快速を優先表示
  soundAlert: false,
};

/**
 * localStorage から時刻表データを即座に取得（なければ同梱データを保存して返す）
 */
export function getStoredTimetable(): TimetableData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DATA);
    if (raw) {
      const parsed = JSON.parse(raw) as TimetableData;
      if (parsed.schedules && parsed.schedules.weekday) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse cached timetable, falling back to default:', e);
  }

  // フォールバック: 同梱の最新データ
  const initial = defaultTimetable as unknown as TimetableData;
  saveStoredTimetable(initial);
  return initial;
}

/**
 * 時刻表データを localStorage に保存
 */
export function saveStoredTimetable(data: TimetableData): void {
  try {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save timetable to localStorage:', e);
  }
}

/**
 * ユーザー設定を取得
 */
export function getStoredSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

/**
 * ユーザー設定を保存
 */
export function saveStoredSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

/**
 * 月替わり（または手動リクエスト時）にバックグラウンドで最新データをフェッチして更新
 */
export async function syncTimetableIfNeeded(force = false): Promise<{ updated: boolean; data: TimetableData }> {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastSyncedMonth = localStorage.getItem(STORAGE_KEY_SYNC_MONTH);

  // 月が変わっているか、または強制更新の場合に実行
  const shouldSync = force || lastSyncedMonth !== currentMonth;

  if (!shouldSync) {
    return { updated: false, data: getStoredTimetable() };
  }

  try {
    // キャッシュバスター付きで fetch
    const response = await fetch(`/timetable.json?t=${Date.now()}`, {
      cache: 'no-cache',
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const freshData = (await response.json()) as TimetableData;
    if (freshData && freshData.schedules && freshData.schedules.weekday) {
      saveStoredTimetable(freshData);
      localStorage.setItem(STORAGE_KEY_SYNC_MONTH, currentMonth);
      return { updated: true, data: freshData };
    }
  } catch (e) {
    console.warn('Background sync failed (using offline cached data):', e);
  }

  return { updated: false, data: getStoredTimetable() };
}
