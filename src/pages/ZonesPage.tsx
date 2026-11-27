import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Edit3, Layers, Plus, Sprout } from 'lucide-react';
import { useHarvestIQ } from '../context/HarvestIQContext';
import { GrowingZone, Rack } from '../types/domain';
import { EmptyState, Modal, PageHeader, StatusLabel } from '../components/common/UIPrimitives';
import { formatDateShort } from '../utils/calculations';

export const ZonesPage: React.FC = () => {
  const {
    farms,
    racks,
    zones,
    batches,
    devices,
    occupancyHistory,
    selectedFarmId,
    addRack,
    addZone,
    updateZone,
  } = useHarvestIQ();

  const [rackModalOpen, setRackModalOpen] = useState(false);
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<GrowingZone | null>(null);

  const [rackForm, setRackForm] = useState({
    farmId: farms[0]?.id ?? 'FARM-001',
    name: '',
    levelsCount: '3',
    systemType: 'NFT Channels' as Rack['systemType'],
    dimensionsLabel: '6.0m × 1.2m · 3 Tiers',
  });

  const [zoneForm, setZoneForm] = useState({
    rackId: racks[0]?.id ?? 'RACK-A',
    levelNumber: '1',
    name: '',
    capacityPlants: '180',
    lightingSpec: 'Full-Spectrum LED 250 µmol/m²/s (16h)',
    irrigationSpec: 'Closed-Loop NFT · 2.2 L/min',
    status: 'Active' as GrowingZone['status'],
  });

  const scopedFarms = useMemo(
    () => farms.filter((f) => selectedFarmId === 'ALL' || f.id === selectedFarmId),
    [farms, selectedFarmId]
  );

  const openCreateZone = (preselectedRack?: Rack) => {
    const targetRack = preselectedRack ?? racks[0];
    const existingLevels = zones.filter((z) => z.rackId === targetRack?.id).length;
    const nextLevel = existingLevels + 1;
    setEditingZone(null);
    setZoneForm({
      rackId: targetRack?.id ?? '',
      levelNumber: String(nextLevel),
      name: `${targetRack?.name ?? 'Rack'} · Level ${nextLevel}`,
      capacityPlants: '180',
      lightingSpec: 'Full-Spectrum LED 250 µmol/m²/s (16h)',
      irrigationSpec: 'Closed-Loop NFT · 2.2 L/min',
      status: 'Active',
    });
    setZoneModalOpen(true);
  };

  const openEditZone = (zone: GrowingZone) => {
    setEditingZone(zone);
    setZoneForm({
      rackId: zone.rackId,
      levelNumber: String(zone.levelNumber),
      name: zone.name,
      capacityPlants: String(zone.capacityPlants),
      lightingSpec: zone.lightingSpec,
      irrigationSpec: zone.irrigationSpec,
      status: zone.status,
    });
    setZoneModalOpen(true);
  };

  const handleRackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rackForm.name.trim()) return;
    addRack({
      farmId: rackForm.farmId,
      name: rackForm.name.trim(),
      levelsCount: Math.max(1, Number(rackForm.levelsCount) || 1),
      systemType: rackForm.systemType,
      dimensionsLabel: rackForm.dimensionsLabel.trim(),
    });
    setRackModalOpen(false);
    setRackForm((f) => ({ ...f, name: '' }));
  };

  const handleZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rack = racks.find((r) => r.id === zoneForm.rackId);
    if (!rack || !zoneForm.name.trim()) return;

    if (editingZone) {
      updateZone({
        ...editingZone,
        name: zoneForm.name.trim(),
        levelNumber: Number(zoneForm.levelNumber) || 1,
        capacityPlants: Number(zoneForm.capacityPlants) || 120,
        lightingSpec: zoneForm.lightingSpec.trim(),
        irrigationSpec: zoneForm.irrigationSpec.trim(),
        status: zoneForm.status,
      });
    } else {
      addZone({
        farmId: rack.farmId,
        rackId: rack.id,
        rackName: rack.name,
        levelNumber: Number(zoneForm.levelNumber) || 1,
        name: zoneForm.name.trim(),
        capacityPlants: Number(zoneForm.capacityPlants) || 120,
        lightingSpec: zoneForm.lightingSpec.trim(),
        irrigationSpec: zoneForm.irrigationSpec.trim(),
        status: zoneForm.status,
      });
    }
    setZoneModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Racks, Levels & Growing Zones"
        subtitle="Hierarchy: Farm → Rack → Level → Growing Zone. Sensors bind to physical zones while crop batches occupy zones across defined cycles."
        actions={
          <>
            <button
              type="button"
              onClick={() => setRackModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4DDD3] bg-white px-4 py-2 text-sm font-medium text-[#202923] hover:bg-[#F7F9F5] whitespace-nowrap"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add Rack</span>
            </button>
            <button
              type="button"
              onClick={() => openCreateZone()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2E24] whitespace-nowrap"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Create Growing Zone</span>
            </button>
          </>
        }
      />

      <div className="space-y-8">
        {scopedFarms.map((farm) => {
          const farmRacks = racks.filter((r) => r.farmId === farm.id);
          return (
            <section key={farm.id} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#DDE4DC] pb-2">
                <div>
                  <h2 className="font-display text-lg font-semibold text-[#153F32]">
                    {farm.name}
                  </h2>
                  <p className="text-xs text-[#606C65]">
                    {farm.location} · {farmRacks.length} configured rack(s)
                  </p>
                </div>
              </div>

              {farmRacks.length === 0 ? (
                <EmptyState
                  title="No racks configured for this farm"
                  description="Add Rack A or Rack B to begin structuring levels and growing zones."
                  actionLabel="Add First Rack"
                  onAction={() => {
                    setRackForm((f) => ({ ...f, farmId: farm.id }));
                    setRackModalOpen(true);
                  }}
                />
              ) : (
                <div className="space-y-5">
                  {farmRacks.map((rack) => {
                    const rackZones = zones
                      .filter((z) => z.rackId === rack.id)
                      .sort((a, b) => a.levelNumber - b.levelNumber);

                    return (
                      <div
                        key={rack.id}
                        className="rounded-xl border border-[#DCE3DB] bg-white p-5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAEFEA] pb-3.5">
                          <div className="flex items-center gap-2.5">
                            <Layers className="h-4 w-4 text-[#287A55]" aria-hidden="true" />
                            <div>
                              <h3 className="font-display text-base font-semibold text-[#202923]">
                                {rack.name}
                              </h3>
                              <p className="text-xs text-[#606C65]">
                                {rack.systemType} · {rack.dimensionsLabel}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => openCreateZone(rack)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#D4DDD3] px-3 py-1.5 text-xs font-medium text-[#153F32] hover:bg-[#F7F9F5] whitespace-nowrap"
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Add Level / Zone</span>
                          </button>
                        </div>

                        {rackZones.length === 0 ? (
                          <p className="py-6 text-center text-sm text-[#78847D]">
                            No growing zones created on {rack.name} yet.
                          </p>
                        ) : (
                          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {rackZones.map((zone) => {
                              const activeBatch = batches.find(
                                (b) => b.zoneId === zone.id && b.status !== 'Harvested'
                              );
                              const zoneDevices = devices.filter((d) => d.zoneId === zone.id);
                              const pastOccupancies = occupancyHistory.filter(
                                (o) => o.zoneId === zone.id && o.endDate !== null
                              );

                              return (
                                <div
                                  key={zone.id}
                                  className="flex flex-col justify-between rounded-lg border border-[#E2E8E0] bg-[#F7F9F5] p-4"
                                >
                                  <div>
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <p className="font-mono text-[11px] text-[#78847D]">
                                          {zone.id} · Level {zone.levelNumber}
                                        </p>
                                        <h4 className="mt-0.5 font-display text-sm font-semibold text-[#202923]">
                                          {zone.name}
                                        </h4>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => openEditZone(zone)}
                                        aria-label={`Edit ${zone.name}`}
                                        className="rounded p-1 text-[#606C65] hover:bg-white hover:text-[#153F32]"
                                      >
                                        <Edit3 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>

                                    <p className="mt-2 text-xs text-[#525E57]">
                                      Capacity: <span className="font-mono tabular-nums">{zone.capacityPlants}</span> heads ·{' '}
                                      {zone.lightingSpec}
                                    </p>
                                    <p className="mt-0.5 text-xs text-[#606C65]">{zone.irrigationSpec}</p>

                                    <div className="mt-3 border-t border-[#E2E8E0] pt-3 space-y-2 text-xs">
                                      <div className="flex items-start gap-2">
                                        <Sprout className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#287A55]" aria-hidden="true" />
                                        <div>
                                          <span className="text-[#606C65]">Current Batch: </span>
                                          {activeBatch ? (
                                            <Link
                                              to={`/batches/${activeBatch.id}`}
                                              className="font-semibold text-[#153F32] hover:underline"
                                            >
                                              {activeBatch.batchCode} ({activeBatch.variety})
                                            </Link>
                                          ) : (
                                            <span className="text-[#78847D]">Unoccupied</span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-start gap-2">
                                        <Cpu className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#153F32]" aria-hidden="true" />
                                        <div>
                                          <span className="text-[#606C65]">Assigned Sensors ({zoneDevices.length}): </span>
                                          {zoneDevices.length > 0 ? (
                                            <span className="font-mono text-[11px] text-[#202923]">
                                              {zoneDevices.map((d) => d.id).join(', ')}
                                            </span>
                                          ) : (
                                            <Link to="/devices" className="text-[#B4690E] hover:underline">
                                              Assign sensor
                                            </Link>
                                          )}
                                        </div>
                                      </div>

                                      {pastOccupancies.length > 0 && (
                                        <p className="text-[11px] text-[#78847D]">
                                          Prior cycle: {pastOccupancies[0].batchCode} (
                                          {formatDateShort(pastOccupancies[0].startDate)} –{' '}
                                          {formatDateShort(pastOccupancies[0].endDate ?? '')})
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="mt-3 flex items-center justify-between border-t border-[#E2E8E0] pt-2.5">
                                    <StatusLabel
                                      state={zone.status === 'Active' ? 'healthy' : 'inactive'}
                                      label={zone.status}
                                    />
                                    <Link
                                      to="/environment"
                                      className="text-xs font-medium text-[#287A55] hover:underline"
                                    >
                                      Telemetry →
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Add Rack Modal */}
      <Modal
        open={rackModalOpen}
        onClose={() => setRackModalOpen(false)}
        title="Add Growing Rack"
        subtitle="Create a physical rack structure inside a registered farm."
      >
        <form onSubmit={handleRackSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#202923]">Target Farm</label>
            <select
              value={rackForm.farmId}
              onChange={(e) => setRackForm((f) => ({ ...f, farmId: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
            >
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#202923]">Rack Name</label>
              <input
                required
                type="text"
                value={rackForm.name}
                onChange={(e) => setRackForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Rack D"
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202923]">Hydroponic System</label>
              <select
                value={rackForm.systemType}
                onChange={(e) =>
                  setRackForm((f) => ({ ...f, systemType: e.target.value as Rack['systemType'] }))
                }
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
              >
                <option value="NFT Channels">NFT Channels</option>
                <option value="Deep Water Culture">Deep Water Culture</option>
                <option value="Ebb & Flow">Ebb &amp; Flow</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202923]">Dimensions / Tiers</label>
            <input
              type="text"
              value={rackForm.dimensionsLabel}
              onChange={(e) => setRackForm((f) => ({ ...f, dimensionsLabel: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRackModalOpen(false)}
              className="rounded-lg border border-[#D4DDD3] px-4 py-2 text-sm font-medium text-[#202923]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2E24]"
            >
              Create Rack
            </button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Zone Modal */}
      <Modal
        open={zoneModalOpen}
        onClose={() => setZoneModalOpen(false)}
        title={editingZone ? `Edit ${editingZone.name}` : 'Create Growing Zone'}
        subtitle="Sensors and crop batches attach at the Growing Zone level."
      >
        <form onSubmit={handleZoneSubmit} className="space-y-4">
          {!editingZone && (
            <div>
              <label className="block text-xs font-medium text-[#202923]">Parent Rack</label>
              <select
                value={zoneForm.rackId}
                onChange={(e) => setZoneForm((f) => ({ ...f, rackId: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
              >
                {racks.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({farms.find((f) => f.id === r.farmId)?.name ?? r.farmId})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#202923]">Zone Label</label>
              <input
                required
                type="text"
                value={zoneForm.name}
                onChange={(e) => setZoneForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Rack A · Level 4"
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202923]">Level #</label>
              <input
                required
                type="number"
                min={1}
                value={zoneForm.levelNumber}
                onChange={(e) => setZoneForm((f) => ({ ...f, levelNumber: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#202923]">Plant Capacity</label>
              <input
                required
                type="number"
                min={10}
                value={zoneForm.capacityPlants}
                onChange={(e) => setZoneForm((f) => ({ ...f, capacityPlants: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202923]">Operational Status</label>
              <select
                value={zoneForm.status}
                onChange={(e) =>
                  setZoneForm((f) => ({ ...f, status: e.target.value as GrowingZone['status'] }))
                }
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Idle">Idle</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202923]">Lighting Specification</label>
            <input
              type="text"
              value={zoneForm.lightingSpec}
              onChange={(e) => setZoneForm((f) => ({ ...f, lightingSpec: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202923]">Irrigation Specification</label>
            <input
              type="text"
              value={zoneForm.irrigationSpec}
              onChange={(e) => setZoneForm((f) => ({ ...f, irrigationSpec: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm focus:border-[#153F32] focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setZoneModalOpen(false)}
              className="rounded-lg border border-[#D4DDD3] px-4 py-2 text-sm font-medium text-[#202923]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2E24]"
            >
              {editingZone ? 'Save Zone' : 'Create Zone'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
