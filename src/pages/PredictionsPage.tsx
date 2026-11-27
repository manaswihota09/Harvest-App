import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useHarvestIQ } from '../context/HarvestIQContext';
import { GrowthStage } from '../types/domain';
import { DemoNotice, PageHeader, StatusLabel } from '../components/common/UIPrimitives';
import { formatDateShort } from '../utils/calculations';

const STAGES: Exclude<GrowthStage, 'Harvested'>[] = [
  'Ready for Harvest',
  'Approaching Maturity',
  'Vegetative Growth',
  'Early Growth',
];

export const PredictionsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    batches,
    zones,
    selectedFarmId,
    predictionsByBatchId,
    varietyConfigs,
  } = useHarvestIQ();

  const [zoneFilter, setZoneFilter] = useState<string>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('ALL');

  const scopedZones = useMemo(
    () => zones.filter((z) => selectedFarmId === 'ALL' || z.farmId === selectedFarmId),
    [zones, selectedFarmId]
  );

  const activeBatches = useMemo(
    () =>
      batches.filter((b) => {
        if (b.status === 'Harvested') return false;
        if (selectedFarmId !== 'ALL' && b.farmId !== selectedFarmId) return false;
        if (zoneFilter !== 'ALL' && b.zoneId !== zoneFilter) return false;
        if (stageFilter !== 'ALL' && predictionsByBatchId[b.id]?.currentStage !== stageFilter) {
          return false;
        }
        return true;
      }),
    [batches, selectedFarmId, zoneFilter, stageFilter, predictionsByBatchId]
  );

  const stageCounts = useMemo(() => {
    return STAGES.map((stage) => {
      const matching = activeBatches.filter(
        (b) => predictionsByBatchId[b.id]?.currentStage === stage
      );
      const yieldKg = matching.reduce(
        (sum, b) => sum + (predictionsByBatchId[b.id]?.estimatedYieldKg ?? 0),
        0
      );
      return {
        stage,
        batches: matching.length,
        estimatedYieldKg: Number(yieldKg.toFixed(1)),
      };
    });
  }, [activeBatches, predictionsByBatchId]);

  const yieldTimelineData = useMemo(() => {
    return [...activeBatches]
      .filter((b) => predictionsByBatchId[b.id]?.estimatedYieldKg !== null)
      .sort((a, b) =>
        (predictionsByBatchId[a.id]?.estimatedHarvestDate ?? '').localeCompare(
          predictionsByBatchId[b.id]?.estimatedHarvestDate ?? ''
        )
      )
      .map((b) => {
        const pred = predictionsByBatchId[b.id];
        return {
          batch: b.batchCode,
          date: formatDateShort(pred.estimatedHarvestDate),
          estimatedYieldKg: pred.estimatedYieldKg ?? 0,
        };
      });
  }, [activeBatches, predictionsByBatchId]);

  return (
    <div>
      <PageHeader
        title="Harvest Readiness & Predictions"
        subtitle="Illustrative maturity timelines, harvest windows, uncertainty ranges, and data completeness indicators."
        actions={
          <Link
            to="/settings"
            className="rounded-lg border border-[#D4DDD3] bg-white px-4 py-2 text-sm font-medium text-[#202923] hover:bg-[#F7F9F5] whitespace-nowrap"
          >
            Configure Variety Criteria
          </Link>
        }
      />

      <DemoNotice
        tone="amber"
        title="DEMONSTRATION MODEL – NOT VALIDATED WITH REAL FARM DATA"
        description="Stage 1 estimates rely on configurable lettuce variety baselines, zone sensor completeness, and simple thermal-drift heuristics. Trained Scikit-learn / XGBoost models are reserved for Stage 3."
        className="mb-6"
      />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DCE3DB] bg-white p-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Filter predictions by zone"
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="rounded-lg border border-[#D4DDD3] bg-[#F7F9F5] px-3 py-1.5 text-xs font-medium text-[#202923]"
          >
            <option value="ALL">All Growing Zones ({scopedZones.length})</option>
            {scopedZones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#F0F4EF] p-1">
            <button
              type="button"
              onClick={() => setStageFilter('ALL')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                stageFilter === 'ALL'
                  ? 'bg-white text-[#153F32] shadow-sm'
                  : 'text-[#606C65] hover:text-[#202923]'
              }`}
            >
              All Stages
            </button>
            {STAGES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStageFilter(st)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  stageFilter === st
                    ? 'bg-white text-[#153F32] shadow-sm'
                    : 'text-[#606C65] hover:text-[#202923]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stage Summary Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stageCounts.map((item) => (
          <div key={item.stage} className="rounded-xl border border-[#DCE3DB] bg-white p-4">
            <p className="text-xs font-medium text-[#606C65]">{item.stage}</p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[#202923]">
              {item.batches} batch{item.batches === 1 ? '' : 'es'}
            </p>
            <p className="mt-1 text-xs text-[#78847D] tabular-nums">
              {item.estimatedYieldKg > 0
                ? `${item.estimatedYieldKg} kg sample est.`
                : 'No yield label or 0 batches'}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-[#DCE3DB] bg-white p-5 lg:col-span-6">
          <h2 className="font-display text-base font-semibold text-[#202923]">
            Readiness Distribution by Maturity Stage
          </h2>
          <p className="text-xs text-[#606C65]">
            Grouped by configurable variety growth criteria (Demonstration)
          </p>
          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageCounts} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAEFEA" />
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#606C65' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#606C65' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #DCE3DB', fontSize: '12px' }}
                />
                <Bar dataKey="batches" name="Active Batches" fill="#153F32" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[#DCE3DB] bg-white p-5 lg:col-span-6">
          <h2 className="font-display text-base font-semibold text-[#202923]">
            Expected Yield by Illustrative Harvest Date
          </h2>
          <p className="text-xs text-[#606C65]">
            Shown only for batches with historical yield-weight labels (kg)
          </p>
          <div className="mt-4 h-60 w-full">
            {yieldTimelineData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-[#78847D]">
                No batches in the current filter carry historical yield labels.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={yieldTimelineData}
                  margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAEFEA" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#606C65' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#606C65' }} unit=" kg" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #DCE3DB', fontSize: '12px' }}
                  />
                  <Bar
                    dataKey="estimatedYieldKg"
                    name="Sample Est. Yield (kg)"
                    fill="#D7A65B"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Batch-wise Forecast Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-[#DCE3DB] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E3E9E2] px-5 py-4">
          <div>
            <h2 className="font-display text-base font-semibold text-[#202923]">
              Batch-Wise Harvest Forecasts (Demonstration Model)
            </h2>
            <p className="text-xs text-[#606C65]">
              Configured cycle criteria:{' '}
              {varietyConfigs
                .map((v) => `${v.variety} (${v.targetDaysMin}–${v.targetDaysMax}d)`)
                .join(' · ')}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#E3E9E2] bg-[#F7F9F5] text-xs font-semibold text-[#525E57]">
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Maturity Stage</th>
                <th className="px-4 py-3">Predicted Harvest Window</th>
                <th className="px-4 py-3 text-right">Days Left</th>
                <th className="px-4 py-3 text-right">Uncertainty</th>
                <th className="px-4 py-3 text-right">Data Completeness</th>
                <th className="px-4 py-3 text-right">Est. Yield</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF2ED]">
              {activeBatches.map((batch) => {
                const pred = predictionsByBatchId[batch.id];
                const zone = zones.find((z) => z.id === batch.zoneId);
                return (
                  <tr
                    key={batch.id}
                    onClick={() => navigate(`/batches/${batch.id}`)}
                    className="cursor-pointer transition-colors hover:bg-[#F7F9F5]"
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-[#153F32]">
                      {batch.batchCode} · {batch.variety}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#525E57]">
                      {zone?.name ?? batch.zoneId}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#202923]">{pred.currentStage}</td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums text-[#202923]">
                      {formatDateShort(pred.windowStart)} – {formatDateShort(pred.windowEnd)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-[#153F32]">
                      {pred.daysRemaining}d
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-[#525E57]">
                      ±{pred.uncertaintyDays}d
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-[#202923]">
                      {pred.dataCompletenessPct}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-[#202923]">
                      {pred.estimatedYieldKg !== null ? `${pred.estimatedYieldKg} kg` : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <StatusLabel state="info" label="Demo Estimate" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
