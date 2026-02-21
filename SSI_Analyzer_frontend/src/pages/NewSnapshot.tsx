import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateSnapshot } from '../hooks/useSnapshots';
import { CreateSnapshotRequest } from '../types';

export default function NewSnapshot() {
  const navigate = useNavigate();
  const createSnapshot = useCreateSnapshot();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    establishBrand: '',
    findPeople: '',
    engageInsights: '',
    buildRelationships: '',
    industryAverage: '',
    networkAverage: '',
    industryRankPercentile: '',
    networkRankPercentile: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload: CreateSnapshotRequest = {
      recordedAt: formData.date,
      establishBrand: Number(formData.establishBrand),
      findPeople: Number(formData.findPeople),
      engageInsights: Number(formData.engageInsights),
      buildRelationships: Number(formData.buildRelationships),
      industryAverage: Number(formData.industryAverage),
      networkAverage: Number(formData.networkAverage),
      industryRankPercentile: Number(formData.industryRankPercentile),
      networkRankPercentile: Number(formData.networkRankPercentile),
    };

    try {
      await createSnapshot.mutateAsync(payload);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save snapshot');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg border border-[#e0e0e0] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#e0e0e0]">
        <h1 className="text-xl font-bold text-[#000000e6]">Record SSI Snapshot</h1>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-[#ffebee] text-[#cc1016] p-3 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-[#000000e6] mb-1">Date</label>
          <input
            type="date"
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-[#00000099] rounded hover:bg-[#f3f2ef] focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-[#000000e6] border-b border-[#e0e0e0] pb-2">Component Scores</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'establishBrand', label: 'Establish Professional Brand', helper: 'Score 0-25' },
              { name: 'findPeople', label: 'Find the Right People', helper: 'Score 0-25' },
              { name: 'engageInsights', label: 'Engage with Insights', helper: 'Score 0-25' },
              { name: 'buildRelationships', label: 'Build Relationships', helper: 'Score 0-25' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-[#000000e6] mb-1">
                  {field.label} <span className="text-[#00000099] font-normal">({field.helper})</span>
                </label>
                <input
                  type="number"
                  name={field.name}
                  min="0"
                  max="25"
                  step="0.01"
                  required
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#00000099] rounded hover:bg-[#f3f2ef] focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-[#000000e6] border-b border-[#e0e0e0] pb-2">Benchmark Data</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#000000e6] mb-1">
                Industry Average SSI <span className="text-[#00000099] font-normal">(0-100)</span>
              </label>
              <input
                type="number"
                name="industryAverage"
                min="0"
                max="100"
                required
                value={formData.industryAverage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#00000099] rounded hover:bg-[#f3f2ef] focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#000000e6] mb-1">
                Network Average SSI <span className="text-[#00000099] font-normal">(0-100)</span>
              </label>
              <input
                type="number"
                name="networkAverage"
                min="0"
                max="100"
                required
                value={formData.networkAverage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#00000099] rounded hover:bg-[#f3f2ef] focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#000000e6] mb-1">
                Industry Rank Percentile <span className="text-[#00000099] font-normal">(Top %)</span>
              </label>
              <input
                type="number"
                name="industryRankPercentile"
                min="1"
                max="100"
                required
                value={formData.industryRankPercentile}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#00000099] rounded hover:bg-[#f3f2ef] focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#000000e6] mb-1">
                Network Rank Percentile <span className="text-[#00000099] font-normal">(Top %)</span>
              </label>
              <input
                type="number"
                name="networkRankPercentile"
                min="1"
                max="100"
                required
                value={formData.networkRankPercentile}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#00000099] rounded hover:bg-[#f3f2ef] focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={createSnapshot.isPending}
            className="bg-[#0a66c2] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#004182] transition-colors disabled:opacity-50"
          >
            {createSnapshot.isPending ? 'Saving...' : 'Save Snapshot'}
          </button>
        </div>
      </form>
    </div>
  );
}
