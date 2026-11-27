import React, { useMemo, useState } from 'react';
import { Code2, Plus } from 'lucide-react';
import { useHarvestIQ } from '../context/HarvestIQContext';
import { harvestService } from '../services/harvestService';
import { ConnectionMethod, Device, DeviceStatus, SensorType } from '../types/domain';
import {
  DemoNotice,
  Modal,
  PageHeader,
  StatusLabel,
} from '../components/common/UIPrimitives';
import { DEMO_REFERENCE_DATE, formatTimestampIST } from '../utils/calculations';

export const DevicesPage: React.FC = () => {
  const {
    devices,
    zones,
    farms,
    selectedFarmId,
    addDevice,
    assignDeviceToZone,
    toggleDeviceConnection,
  } = useHarvestIQ();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [payloadDevice, setPayloadDevice] = useState<Device | null>(null);

  const [newDevice, setNewDevice] = useState({
    id: `TEMP-${String(devices.length + 1).padStart(3, '0')}`,
    manufacturer: 'VayuMetrics IoT (Demo)',
    model: 'VM-AirNode Pro',
    sensorType: 'temperature' as SensorType,
    unit: '°C',
    zoneId: zones[0]?.id ?? 'RACK-A-LEVEL-2',
    connectionMethod: 'MQTT' as ConnectionMethod,
    lastReadingValue: '22.1',
    calibrationNote: 'Stage 1 simulated registration (Demo)',
  });

  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      if (selectedFarmId !== 'ALL' && d.farmId !== selectedFarmId) return false;
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
      return true;
    });
  }, [devices, selectedFarmId, statusFilter]);

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevice.id.trim()) return;
    const zone = zones.find((z) => z.id === newDevice.zoneId);
    addDevice({
      id: newDevice.id.trim().toUpperCase(),
      manufacturer: newDevice.manufacturer.trim(),
      model: newDevice.model.trim(),
      sensorType: newDevice.sensorType,
      unit: newDevice.unit.trim(),
      farmId: zone?.farmId ?? farms[0]?.id ?? 'FARM-001',
      zoneId: zone ? zone.id : null,
      connectionMethod: newDevice.connectionMethod,
      status: zone ? 'Connected' : 'Integration pending',
      lastReadingValue: newDevice.lastReadingValue ? Number(newDevice.lastReadingValue) : null,
      lastCommunicationAt: `${DEMO_REFERENCE_DATE}T09:30:00+05:30`,
      calibrationNote: newDevice.calibrationNote.trim(),
    });
    setAddModalOpen(false);
  };

  const statusToSemantic = (status: DeviceStatus) => {
    if (status === 'Connected') return 'healthy';
    if (status === 'No recent data' || status === 'Integration pending') return 'warning';
    return 'critical';
  };

  return (
    <div>
      <PageHeader
        title="Device Registry & Connectivity"
        subtitle="Hardware-agnostic registry connecting existing third-party sensors to physical growing zones. No API keys or device secrets are stored or exposed in the UI."
        actions={
          <button
            type="button"
            onClick={() => {
              setNewDevice((d) => ({
                ...d,
                id: `SENS-${String(devices.length + 1).padStart(3, '0')}`,
              }));
              setAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2E24] whitespace-nowrap"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Register Demo Sensor</span>
          </button>
        }
      />

      <DemoNotice
        title="Simulated Hardware Registry (Stage 1)"
        description="Live REST, MQTT, Webhook, Modbus TCP, and LoRaWAN gateway adapters are scheduled for Stage 2. Sensors assign to physical Growing Zones rather than permanently to crop batches."
        className="mb-6"
      />

      {/* Status Filter Strip */}
      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-[#DCE3DB] bg-white p-3">
        {(['ALL', 'Connected', 'No recent data', 'Offline', 'Integration pending'] as const).map(
          (st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#153F32] text-white'
                  : 'bg-[#F7F9F5] text-[#525E57] hover:bg-[#E8F0E8]'
              }`}
            >
              {st === 'ALL' ? `All Devices (${devices.length})` : st}
            </button>
          )
        )}
      </div>

      {/* Device Table */}
      <div className="overflow-hidden rounded-xl border border-[#DCE3DB] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#E3E9E2] bg-[#F7F9F5] text-xs font-semibold text-[#525E57]">
                <th className="px-4 py-3">Device ID</th>
                <th className="px-4 py-3">Manufacturer &amp; Model</th>
                <th className="px-4 py-3">Variable</th>
                <th className="px-4 py-3">Assigned Growing Zone</th>
                <th className="px-4 py-3">Adapter</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Last Simulated Reading</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF2ED]">
              {filteredDevices.map((device) => (
                <tr key={device.id} className="hover:bg-[#F7F9F5]">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#153F32]">
                    {device.id}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-[#202923]">{device.model}</p>
                    <p className="text-[11px] text-[#606C65]">{device.manufacturer}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#202923]">
                    {device.sensorType} ({device.unit})
                  </td>
                  <td className="px-4 py-3">
                    <select
                      aria-label={`Assign zone for ${device.id}`}
                      value={device.zoneId ?? ''}
                      onChange={(e) =>
                        assignDeviceToZone(device.id, e.target.value ? e.target.value : null)
                      }
                      className="rounded-lg border border-[#D4DDD3] bg-white px-2.5 py-1 text-xs text-[#202923] focus:border-[#153F32] focus:outline-none"
                    >
                      <option value="">Unassigned</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#525E57]">
                    {device.connectionMethod}
                  </td>
                  <td className="px-4 py-3">
                    <StatusLabel
                      state={statusToSemantic(device.status)}
                      label={device.status}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-mono text-xs font-semibold tabular-nums text-[#202923]">
                      {device.lastReadingValue !== null
                        ? `${device.lastReadingValue} ${device.unit}`
                        : '—'}
                    </p>
                    <p className="text-[11px] text-[#78847D]">
                      {formatTimestampIST(device.lastCommunicationAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPayloadDevice(device)}
                        title="Inspect standardized ingestion payload"
                        className="inline-flex items-center gap-1 rounded border border-[#D4DDD3] px-2 py-1 text-xs font-medium text-[#153F32] hover:bg-[#E8F0E8]"
                      >
                        <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Schema</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleDeviceConnection(device.id)}
                        className="rounded border border-[#D4DDD3] px-2.5 py-1 text-xs font-medium text-[#202923] hover:bg-white"
                      >
                        {device.status === 'Connected' ? 'Simulate Offline' : 'Reconnect'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Demo Sensor Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register Demonstration Sensor"
        subtitle="Stage 1 simulation only — do not enter real production credentials or API secrets."
      >
        <form onSubmit={handleAddDevice} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#202923]">Device ID</label>
              <input
                required
                type="text"
                value={newDevice.id}
                onChange={(e) => setNewDevice((d) => ({ ...d, id: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202923]">Sensor Type</label>
              <select
                value={newDevice.sensorType}
                onChange={(e) => {
                  const type = e.target.value as SensorType;
                  const unitMap: Record<SensorType, string> = {
                    temperature: '°C',
                    humidity: '% RH',
                    par: 'µmol/m²/s',
                    ph: 'pH',
                    ec: 'mS/cm',
                    water_temp: '°C',
                    water_level: 'cm',
                    water_flow: 'L/min',
                    co2: 'ppm',
                    camera: 'frame',
                  };
                  setNewDevice((d) => ({ ...d, sensorType: type, unit: unitMap[type] }));
                }}
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
              >
                <option value="temperature">Temperature</option>
                <option value="humidity">Humidity</option>
                <option value="par">PAR / Light</option>
                <option value="ph">pH</option>
                <option value="ec">Electrical Conductivity (EC)</option>
                <option value="water_temp">Water Temperature</option>
                <option value="water_flow">Water Flow</option>
                <option value="co2">CO₂</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#202923]">Manufacturer (Demo)</label>
              <input
                required
                type="text"
                value={newDevice.manufacturer}
                onChange={(e) => setNewDevice((d) => ({ ...d, manufacturer: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202923]">Model</label>
              <input
                required
                type="text"
                value={newDevice.model}
                onChange={(e) => setNewDevice((d) => ({ ...d, model: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#202923]">Assign to Growing Zone</label>
              <select
                value={newDevice.zoneId}
                onChange={(e) => setNewDevice((d) => ({ ...d, zoneId: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
              >
                <option value="">Leave Unassigned</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202923]">Connection Method</label>
              <select
                value={newDevice.connectionMethod}
                onChange={(e) =>
                  setNewDevice((d) => ({
                    ...d,
                    connectionMethod: e.target.value as ConnectionMethod,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
              >
                <option value="MQTT">MQTT</option>
                <option value="REST API">REST API</option>
                <option value="HTTPS Webhook">HTTPS Webhook</option>
                <option value="LoRaWAN Gateway">LoRaWAN Gateway</option>
                <option value="Modbus TCP">Modbus TCP</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="rounded-lg border border-[#D4DDD3] px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2E24]"
            >
              Add Demo Device
            </button>
          </div>
        </form>
      </Modal>

      {/* Standardized Adapter Schema Modal */}
      <Modal
        open={Boolean(payloadDevice)}
        onClose={() => setPayloadDevice(null)}
        title={`Standardized Adapter Payload · ${payloadDevice?.id ?? ''}`}
        subtitle="Unified Stage 2 internal ingestion structure normalized across manufacturer formats."
      >
        {payloadDevice && (
          <div className="space-y-4">
            <pre className="overflow-x-auto rounded-lg bg-[#15221B] p-4 font-mono text-xs text-[#E8F0E8]">
              {JSON.stringify(harvestService.toStandardizedPayload(payloadDevice), null, 2)}
            </pre>
            <p className="text-xs text-[#606C65]">
              Calibration note: {payloadDevice.calibrationNote}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};
