import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Train as TrainIcon } from 'lucide-react';
import { NextTrainInfo } from '../types';
import { formatRemainingSeconds } from '../utils/dateHelper';

interface AllTrainsListProps {
  trains: NextTrainInfo[];
}

export const AllTrainsList: React.FC<AllTrainsListProps> = ({ trains }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-hidden backdrop-blur-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3.5 px-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <TrainIcon className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">
            直近の全電車（各駅停車を含む）
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {trains.length}本
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <span className="text-[11px] text-slate-400">
            {isOpen ? '閉じる' : '展開する'}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 pt-0 border-t border-slate-800/50 space-y-2 mt-2">
          {trains.map((info, idx) => {
            const { train, departureTime, officeLeaveTime, diffSeconds } = info;
            const trainTimeStr = `${String(departureTime.getHours()).padStart(2, '0')}:${String(departureTime.getMinutes()).padStart(2, '0')}`;
            const leaveTimeStr = `${String(officeLeaveTime.getHours()).padStart(2, '0')}:${String(officeLeaveTime.getMinutes()).padStart(2, '0')}`;
            const rem = formatRemainingSeconds(diffSeconds);
            const canCatch = diffSeconds >= 0;

            return (
              <div
                key={`all-${train.hour}-${train.minute}-${idx}`}
                className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                  train.isRapid
                    ? 'bg-rose-950/20 border border-rose-900/30'
                    : 'bg-slate-950/40 border border-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-white text-sm">
                    {trainTimeStr}
                  </span>
                  {train.isRapid ? (
                    <span className="px-1.5 py-0.5 rounded bg-rose-600/20 text-rose-400 text-[10px] font-bold border border-rose-600/30">
                      快速
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                      各停
                    </span>
                  )}
                  <span className="text-slate-300 font-medium">
                    {train.destination}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[10px] text-slate-400">
                    出 {leaveTimeStr}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      canCatch
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {canCatch ? `あと${rem.display}` : '出発済'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
