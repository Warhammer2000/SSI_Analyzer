import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateSnapshot } from '../hooks/useSnapshots';
import { CreateSnapshotRequest } from '../types';
import { Lock, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Import() {
  const [activeTab, setActiveTab] = useState<'paste' | 'extension'>('paste');
  const [pasteContent, setPasteContent] = useState('');
  const [parsedData, setParsedData] = useState<Partial<CreateSnapshotRequest> | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const createSnapshot = useCreateSnapshot();

  const handleParse = () => {
    setError('');
    setParsedData(null);

    try {
      const brandMatch = pasteContent.match(/(\d+(?:\.\d+)?)\s+Establish your professional brand/i);
      const peopleMatch = pasteContent.match(/(\d+(?:\.\d+)?)\s+Find the right people/i);
      const insightsMatch = pasteContent.match(/(\d+(?:\.\d+)?)\s+Engage with insights/i);
      const relationshipsMatch = pasteContent.match(/(\d+(?:\.\d+)?)\s+Build relationships/i);

      if (!brandMatch || !peopleMatch || !insightsMatch || !relationshipsMatch) {
        throw new Error('Could not find all 4 component scores. Ensure you copied the "Four components of your score" section.');
      }

      const industryRankMatch = pasteContent.match(/Industry SSI rank\s+Top\s+(\d+)%/i);
      const networkRankMatch = pasteContent.match(/Network SSI rank\s+Top\s+(\d+)%/i);

      if (!industryRankMatch || !networkRankMatch) {
        throw new Error('Could not find Industry or Network ranks (e.g., "Industry SSI rank Top 65%").');
      }

      const industryAvgMatch = pasteContent.match(/industry have an average SSI of (\d+)/i);
      const networkAvgMatch = pasteContent.match(/network have an average SSI of (\d+)/i);

      if (!industryAvgMatch || !networkAvgMatch) {
        throw new Error('Could not find Industry or Network averages (e.g., "have an average SSI of 31").');
      }

      setParsedData({
        establishBrand: parseFloat(brandMatch[1]),
        findPeople: parseFloat(peopleMatch[1]),
        engageInsights: parseFloat(insightsMatch[1]),
        buildRelationships: parseFloat(relationshipsMatch[1]),
        industryAverage: parseInt(industryAvgMatch[1]),
        networkAverage: parseInt(networkAvgMatch[1]),
        industryRankPercentile: parseInt(industryRankMatch[1]),
        networkRankPercentile: parseInt(networkRankMatch[1]),
      });

    } catch (err: any) {
      setError(err.message || 'Could not parse data. Make sure you copied the full SSI page.');
    }
  };

  const handleSave = async () => {
    if (!parsedData) return;

    const payload: CreateSnapshotRequest = {
      recordedAt: new Date().toISOString().split('T')[0],
      establishBrand: parsedData.establishBrand!,
      findPeople: parsedData.findPeople!,
      engageInsights: parsedData.engageInsights!,
      buildRelationships: parsedData.buildRelationships!,
      industryAverage: parsedData.industryAverage!,
      networkAverage: parsedData.networkAverage!,
      industryRankPercentile: parsedData.industryRankPercentile!,
      networkRankPercentile: parsedData.networkRankPercentile!,
    };

    try {
      await createSnapshot.mutateAsync(payload);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save snapshot');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#000000e6] mb-2">Import from LinkedIn</h1>
      <p className="text-[#00000099] mb-6">Paste your SSI data from LinkedIn and we'll parse it automatically</p>

      <div className="bg-white rounded-lg border border-[#e0e0e0] shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-[#e0e0e0]">
          <button
            className={cn(
              "px-6 py-4 text-sm font-semibold transition-colors",
              activeTab === 'paste'
                ? "text-[#0a66c2] border-b-2 border-[#0a66c2]"
                : "text-[#00000099] hover:bg-[#f3f2ef]"
            )}
            onClick={() => setActiveTab('paste')}
          >
            Paste Data
          </button>
          <button
            className={cn(
              "px-6 py-4 text-sm font-semibold transition-colors flex items-center gap-2",
              activeTab === 'extension'
                ? "text-[#0a66c2] border-b-2 border-[#0a66c2]"
                : "text-[#00000099] hover:bg-[#f3f2ef]"
            )}
            onClick={() => setActiveTab('extension')}
          >
            Browser Extension
            <Lock className="w-3 h-3" />
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'paste' ? (
            <div className="space-y-6">
              <p className="text-sm text-[#00000099]">
                Paste your SSI data from LinkedIn below. We'll parse the scores automatically.
              </p>

              <textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder={`Your Social Selling Index\n\nIndustry SSI rank\nTop 65%\n\nFour components of your score\n12.275  Establish your professional brand\n6  Find the right people\n3.1  Engage with insights\n1.948  Build relationships\n\nSales professionals in the Software Development industry have an average SSI of 31.\nPeople in your network have an average SSI of 30.`}
                className="w-full h-64 p-4 border border-[#00000099] rounded font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />

              {error && (
                <div className="flex items-center gap-2 text-[#cc1016] bg-[#ffebee] p-3 rounded text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {parsedData && (
                <div className="bg-[#f0f9f4] border border-[#057642] rounded p-4">
                  <h3 className="font-bold text-[#057642] flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5" />
                    Data Parsed Successfully
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="block text-[#00000099] text-xs">Brand</span>
                      <span className="font-bold">{parsedData.establishBrand}</span>
                    </div>
                    <div>
                      <span className="block text-[#00000099] text-xs">People</span>
                      <span className="font-bold">{parsedData.findPeople}</span>
                    </div>
                    <div>
                      <span className="block text-[#00000099] text-xs">Insights</span>
                      <span className="font-bold">{parsedData.engageInsights}</span>
                    </div>
                    <div>
                      <span className="block text-[#00000099] text-xs">Relationships</span>
                      <span className="font-bold">{parsedData.buildRelationships}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4">
                {!parsedData ? (
                  <button
                    onClick={handleParse}
                    disabled={!pasteContent}
                    className="bg-[#0a66c2] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#004182] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Parse Data
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setParsedData(null)}
                      className="text-[#00000099] font-semibold hover:text-[#000000e6]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={createSnapshot.isPending}
                      className="bg-[#057642] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#046236] transition-colors disabled:opacity-50"
                    >
                      {createSnapshot.isPending ? 'Saving...' : 'Confirm & Save'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-[#f3f2ef] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-[#00000099]" />
              </div>
              <h3 className="text-lg font-bold text-[#000000e6] mb-2">Browser Extension</h3>
              <p className="text-[#00000099] max-w-md mx-auto mb-6">
                Install our Chrome extension to auto-capture SSI data with one click.
              </p>
              <button
                disabled
                className="bg-[#e0e0e0] text-[#00000099] px-6 py-2 rounded-full font-semibold cursor-not-allowed"
                title="Coming soon"
              >
                Download Extension
              </button>
              <p className="text-xs text-[#00000099] mt-2">Coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
