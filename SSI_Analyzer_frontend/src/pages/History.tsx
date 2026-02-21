import React, { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Download, ChevronDown, ChevronUp, Share2, Loader2 } from 'lucide-react';
import { useSnapshots, useDeleteSnapshot } from '../hooks/useSnapshots';
import { useAnalysis } from '../hooks/useAnalysis';
import { parseRecommendation } from '../types';

function SnapshotRecommendations({ snapshotId }: { snapshotId: string }) {
  const { data: recommendations = [] } = useAnalysis(snapshotId);
  const parsed = recommendations.map(parseRecommendation);

  if (parsed.length === 0) {
    return <p className="text-sm text-[#00000099]">No recommendations generated yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {parsed.slice(0, 4).map((rec) => (
        <div key={rec.id} className="bg-white p-3 rounded border border-[#e0e0e0] text-sm">
          <p className="font-semibold text-[#0a66c2] mb-1">{rec.title}</p>
          <ul className="list-disc list-inside text-[#00000099] text-xs">
            {rec.actions.slice(0, 2).map((action, i) => (
              <li key={i}>{action}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function History() {
  const { data: snapshots = [], isLoading } = useSnapshots();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const deleteSnapshotMutation = useDeleteSnapshot();

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this snapshot?')) {
      deleteSnapshotMutation.mutate(id);
    }
  };

  const handleShare = (snapshot: (typeof snapshots)[0], e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `My LinkedIn SSI Score: ${snapshot.totalScore}/100\nDate: ${snapshot.recordedAt}\nIndustry Rank: Top ${snapshot.industryRankPercentile}%\nNetwork Rank: Top ${snapshot.networkRankPercentile}%`;
    navigator.clipboard.writeText(text);
    alert('Snapshot summary copied to clipboard!');
  };

  const handleExport = () => {
    if (snapshots.length === 0) return;

    const headers = [
      'Date', 'Total Score', 'Establish Brand', 'Find People',
      'Engage Insights', 'Build Relationships', 'Industry Rank', 'Network Rank'
    ];

    const csvContent = [
      headers.join(','),
      ...snapshots.map(s => [
        s.recordedAt, s.totalScore, s.establishBrand, s.findPeople,
        s.engageInsights, s.buildRelationships,
        s.industryRankPercentile, s.networkRankPercentile
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ssi_history_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0a66c2]" />
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-[#e0e0e0]">
        <p className="text-[#00000099]">No history available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#000000e6]">Snapshot History</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 text-[#0a66c2] font-semibold hover:bg-[#eef3f8] rounded-full transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[#e0e0e0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f2ef] border-b border-[#e0e0e0]">
                <th className="p-4 font-semibold text-sm text-[#00000099]">Date</th>
                <th className="p-4 font-semibold text-sm text-[#00000099]">Total</th>
                <th className="p-4 font-semibold text-sm text-[#00000099] hidden md:table-cell">Brand</th>
                <th className="p-4 font-semibold text-sm text-[#00000099] hidden md:table-cell">People</th>
                <th className="p-4 font-semibold text-sm text-[#00000099] hidden md:table-cell">Insights</th>
                <th className="p-4 font-semibold text-sm text-[#00000099] hidden md:table-cell">Relationships</th>
                <th className="p-4 font-semibold text-sm text-[#00000099]">Ind. Rank</th>
                <th className="p-4 font-semibold text-sm text-[#00000099]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((snapshot) => {
                const isExpanded = expandedRow === snapshot.id;

                return (
                  <React.Fragment key={snapshot.id}>
                    <tr
                      className="border-b border-[#e0e0e0] hover:bg-[#f9f9f9] cursor-pointer transition-colors"
                      onClick={() => setExpandedRow(isExpanded ? null : snapshot.id)}
                    >
                      <td className="p-4 text-sm font-medium text-[#000000e6]">
                        {format(new Date(snapshot.recordedAt), 'MMM d, yyyy')}
                      </td>
                      <td className="p-4 text-sm font-bold text-[#000000e6]">{snapshot.totalScore}</td>
                      <td className="p-4 text-sm text-[#00000099] hidden md:table-cell">{snapshot.establishBrand}</td>
                      <td className="p-4 text-sm text-[#00000099] hidden md:table-cell">{snapshot.findPeople}</td>
                      <td className="p-4 text-sm text-[#00000099] hidden md:table-cell">{snapshot.engageInsights}</td>
                      <td className="p-4 text-sm text-[#00000099] hidden md:table-cell">{snapshot.buildRelationships}</td>
                      <td className="p-4 text-sm text-[#000000e6]">Top {snapshot.industryRankPercentile}%</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleShare(snapshot, e)}
                            className="p-2 text-[#00000099] hover:text-[#0a66c2] hover:bg-[#eef3f8] rounded-full transition-colors"
                            title="Share Snapshot"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(snapshot.id, e)}
                            className="p-2 text-[#00000099] hover:text-[#cc1016] hover:bg-[#ffebee] rounded-full transition-colors"
                            title="Delete Snapshot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-[#00000099]" /> : <ChevronDown className="w-4 h-4 text-[#00000099]" />}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-[#f9f9f9]">
                        <td colSpan={8} className="p-4 border-b border-[#e0e0e0]">
                          <div className="space-y-2">
                            <h4 className="text-sm font-bold text-[#000000e6] mb-2">Recommendations from this snapshot:</h4>
                            <SnapshotRecommendations snapshotId={snapshot.id} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
