import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ArrowUp, ArrowDown, Target, ChevronDown, ChevronUp, CheckCircle2, Plus, Import, Loader2 } from 'lucide-react';
import { parseRecommendation, ParsedRecommendation } from '../types';
import { getGrade, getTotalScoreColor, COMPONENT_LABELS, COMPONENT_COLORS, cn } from '../lib/utils';
import { format } from 'date-fns';
import { useLatestSnapshot, useSnapshots, useTrends } from '../hooks/useSnapshots';
import { useAnalysis, useGenerateAnalysis } from '../hooks/useAnalysis';

export default function Dashboard() {
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const { data: latestSnapshot, isLoading: loadingLatest } = useLatestSnapshot();
  const { data: snapshots = [] } = useSnapshots();
  const { data: trendData = [] } = useTrends();
  const { data: rawRecommendations } = useAnalysis(latestSnapshot?.id);
  const generateAnalysis = useGenerateAnalysis();

  const recommendations: ParsedRecommendation[] = (rawRecommendations ?? latestSnapshot?.recommendations ?? []).map(parseRecommendation);

  // Auto-generate analysis if latest snapshot has no recommendations
  useEffect(() => {
    if (latestSnapshot && (!rawRecommendations || rawRecommendations.length === 0) && !latestSnapshot.recommendations?.length && !generateAnalysis.isPending) {
      generateAnalysis.mutate(latestSnapshot.id);
    }
  }, [latestSnapshot?.id]);

  if (loadingLatest) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0a66c2]" />
      </div>
    );
  }

  if (!latestSnapshot) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-lg border border-[#e0e0e0] shadow-sm">
        <div className="bg-[#f3f2ef] p-4 rounded-full mb-4">
          <Target className="w-12 h-12 text-[#0a66c2]" />
        </div>
        <h2 className="text-2xl font-bold text-[#000000e6] mb-2">Record your first SSI snapshot</h2>
        <p className="text-[#00000099] mb-6 max-w-md">
          Start tracking your Social Selling Index to get personalized recommendations and improve your LinkedIn performance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/new"
            className="flex items-center justify-center gap-2 bg-[#0a66c2] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#004182] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Manual Entry
          </Link>
          <Link
            to="/import"
            className="flex items-center justify-center gap-2 bg-white text-[#0a66c2] border border-[#0a66c2] px-6 py-2 rounded-full font-semibold hover:bg-[#f3f2ef] transition-colors"
          >
            <Import className="w-4 h-4" />
            Paste from LinkedIn
          </Link>
        </div>
      </div>
    );
  }

  const current = latestSnapshot;
  const previous = snapshots.length > 1 ? snapshots[1] : null;
  const totalScore = current.totalScore;

  const renderRankChange = (currentRank: number, prevRank: number | undefined) => {
    if (!prevRank) return null;
    const diff = prevRank - currentRank;

    if (diff === 0) return <span className="text-[#00000099] text-xs ml-1">-</span>;
    const isImprovement = diff > 0;
    return (
      <span className={cn("flex items-center text-xs ml-1", isImprovement ? "text-[#057642]" : "text-[#cc1016]")}>
        {isImprovement ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
        {Math.abs(diff)}%
      </span>
    );
  };

  const pieData = [
    { name: 'Score', value: totalScore },
    { name: 'Remaining', value: 100 - totalScore },
  ];

  return (
    <div className="space-y-6">
      {/* Card 1: Score Overview */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#000000e6]">Dashboard</h2>
        <div className="flex gap-2">
          <Link
            to="/new"
            className="flex items-center gap-1 bg-[#0a66c2] text-white px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-[#004182] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New
          </Link>
          <Link
            to="/import"
            className="flex items-center gap-1 bg-white text-[#0a66c2] border border-[#0a66c2] px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-[#f3f2ef] transition-colors"
          >
            <Import className="w-4 h-4" />
            Import
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#e0e0e0] shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Donut Chart */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={getTotalScoreColor(totalScore)} />
                  <Cell fill="#f3f2ef" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-bold text-[#000000e6]">{totalScore}</span>
              <span className="text-sm text-[#00000099]">/100</span>
            </div>
          </div>

          {/* Stats & Averages */}
          <div className="flex-1 w-full space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f3f2ef] p-4 rounded-lg">
                <p className="text-sm text-[#00000099] mb-1">Industry Rank</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-[#000000e6]">Top {current.industryRankPercentile}%</span>
                  {previous && renderRankChange(current.industryRankPercentile, previous.industryRankPercentile)}
                </div>
              </div>
              <div className="bg-[#f3f2ef] p-4 rounded-lg">
                <p className="text-sm text-[#00000099] mb-1">Network Rank</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-[#000000e6]">Top {current.networkRankPercentile}%</span>
                  {previous && renderRankChange(current.networkRankPercentile, previous.networkRankPercentile)}
                </div>
              </div>
            </div>

            {/* Horizontal Bar for Averages */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[#00000099]">
                <span>0</span>
                <span>100</span>
              </div>
              <div className="relative h-2 bg-[#f3f2ef] rounded-full">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-[#00000099]"
                  style={{ left: `${current.industryAverage}%` }}
                  title={`Industry Avg: ${current.industryAverage}`}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-[#0a66c2]"
                  style={{ left: `${current.networkAverage}%` }}
                  title={`Network Avg: ${current.networkAverage}`}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ left: `${totalScore}%`, backgroundColor: getTotalScoreColor(totalScore) }}
                  title={`Your Score: ${totalScore}`}
                />
              </div>
              <div className="flex justify-between text-xs text-[#00000099] mt-1">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-3 bg-[#00000099]"></div>
                  <span>Industry Avg ({current.industryAverage})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-3 bg-[#0a66c2]"></div>
                  <span>Network Avg ({current.networkAverage})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Component Breakdown */}
      <div className="bg-white rounded-lg border border-[#e0e0e0] shadow-sm p-6">
        <h3 className="text-lg font-bold text-[#000000e6] mb-4">Component Breakdown</h3>
        <div className="space-y-6">
          {(['establishBrand', 'findPeople', 'engageInsights', 'buildRelationships'] as const).map((key) => {
            const score = current[key];
            const { grade, bg, hex } = getGrade(score);
            const label = COMPONENT_LABELS[key];

            return (
              <div key={key} className="grid grid-cols-[1fr_auto] md:grid-cols-[200px_1fr_80px_40px] gap-4 items-center">
                <span className="text-sm font-semibold text-[#000000e6]">{label}</span>

                <div className="h-2 bg-[#f3f2ef] rounded-full overflow-hidden w-full">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(score / 25) * 100}%`, backgroundColor: hex }}
                  />
                </div>

                <span className="text-sm font-medium text-[#00000099] text-right">{score.toFixed(1)} / 25</span>

                <span className={cn("text-xs font-bold px-2 py-0.5 rounded text-white text-center", bg)}>
                  {grade}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card 3: AI Recommendations */}
      <div className="bg-white rounded-lg border border-[#e0e0e0] shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-6 h-6 text-[#0a66c2]" />
          <h3 className="text-lg font-bold text-[#000000e6]">Your Action Plan</h3>
          {generateAnalysis.isPending && <Loader2 className="w-4 h-4 animate-spin text-[#00000099]" />}
        </div>

        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={cn(
                "border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer",
                rec.isCompleted ? "border-[#057642] bg-[#f0f9f4]" : "border-[#e0e0e0]"
              )}
              onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
            >
              <div className="flex items-stretch min-h-[80px]">
                <div
                  className="w-1 flex-shrink-0"
                  style={{ backgroundColor: COMPONENT_COLORS[rec.componentKey] }}
                />

                <div className="flex-1 p-4 flex flex-col justify-center">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-[#f3f2ef] text-[#00000099] text-xs font-bold px-2 py-0.5 rounded">
                          P{rec.priority}
                        </span>
                        <h4 className={cn("font-bold", rec.isCompleted ? "text-[#057642] line-through" : "text-[#000000e6]")}>
                          {rec.title}
                        </h4>
                        {rec.isCompleted && <CheckCircle2 className="w-4 h-4 text-[#057642]" />}
                      </div>
                      <p className="text-sm text-[#00000099]">{rec.description}</p>
                    </div>
                    {expandedRec === rec.id ? (
                      <ChevronUp className="w-5 h-5 text-[#00000099]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#00000099]" />
                    )}
                  </div>
                </div>
              </div>

              {expandedRec === rec.id && (
                <div className="bg-[#f9f9f9] p-4 border-t border-[#e0e0e0]">
                  <ul className="space-y-3 mb-4">
                    {rec.actions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-[#000000e6]">
                        <CheckCircle2 className="w-4 h-4 text-[#0a66c2] mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between">
                    {rec.timeEstimate && (
                      <span className="text-xs font-semibold text-[#00000099] bg-[#e0e0e0] px-2 py-1 rounded">
                        {rec.timeEstimate}
                      </span>
                    )}
                    {rec.expectedImpact && (
                      <span className="text-xs text-[#057642] font-semibold">
                        {rec.expectedImpact}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Card 4: Trends */}
      {trendData.length >= 2 && (
        <div className="bg-white rounded-lg border border-[#e0e0e0] shadow-sm p-6">
          <h3 className="text-lg font-bold text-[#000000e6] mb-6">Score Trends</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis
                  dataKey="recordedAt"
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  stroke="#00000099"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#00000099"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                  labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                />
                <Legend />
                <Line type="monotone" dataKey="totalScore" name="Total Score" stroke="#000000e6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="establishBrand" name="Brand" stroke={COMPONENT_COLORS.establishBrand} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="findPeople" name="Find People" stroke={COMPONENT_COLORS.findPeople} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="engageInsights" name="Insights" stroke={COMPONENT_COLORS.engageInsights} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="buildRelationships" name="Relationships" stroke={COMPONENT_COLORS.buildRelationships} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
