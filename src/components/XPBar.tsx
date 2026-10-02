import { Zap, Flame } from 'lucide-react'

interface Props {
  xp: number
  streak: number
}

export function XPBar({ xp, streak }: Props) {
  const level = Math.floor(xp / 100) + 1
  const levelXP = xp % 100
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <Zap size={16} className="text-yellow-400" />
        <span className="text-sm font-semibold text-yellow-400">{xp} XP</span>
        <span className="text-xs text-gray-500 ml-1">Lv.{level}</span>
      </div>
      <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${levelXP}%` }}
        />
      </div>
      {streak > 0 && (
        <div className={`flex items-center gap-1 ${streak >= 10 ? 'animate-streak-flash' : ''}`}>
          <Flame size={16} className="text-orange-400" />
          <span className="text-sm font-semibold text-orange-400">{streak}</span>
        </div>
      )}
    </div>
  )
}
