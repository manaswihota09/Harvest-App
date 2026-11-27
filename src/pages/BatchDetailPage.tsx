import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowLeft, CalendarCheck } from 'lucide-react';
import { useHarvestIQ } from '../context/HarvestIQContext';
import { harvestService } from '../services/harvestService';
import {
  DemoNotice,
  EmptyState,
  Modal,
  PageHeader,
  StatusLabel,
} from '../components/common/UIPrimitives';
import { DEMO_REFERENCE_DATE, formatDateShort } from '../utils/calculations';

export const BatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    batches,
    farms,
    zones,
    devices,
    observations,
    alerts,
    harvestRecords,
    occupancyHistory,
    predictionsByBatchId,
    recordHarvest,
  } = useHarvestIQ();

  const batch = batches.find((b) => b.id === id);
  const [harvestModalOpen, setHarvestModalOpen] = useState(false);
  const [harvestForm, setHarvestForm] = useState({
    actualHarvestDate: DEMO_REFERENCE_DATE,
    actualWeightKg: '',
    harvestedPlantCount: '',
    notes: '',
  });

  const batchObservations = useMemo(
    () => observations.filter((o) => o.batchId === id).sort((a, b) => a.dayNumber - b.dayNumber),
    [observations, id]
  );

  if (!batch) {
    return (
      <EmptyState
        title="Crop batch not found"
        description="The requested batch may have been deleted or does not exist in local storage."
        actionLabel="Back to Crop Batches"
        onAction={() => navigate('/batches')}
      />
    );
  }

  const farm = farms.find((f) => f.id === batch.farmId);
  const zone = zones.find((z) => z.id === batch.zoneId);
  const pred = predictionsByBatchId[batch.id];
  const zoneDevices = devices.filter((d) => d.zoneId === batch.zoneId);
  const envSeries = harvestService.getZoneEnvironmentSeries(batch.zoneId);
  const batchAlerts = alerts.filter(
    (a) => a.batchId === batch.id || (a.zoneId === batch.zoneId && !a.isResolved)
  );
  const harvestRecord = harvestRecords.find((r) => r.batchId === batch.id);
  const occupancy = occupancyHistory.find((o) => o.batchId === batch.id);

  const openHarvestModal = () => {
    setHarvestForm({
      actualHarvestDate: DEMO_REFERENCE_DATE,
      actualWeightKg: pred?.estimatedYieldKg ? String(pred.estimatedYieldKg) : '35.0',
      harvestedPlantCount: String(batch.plantCount),
      notes: '',
    });
    setHarvestModalOpen(true);
  };

  const handleHarvestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wt = Number(harvestForm.actualWeightKg);
    const cnt = Number(harvestForm.harvestedPlantCount);
    if (Number.isNaN(wt) || wt <= 0 || Number.isNaN(cnt) || cnt <= 0) return;
    recordHarvest({
      batchId: batch.id,
      actualHarvestDate: harvestForm.actualHarvestDate,
      actualWeightKg: wt,
      harvestedPlantCount: cnt,
      notes: harvestForm.notes.trim(),
    });
    setHarvestModalOpen(false);
  };

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/batches"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#153F32] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>All Crop Batches</span>
        </Link>
      </div>

      <PageHeader
        title={`Batch ${batch.batchCode} · ${batch.variety} Lettuce`}
        subtitle={`${farm?.name ?? batch.farmId} · ${zone?.name ?? batch.zoneId} · Planted ${formatDateShort(
          batch.plantingDate
        )}`}
        actions={
          batch.status !== 'Harvested' ? (
            <button
              type="button"
              onClick={openHarvestModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2E24] whitespace-nowrap"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              <span>Record Actual Harvest</span>
            </button>
          ) : undefined
        }
      />

      <DemoNotice
        tone="amber"
        title="DEMONSTRATION MODEL – NOT VALIDATED WITH REAL FARM DATA"
        description="Predictions, uncertainty bounds, and sample plant growth observations below illustrate Stage 1 architecture only."
        className="mb-6"
      />

      {/* Prominent Harvest Prediction & Batch Summary */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-[#C9DBC9] bg-white p-6 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAEFEA] pb-3">
            <div>
              <p className="text-xs font-semibold text-[#287A55]">
                Illustrative Harvest Prediction Card
              </p>
              <h2 className="mt-0.5 font-display text-lg font-semibold text-[#202923]">
                {batch.status === 'Harvested'
                  ? 'Harvest Completed'
                  : `${formatDateShort(pred.windowStart)} – ${formatDateShort(pred.windowEnd)}`}
              </h2>
            </div>
            <StatusLabel
              state={
                batch.status === 'Harvested'
                  ? 'inactive'
                  : pred.currentStage === 'Ready for Harvest'
                  ? 'healthy'
                  : 'info'
              }
              label={pred.currentStage}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-[#606C65]">Est. Midpoint Date</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-[#202923]">
                {formatDateShort(pred.estimatedHarvestDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#606C65]">Days Remaining</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-[#153F32]">
                {batch.status === 'Harvested' ? '0d' : `${pred.daysRemaining} days`}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#606C65]">Uncertainty Band</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-[#202923]">
                ±{pred.uncertaintyDays} days
              </p>
            </div>
            <div>
              <p className="text-xs text-[#606C65]">Data Completeness</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-[#202923]">
                {pred.dataCompletenessPct}%
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-[#EAEFEA] pt-4">
            <p className="text-xs font-semibold text-[#202923]">
              Factors Contributing to Illustrative Estimate
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-[#525E57]">
              {pred.factors.map((f, i) => (
                <li key={i}>· {f}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-[#DCE3DB] bg-white p-6 lg:col-span-5">
          <h2 className="font-display text-base font-semibold text-[#202923]">
            Batch Profile &amp; Zone Occupancy
          </h2>
          <dl className="mt-4 space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-[#F0F4EF] pb-2">
              <dt className="text-[#606C65]">Crop &amp; Variety</dt>
              <dd className="font-medium text-[#202923]">
                {batch.cropName} · {batch.variety}
              </dd>
            </div>
            <div className="flex justify-between border-b border-[#F0F4EF] pb-2">
              <dt className="text-[#606C65]">Physical Growing Zone</dt>
              <dd className="font-medium text-[#202923]">{zone?.name ?? batch.zoneId}</dd>
            </div>
            <div className="flex justify-between border-b border-[#F0F4EF] pb-2">
              <dt className="text-[#606C65]">Zone Occupancy Period</dt>
              <dd className="font-mono tabular-nums text-[#202923]">
                {formatDateShort(occupancy?.startDate ?? batch.plantingDate)} →{' '}
                {occupancy?.endDate ? formatDateShort(occupancy.endDate) : 'Active'}
              </dd>
            </div>
            <div className="flex justify-between border-b border-[#F0F4EF] pb-2">
              <dt className="text-[#606C65]">Crop Age / Plant Count</dt>
              <dd className="font-mono tabular-nums text-[#202923]">
                {pred.cropAgeDays} days · {batch.plantCount} heads
              </dd>
            </div>
            <div className="flex justify-between border-b border-[#F0F4EF] pb-2">
              <dt className="text-[#606C65]">Estimated Yield (Sample)</dt>
              <dd className="font-mono tabular-nums text-[#202923]">
                {pred.estimatedYieldKg !== null ? `${pred.estimatedYieldKg} kg` : 'Insufficient labels'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#606C65]">Zone Sensors Linked</dt>
              <dd className="font-mono text-[#153F32]">
                {zoneDevices.length > 0 ? zoneDevices.map((d) => d.id).join(', ') : 'None assigned'}
              </dd>
            </div>
          </dl>
          {batch.notes && (
            <p className="mt-4 rounded-lg bg-[#F7F9F5] p-3 text-xs text-[#4E5A53]">
              {batch.notes}
            </p>
          )}
        </div>
      </div>

      {/* Charts: Growth Progression & Environmental History */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-[#DCE3DB] bg-white p-5 lg:col-span-6">
          <h2 className="font-display text-base font-semibold text-[#202923]">
            Sample Growth Observations
          </h2>
          <p className="text-xs text-[#606C65]">
            Plant height (cm) and leaf count progression (labelled sample observations)
          </p>

          {batchObservations.length === 0 ? (
            <p className="py-12 text-center text-xs text-[#78847D]">
              No manual plant measurements have been logged for Batch {batch.batchCode} yet.
            </p>
          ) : (
            <div className="mt-4 h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={batchObservations} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAEFEA" />
                  <XAxis dataKey="dayNumber" tickFormatter={(d) => `D${d}`} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #DCE3DB', fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgHeightCm"
                    name="Height (cm)"
                    stroke="#153F32"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgLeafCount"
                    name="Leaf Count"
                    stroke="#287A55"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[#DCE3DB] bg-white p-5 lg:col-span-6">
          <h2 className="font-display text-base font-semibold text-[#202923]">
            Zone-Associated Environmental History (Simulated)
          </h2>
          <p className="text-xs text-[#606C65]">
            Derived from sensors assigned to {zone?.name ?? batch.zoneId} during occupancy
          </p>
          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={envSeries} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAEFEA" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="t" domain={[16, 28]} tick={{ fontSize: 11 }} unit="°C" />
                <YAxis yAxisId="ec" orientation="right" domain={[1.0, 2.4]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #DCE3DB', fontSize: '12px' }}
                />
                <Line
                  yAxisId="t"
                  type="monotone"
                  dataKey="temperature"
                  name="Air Temp (°C)"
                  stroke="#153F32"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="ec"
                  type="monotone"
                  dataKey="ec"
                  name="EC (mS/cm)"
                  stroke="#D7A65B"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actual Harvest Record & Alerts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#DCE3DB] bg-white p-5">
          <h2 className="font-display text-base font-semibold text-[#202923]">
            Actual Harvest Record
          </h2>
          {harvestRecord ? (
            <dl className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-[#606C65]">Actual Harvest Date</dt>
                <dd className="font-mono font-semibold text-[#153F32]">
                  {formatDateShort(harvestRecord.actualHarvestDate)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#606C65]">Actual Harvested Weight</dt>
                <dd className="font-mono font-semibold tabular-nums text-[#202923]">
                  {harvestRecord.actualWeightKg} kg
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#606C65]">Harvested Head Count</dt>
                <dd className="font-mono tabular-nums text-[#202923]">
                  {harvestRecord.harvestedPlantCount} heads
                </dd>
              </div>
              {harvestRecord.notes && (
                <p className="pt-2 text-[#525E57]">{harvestRecord.notes}</p>
              )}
            </dl>
          ) : (
            <div className="mt-4">
              <p className="text-xs text-[#606C65]">
                This batch has not been harvested yet. Recording actual harvest date and weight
                builds ground-truth data for Stage 3 validation.
              </p>
              <button
                type="button"
                onClick={openHarvestModal}
                className="mt-4 rounded-lg border border-[#153F32] px-3.5 py-1.5 text-xs font-medium text-[#153F32] hover:bg-[#E8F0E8]"
              >
                Log Actual Harvest
              </button>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[#DCE3DB] bg-white p-5">
          <h2 className="font-display text-base font-semibold text-[#202923]">
            Batch &amp; Zone Alerts ({batchAlerts.length})
          </h2>
          {batchAlerts.length === 0 ? (
            <p className="mt-4 text-xs text-[#606C65]">
              No active anomalies or sensor faults flagged for this batch.
            </p>
          ) : (
            <div className="mt-3 space-y-2.5">
              {batchAlerts.map((a) => (
                <div key={a.id} className="rounded-lg border border-[#E5EBE4] bg-[#F7F9F5] p-3 text-xs">
                  <StatusLabel
                    state={a.severity === 'Critical' ? 'critical' : a.severity === 'Attention' ? 'warning' : 'info'}
                    label={a.title}
                  />
                  <p className="mt-1 text-[#525E57]">{a.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Record Harvest Modal */}
      <Modal
        open={harvestModalOpen}
        onClose={() => setHarvestModalOpen(false)}
        title={`Record Harvest · Batch ${batch.batchCode}`}
        subtitle="Preserves actual harvest ground truth for future model validation."
      >
        <form onSubmit={handleHarvestSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#202923]">Actual Harvest Date</label>
              <input
                required
                type="date"
                value={harvestForm.actualHarvestDate}
                onChange={(e) =>
                  setHarvestForm((f) => ({ ...f, actualHarvestDate: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202923]">Net Weight (kg)</label>
              <input
                required
                type="number"
                step="0.1"
                min="0.5"
                value={harvestForm.actualWeightKg}
                onChange={(e) => setHarvestForm((f) => ({ ...f, actualWeightKg: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202923]">Harvested Head Count</label>
            <input
              required
              type="number"
              min="1"
              value={harvestForm.harvestedPlantCount}
              onChange={(e) =>
                setHarvestForm((f) => ({ ...f, harvestedPlantCount: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202923]">Harvest Notes</label>
            <textarea
              rows={2}
              value={harvestForm.notes}
              onChange={(e) => setHarvestForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Leaf quality, culling notes, buyer delivery..."
              className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setHarvestModalOpen(false)}
              className="rounded-lg border border-[#D4DDD3] px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2E24]"
            >
              Save Harvest Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
