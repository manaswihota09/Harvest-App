import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useHarvestIQ } from '../context/HarvestIQContext';
import { AlertCategory } from '../types/domain';
import { EmptyState, PageHeader, StatusLabel } from '../components/common/UIPrimitives';
import { formatTimestampIST } from '../utils/calculations';

export const AlertsPage: React.FC = () => {
  const { alerts, selectedFarmId, markAlertRead, resolveAlert } = useHarvestIQ();

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | AlertCategory>('ALL');
  const [showResolved, setShowResolved] = useState(false);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (selectedFarmId !== 'ALL' && a.farmId !== selectedFarmId) return false;
      if (!showResolved && a.isResolved) return false;
      if (categoryFilter !== 'ALL' && a.category !== categoryFilter) return false;
      return true;
    });
  }, [alerts, selectedFarmId, showResolved, categoryFilter]);

  const categoryLabel = (cat: AlertCategory) => {
    switch (cat) {
      case 'sensor_fault':
        return 'Sensor Fault / Telemetry';
      case 'environmental_deviation':
        return 'Environmental Deviation';
      case 'growth_concern':
        return 'Growth Trend Concern';
      case 'harvest_window':
        return 'Harvest Window';
    }
  };

  return (
    <div>
      <PageHeader
        title="Alert Management"
        subtitle="Sensor disconnections and stale telemetry are separated from environmental deviations and crop harvest advisories."
      />

      {/* Filter Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DCE3DB] bg-white p-3.5">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#F0F4EF] p-1">
          {(
            [
              { id: 'ALL', label: 'All Categories' },
              { id: 'sensor_fault', label: 'Sensor Faults' },
              { id: 'environmental_deviation', label: 'Environmental Deviations' },
              { id: 'harvest_window', label: 'Harvest Windows' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryFilter(tab.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                categoryFilter === tab.id
                  ? 'bg-white text-[#153F32] shadow-sm'
                  : 'text-[#606C65] hover:text-[#202923]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-[#525E57]">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="accent-[#153F32]"
          />
          <span>Show resolved alerts</span>
        </label>
      </div>

      {filteredAlerts.length === 0 ? (
        <EmptyState
          title="No alerts match your current view"
          description="All active sensor faults and environmental advisories for this selection have been addressed."
        />
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-xl border bg-white p-5 ${
                alert.isResolved
                  ? 'border-[#E6ECE5] opacity-75'
                  : alert.isRead
                  ? 'border-[#DCE3DB]'
                  : 'border-[#B9CBB9]'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <StatusLabel
                      state={
                        alert.isResolved
                          ? 'inactive'
                          : alert.severity === 'Critical'
                          ? 'critical'
                          : alert.severity === 'Attention'
                          ? 'warning'
                          : 'info'
                      }
                      label={alert.isResolved ? 'Resolved' : `${alert.severity} · ${categoryLabel(alert.category)}`}
                    />
                    <span className="text-[#78847D]">·</span>
                    <span className="font-mono text-[#606C65]">{alert.zoneId ?? alert.farmId}</span>
                    <span className="text-[#78847D]">·</span>
                    <span className="text-[#78847D]">{formatTimestampIST(alert.occurredAt)}</span>
                  </div>

                  <h2 className="font-display text-base font-semibold text-[#202923]">
                    {alert.title}
                  </h2>
                  <p className="text-sm text-[#4E5A53]">{alert.explanation}</p>
                  <p className="text-xs font-medium text-[#153F32]">
                    Suggested Action: {alert.suggestedAction}
                  </p>

                  {alert.batchId && (
                    <div className="pt-1">
                      <Link
                        to={`/batches/${alert.batchId}`}
                        className="text-xs font-semibold text-[#287A55] hover:underline"
                      >
                        Inspect Affected Crop Batch →
                      </Link>
                    </div>
                  )}
                </div>

                {!alert.isResolved && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => markAlertRead(alert.id, !alert.isRead)}
                      className="rounded-lg border border-[#D4DDD3] px-3 py-1.5 text-xs font-medium text-[#202923] hover:bg-[#F7F9F5]"
                    >
                      {alert.isRead ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      type="button"
                      onClick={() => resolveAlert(alert.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#153F32] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0F2E24]"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Resolve</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
