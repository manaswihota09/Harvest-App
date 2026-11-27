import React, { useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { useHarvestIQ } from '../context/HarvestIQContext';
import { UserRole, VarietyConfig } from '../types/domain';
import { ConfirmDialog, PageHeader } from '../components/common/UIPrimitives';

export const SettingsPage: React.FC = () => {
  const {
    varietyConfigs,
    updateVarietyConfig,
    activeRole,
    setActiveRole,
    resetDemoData,
  } = useHarvestIQ();

  const [draftConfigs, setDraftConfigs] = useState<VarietyConfig[]>(varietyConfigs);
  const [savedNotice, setSavedNotice] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const handleFieldChange = (
    index: number,
    field: keyof VarietyConfig,
    rawValue: string
  ) => {
    const val = Number(rawValue);
    if (Number.isNaN(val)) return;
    setDraftConfigs((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: val } : item))
    );
    setSavedNotice(false);
  };

  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    draftConfigs.forEach((cfg) => updateVarietyConfig(cfg));
    setSavedNotice(true);
  };

  return (
    <div>
      <PageHeader
        title="Farm & Application Settings"
        subtitle="Configure variety-specific environmental ranges, preview user roles, or reset the Stage 1 demonstration dataset."
        actions={
          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4DDD3] bg-white px-3.5 py-2 text-sm font-medium text-[#202923] hover:bg-[#FDF2F3] hover:text-[#C82333] whitespace-nowrap"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Reset Demo Data</span>
          </button>
        }
      />

      {/* User Role Context Switcher */}
      <div className="mb-6 rounded-xl border border-[#DCE3DB] bg-white p-5">
        <h2 className="font-display text-base font-semibold text-[#202923]">
          Stage 1 Role Context Preview
        </h2>
        <p className="mt-1 text-xs text-[#606C65]">
          Preview how the workspace identifies your role. Multi-tenant RBAC authentication will be
          implemented in Stage 2.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              { id: 'farmer', label: 'Farmer / Farm Operator' },
              { id: 'infrastructure_partner', label: 'Infrastructure Partner' },
              { id: 'sensor_partner', label: 'Sensor / IoT Partner' },
            ] as { id: UserRole; label: string }[]
          ).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveRole(r.id)}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                activeRole === r.id
                  ? 'bg-[#153F32] text-white'
                  : 'border border-[#D4DDD3] bg-[#F7F9F5] text-[#202923] hover:bg-[#E8F0E8]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Configurable Variety Ranges */}
      <form
        onSubmit={handleSaveConfigs}
        className="rounded-xl border border-[#DCE3DB] bg-white p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAEFEA] pb-4">
          <div>
            <h2 className="font-display text-base font-semibold text-[#202923]">
              Lettuce Variety Operating Ranges &amp; Maturity Criteria
            </h2>
            <p className="text-xs text-[#606C65]">
              Changes immediately update environmental compliance checks and harvest prediction windows.
            </p>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2E24] whitespace-nowrap"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            <span>Save Criteria</span>
          </button>
        </div>

        {savedNotice && (
          <p className="mt-4 rounded-lg border border-[#C9DBC9] bg-[#E8F0E8] px-3 py-2 text-xs font-medium text-[#153F32]">
            Variety operating criteria updated in local storage.
          </p>
        )}

        <div className="mt-4 space-y-4">
          {draftConfigs.map((cfg, idx) => (
            <div
              key={cfg.variety}
              className="rounded-lg border border-[#E2E8E0] bg-[#F7F9F5] p-4"
            >
              <h3 className="font-display text-sm font-semibold text-[#153F32]">
                {cfg.variety} Lettuce
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <div>
                  <label className="block text-[11px] text-[#606C65]">Temp Min (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={cfg.tempMin}
                    onChange={(e) => handleFieldChange(idx, 'tempMin', e.target.value)}
                    className="mt-1 w-full rounded border border-[#D4DDD3] bg-white px-2.5 py-1.5 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#606C65]">Temp Max (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={cfg.tempMax}
                    onChange={(e) => handleFieldChange(idx, 'tempMax', e.target.value)}
                    className="mt-1 w-full rounded border border-[#D4DDD3] bg-white px-2.5 py-1.5 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#606C65]">pH Min</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cfg.phMin}
                    onChange={(e) => handleFieldChange(idx, 'phMin', e.target.value)}
                    className="mt-1 w-full rounded border border-[#D4DDD3] bg-white px-2.5 py-1.5 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#606C65]">pH Max</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cfg.phMax}
                    onChange={(e) => handleFieldChange(idx, 'phMax', e.target.value)}
                    className="mt-1 w-full rounded border border-[#D4DDD3] bg-white px-2.5 py-1.5 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#606C65]">Min Days</label>
                  <input
                    type="number"
                    value={cfg.targetDaysMin}
                    onChange={(e) => handleFieldChange(idx, 'targetDaysMin', e.target.value)}
                    className="mt-1 w-full rounded border border-[#D4DDD3] bg-white px-2.5 py-1.5 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#606C65]">Max Days</label>
                  <input
                    type="number"
                    value={cfg.targetDaysMax}
                    onChange={(e) => handleFieldChange(idx, 'targetDaysMax', e.target.value)}
                    className="mt-1 w-full rounded border border-[#D4DDD3] bg-white px-2.5 py-1.5 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </form>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          resetDemoData();
          window.location.reload();
        }}
        title="Reset Stage 1 Demonstration Data?"
        message="This restores the default Odisha pilot farms, racks, growing zones, lettuce batches, devices, and harvest records in browser storage."
        confirmLabel="Restore Defaults"
        destructive
      />
    </div>
  );
};
