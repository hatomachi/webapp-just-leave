import React from 'react';
import { Flame } from 'lucide-react';
import { NextTrainInfo } from '../types';
import { formatRemainingSeconds } from '../utils/dateHelper';

interface NextRapidsListProps {
  rapids: NextTrainInfo[];
}

export const NextRapidsList: React.FC<NextRapidsListProps> = ({ rapids }) => {
  if (rapids.length === 0) return null;

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-rose-500 fill-current" />
          その後の快速（予定）
        </h2>
        <span className="text-[10px] text-slate-500">西船橋方面</span>
      </div>

      <div className="space-y-2.5">
        {rapids.map((info, idx) => {
          const { train, departureTime, officeLeaveTime, diffSeconds } = info;
          const trainTimeStr = `${String(departureTime.getHours()).padStart(2, '0')}:${String(departureTime.getMinutes()).padStart(2, '0')}`;
          const leaveTimeStr = `${String(officeLeaveTime.getHours()).padStart(2, '0')}:${String(officeLeaveTime.getMinutes()).padStart(2, '0')}`;
          const rem = formatRemainingSeconds(diffSeconds);

          return (
            <div
              key={`${train.hour}-${train.minute}-${idx}`}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/50 hover:border-slate-700/80 transition-all"
            >
              {/* 発車・行先 */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 font-mono w-4">
                  #{idx + 2}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-sm text-white">
                      {trainTimeStr}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
                      快速
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {train.destination}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <span>オフィス出発:</span>
                    <span className="font-mono font-semibold text-tozai-light">{leaveTimeStr}</span>
                  </div>
                </div>
              </div>

              {/* 残り時間バッジ */}
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded-full bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700">
                  あと {rem.display}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
