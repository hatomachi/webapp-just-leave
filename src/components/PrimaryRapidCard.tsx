import React from 'react';
import { Clock, Flame, Footprints, AlertTriangle } from 'lucide-react';
import { NextTrainInfo } from '../types';
import { formatRemainingSeconds } from '../utils/dateHelper';

interface PrimaryRapidCardProps {
  rapidInfo: NextTrainInfo | null;
  walkMinutes: number;
}

export const PrimaryRapidCard: React.FC<PrimaryRapidCardProps> = ({
  rapidInfo,
  walkMinutes,
}) => {
  if (!rapidInfo) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 text-center shadow-xl">
        <p className="text-slate-400 text-sm">本日の西船橋方面・快速の運行は終了しました</p>
        <p className="text-xs text-slate-500 mt-1">各駅停車をご利用ください</p>
      </div>
    );
  }

  const { train, departureTime, officeLeaveTime, diffSeconds } = rapidInfo;
  const remaining = formatRemainingSeconds(diffSeconds);

  // ステータス判定
  // diffSeconds: オフィス出発リミットまでの秒数
  let statusMode: 'safe' | 'ready' | 'urgent' | 'late' = 'safe';
  if (diffSeconds < 0) {
    statusMode = 'late';
  } else if (diffSeconds <= 60) {
    statusMode = 'urgent';
  } else if (diffSeconds <= 300) {
    statusMode = 'ready';
  }

  // ステータス別のカラー・メッセージ
  const statusStyles = {
    safe: {
      border: 'border-tozai/40 hover:border-tozai/60',
      badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      timeColor: 'text-emerald-400',
      message: 'まだオフィスで余裕あり',
      glow: 'shadow-tozai/10',
    },
    ready: {
      border: 'border-amber-500/40 hover:border-amber-500/60',
      badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      timeColor: 'text-amber-400',
      message: 'そろそろ片付け・出発準備！',
      glow: 'shadow-amber-500/10',
    },
    urgent: {
      border: 'border-orange-500/60 shadow-orange-500/20 animate-pulse',
      badgeBg: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
      timeColor: 'text-orange-400',
      message: '今すぐオフィスを出よう！',
      glow: 'shadow-orange-500/20',
    },
    late: {
      border: 'border-rose-500/50',
      badgeBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      timeColor: 'text-rose-400',
      message: 'リミット経過（早歩きでワンチャン！）',
      glow: 'shadow-rose-500/10',
    },
  }[statusMode];

  // 時刻フォーマット
  const trainTimeStr = `${String(departureTime.getHours()).padStart(2, '0')}:${String(departureTime.getMinutes()).padStart(2, '0')}`;
  const leaveTimeStr = `${String(officeLeaveTime.getHours()).padStart(2, '0')}:${String(officeLeaveTime.getMinutes()).padStart(2, '0')}`;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border ${statusStyles.border} p-5 shadow-2xl ${statusStyles.glow} transition-all duration-300 backdrop-blur-xl`}
    >
      {/* 背景のスカイブルーのアクセント光彩 */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-tozai/20 rounded-full blur-3xl pointer-events-none" />

      {/* ヘッダー部: 列車種別・行先・木場発車時刻 */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5 mb-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white font-extrabold text-xs tracking-wide shadow-md shadow-rose-600/30 flex items-center gap-1">
            <Flame className="w-3 h-3 fill-current" />
            快速
          </span>
          <span className="text-base font-bold text-white tracking-wide">
            {train.destination} 行
          </span>
        </div>

        <div className="flex items-baseline gap-1 text-slate-300">
          <span className="text-xs text-slate-400">木場発</span>
          <span className="text-xl font-mono font-bold text-white tracking-tight">
            {trainTimeStr}
          </span>
        </div>
      </div>

      {/* メイン: オフィス出発リミット＆カウントダウン */}
      <div className="flex flex-col items-center justify-center my-2 text-center">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1">
          <Footprints className="w-3.5 h-3.5 text-tozai-light" />
          <span>オフィス出発ベスト時刻 (徒歩{walkMinutes}分前)</span>
        </div>

        {/* 出発時刻特大表示 */}
        <div className="text-4xl sm:text-5xl font-mono font-black tracking-tight text-white mb-2 drop-shadow-sm flex items-baseline gap-1">
          <span>{leaveTimeStr}</span>
          <span className="text-sm font-sans font-medium text-slate-400">発</span>
        </div>

        {/* カウントダウン表示 */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs sm:text-sm font-bold tracking-wide ${statusStyles.badgeBg}`}
        >
          {statusMode === 'late' ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : statusMode === 'urgent' ? (
            <Flame className="w-4 h-4 text-orange-400 shrink-0 animate-bounce" />
          ) : (
            <Clock className="w-4 h-4 shrink-0" />
          )}

          <span>
            {statusMode === 'late' ? (
              <>リミットを <span className="font-mono text-base">{remaining.display}</span> 超過</>
            ) : (
              <>オフィス出発まで あと <span className="font-mono text-base">{remaining.display}</span></>
            )}
          </span>
        </div>

        <p className={`text-[11px] font-medium mt-2 ${statusStyles.timeColor}`}>
          {statusStyles.message}
        </p>
      </div>

      {/* タイムラインゲージ（オフィス ➜ 徒歩 ➜ 木場駅ホーム） */}
      <div className="mt-5 pt-3.5 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium px-1">
          <span className="flex items-center gap-1 text-slate-300">
            🏢 オフィス
            <span className="font-mono text-white font-semibold">{leaveTimeStr}</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            徒歩 {walkMinutes}分
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            🚇 木場駅
            <span className="font-mono text-white font-semibold">{trainTimeStr}</span>
          </span>
        </div>

        {/* プログレスバー */}
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className={`h-full transition-all duration-1000 ${
              statusMode === 'late'
                ? 'bg-rose-500'
                : statusMode === 'urgent'
                ? 'bg-orange-500'
                : statusMode === 'ready'
                ? 'bg-amber-400'
                : 'bg-gradient-to-r from-tozai to-emerald-400'
            }`}
            style={{
              width: `${Math.max(
                5,
                Math.min(
                  100,
                  diffSeconds < 0
                    ? 100
                    : ((walkMinutes * 60 - diffSeconds) / (walkMinutes * 60)) * 100
                )
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
