import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useHarvestIQ } from '../context/HarvestIQContext';
import { harvestService } from '../services/harvestService';
import { DemoNotice, PageHeader, StatusLabel } from '../components/common/UIPrimitives';
import { formatTimestampIST } from '../utils/calculations';

export const EnvironmentPage: React.FC = () => {
  const { zones, devices, batches, varietyConfigs, selectedFarmId } = useHarvestIQ();

  const scopedZones = useMemo(
    () => zones.filter((z) => selectedFarmId === 'ALL' || z.farmId === selectedFarmId),
    [zones, selectedFarmId]
  );

  const [selectedZoneId, setSelectedZoneId] = useState<string>(
    scopedZones[0]?.id ?? 'RACK-A-LEVEL-2'
  );
  const [windowDays, setWindowDays] = useState<7 | 14>(14);

  const activeZone =
    scopedZones.find((z) => z.id === selectedZoneId) ?? scopedZones[0] ?? zones[0];

  const zoneSeries = useMemo(() => {
    const raw = harvestService.getZoneEnvironmentSeries(activeZone?.id ?? 'RACK-A-LEVEL-2');
    return raw.slice(-windowDays);
  }, [activeZone, windowDays]);

  const latest = zoneSeries[zoneSeries.length - 1];
  const zoneDevices = devices.filter((d) => d.zoneId === activeZone?.id);
  const staleOrOffline = zoneDevices.filter((d) => d.status !== 'Connected');

  const occupyingBatch = batches.find(
    (b) => b.zoneId === activeZone?.id && b.status !== 'Harvested'
  );
  const targetConfig =
    varietyConfigs.find((v) => v.variety === occupyingBatch?.variety) ?? varietyConfigs[0];

  const zoneComparison = useMemo(() => {
    return scopedZones.map((z) => {
      const s = harvestService.getZoneEnvironmentSeries(z.id);
      const last = s[s.length - 1];
      return {
        zone: z.name.replace(' · ', ' '),
        temperature: last?.temperature ?? 0,
        humidity: last?.humidity ?? 0,
        ec: last?.ec ?? 0,
      };
    });
  }, [scopedZones]);

  const metrics = [
    {
      label: 'Air Temperature',
      value: latest?.temperature !== null && latest?.temperature !== undefined ? `${latest.temperature} °C` : 'Missing',
      range: `${targetConfig.tempMin}–${targetConfig.tempMax} °C`,
      ok:
        latest?.temperature !== null &&
        latest?.temperature !== undefined &&
        latest.temperature >= targetConfig.tempMin &&
        latest.temperature <= targetConfig.tempMax,
    },
    {
      label: 'Relative Humidity',
      value: latest?.humidity !== null && latest?.humidity !== undefined ? `${latest.humidity} %` : 'Missing',
      range: `${targetConfig.humidityMin}–${targetConfig.humidityMax} %`,
      ok:
        latest?.humidity !== null &&
        latest?.humidity !== undefined &&
        latest.humidity >= targetConfig.humidityMin &&
        latest.humidity <= targetConfig.humidityMax,
    },
    {
      label: 'PAR / Light',
      value: latest?.par !== null && latest?.par !== undefined ? `${latest.par} µmol/m²/s` : 'Missing',
      range: `${targetConfig.parMin}–${targetConfig.parMax} µmol/m²/s`,
      ok:
        latest?.par !== null &&
        latest?.par !== undefined &&
        latest.par >= targetConfig.parMin &&
        latest.par <= targetConfig.parMax,
    },
    {
      label: 'Nutrient pH',
      value: latest?.ph !== null && latest?.ph !== undefined ? `${latest.ph} pH` : 'Missing',
      range: `${targetConfig.phMin}–${targetConfig.phMax} pH`,
      ok:
        latest?.ph !== null &&
        latest?.ph !== undefined &&
        latest.ph >= targetConfig.phMin &&
        latest.ph <= targetConfig.phMax,
    },
    {
      label: 'Electrical Conductivity',
      value: latest?.ec !== null && latest?.ec !== undefined ? `${latest.ec} mS/cm` : 'Missing',
      range: `${targetConfig.ecMin}–${targetConfig.ecMax} mS/cm`,
      ok:
        latest?.ec !== null &&
        latest?.ec !== undefined &&
        latest.ec >= targetConfig.ecMin &&
        latest.ec <= targetConfig.ecMax,
    },
    {
      label: 'Water Temperature',
      value: latest?.waterTemp !== null && latest?.waterTemp !== undefined ? `${latest.waterTemp} °C` : 'Missing',
      range: '18.0–22.0 °C',
      ok:
        latest?.waterTemp !== null &&
        latest?.waterTemp !== undefined &&
        latest.waterTemp >= 18 &&
        latest.waterTemp <= 22,
    },
    {
      label: 'CO₂ Concentration',
      value: latest?.co2 !== null && latest?.co2 !== undefined ? `${latest.co2} ppm` : 'Missing / Stale',
      range: '600–900 ppm',
      ok: latest?.co2 !== null && latest?.co2 !== undefined,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Environmental Monitoring"
        subtitle="Zone-level microclimate and nutrient solution telemetry with operating-range checks and freshness warnings."
      />

      <DemoNotice
        title="Simulated Sensor Telemetry (Stage 1)"
        description="Readings shown are deterministic Stage 1 demonstration series. Automated irrigation or actuator control is intentionally disabled."
        className="mb-6"
      />

      {/* Zone & Window Selector */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DCE3DB] bg-white p-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="env-zone-select" className="text-xs font-semibold text-[#202923]">
            Growing Zone:
          </label>
          <select
            id="env-zone-select"
            value={activeZone?.id ?? ''}
            onChange={(e) => setSelectedZoneId(e.target.value)}
            className="rounded-lg border border-[#D4DDD3] bg-[#F7F9F5] px-3 py-1.5 text-xs font-medium text-[#202923]"
          >
            {scopedZones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>

          <span className="text-xs text-[#606C65]">
            Active Crop:{' '}
            <strong className="text-[#202923]">
              {occupyingBatch
                ? `${occupyingBatch.batchCode} (${occupyingBatch.variety})`
                : 'Unoccupied'}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-[#F0F4EF] p-1">
          <button
            type="button"
            onClick={() => setWindowDays(7)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              windowDays === 7 ? 'bg-white text-[#153F32] shadow-sm' : 'text-[#606C65]'
            }`}
          >
            7 Days
          </button>
          <button
            type="button"
            onClick={() => setWindowDays(14)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              windowDays === 14 ? 'bg-white text-[#153F32] shadow-sm' : 'text-[#606C65]'
            }`}
          >
            14 Days
          </button>
        </div>
      </div>

      {/* Missing data / Stale warning if any sensor in this zone is not Connected */}
      {staleOrOffline.length > 0 && (
        <DemoNotice
          tone="amber"
          title={`Data Freshness Warning in ${activeZone?.name}`}
          description={`${staleOrOffline
            .map((d) => `${d.id} (${d.status}, last seen ${formatTimestampIST(d.lastCommunicationAt)})`)
            .join('; ')}. Verify physical sensor communication before relying on affected variables.`}
          className="mb-6"
        />
      )}

      {/* 7 Environmental KPI Tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-[#DCE3DB] bg-white p-4">
            <p className="text-xs font-medium text-[#606C65]">{m.label}</p>
            <p className="mt-2 font-mono text-lg font-semibold tabular-nums text-[#202923]">
              {m.value}
            </p>
            <p className="mt-1 text-[11px] text-[#78847D] tabular-nums">Target: {m.range}</p>
            <div className="mt-2">
              <StatusLabel
                state={m.value.includes('Missing') ? 'critical' : m.ok ? 'healthy' : 'warning'}
                label={
                  m.value.includes('Missing')
                    ? 'Missing'
                    : m.ok
                    ? 'In Range'
                    : 'Out of Range'
                }
              />
            </div>
          </div>
        ))}
      </div>

      {/* Historical Trends Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-[#DCE3DB] bg-white p-5 lg:col-span-6">
          <h2 className="font-display text-base font-semibold text-[#202923]">
            Air &amp; Water Temperature History ({activeZone?.name})
          </h2>
          <p className="text-xs text-[#606C65]">Simulated °C readings over {windowDays} days</p>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={zoneSeries} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAEFEA" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[16, 28]} tick={{ fontSize: 11 }} unit="°C" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #DCE3DB', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Air Temp (°C)"
                  stroke="#153F32"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="waterTemp"
                  name="Water Temp (°C)"
                  stroke="#287A55"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[#DCE3DB] bg-white p-5 lg:col-span-6">
          <h2 className="font-display text-base font-semibold text-[#202923]">
            Nutrient pH &amp; EC Trend ({activeZone?.name})
          </h2>
          <p className="text-xs text-[#606C65]">Solution stability across monitoring interval</p>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={zoneSeries} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAEFEA" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="ph" domain={[5.0, 6.8]} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="ec" orientation="right" domain={[1.0, 2.4]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #DCE3DB', fontSize: '12px' }}
                />
                <Line yAxisId="ph" type="monotone" dataKey="ph" name="pH" stroke="#153F32" strokeWidth={2} />
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

      {/* Zone-wise Comparison */}
      <div className="mt-6 rounded-xl border border-[#DCE3DB] bg-white p-5">
        <h2 className="font-display text-base font-semibold text-[#202923]">
          Zone-Wise Latest Air Temperature Comparison
        </h2>
        <p className="text-xs text-[#606C65]">
          Compare thermal uniformity across racks and tiers (°C)
        </p>
        <div className="mt-4 h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={zoneComparison} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAEFEA" />
              <XAxis dataKey="zone" tick={{ fontSize: 10 }} />
              <YAxis domain={[15, 28]} tick={{ fontSize: 11 }} unit="°C" />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #DCE3DB', fontSize: '12px' }}
              />
              <Bar dataKey="temperature" name="Air Temp (°C)" fill="#287A55" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
