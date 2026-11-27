import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Download, Plus } from 'lucide-react';
import { useHarvestIQ } from '../context/HarvestIQContext';
import {
  EmptyState,
  Modal,
  PageHeader,
  StatusLabel,
} from '../components/common/UIPrimitives';
import {
  DEMO_REFERENCE_DATE,
  daysBetween,
  exportRowsToCsv,
  formatDateShort,
} from '../utils/calculations';

export const HarvestPage: React.FC = () => {
  const {
    batches,
    zones,
    harvestRecords,
    selectedFarmId,
    predictionsByBatchId,
    recordHarvest,
  } = useHarvestIQ();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [formState, setFormState] = useState({
    actualHarvestDate: DEMO_REFERENCE_DATE,
    actualWeightKg: '38.0',
    harvestedPlantCount: '165',
    notes: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const activeBatches = useMemo(
    () =>
      batches
        .filter(
          (b) =>
            b.status !== 'Harvested' &&
            (selectedFarmId === 'ALL' || b.farmId === selectedFarmId)
        )
        .sort(
          (a, b) =>
            (predictionsByBatchId[a.id]?.daysRemaining ?? 99) -
            (predictionsByBatchId[b.id]?.daysRemaining ?? 99)
        ),
    [batches, selectedFarmId, predictionsByBatchId]
  );

  const scopedRecords = useMemo(
    () =>
      harvestRecords.filter(
        (r) => selectedFarmId === 'ALL' || r.farmId === selectedFarmId
      ),
    [harvestRecords, selectedFarmId]
  );

  const openLogModal = (batchId?: string) => {
    const target =
      batches.find((b) => b.id === batchId) ?? activeBatches[0];
    if (!target) return;
    const pred = predictionsByBatchId[target.id];
    setSelectedBatchId(target.id);
    setErrorMsg('');
    setFormState({
      actualHarvestDate: DEMO_REFERENCE_DATE,
      actualWeightKg: pred?.estimatedYieldKg ? String(pred.estimatedYieldKg) : '34.5',
      harvestedPlantCount: String(target.plantCount),
      notes: '',
    });
    setModalOpen(true);
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = Number(formState.actualWeightKg);
    const count = Number(formState.harvestedPlantCount);
    if (!selectedBatchId) {
      setErrorMsg('Select an active crop batch.');
      return;
    }
    if (Number.isNaN(weight) || weight <= 0) {
      setErrorMsg('Harvested weight must be greater than 0 kg.');
      return;
    }
    if (Number.isNaN(count) || count <= 0) {
      setErrorMsg('Harvested plant count must be at least 1.');
      return;
    }

    recordHarvest({
      batchId: selectedBatchId,
      actualHarvestDate: formState.actualHarvestDate,
      actualWeightKg: weight,
      harvestedPlantCount: count,
      notes: formState.notes.trim(),
    });
    setModalOpen(false);
  };

  const handleExportCsv = () => {
    exportRowsToCsv(
      'harvestiq-harvest-history.csv',
      [
        'Record ID',
        'Batch Code',
        'Variety',
        'Zone',
        'Planting Date',
        'Predicted Window',
        'Actual Harvest Date',
        'Predicted Yield (kg)',
        'Actual Weight (kg)',
        'Harvested Plants',
        'Notes',
      ],
      scopedRecords.map((r) => [
        r.id,
        r.batchCode,
        r.variety,
        r.zoneId,
        r.plantingDate,
        `${r.predictedWindowStart} to ${r.predictedWindowEnd}`,
        r.actualHarvestDate,
        r.predictedYieldKg ?? 'N/A',
        r.actualWeightKg,
        r.harvestedPlantCount,
        r.notes,
      ])
    );
  };

  return (
    <div>
      <PageHeader
        title="Harvest Scheduling & History"
        subtitle="Coordinate upcoming lettuce harvests and log actual harvest dates and weights to support future Stage 3 model validation."
        actions={
          <>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4DDD3] bg-white px-3.5 py-2 text-sm font-medium text-[#202923] hover:bg-[#F7F9F5] whitespace-nowrap"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              disabled={activeBatches.length === 0}
              onClick={() => openLogModal()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2E24] disabled:opacity-50 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Record Actual Harvest</span>
            </button>
          </>
        }
      />

      {/* Upcoming Harvest Queue & Calendar Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-[#DCE3DB] bg-white p-5 lg:col-span-7">
          <h2 className="font-display text-base font-semibold text-[#202923]">
            Upcoming Harvest Queue ({activeBatches.length})
          </h2>
          <p className="text-xs text-[#606C65]">
            Ordered by illustrative days remaining until harvest window
          </p>

          {activeBatches.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="No active batches awaiting harvest"
                description="Register a new lettuce batch in Crop Batches to populate the harvest schedule."
              />
            </div>
          ) : (
            <div className="mt-4 divide-y divide-[#EEF2ED]">
              {activeBatches.map((batch) => {
                const pred = predictionsByBatchId[batch.id];
                const zone = zones.find((z) => z.id === batch.zoneId);
                return (
                  <div
                    key={batch.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <Link
                        to={`/batches/${batch.id}`}
                        className="font-mono text-sm font-semibold text-[#153F32] hover:underline"
                      >
                        {batch.batchCode} · {batch.variety}
                      </Link>
                      <p className="mt-0.5 text-xs text-[#606C65]">
                        {zone?.name ?? batch.zoneId} · {batch.plantCount} heads · Window{' '}
                        {formatDateShort(pred.windowStart)} – {formatDateShort(pred.windowEnd)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusLabel
                        state={
                          pred.currentStage === 'Ready for Harvest'
                            ? 'healthy'
                            : pred.currentStage === 'Approaching Maturity'
                            ? 'warning'
                            : 'info'
                        }
                        label={`${pred.daysRemaining}d remaining`}
                      />
                      <button
                        type="button"
                        onClick={() => openLogModal(batch.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#D4DDD3] bg-[#F7F9F5] px-3 py-1.5 text-xs font-medium text-[#153F32] hover:bg-[#E8F0E8] whitespace-nowrap"
                      >
                        <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Mark Harvested</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Harvest Calendar Summary */}
        <div className="rounded-xl border border-[#DCE3DB] bg-white p-5 lg:col-span-5">
          <h2 className="font-display text-base font-semibold text-[#202923]">
            Predicted Harvest Calendar Windows
          </h2>
          <p className="text-xs text-[#606C65]">
            Grouped by target harvest week (Demonstration estimates)
          </p>
          <div className="mt-4 space-y-3">
            {activeBatches.map((batch) => {
              const pred = predictionsByBatchId[batch.id];
              return (
                <div
                  key={batch.id}
                  className="flex items-center justify-between rounded-lg border border-[#E5EBE4] bg-[#F7F9F5] px-3.5 py-2.5 text-xs"
                >
                  <div>
                    <p className="font-semibold text-[#202923]">
                      {formatDateShort(pred.windowStart)} – {formatDateShort(pred.windowEnd)}
                    </p>
                    <p className="text-[#606C65]">
                      Batch {batch.batchCode} ({batch.variety})
                    </p>
                  </div>
                  <span className="font-mono font-semibold tabular-nums text-[#153F32]">
                    {pred.estimatedYieldKg !== null ? `~${pred.estimatedYieldKg} kg` : 'Unlabelled'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Completed Harvests & Expected vs Actual Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-[#DCE3DB] bg-white">
        <div className="border-b border-[#E3E9E2] px-5 py-4">
          <h2 className="font-display text-base font-semibold text-[#202923]">
            Completed Harvest Records ({scopedRecords.length})
          </h2>
          <p className="text-xs text-[#606C65]">
            Expected vs. actual harvest outcomes preserved for Stage 3 validation
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#E3E9E2] bg-[#F7F9F5] text-xs font-semibold text-[#525E57]">
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Variety &amp; Zone</th>
                <th className="px-4 py-3">Predicted Window</th>
                <th className="px-4 py-3">Actual Harvest Date</th>
                <th className="px-4 py-3 text-right">Cycle Days</th>
                <th className="px-4 py-3 text-right">Est. Yield</th>
                <th className="px-4 py-3 text-right">Actual Weight</th>
                <th className="px-4 py-3 text-right">Heads</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF2ED]">
              {scopedRecords.map((rec) => {
                const cycleDays = daysBetween(rec.plantingDate, rec.actualHarvestDate);
                return (
                  <tr key={rec.id} className="hover:bg-[#F7F9F5]">
                    <td className="px-4 py-3 font-mono font-semibold text-[#153F32]">
                      <Link to={`/batches/${rec.batchId}`} className="hover:underline">
                        {rec.batchCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#202923]">
                      {rec.variety} · {rec.zoneId}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums text-[#606C65]">
                      {formatDateShort(rec.predictedWindowStart)} –{' '}
                      {formatDateShort(rec.predictedWindowEnd)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold tabular-nums text-[#202923]">
                      {formatDateShort(rec.actualHarvestDate)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-[#202923]">
                      {cycleDays}d
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-[#606C65]">
                      {rec.predictedYieldKg !== null ? `${rec.predictedYieldKg} kg` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-semibold tabular-nums text-[#1E6B47]">
                      {rec.actualWeightKg} kg
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-[#202923]">
                      {rec.harvestedPlantCount}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#525E57] max-w-[240px] truncate">
                      {rec.notes || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Harvest Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Actual Harvest"
        subtitle="Logs actual yield weight and closes zone occupancy for the selected batch."
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          {errorMsg && (
            <p className="rounded-lg border border-[#F2C6CA] bg-[#FDF2F3] px-3 py-2 text-xs text-[#C82333]">
              {errorMsg}
            </p>
          )}
          <div>
            <label className="block text-xs font-medium text-[#202923]">Active Batch</label>
            <select
              value={selectedBatchId}
              onChange={(e) => {
                const nextId = e.target.value;
                setSelectedBatchId(nextId);
                const b = batches.find((item) => item.id === nextId);
                const p = predictionsByBatchId[nextId];
                if (b) {
                  setFormState((f) => ({
                    ...f,
                    harvestedPlantCount: String(b.plantCount),
                    actualWeightKg: p?.estimatedYieldKg ? String(p.estimatedYieldKg) : f.actualWeightKg,
                  }));
                }
              }}
              className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
            >
              {activeBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batchCode} · {b.variety} ({b.zoneId})
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#202923]">Actual Harvest Date</label>
              <input
                required
                type="date"
                value={formState.actualHarvestDate}
                onChange={(e) =>
                  setFormState((f) => ({ ...f, actualHarvestDate: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202923]">
                Actual Harvested Weight (kg)
              </label>
              <input
                required
                type="number"
                step="0.1"
                min="0.1"
                value={formState.actualWeightKg}
                onChange={(e) => setFormState((f) => ({ ...f, actualWeightKg: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202923]">
              Number of Harvested Plants
            </label>
            <input
              required
              type="number"
              min="1"
              value={formState.harvestedPlantCount}
              onChange={(e) =>
                setFormState((f) => ({ ...f, harvestedPlantCount: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202923]">Harvest Notes</label>
            <textarea
              rows={2}
              value={formState.notes}
              onChange={(e) => setFormState((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Head weight uniformity, culling, market channel..."
              className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-[#D4DDD3] px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2E24]"
            >
              Confirm &amp; Log Harvest
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
