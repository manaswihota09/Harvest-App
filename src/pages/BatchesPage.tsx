import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpDown, Edit3, Plus, Search, Trash2 } from 'lucide-react';
import { useHarvestIQ } from '../context/HarvestIQContext';
import { CropBatch, LettuceVariety } from '../types/domain';
import {
  ConfirmDialog,
  DemoNotice,
  EmptyState,
  Modal,
  PageHeader,
  StatusLabel,
} from '../components/common/UIPrimitives';
import { DEMO_REFERENCE_DATE, formatDateShort } from '../utils/calculations';

export const BatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    batches,
    zones,
    selectedFarmId,
    predictionsByBatchId,
    addBatch,
    updateBatch,
    deleteBatch,
  } = useHarvestIQ();

  const [search, setSearch] = useState('');
  const [varietyFilter, setVarietyFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE_ONLY');
  const [sortBy, setSortBy] = useState<'age_desc' | 'harvest_asc' | 'code_asc'>('harvest_asc');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<CropBatch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CropBatch | null>(null);
  const [formError, setFormError] = useState('');

  const [formState, setFormState] = useState({
    batchCode: '',
    variety: 'Romaine' as LettuceVariety,
    zoneId: zones[0]?.id ?? 'RACK-A-LEVEL-2',
    plantingDate: DEMO_REFERENCE_DATE,
    plantCount: '160',
    hasHistoricalYieldLabel: true,
    notes: '',
  });

  const scopedZones = useMemo(
    () => zones.filter((z) => selectedFarmId === 'ALL' || z.farmId === selectedFarmId),
    [zones, selectedFarmId]
  );

  const filteredBatches = useMemo(() => {
    const q = search.trim().toLowerCase();
    return batches
      .filter((b) => {
        if (selectedFarmId !== 'ALL' && b.farmId !== selectedFarmId) return false;
        if (varietyFilter !== 'ALL' && b.variety !== varietyFilter) return false;
        if (statusFilter === 'ACTIVE_ONLY' && b.status === 'Harvested') return false;
        if (
          statusFilter !== 'ALL' &&
          statusFilter !== 'ACTIVE_ONLY' &&
          b.status !== statusFilter
        ) {
          return false;
        }
        if (q) {
          const z = zones.find((zn) => zn.id === b.zoneId);
          const match =
            b.batchCode.toLowerCase().includes(q) ||
            b.variety.toLowerCase().includes(q) ||
            (z?.name.toLowerCase().includes(q) ?? false);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const pa = predictionsByBatchId[a.id];
        const pb = predictionsByBatchId[b.id];
        if (sortBy === 'age_desc') return (pb?.cropAgeDays ?? 0) - (pa?.cropAgeDays ?? 0);
        if (sortBy === 'code_asc') return a.batchCode.localeCompare(b.batchCode);
        return (pa?.daysRemaining ?? 99) - (pb?.daysRemaining ?? 99);
      });
  }, [
    batches,
    selectedFarmId,
    varietyFilter,
    statusFilter,
    search,
    sortBy,
    zones,
    predictionsByBatchId,
  ]);

  const openCreateModal = () => {
    setEditingBatch(null);
    setFormError('');
    const nextNum = batches.length + 1;
    setFormState({
      batchCode: `L-${String(nextNum).padStart(3, '0')}`,
      variety: 'Romaine',
      zoneId: scopedZones[0]?.id ?? zones[0]?.id ?? 'RACK-A-LEVEL-2',
      plantingDate: DEMO_REFERENCE_DATE,
      plantCount: '160',
      hasHistoricalYieldLabel: true,
      notes: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (batch: CropBatch) => {
    setEditingBatch(batch);
    setFormError('');
    setFormState({
      batchCode: batch.batchCode,
      variety: batch.variety,
      zoneId: batch.zoneId,
      plantingDate: batch.plantingDate,
      plantCount: String(batch.plantCount),
      hasHistoricalYieldLabel: batch.hasHistoricalYieldLabel,
      notes: batch.notes ?? '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = Number(formState.plantCount);
    const zone = zones.find((z) => z.id === formState.zoneId);

    if (!formState.batchCode.trim()) {
      setFormError('Batch identifier (e.g. L-007) is required.');
      return;
    }
    if (!zone) {
      setFormError('Please select a valid growing zone.');
      return;
    }
    if (Number.isNaN(count) || count <= 0) {
      setFormError('Plant count must be a positive integer.');
      return;
    }

    if (editingBatch) {
      updateBatch({
        ...editingBatch,
        batchCode: formState.batchCode.trim(),
        variety: formState.variety,
        zoneId: zone.id,
        farmId: zone.farmId,
        plantingDate: formState.plantingDate,
        plantCount: count,
        hasHistoricalYieldLabel: formState.hasHistoricalYieldLabel,
        notes: formState.notes.trim(),
      });
    } else {
      addBatch({
        batchCode: formState.batchCode.trim(),
        cropName: 'Lettuce',
        variety: formState.variety,
        farmId: zone.farmId,
        zoneId: zone.id,
        plantingDate: formState.plantingDate,
        plantCount: count,
        hasHistoricalYieldLabel: formState.hasHistoricalYieldLabel,
        notes: formState.notes.trim(),
      });
    }
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Crop Batch Management"
        subtitle="Manage hydroponic lettuce batches across racks and growing zones. Telemetry inherits automatically from each zone."
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2E24] whitespace-nowrap"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Register Lettuce Batch</span>
          </button>
        }
      />

      <DemoNotice
        title="Illustrative Demonstration Harvest Windows"
        description="Estimated harvest windows and sample yields (shown only where historical yield labels exist) are Stage 1 demonstration calculations."
        className="mb-6"
      />

      {/* Search & Filters */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DCE3DB] bg-white p-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#78847D]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search batch ID, variety, zone..."
              aria-label="Search crop batches"
              className="w-56 rounded-lg border border-[#D4DDD3] bg-[#F7F9F5] py-1.5 pl-8 pr-3 text-xs text-[#202923] focus:border-[#153F32] focus:bg-white focus:outline-none"
            />
          </div>

          <select
            aria-label="Filter by lettuce variety"
            value={varietyFilter}
            onChange={(e) => setVarietyFilter(e.target.value)}
            className="rounded-lg border border-[#D4DDD3] bg-[#F7F9F5] px-3 py-1.5 text-xs font-medium text-[#202923]"
          >
            <option value="ALL">All Varieties</option>
            <option value="Romaine">Romaine</option>
            <option value="Butterhead">Butterhead</option>
            <option value="Crisphead">Crisphead</option>
            <option value="Lollo Rosso">Lollo Rosso</option>
          </select>

          <select
            aria-label="Filter by batch status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[#D4DDD3] bg-[#F7F9F5] px-3 py-1.5 text-xs font-medium text-[#202923]"
          >
            <option value="ACTIVE_ONLY">Active &amp; Ready Batches</option>
            <option value="ALL">All Batches (Incl. Harvested)</option>
            <option value="Ready">Ready / Approaching</option>
            <option value="Attention">Requires Attention</option>
            <option value="Harvested">Harvested</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-[#78847D]" aria-hidden="true" />
          <select
            aria-label="Sort batches"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-lg border border-[#D4DDD3] bg-[#F7F9F5] px-3 py-1.5 text-xs font-medium text-[#202923]"
          >
            <option value="harvest_asc">Soonest Harvest First</option>
            <option value="age_desc">Oldest Crop Age First</option>
            <option value="code_asc">Batch ID (A–Z)</option>
          </select>
        </div>
      </div>

      {filteredBatches.length === 0 ? (
        <EmptyState
          title="No matching lettuce batches"
          description="Adjust your filters or register a new hydroponic lettuce batch in a growing zone."
          actionLabel="Register Lettuce Batch"
          onAction={openCreateModal}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#DCE3DB] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#E3E9E2] bg-[#F7F9F5] text-xs font-semibold text-[#525E57]">
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Variety</th>
                  <th className="px-4 py-3">Growing Zone</th>
                  <th className="px-4 py-3">Planted</th>
                  <th className="px-4 py-3 text-right">Age</th>
                  <th className="px-4 py-3 text-right">Plants</th>
                  <th className="px-4 py-3">Growth Stage</th>
                  <th className="px-4 py-3">Demo Harvest Window</th>
                  <th className="px-4 py-3 text-right">Est. Yield</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2ED]">
                {filteredBatches.map((batch) => {
                  const zone = zones.find((z) => z.id === batch.zoneId);
                  const pred = predictionsByBatchId[batch.id];

                  return (
                    <tr
                      key={batch.id}
                      className="transition-colors hover:bg-[#F7F9F5]"
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-[#153F32]">
                        <Link to={`/batches/${batch.id}`} className="hover:underline">
                          {batch.batchCode}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-medium text-[#202923]">{batch.variety}</td>
                      <td className="px-4 py-3 text-xs text-[#525E57]">
                        {zone?.name ?? batch.zoneId}
                      </td>
                      <td className="px-4 py-3 text-xs tabular-nums text-[#525E57]">
                        {formatDateShort(batch.plantingDate)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-[#202923]">
                        {pred?.cropAgeDays ?? 0}d
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-[#202923]">
                        {batch.plantCount}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#202923]">
                        {pred?.currentStage ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs tabular-nums text-[#525E57]">
                        {batch.status === 'Harvested'
                          ? 'Completed'
                          : `${formatDateShort(pred?.windowStart ?? '')} – ${formatDateShort(
                              pred?.windowEnd ?? ''
                            )}`}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-[#202923]">
                        {pred?.estimatedYieldKg !== null && pred?.estimatedYieldKg !== undefined
                          ? `${pred.estimatedYieldKg} kg`
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusLabel
                          state={
                            batch.status === 'Ready'
                              ? 'healthy'
                              : batch.status === 'Attention'
                              ? 'warning'
                              : batch.status === 'Harvested'
                              ? 'inactive'
                              : 'info'
                          }
                          label={batch.status}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/batches/${batch.id}`)}
                            className="rounded px-2 py-1 text-xs font-medium text-[#153F32] hover:bg-[#E8F0E8]"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(batch)}
                            aria-label={`Edit batch ${batch.batchCode}`}
                            className="rounded p-1.5 text-[#606C65] hover:bg-[#E8F0E8] hover:text-[#153F32]"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(batch)}
                            aria-label={`Delete batch ${batch.batchCode}`}
                            className="rounded p-1.5 text-[#606C65] hover:bg-[#FDF2F3] hover:text-[#C82333]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Batch Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBatch ? `Edit Batch ${editingBatch.batchCode}` : 'Register Lettuce Batch'}
        subtitle="New batches automatically inherit simulated telemetry from their assigned growing zone."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <p className="rounded-lg border border-[#F2C6CA] bg-[#FDF2F3] px-3 py-2 text-xs text-[#C82333]">
              {formError}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#202923]">Batch Identifier</label>
              <input
                required
                type="text"
                value={formState.batchCode}
                onChange={(e) => setFormState((s) => ({ ...s, batchCode: e.target.value }))}
                placeholder="e.g. L-007"
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 font-mono text-sm focus:border-[#153F32] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202923]">Lettuce Variety</label>
              <select
                value={formState.variety}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, variety: e.target.value as LettuceVariety }))
                }
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
              >
                <option value="Romaine">Romaine</option>
                <option value="Butterhead">Butterhead</option>
                <option value="Crisphead">Crisphead</option>
                <option value="Lollo Rosso">Lollo Rosso</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#202923]">Growing Zone</label>
            <select
              value={formState.zoneId}
              onChange={(e) => setFormState((s) => ({ ...s, zoneId: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} (Cap: {z.capacityPlants})
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#202923]">Planting Date</label>
              <input
                required
                type="date"
                value={formState.plantingDate}
                onChange={(e) => setFormState((s) => ({ ...s, plantingDate: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202923]">Plant Count (Heads)</label>
              <input
                required
                type="number"
                min={1}
                max={1000}
                value={formState.plantCount}
                onChange={(e) => setFormState((s) => ({ ...s, plantCount: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5 rounded-lg border border-[#E2E8E0] bg-[#F7F9F5] p-3 text-xs text-[#4E5A53]">
            <input
              type="checkbox"
              checked={formState.hasHistoricalYieldLabel}
              onChange={(e) =>
                setFormState((s) => ({ ...s, hasHistoricalYieldLabel: e.target.checked }))
              }
              className="mt-0.5 accent-[#153F32]"
            />
            <span>
              Prior harvest weight records exist for this variety &amp; zone (enables sample yield
              weight estimation).
            </span>
          </label>

          <div>
            <label className="block text-xs font-medium text-[#202923]">Notes</label>
            <textarea
              rows={2}
              value={formState.notes}
              onChange={(e) => setFormState((s) => ({ ...s, notes: e.target.value }))}
              placeholder="Transplant vigor, nutrient recipe notes..."
              className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-[#D4DDD3] px-4 py-2 text-sm font-medium text-[#202923]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2E24]"
            >
              {editingBatch ? 'Save Changes' : 'Create Batch'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteBatch(deleteTarget.id);
        }}
        title={`Delete Batch ${deleteTarget?.batchCode ?? ''}?`}
        message="This removes the crop batch and its local zone occupancy link from the Stage 1 demonstration store."
        confirmLabel="Delete Batch"
        destructive
      />
    </div>
  );
};
