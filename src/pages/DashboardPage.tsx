import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowRight, Plus } from 'lucide-react';
import { useHarvestIQ } from '../context/HarvestIQContext';
import { harvestService } from '../services/harvestService';
import { DemoNotice, PageHeader, StatusLabel } from '../components/common/UIPrimitives';
import { formatDateShort } from '../utils/calculations';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    farms,
    zones,
    batches,
    devices,
    alerts,
    selectedFarmId,
    predictionsByBatchId,
  } = useHarvestIQ();

  const [zoneFilter, setZoneFilter] = useState<string>('ALL');
  const [rangeDays, setRangeDays] = useState<7 | 14>(14);
  const [stageFilter, setStageFilter] = useState<string>('ALL');

  const scopedZones = useMemo(
    () =>
      zones.filter((z) => selectedFarmId === 'ALL' || z.farmId === selectedFarmId),
    [zones, selectedFarmId]
  );

  const scopedBatches = useMemo(
    () =>
      batches.filter((b) => {
        if (b.status === 'Harvested') return false;
        if (selectedFarmId !== 'ALL' && b.farmId !== selectedFarmId) return false;
        if (zoneFilter !== 'ALL' && b.zoneId !== zoneFilter) return false;
        if (stageFilter !== 'ALL') {
          const pred = predictionsByBatchId[b.id];
          if (pred?.currentStage !== stageFilter) return false;
        }
        return true;
      }),
    [batches, selectedFarmId, zoneFilter, stageFilter, predictionsByBatchId]
  );

  const scopedDevices = useMemo(
    () =>
      devices.filter((d) => {
        if (selectedFarmId !== 'ALL' && d.farmId !== selectedFarmId) return false;
        if (zoneFilter !== 'ALL' && d.zoneId !== zoneFilter) return false;
        return true;
      }),
    [devices, selectedFarmId, zoneFilter]
  );

  const scopedAlerts = useMemo(
    () =>
      alerts.filter((a) => {
        if (a.isResolved) return false;
        if (selectedFarmId !== 'ALL' && a.farmId !== selectedFarmId) return false;
        if (zoneFilter !== 'ALL' && a.zoneId !== zoneFilter) return false;
        return true;
      }),
    [alerts, selectedFarmId, zoneFilter]
  );

  const kpis = useMemo(() => {
    const approachingOrReady = scopedBatches.filter((b) => {
      const stage = predictionsByBatchId[b.id]?.currentStage;
      return stage === 'Approaching Maturity' || stage === 'Ready for Harvest';
    }).length;

    const connectedDevices = scopedDevices.filter((d) => d.status === 'Connected').length;
    const attentionDevices = scopedDevices.filter(
      (d) => d.status === 'Offline' || d.status === 'No recent data' || d.status === 'Authentication error'
    ).length;

    const supportedYieldTotal = scopedBatches.reduce((sum, b) => {
      const est = predictionsByBatchId[b.id]?.estimatedYieldKg;
      return sum + (est ?? 0);
    }, 0);

    const batchesAttention = scopedBatches.filter((b) => b.status === 'Attention').length;

    return {
      activeBatches: scopedBatches.length,
      growingZones: zoneFilter === 'ALL' ? scopedZones.length : 1,
      approachingHarvest: approachingOrReady,
      connectedDevices,
      totalDevices: scopedDevices.length,
      attentionDevices,
      estimatedYieldKg: Number(supportedYieldTotal.toFixed(1)),
      batchesAttention,
    };
  }, [scopedBatches, scopedZones, scopedDevices, zoneFilter, predictionsByBatchId]);

  const activeEnvZoneId = useMemo(() => {
    if (zoneFilter !== 'ALL') return zoneFilter;
    return scopedZones[0]?.id ?? 'RACK-A-LEVEL-2';
  }, [zoneFilter, scopedZones]);

  const envChartData = useMemo(() => {
    const series = harvestService.getZoneEnvironmentSeries(activeEnvZoneId);
    return series.slice(-rangeDays);
  }, [activeEnvZoneId, rangeDays]);

  const zoneDistributionData = useMemo(() => {
    return scopedZones.map((z) => {
      const zoneBatches = batches.filter((b) => b.zoneId === z.id && b.status !== 'Harvested');
      const plantedHeads = zoneBatches.reduce((sum, b) => sum + b.plantCount, 0);
      return {
        zone: z.name.replace(' · ', ' '),
        plantedHeads,
        capacity: z.capacityPlants,
      };
    });
  }, [scopedZones, batches]);

  const upcomingHarvests = useMemo(() => {
    return [...scopedBatches]
      .sort((a, b) => {
        const da = predictionsByBatchId[a.id]?.daysRemaining ?? 99;
        const db = predictionsByBatchId[b.id]?.daysRemaining ?? 99;
        return da - db;
      })
      .slice(0, 5);
  }, [scopedBatches, predictionsByBatchId]);

  const activeFarmName =
    selectedFarmId === 'ALL'
      ? 'All Odisha Pilot Farms'
      : farms.find((f) => f.id === selectedFarmId)?.name ?? 'Farm Overview';

  return (
    <div>
      <PageHeader
        title="Farm Intelligence Overview"
        subtitle={`${activeFarmName} · Real-time workspace status powered by Stage 1 deterministic demonstration datasets.`}
        actions={
          <>
            <Link
              to="/batches"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2E24] whitespace-nowrap"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>New Lettuce Batch</span>
            </Link>
            <Link
              to="/harvest"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4DDD3] bg-white px-4 py-2 text-sm font-medium text-[#202923] hover:bg-[#F7F9F5] whitespace-nowrap"
            >
              <span>Log Harvest</span>
            </Link>
          </>
        }
      />

      <DemoNotice
        title="Stage 1 Demonstration Mode · Simulated Sensor Telemetry & Illustrative Predictions"
        description="Sensor readings are deterministic demonstration series. Harvest windows use transparent rule-based variety baselines rather than trained ML models."
        className="mb-6"
      />

      {/* Interactive Filter Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DCE3DB] bg-white p-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label htmlFor="dash-zone-filter" className="sr-only">
              Filter by Growing Zone
            </label>
            <select
              id="dash-zone-filter"
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="rounded-lg border border-[#D4DDD3] bg-[#F7F9F5] px-3 py-1.5 text-xs font-medium text-[#202923] focus:border-[#153F32] focus:outline-none"
            >
              <option value="ALL">All Growing Zones ({scopedZones.length})</option>
              {scopedZones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dash-stage-filter" className="sr-only">
              Filter by Maturity Stage
            </label>
            <select
              id="dash-stage-filter"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="rounded-lg border border-[#D4DDD3] bg-[#F7F9F5] px-3 py-1.5 text-xs font-medium text-[#202923] focus:border-[#153F32] focus:outline-none"
            >
              <option value="ALL">All Growth Stages</option>
              <option value="Early Growth">Early Growth</option>
              <option value="Vegetative Growth">Vegetative Growth</option>
              <option value="Approaching Maturity">Approaching Maturity</option>
              <option value="Ready for Harvest">Ready for Harvest</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-[#F0F4EF] p-1">
          <button
            type="button"
            onClick={() => setRangeDays(7)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
              rangeDays === 7 ? 'bg-white text-[#153F32] shadow-sm' : 'text-[#606C65] hover:text-[#202923]'
            }`}
          >
            7-Day Trend
          </button>
          <button
            type="button"
            onClick={() => setRangeDays(14)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
              rangeDays === 14 ? 'bg-white text-[#153F32] shadow-sm' : 'text-[#606C65] hover:text-[#202923]'
            }`}
          >
            14-Day Trend
          </button>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-xl border border-[#DCE3DB] bg-white p-4">
          <p className="text-xs font-medium text-[#606C65]">Active Crop Batches</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[#202923]">
            {kpis.activeBatches}
          </p>
          <p className="mt-1 text-[11px] text-[#78847D]">Hydroponic lettuce cycles</p>
        </div>

        <div className="rounded-xl border border-[#DCE3DB] bg-white p-4">
          <p className="text-xs font-medium text-[#606C65]">Growing Zones</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[#202923]">
            {kpis.growingZones}
          </p>
          <p className="mt-1 text-[11px] text-[#78847D]">Configured rack tiers</p>
        </div>

        <div className="rounded-xl border border-[#DCE3DB] bg-white p-4">
          <p className="text-xs font-medium text-[#606C65]">Approaching Harvest</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[#287A55]">
            {kpis.approachingHarvest}
          </p>
          <p className="mt-1 text-[11px] text-[#78847D]">Ready or near maturity</p>
        </div>

        <div className="rounded-xl border border-[#DCE3DB] bg-white p-4">
          <p className="text-xs font-medium text-[#606C65]">Connected Sensors</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[#202923]">
            {kpis.connectedDevices}/{kpis.totalDevices}
          </p>
          <p className="mt-1 text-[11px] text-[#78847D]">
            {kpis.attentionDevices} requiring attention
          </p>
        </div>

        <div className="rounded-xl border border-[#DCE3DB] bg-white p-4">
          <p className="text-xs font-medium text-[#606C65]">Est. Upcoming Yield</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[#202923]">
            {kpis.estimatedYieldKg} kg
          </p>
          <p className="mt-1 text-[11px] text-[#78847D]">Labelled sample batches only</p>
        </div>

        <div className="rounded-xl border border-[#DCE3DB] bg-white p-4">
          <p className="text-xs font-medium text-[#606C65]">Batches Needing Attention</p>
          <p
            className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${
              kpis.batchesAttention > 0 ? 'text-[#B4690E]' : 'text-[#202923]'
            }`}
          >
            {kpis.batchesAttention}
          </p>
          <p className="mt-1 text-[11px] text-[#78847D]">Range deviations flagged</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-[#DCE3DB] bg-white p-5 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-semibold text-[#202923]">
                Simulated Microclimate Trend ({activeEnvZoneId})
              </h2>
              <p className="text-xs text-[#606C65]">
                Air Temperature (°C) &amp; Relative Humidity (% RH) · Last {rangeDays} days
              </p>
            </div>
            <Link
              to="/environment"
              className="text-xs font-medium text-[#287A55] hover:underline whitespace-nowrap"
            >
              Full Telemetry →
            </Link>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={envChartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#153F32" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#153F32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAEFEA" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#606C65' }} />
                <YAxis yAxisId="temp" domain={[15, 30]} tick={{ fontSize: 11, fill: '#606C65' }} unit="°C" />
                <YAxis yAxisId="hum" orientation="right" domain={[40, 85]} tick={{ fontSize: 11, fill: '#606C65' }} unit="%" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #DCE3DB',
                    fontSize: '12px',
                  }}
                />
                <Area
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temperature"
                  name="Air Temp (°C)"
                  stroke="#153F32"
                  strokeWidth={2}
                  fill="url(#tempFill)"
                />
                <Area
                  yAxisId="hum"
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity (% RH)"
                  stroke="#D7A65B"
                  strokeWidth={2}
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[#DCE3DB] bg-white p-5 lg:col-span-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-semibold text-[#202923]">
                Zone Occupancy vs. Capacity
              </h2>
              <p className="text-xs text-[#606C65]">Active lettuce heads per rack tier</p>
            </div>
            <Link
              to="/zones"
              className="text-xs font-medium text-[#287A55] hover:underline whitespace-nowrap"
            >
              Manage Zones →
            </Link>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={zoneDistributionData}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EAEFEA" />
                <XAxis dataKey="zone" tick={{ fontSize: 10, fill: '#606C65' }} />
                <YAxis tick={{ fontSize: 11, fill: '#606C65' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #DCE3DB',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="plantedHeads" name="Planted Heads" fill="#287A55" radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" name="Zone Capacity" fill="#DCE6DC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Split: Upcoming Harvests & Alerts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-[#DCE3DB] bg-white p-5 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-[#EAEFEA] pb-3">
            <div>
              <h2 className="font-display text-base font-semibold text-[#202923]">
                Upcoming Harvest Schedule (Demonstration)
              </h2>
              <p className="text-xs text-[#606C65]">
                Click any batch to inspect growth timeline and zone telemetry.
              </p>
            </div>
            <Link
              to="/predictions"
              className="text-xs font-medium text-[#287A55] hover:underline whitespace-nowrap"
            >
              All Predictions →
            </Link>
          </div>

          <div className="mt-3 divide-y divide-[#EEF2ED]">
            {upcomingHarvests.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#78847D]">
                No active batches match the current filters.
              </p>
            ) : (
              upcomingHarvests.map((batch) => {
                const pred = predictionsByBatchId[batch.id];
                const zone = zones.find((z) => z.id === batch.zoneId);
                return (
                  <button
                    key={batch.id}
                    type="button"
                    onClick={() => navigate(`/batches/${batch.id}`)}
                    className="flex w-full items-center justify-between gap-4 py-3 text-left transition-colors hover:bg-[#F7F9F5] px-2 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#202923]">
                        Batch {batch.batchCode} · {batch.variety} Lettuce
                      </p>
                      <p className="mt-0.5 text-xs text-[#606C65]">
                        {zone?.name ?? batch.zoneId} · Age {pred?.cropAgeDays ?? 0}d ·{' '}
                        {batch.plantCount} heads
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-xs font-semibold tabular-nums text-[#153F32]">
                        {formatDateShort(pred?.windowStart ?? '')} –{' '}
                        {formatDateShort(pred?.windowEnd ?? '')}
                      </p>
                      <div className="mt-1 flex justify-end">
                        <StatusLabel
                          state={
                            pred?.currentStage === 'Ready for Harvest'
                              ? 'healthy'
                              : pred?.currentStage === 'Approaching Maturity'
                              ? 'warning'
                              : 'info'
                          }
                          label={pred?.currentStage ?? 'Active'}
                        />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[#DCE3DB] bg-white p-5 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#EAEFEA] pb-3">
            <div>
              <h2 className="font-display text-base font-semibold text-[#202923]">
                Active Alerts &amp; Device Health
              </h2>
              <p className="text-xs text-[#606C65]">
                Sensor faults and environmental deviations
              </p>
            </div>
            <Link
              to="/alerts"
              className="text-xs font-medium text-[#287A55] hover:underline whitespace-nowrap"
            >
              Alert Center →
            </Link>
          </div>

          <div className="mt-3 space-y-3">
            {scopedAlerts.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#78847D]">
                No unresolved alerts for this selection.
              </p>
            ) : (
              scopedAlerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-lg border border-[#E5EBE4] bg-[#F7F9F5] p-3.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <StatusLabel
                      state={
                        alert.severity === 'Critical'
                          ? 'critical'
                          : alert.severity === 'Attention'
                          ? 'warning'
                          : 'info'
                      }
                      label={
                        alert.category === 'sensor_fault'
                          ? `Sensor Fault · ${alert.severity}`
                          : alert.category === 'environmental_deviation'
                          ? `Env Deviation · ${alert.severity}`
                          : `Harvest Notice · ${alert.severity}`
                      }
                    />
                    <span className="font-mono text-[11px] text-[#78847D]">
                      {alert.zoneId ?? 'Facility'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-[#202923]">{alert.title}</p>
                  <p className="mt-1 text-xs text-[#606C65]">{alert.suggestedAction}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 border-t border-[#EAEFEA] pt-3 flex items-center justify-between text-xs">
            <span className="text-[#606C65]">
              {kpis.attentionDevices > 0
                ? `${kpis.attentionDevices} sensor(s) offline or stale`
                : 'All assigned sensors reporting'}
            </span>
            <Link
              to="/devices"
              className="inline-flex items-center gap-1 font-medium text-[#153F32] hover:underline"
            >
              <span>Inspect Registry</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
