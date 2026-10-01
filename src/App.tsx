import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { PrimaryRapidCard } from './components/PrimaryRapidCard';
import { WalkTimeSelector } from './components/WalkTimeSelector';
import { NextRapidsList } from './components/NextRapidsList';
import { AllTrainsList } from './components/AllTrainsList';
import { TimetableData, UserSettings, DayType } from './types';
import {
  getStoredTimetable,
  getStoredSettings,
  saveStoredSettings,
  syncTimetableIfNeeded,
} from './utils/storage';
import { calculateUpcomingTrains } from './utils/trainCalculator';
import { Info } from 'lucide-react';

export const App: React.FC = () => {
  // 時刻表データ（localStorageから0ms同期ロード）
  const [timetable, setTimetable] = useState<TimetableData>(() => getStoredTimetable());
  // ユーザー設定（localStorageから0ms同期ロード）
  const [settings, setSettings] = useState<UserSettings>(() => getStoredSettings());
  // 現在時刻（毎秒更新）
  const [now, setNow] = useState<Date>(new Date());
  // バックグラウンド同期状態
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  // 1秒ごとの時計更新
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 起動時のバックグラウンド自動同期（月替わりチェック）
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setIsSyncing(true);
      const res = await syncTimetableIfNeeded();
      if (isMounted) {
        setIsSyncing(false);
        if (res.updated) {
          setTimetable(res.data);
          setSyncSuccess(true);
          setTimeout(() => setSyncSuccess(false), 4000);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // 手動同期ハンドラー
  const handleManualSync = useCallback(async () => {
    setIsSyncing(true);
    const res = await syncTimetableIfNeeded(true);
    setIsSyncing(false);
    if (res.updated) {
      setTimetable(res.data);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
    }
  }, []);

  // 徒歩時間変更ハンドラー
  const handleChangeWalkMinutes = useCallback((minutes: number) => {
    setSettings((prev) => {
      const next = { ...prev, walkMinutes: minutes };
      saveStoredSettings(next);
      return next;
    });
  }, []);

  // ダイヤ上書き変更ハンドラー
  const handleSelectDayType = useCallback((override: 'auto' | DayType) => {
    setSettings((prev) => {
      const next = { ...prev, dayTypeOverride: override };
      saveStoredSettings(next);
      return next;
    });
  }, []);

  // 電車一覧と乗るべき快速のリアルタイム計算
  const calculated = useMemo(() => {
    return calculateUpcomingTrains(
      timetable,
      now,
      settings.walkMinutes,
      settings.dayTypeOverride
    );
  }, [timetable, now, settings.walkMinutes, settings.dayTypeOverride]);

  return (
    <div className="min-h-screen bg-[#090f14] text-slate-100 flex flex-col justify-between max-w-md mx-auto relative shadow-2xl">
      {/* 上部ヘッダー */}
      <div>
        <Header
          now={now}
          activeDayType={calculated.activeDayType}
          dayTypeOverride={settings.dayTypeOverride}
          onSelectDayType={handleSelectDayType}
          isSyncing={isSyncing}
          onManualSync={handleManualSync}
          syncSuccess={syncSuccess}
        />

        {/* メインコンテンツエリア */}
        <main className="p-4 space-y-4 pb-12">
          {/* 最重要: 次の快速カード */}
          <PrimaryRapidCard
            rapidInfo={calculated.primaryRapid}
            walkMinutes={settings.walkMinutes}
          />

          {/* 徒歩時間微調整セレクター */}
          <WalkTimeSelector
            walkMinutes={settings.walkMinutes}
            onChangeWalkMinutes={handleChangeWalkMinutes}
          />

          {/* その後の快速リスト */}
          <NextRapidsList rapids={calculated.nextRapids} />

          {/* 各停を含む直近の全電車 */}
          <AllTrainsList trains={calculated.upcomingAllTrains} />

          {/* ガイド・使い方のヒント */}
          <div className="rounded-2xl bg-slate-900/30 border border-slate-800/40 p-3.5 text-slate-400 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-tozai-light shrink-0 mt-0.5" />
            <div className="space-y-1 text-[11px] leading-relaxed">
              <p>
                <strong className="text-slate-200">📱 スマホのホーム画面に追加</strong>
                していただくと、アプリとして全画面・0.1秒で即座に開きます。
              </p>
              <p className="text-slate-500">
                時刻表データは月替わりに自動チェックされ、localStorage に常時キャッシュされるためオフラインでも安心です。
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* フッター */}
      <footer className="p-4 text-center text-[10px] text-slate-500 border-t border-slate-900/80">
        <p>東京メトロ東西線 木場駅（B線 西船橋・東葉勝田台方面）</p>
        <p className="mt-0.5 font-mono text-slate-600">データ更新: {timetable.updatedAt}</p>
      </footer>
    </div>
  );
};

export default App;
