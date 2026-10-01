import React from 'react';
import { Footprints, Minus, Plus } from 'lucide-react';

interface WalkTimeSelectorProps {
  walkMinutes: number;
  onChangeWalkMinutes: (minutes: number) => void;
}

export const WalkTimeSelector: React.FC<WalkTimeSelectorProps> = ({
  walkMinutes,
  onChangeWalkMinutes,
}) => {
  const presets = [7, 8, 10, 12, 15];

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-3 px-4 flex items-center justify-between backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-tozai/10 text-tozai-light">
          <Footprints className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-medium text-slate-300 block">オフィス ➜ ホーム徒歩</span>
          <span className="text-[10px] text-slate-500">ワンタップで微調整</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChangeWalkMinutes(Math.max(3, walkMinutes - 1))}
          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 flex items-center justify-center transition-all"
          title="1分短縮"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* プリセットボタングループ */}
        <div className="flex items-center gap-1">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => onChangeWalkMinutes(p)}
              className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 ${
                walkMinutes === p
                  ? 'bg-tozai text-white shadow-md shadow-tozai/30 scale-105'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}分
            </button>
          ))}
        </div>

        <button
          onClick={() => onChangeWalkMinutes(Math.min(30, walkMinutes + 1))}
          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 flex items-center justify-center transition-all"
          title="1分延長"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
