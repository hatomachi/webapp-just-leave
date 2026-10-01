import { Calendar, RefreshCw } from 'lucide-react';
import { DayType } from '../types';

interface HeaderProps {
  now: Date;
  activeDayType: DayType;
  dayTypeOverride: 'auto' | DayType;
  onSelectDayType: (override: 'auto' | DayType) => void;
  isSyncing: boolean;
  onManualSync: () => void;
  syncSuccess: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  now,
  activeDayType,
  dayTypeOverride,
  onSelectDayType,
  isSyncing,
  onManualSync,
  syncSuccess,
}) => {
  const dayTypeLabels: Record<DayType, string> = {
    weekday: '平日ダイヤ',
    saturday: '土曜ダイヤ',
    holiday: '休日ダイヤ',
  };

  const timeStr = now.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-slate-800/80 bg-[#090f14]/80 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-tozai to-tozai-light flex items-center justify-center shadow-lg shadow-tozai/20 text-white font-black text-xs tracking-wider">
          JL
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
            JustLeave
            <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-tozai/20 text-tozai-light border border-tozai/30">
              木場 → 西船橋
            </span>
          </h1>
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
            <span>現在: {timeStr}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* ダイヤ種別切り替え */}
        <div className="relative">
          <select
            value={dayTypeOverride}
            onChange={(e) => onSelectDayType(e.target.value as 'auto' | DayType)}
            className="text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700 rounded-lg px-2.5 py-1 appearance-none pr-6 cursor-pointer focus:outline-none focus:ring-1 focus:ring-tozai"
          >
            <option value="auto">自動 ({dayTypeLabels[activeDayType]})</option>
            <option value="weekday">平日ダイヤ固定</option>
            <option value="saturday">土曜ダイヤ固定</option>
            <option value="holiday">休日ダイヤ固定</option>
          </select>
          <Calendar className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* 手動同期ボタン */}
        <button
          onClick={onManualSync}
          disabled={isSyncing}
          title="時刻表データを最新に更新"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors relative"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-tozai' : ''}`} />
          {syncSuccess && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
