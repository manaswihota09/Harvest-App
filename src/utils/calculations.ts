import {
  BatchStatus,
  CropBatch,
  Device,
  GrowthStage,
  HarvestPrediction,
  VarietyConfig,
  ZoneEnvironmentSeriesPoint,
} from '../types/domain';

// Reference demonstration date aligned with Stage 1 validation scenario
export const DEMO_REFERENCE_DATE = '2026-11-27';

export function daysBetween(startDateStr: string, endDateStr: string): number {
  const start = new Date(`${startDateStr}T00:00:00`);
  const end = new Date(`${endDateStr}T00:00:00`);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTimestampIST(isoStr: string): string {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return isoStr;
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function computeGrowthStage(
  batch: CropBatch,
  config: VarietyConfig,
  referenceDate: string = DEMO_REFERENCE_DATE
): GrowthStage {
  if (batch.status === 'Harvested') return 'Harvested';
  const age = daysBetween(batch.plantingDate, referenceDate);
  const minTarget = config.targetDaysMin;

  if (age >= minTarget) return 'Ready for Harvest';
  if (age >= Math.round(minTarget * 0.72)) return 'Approaching Maturity';
  if (age >= Math.round(minTarget * 0.32)) return 'Vegetative Growth';
  return 'Early Growth';
}

export function computeBatchStatus(
  batch: CropBatch,
  stage: GrowthStage,
  hasEnvAlert: boolean
): BatchStatus {
  if (batch.status === 'Harvested') return 'Harvested';
  if (hasEnvAlert) return 'Attention';
  if (stage === 'Ready for Harvest' || stage === 'Approaching Maturity') return 'Ready';
  return 'Active';
}

/**
 * Transparent Stage 1 frontend demonstration calculation.
 * Clearly separated from future Stage 3 Scikit-learn / XGBoost ML predictions.
 */
export function buildDemoHarvestPrediction(
  batch: CropBatch,
  config: VarietyConfig,
  zoneDevices: Device[],
  zoneSeries: ZoneEnvironmentSeriesPoint[],
  referenceDate: string = DEMO_REFERENCE_DATE
): HarvestPrediction {
  const cropAgeDays = daysBetween(batch.plantingDate, referenceDate);
  const stage = computeGrowthStage(batch, config, referenceDate);

  // Measure sensor data completeness in the assigned zone
  const connectedCount = zoneDevices.filter((d) => d.status === 'Connected').length;
  const deviceCoverage = zoneDevices.length > 0 ? connectedCount / zoneDevices.length : 0;

  // Check recent environmental compliance across the latest readings
  const latestPoint = zoneSeries[zoneSeries.length - 1];
  let tempDriftDays = 0;
  if (zoneSeries.length > 0) {
    const outOfRangePoints = zoneSeries.filter(
      (pt) =>
        pt.temperature !== null &&
        (pt.temperature > config.tempMax || pt.temperature < config.tempMin)
    ).length;
    if (outOfRangePoints > zoneSeries.length * 0.35) {
      tempDriftDays = 2; // Illustrative shift for sustained thermal stress
    }
  }

  const baseMidDays = Math.round((config.targetDaysMin + config.targetDaysMax) / 2);
  const adjustedTotalDays = baseMidDays + tempDriftDays;
  const estimatedHarvestDate = addDays(batch.plantingDate, adjustedTotalDays);
  const windowStart = addDays(batch.plantingDate, config.targetDaysMin + tempDriftDays);
  const windowEnd = addDays(batch.plantingDate, config.targetDaysMax + tempDriftDays);
  const daysRemaining = Math.max(0, daysBetween(referenceDate, estimatedHarvestDate));

  const dataCompletenessPct = Math.round(
    Math.min(100, Math.max(25, deviceCoverage * 75 + (batch.hasHistoricalYieldLabel ? 25 : 10)))
  );

  const uncertaintyDays = dataCompletenessPct >= 85 ? 2 : dataCompletenessPct >= 60 ? 3 : 5;

  const estimatedYieldKg = batch.hasHistoricalYieldLabel
    ? Number(((batch.plantCount * config.sampleAvgHeadWeightGrams) / 1000).toFixed(1))
    : null;

  const factors: string[] = [
    `${batch.variety} baseline cycle range (${config.targetDaysMin}–${config.targetDaysMax} days)`,
    `Current crop age: ${cropAgeDays} days since transplanting`,
  ];

  if (zoneDevices.length === 0) {
    factors.push('No sensors currently assigned to this zone (lower completeness)');
  } else {
    factors.push(`${connectedCount} of ${zoneDevices.length} assigned zone sensors reporting`);
  }

  if (tempDriftDays > 0) {
    factors.push(
      `Sustained air temp above ${config.tempMax}°C adds +${tempDriftDays}d illustrative window buffer`
    );
  } else if (latestPoint?.temperature !== null && latestPoint?.temperature !== undefined) {
    factors.push(`Recent zone temp (${latestPoint.temperature}°C) within configured range`);
  }

  if (!batch.hasHistoricalYieldLabel) {
    factors.push('Yield weight omitted: awaiting prior labelled harvest weights for this setup');
  }

  return {
    batchId: batch.id,
    batchCode: batch.batchCode,
    isDemoModel: true,
    currentStage: stage,
    cropAgeDays,
    estimatedHarvestDate,
    windowStart,
    windowEnd,
    daysRemaining,
    uncertaintyDays,
    dataCompletenessPct,
    estimatedYieldKg,
    yieldSupported: batch.hasHistoricalYieldLabel,
    factors,
    updatedAt: `${referenceDate}T09:30:00+05:30`,
  };
}

export function exportRowsToCsv(filename: string, headers: string[], rows: (string | number | null)[][]): void {
  const escapeCell = (val: string | number | null): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
