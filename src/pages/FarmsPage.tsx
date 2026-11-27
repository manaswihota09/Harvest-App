import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Edit3, MapPin, Plus } from 'lucide-react';
import { useHarvestIQ } from '../context/HarvestIQContext';
import { Farm } from '../types/domain';
import { Modal, PageHeader } from '../components/common/UIPrimitives';
import { formatDateShort } from '../utils/calculations';

export const FarmsPage: React.FC = () => {
  const { farms, racks, zones, batches, devices, addFarm, updateFarm, setSelectedFarmId } =
    useHarvestIQ();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [formState, setFormState] = useState({
    name: '',
    location: '',
    state: 'Odisha',
    facilityType: 'Controlled Indoor Vertical Farm',
    totalAreaSqM: '250',
    establishedDate: '2026-11-27',
    managerName: '',
    notes: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const openCreateModal = () => {
    setEditingFarm(null);
    setErrorMsg('');
    setFormState({
      name: '',
      location: '',
      state: 'Odisha',
      facilityType: 'Controlled Indoor Vertical Farm',
      totalAreaSqM: '250',
      establishedDate: '2026-11-27',
      managerName: '',
      notes: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (farm: Farm) => {
    setEditingFarm(farm);
    setErrorMsg('');
    setFormState({
      name: farm.name,
      location: farm.location,
      state: farm.state,
      facilityType: farm.facilityType,
      totalAreaSqM: String(farm.totalAreaSqM),
      establishedDate: farm.establishedDate,
      managerName: farm.managerName,
      notes: farm.notes ?? '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const area = Number(formState.totalAreaSqM);
    if (!formState.name.trim() || !formState.location.trim() || !formState.managerName.trim()) {
      setErrorMsg('Farm name, location, and operator name are required.');
      return;
    }
    if (Number.isNaN(area) || area <= 0) {
      setErrorMsg('Total floor area must be a positive number.');
      return;
    }

    if (editingFarm) {
      updateFarm({
        ...editingFarm,
        name: formState.name.trim(),
        location: formState.location.trim(),
        state: formState.state.trim(),
        facilityType: formState.facilityType.trim(),
        totalAreaSqM: area,
        establishedDate: formState.establishedDate,
        managerName: formState.managerName.trim(),
        notes: formState.notes.trim(),
      });
    } else {
      addFarm({
        name: formState.name.trim(),
        location: formState.location.trim(),
        state: formState.state.trim(),
        facilityType: formState.facilityType.trim(),
        totalAreaSqM: area,
        establishedDate: formState.establishedDate,
        managerName: formState.managerName.trim(),
        notes: formState.notes.trim(),
      });
    }
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Farm Management"
        subtitle="Register vertical farming facilities and inspect rack, zone, batch, and sensor allocations."
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2E24] whitespace-nowrap"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Register Farm</span>
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {farms.map((farm) => {
          const farmRacks = racks.filter((r) => r.farmId === farm.id);
          const farmZones = zones.filter((z) => z.farmId === farm.id);
          const farmBatches = batches.filter(
            (b) => b.farmId === farm.id && b.status !== 'Harvested'
          );
          const farmDevices = devices.filter((d) => d.farmId === farm.id);

          return (
            <div
              key={farm.id}
              className="flex flex-col justify-between rounded-xl border border-[#DCE3DB] bg-white p-6"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs text-[#606C65]">
                      {farm.id} · {farm.facilityType}
                    </p>
                    <h2 className="mt-1 font-display text-xl font-semibold text-[#202923]">
                      {farm.name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditModal(farm)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4DDD3] px-3 py-1.5 text-xs font-medium text-[#202923] hover:bg-[#F7F9F5] whitespace-nowrap"
                  >
                    <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#606C65]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[#287A55]" aria-hidden="true" />
                    {farm.location}
                  </span>
                  <span>Operator: {farm.managerName}</span>
                  <span className="tabular-nums">{farm.totalAreaSqM} m²</span>
                  <span>Since {formatDateShort(farm.establishedDate)}</span>
                </div>

                {farm.notes && (
                  <p className="mt-3 text-sm text-[#4E5A53]">{farm.notes}</p>
                )}

                <div className="mt-5 grid grid-cols-4 gap-3 border-t border-[#EAEFEA] pt-4">
                  <div>
                    <p className="text-[11px] text-[#78847D]">Racks</p>
                    <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-[#202923]">
                      {farmRacks.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#78847D]">Zones</p>
                    <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-[#202923]">
                      {farmZones.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#78847D]">Active Batches</p>
                    <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-[#287A55]">
                      {farmBatches.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#78847D]">Sensors</p>
                    <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-[#202923]">
                      {farmDevices.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#EAEFEA] pt-4">
                <Link
                  to="/zones"
                  onClick={() => setSelectedFarmId(farm.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#153F32] hover:underline"
                >
                  <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Configure Racks &amp; Zones →</span>
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setSelectedFarmId(farm.id)}
                  className="text-xs font-medium text-[#606C65] hover:text-[#153F32]"
                >
                  Filter Dashboard to Farm
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingFarm ? `Edit ${editingFarm.name}` : 'Register New Farm'}
        subtitle="Stage 1 demonstration records persist locally in your browser."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <p className="rounded-lg border border-[#F2C6CA] bg-[#FDF2F3] px-3 py-2 text-xs text-[#C82333]">
              {errorMsg}
            </p>
          )}
          <div>
            <label className="block text-xs font-medium text-[#202923]">Farm Name</label>
            <input
              required
              type="text"
              value={formState.name}
              onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
              placeholder="e.g. Puri Coastal HydroGreens"
              className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#202923]">City / Location</label>
              <input
                required
                type="text"
                value={formState.location}
                onChange={(e) => setFormState((s) => ({ ...s, location: e.target.value }))}
                placeholder="e.g. Cuttack, Odisha"
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202923]">Operator Name</label>
              <input
                required
                type="text"
                value={formState.managerName}
                onChange={(e) => setFormState((s) => ({ ...s, managerName: e.target.value }))}
                placeholder="e.g. Rajesh Panda"
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#202923]">Facility Type</label>
              <select
                value={formState.facilityType}
                onChange={(e) => setFormState((s) => ({ ...s, facilityType: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
              >
                <option value="Controlled Indoor Vertical Farm">Controlled Indoor Vertical Farm</option>
                <option value="Modular Container Hydroponics">Modular Container Hydroponics</option>
                <option value="Hybrid Greenhouse Vertical Rack">Hybrid Greenhouse Vertical Rack</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202923]">Floor Area (m²)</label>
              <input
                required
                type="number"
                min={10}
                value={formState.totalAreaSqM}
                onChange={(e) => setFormState((s) => ({ ...s, totalAreaSqM: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202923]">Notes</label>
            <textarea
              rows={2}
              value={formState.notes}
              onChange={(e) => setFormState((s) => ({ ...s, notes: e.target.value }))}
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
              {editingFarm ? 'Save Changes' : 'Create Farm'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
