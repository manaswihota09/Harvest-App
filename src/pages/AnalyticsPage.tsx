import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download } from 'lucide-react';
import { useHarvestIQ } from '../context/HarvestIQContext';
import { DemoNotice, PageHeader } from '../components/common/UIPrimitives';
import { daysBetween, exportRowsToCsv } from '../utils/calculations';

export const AnalyticsPage: React.FC = () => {
  const { batches, zones, harvestRecords, selectedFarmId, predictionsByBatchId } = useHarvestIQ();

  const scopedRecords = useMemo(
    () =>
      harvestRecords.filter(
        (r) => selectedFarmId === 'ALL' || r.farmId === selectedFarmId
      ),
    [harvestRecords, selectedFarmId]
  );

  const scopedBatches = useMemo(
    () =>
      batches.filter((b) => selectedFarmId === 'ALL' || b.farmId === selectedFarmId),
    [batches, selectedFarmId]
  );

  const yieldComparisonData = useMemo(() => {
    return scopedRecords.map((r) => ({
      batch: r.batchCode,
      predictedKg: r.predictedYieldKg ?? 0,
      actualKg: r.actualWeightKg,
    }));
  }, [scopedRecords]);

  const zonePerformanceData = useMemo(() => {
    return zones
      .filter((z) => selectedFarmId === 'ALL' || z.farmId === selectedFarmId)
      .map((z) => {
        const zoneBatches = scopedBatches.filter((b) => b.zoneId === z.id);
        const harvested = scopedRecords.filter((r) => r.zoneId === z.id);
        const totalKg = harvested.reduce((sum, r) => sum + r.actualWeightKg, 0);
        return {
          zone: z.name.replace(' · ', ' '),
          totalBatches: zoneBatches.length,
          harvestedKg: Number(totalKg.toFixed(1)),
        };
      });
  }, [zones, selectedFarmId, scopedBatches, scopedRecords]);

  const exportBatchesCsv = () => {
    exportRowsToCsv(
      'harvestiq-batch-analytics.csv',
      [
        'Batch Code',
        'Variety',
        'Zone ID',
        'Planting Date',
        'Crop Age (Days)',
        'Plant Count',
        'Growth Stage',
        'Demo Harvest Window',
        'Estimated Yield (kg)',
        'Status',
      ],
      scopedBatches.map((b) => {
        const p = predictionsByBatchId[b.id];
        return [
          b.batchCode,
          b.variety,
          b.zoneId,
          b.plantingDate,
          p?.cropAgeDays ?? 0,
          b.plantCount,
          p?.currentStage ?? b.status,
          p ? `${p.windowStart} to ${p.windowEnd}` : '',
          p?.estimatedYieldKg ?? 'N/A',
          b.status,
        ];
      })
    );
  };

  return (
    <div>
      <PageHeader
        title="Farm Analytics & Reports"
        subtitle="Compare crop cycles, zone output, and expected vs. actual harvest weights. Export structured CSV datasets."
        actions={
          <button
            type="button"
            onClick={exportBatchesCsv}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2E24] whitespace-nowrap"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Export Batch Report CSV</span>
          </button>
        }
      />

      {/* Honest Model Evaluation Notice */}
      <DemoNotice
        title="Model Evaluation Status (Stage 1 Transparency)"
        description="Model evaluation will become available after sufficient actual harvest records have been collected. Synthetic demonstration data is never used to fabricate real-world accuracy metrics."
        className="mb-6"
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Predicted vs Actual Yield Chart */}
        <div className="rounded-xl border border-[#DCE3DB] bg-white p-5 lg:col-span-6">
          <h2 className="font-display text-base font-semibold text-[#202923]">
            Predicted vs. Actual Harvest Weight (kg)
          </h2>
          <p className="text-xs text-[#606C65]">
            Completed harvest cycles logged in Odisha pilot facilities
          </p>
          <div className="mt-4 h-64 w-full">
            {yieldComparisonData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-[#78847D]">
                Log completed harvests to view predicted vs. actual comparisons.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={yieldComparisonData}
                  margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAEFEA" />
                  <XAxis dataKey="batch" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit=" kg" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #DCE3DB', fontSize: '12px' }}
                  />
                  <Bar
                    dataKey="predictedKg"
                    name="Sample Estimate (kg)"
                    fill="#C9DBC9"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="actualKg"
                    name="Actual Logged Weight (kg)"
                    fill="#153F32"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Zone Performance */}
        <div className="rounded-xl border border-[#DCE3DB] bg-white p-5 lg:col-span-6">
          <h2 className="font-display text-base font-semibold text-[#202923]">
            Zone Throughput &amp; Logged Output
          </h2>
          <p className="text-xs text-[#606C65]">
            Total harvested kilograms recorded per growing zone
          </p>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={zonePerformanceData}
                margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EAEFEA" />
                <XAxis dataKey="zone" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} unit=" kg" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #DCE3DB', fontSize: '12px' }}
                />
                <Bar
                  dataKey="harvestedKg"
                  name="Logged Harvest (kg)"
                  fill="#287A55"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model Evaluation & Harvest Cycle Table */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-[#DCE3DB] bg-white p-5 lg:col-span-5">
          <h2 className="font-display text-base font-semibold text-[#202923]">
            Stage 3 Validation Readiness
          </h2>
          <p className="mt-2 text-sm text-[#4E5A53]">
            Model evaluation will become available after sufficient actual harvest records have been
            collected.
          </p>
          <dl className="mt-4 space-y-2.5 border-t border-[#EAEFEA] pt-4 text-xs">
            <div className="flex justify-between">
              <dt className="text-[#606C65]">Logged Actual Harvest Records</dt>
              <dd className="font-mono font-semibold tabular-nums text-[#153F32]">
                {scopedRecords.length}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#606C65]">Planned Maturity Metric</dt>
              <dd className="font-mono text-[#202923]">MAE (days) &amp; Window Coverage</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#606C65]">Planned Yield Metric</dt>
              <dd className="font-mono text-[#202923]">MAE (kg) via batch-grouped split</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-[#DCE3DB] bg-white p-5 lg:col-span-7">
          <h2 className="font-display text-base font-semibold text-[#202923]">
            Cycle Duration Summary
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#E3E9E2] text-[#606C65]">
                  <th className="py-2 pr-3">Batch</th>
                  <th className="py-2 pr-3">Variety</th>
                  <th className="py-2 pr-3 text-right">Days to Harvest</th>
                  <th className="py-2 pr-3 text-right">Predicted Window</th>
                  <th className="py-2 text-right">Actual Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2ED]">
                {scopedRecords.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 pr-3 font-mono font-semibold text-[#153F32]">
                      {r.batchCode}
                    </td>
                    <td className="py-2.5 pr-3 text-[#202923]">{r.variety}</td>
                    <td className="py-2.5 pr-3 text-right font-mono tabular-nums">
                      {daysBetween(r.plantingDate, r.actualHarvestDate)}d
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono text-[#606C65]">
                      {r.predictedWindowStart} → {r.predictedWindowEnd}
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold tabular-nums text-[#202923]">
                      {r.actualWeightKg} kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
