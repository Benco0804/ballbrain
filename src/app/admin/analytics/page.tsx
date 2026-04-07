'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type MetricCards = {
  totalUsers: number
  activeUsers7: number
  activeUsers24: number
  avgCoins: number
  totalGridPlays: number
  uniqueGridPlayers: number
  avgScore: number
  perfectGrids: number
  triviaTotal: number
  triviaUnique: number
  triviaAvgCoins: number
  triviaCompletePct: string
  coinsEarned: number
  coinsSpent: number
  hintsUsed: number
  hintCoins: number
  ret1: number
  ret2: number
  ret3: number
  ret5: number
}

type TopPlayer = {
  id: string
  display_name: string
  username: string
  coins: number
  created_at: string
  gridPlays: number
  triviaPlays: number
}

type SportCount = { sport: string; count: number }
type DailyCount = { date: string; count: number }
type ReasonCount = { reason: string; amount: number }

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<MetricCards | null>(null)
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([])
  const [sportGridCounts, setSportGridCounts] = useState<SportCount[]>([])
  const [sportScores, setSportScores] = useState<SportCount[]>([])
  const [dailyCounts, setDailyCounts] = useState<DailyCount[]>([])
  const [triviaSportCounts, setTriviaSportCounts] = useState<SportCount[]>([])
  const [reasonCounts, setReasonCounts] = useState<ReasonCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const supabase = createClient()
      const now = new Date()
      const day7 = new Date(now.getTime() - 7 * 86400000).toISOString()
      const day1 = new Date(now.getTime() - 86400000).toISOString()

      const [
        { data: users },
        { data: gameResults },
        { data: triviaPlays },
        { data: transactions },
        { data: hints }
      ] = await Promise.all([
        supabase.from('users').select('id,username,display_name,coins,created_at'),
        supabase.from('game_results').select('id,user_id,score,sport,play_date,completed_at'),
        supabase.from('solo_trivia_plays').select('id,user_id,sport,coins_earned,completed_at,created_at'),
        supabase.from('economy_transactions').select('id,user_id,currency,amount,reason,created_at').eq('currency', 'coins'),
        supabase.from('puzzle_hints').select('id,user_id,coins_spent,created_at')
      ])

      if (!users || !gameResults || !triviaPlays || !transactions || !hints) {
        throw new Error('Failed to fetch data from Supabase')
      }

      // Active users
      const activeSet7 = new Set<string>()
      const activeSet24 = new Set<string>()
      gameResults.forEach(r => {
        if (r.play_date && r.play_date >= day7.slice(0, 10)) activeSet7.add(r.user_id)
        if (r.play_date && r.play_date >= day1.slice(0, 10)) activeSet24.add(r.user_id)
      })
      triviaPlays.forEach(r => {
        if (r.created_at >= day7) activeSet7.add(r.user_id)
        if (r.created_at >= day1) activeSet24.add(r.user_id)
      })

      // Grid metrics
      const scores = gameResults.filter(r => r.score != null).map(r => r.score as number)
      const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

      // Sport breakdowns
      const sportGridMap: Record<string, number> = {}
      const sportScoreMap: Record<string, number[]> = {}
      gameResults.forEach(r => {
        const s = (r.sport || 'unknown').toLowerCase()
        sportGridMap[s] = (sportGridMap[s] || 0) + 1
        if (r.score != null) {
          sportScoreMap[s] = sportScoreMap[s] || []
          sportScoreMap[s].push(r.score as number)
        }
      })
      setSportGridCounts(Object.entries(sportGridMap).map(([sport, count]) => ({ sport, count })))
      setSportScores(Object.entries(sportScoreMap).map(([sport, arr]) => ({
        sport,
        count: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10
      })))

      // Daily plays last 14 days
      const dailyMap: Record<string, number> = {}
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10)
        dailyMap[d] = 0
      }
      gameResults.forEach(r => { if (r.play_date && dailyMap.hasOwnProperty(r.play_date)) dailyMap[r.play_date]++ })
      triviaPlays.forEach(r => {
        const d = (r.created_at || '').slice(0, 10)
        if (dailyMap.hasOwnProperty(d)) dailyMap[d]++
      })
      setDailyCounts(Object.entries(dailyMap).map(([date, count]) => ({ date: date.slice(5), count })))

      // Trivia metrics
      const triviaCoins = triviaPlays.filter(r => r.coins_earned != null).map(r => r.coins_earned as number)
      const triviaAvgCoins = triviaCoins.length ? Math.round(triviaCoins.reduce((a, b) => a + b, 0) / triviaCoins.length) : 0
      const triviaCompletePct = triviaPlays.length ? Math.round(triviaPlays.filter(r => r.completed_at).length / triviaPlays.length * 100) + '%' : '—'

      const triviaSportMap: Record<string, number> = {}
      triviaPlays.forEach(r => {
        const s = (r.sport || 'mix').toLowerCase()
        triviaSportMap[s] = (triviaSportMap[s] || 0) + 1
      })
      setTriviaSportCounts(Object.entries(triviaSportMap).map(([sport, count]) => ({ sport, count })))

      // Economy
      const earned = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
      const spent = Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0))
      const reasonMap: Record<string, number> = {}
      transactions.filter(t => t.amount > 0).forEach(t => {
        const r = t.reason || 'other'
        reasonMap[r] = (reasonMap[r] || 0) + t.amount
      })
      setReasonCounts(Object.entries(reasonMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([reason, amount]) => ({ reason, amount })))

      // Retention proxy
      const playDaysByUser: Record<string, Set<string>> = {}
      gameResults.forEach(r => {
        if (!playDaysByUser[r.user_id]) playDaysByUser[r.user_id] = new Set()
        if (r.play_date) playDaysByUser[r.user_id].add(r.play_date)
      })
      triviaPlays.forEach(r => {
        if (!playDaysByUser[r.user_id]) playDaysByUser[r.user_id] = new Set()
        const d = (r.created_at || '').slice(0, 10)
        if (d) playDaysByUser[r.user_id].add(d)
      })
      const allPlayers = Object.keys(playDaysByUser)

      // Top players
      const gridCountByUser: Record<string, number> = {}
      gameResults.forEach(r => { gridCountByUser[r.user_id] = (gridCountByUser[r.user_id] || 0) + 1 })
      const triviaCountByUser: Record<string, number> = {}
      triviaPlays.forEach(r => { triviaCountByUser[r.user_id] = (triviaCountByUser[r.user_id] || 0) + 1 })

      const top = [...users]
        .sort((a, b) => (gridCountByUser[b.id] || 0) + (triviaCountByUser[b.id] || 0) - (gridCountByUser[a.id] || 0) - (triviaCountByUser[a.id] || 0))
        .slice(0, 10)
        .map(u => ({ ...u, gridPlays: gridCountByUser[u.id] || 0, triviaPlays: triviaCountByUser[u.id] || 0 }))
      setTopPlayers(top)

      setMetrics({
        totalUsers: users.length,
        activeUsers7: activeSet7.size,
        activeUsers24: activeSet24.size,
        avgCoins: users.length ? Math.round(users.reduce((s, u) => s + (u.coins || 0), 0) / users.length) : 0,
        totalGridPlays: gameResults.length,
        uniqueGridPlayers: new Set(gameResults.map(r => r.user_id)).size,
        avgScore: Math.round(avgScore * 10) / 10,
        perfectGrids: gameResults.filter(r => r.score === 9).length,
        triviaTotal: triviaPlays.length,
        triviaUnique: new Set(triviaPlays.map(r => r.user_id)).size,
        triviaAvgCoins,
        triviaCompletePct,
        coinsEarned: earned,
        coinsSpent: spent,
        hintsUsed: hints.length,
        hintCoins: hints.reduce((s, h) => s + (h.coins_spent || 0), 0),
        ret1: allPlayers.filter(id => playDaysByUser[id].size === 1).length,
        ret2: allPlayers.filter(id => playDaysByUser[id].size >= 2).length,
        ret3: allPlayers.filter(id => playDaysByUser[id].size >= 3).length,
        ret5: allPlayers.filter(id => playDaysByUser[id].size >= 5).length,
      })

    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading analytics...</div>
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">Error: {error}</div>

  const SPORT_COLORS: Record<string, string> = { nba: '#3B82F6', soccer: '#22C55E', mix: '#F59E0B', unknown: '#9CA3AF' }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">BallBrain Analytics</h1>
          <button onClick={loadData} className="text-sm px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50">
            Refresh
          </button>
        </div>

        <Section title="Users">
          <MetricGrid>
            <Metric label="Total users" value={metrics!.totalUsers} />
            <Metric label="Active last 7d" value={metrics!.activeUsers7} />
            <Metric label="Active last 24h" value={metrics!.activeUsers24} />
            <Metric label="Avg coins balance" value={metrics!.avgCoins.toLocaleString()} />
          </MetricGrid>
        </Section>

        <Section title="Grid plays">
          <MetricGrid>
            <Metric label="Total plays" value={metrics!.totalGridPlays} />
            <Metric label="Unique players" value={metrics!.uniqueGridPlayers} />
            <Metric label="Avg score" value={metrics!.avgScore} />
            <Metric label="Perfect grids" value={metrics!.perfectGrids} />
          </MetricGrid>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <ChartCard title="Plays by sport">
              <BarChart data={sportGridCounts.map(s => ({ label: s.sport, value: s.count, color: SPORT_COLORS[s.sport] || '#9CA3AF' }))} />
            </ChartCard>
            <ChartCard title="Avg score by sport">
              <BarChart data={sportScores.map(s => ({ label: s.sport, value: s.count, color: SPORT_COLORS[s.sport] || '#9CA3AF' }))} />
            </ChartCard>
          </div>
          <ChartCard title="Daily plays (last 14 days)">
            <LineChart data={dailyCounts.map(d => ({ label: d.date, value: d.count }))} />
          </ChartCard>
        </Section>

        <Section title="Trivia plays">
          <MetricGrid>
            <Metric label="Total sessions" value={metrics!.triviaTotal} />
            <Metric label="Unique players" value={metrics!.triviaUnique} />
            <Metric label="Avg coins earned" value={metrics!.triviaAvgCoins} />
            <Metric label="Completion rate" value={metrics!.triviaCompletePct} />
          </MetricGrid>
          <ChartCard title="Trivia plays by sport">
            <BarChart data={triviaSportCounts.map(s => ({ label: s.sport, value: s.count, color: SPORT_COLORS[s.sport] || '#9CA3AF' }))} />
          </ChartCard>
        </Section>

        <Section title="Economy">
          <MetricGrid>
            <Metric label="Coins earned" value={metrics!.coinsEarned.toLocaleString()} />
            <Metric label="Coins spent" value={metrics!.coinsSpent.toLocaleString()} />
            <Metric label="Hints used" value={metrics!.hintsUsed} />
            <Metric label="Coins on hints" value={metrics!.hintCoins.toLocaleString()} />
          </MetricGrid>
          <ChartCard title="Coins earned by reason">
            <HorizontalBarChart data={reasonCounts.map(r => ({ label: r.reason, value: r.amount }))} />
          </ChartCard>
        </Section>

        <Section title="Retention proxy">
          <MetricGrid>
            <Metric label="Played 1 day only" value={metrics!.ret1} />
            <Metric label="Played 2+ days" value={metrics!.ret2} />
            <Metric label="Played 3+ days" value={metrics!.ret3} />
            <Metric label="Played 5+ days" value={metrics!.ret5} />
          </MetricGrid>
        </Section>

        <Section title="Top players">
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Player</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Grid plays</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Trivia plays</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Coins</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {topPlayers.map((p, i) => (
                  <tr key={p.id} className={i < topPlayers.length - 1 ? 'border-b border-gray-50' : ''}>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.display_name || p.username || p.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-gray-600">{p.gridPlays}</td>
                    <td className="px-4 py-3 text-gray-600">{p.triviaPlays}</td>
                    <td className="px-4 py-3 text-gray-600">{(p.coins || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-400">{p.created_at?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">{title}</p>
      {children}
    </div>
  )
}

function MetricGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">{children}</div>
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
      <p className="text-sm font-medium text-gray-700 mb-3">{title}</p>
      {children}
    </div>
  )
}

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="space-y-2">
      {data.map(d => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-16 shrink-0">{d.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color }} />
          </div>
          <span className="text-xs font-medium text-gray-700 w-6 text-right">{d.value}</span>
        </div>
      ))}
    </div>
  )
}

function HorizontalBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="space-y-2">
      {data.map(d => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-32 shrink-0 truncate">{d.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
            <div className="h-full rounded-full bg-green-400 transition-all" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
          <span className="text-xs font-medium text-gray-700 w-16 text-right">{d.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

function LineChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  const w = 600; const h = 120; const pad = 20
  const points = data.map((d, i) => ({
    x: pad + (i / (data.length - 1)) * (w - pad * 2),
    y: h - pad - (d.value / max) * (h - pad * 2),
    label: d.label,
    value: d.value
  }))
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `${path} L ${points[points.length-1].x} ${h - pad} L ${points[0].x} ${h - pad} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 120 }}>
      <path d={area} fill="rgba(59,130,246,0.08)" />
      <path d={path} fill="none" stroke="#3B82F6" strokeWidth="2" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill="#3B82F6" />
          {i % 2 === 0 && <text x={p.x} y={h - 4} textAnchor="middle" fontSize="9" fill="#9CA3AF">{p.label}</text>}
        </g>
      ))}
    </svg>
  )
}
