import {
  DEFAULT_VARIETY_CONFIGS,
  INITIAL_ALERTS,
  INITIAL_BATCHES,
  INITIAL_DEVICES,
  INITIAL_DEVICE_ASSIGNMENTS,
  INITIAL_FARMS,
  INITIAL_HARVEST_RECORDS,
  INITIAL_OBSERVATIONS,
  INITIAL_OCCUPANCY_HISTORY,
  INITIAL_PARTNERS,
  INITIAL_PARTNER_PRODUCTS,
  INITIAL_RACKS,
  INITIAL_ZONES,
  ZONE_ENVIRONMENT_SERIES,
} from '../data/mockData';
import {
  BatchZoneOccupancy,
  CropBatch,
  Device,
  DeviceAssignment,
  Farm,
  FarmAlert,
  GrowingZone,
  GrowthObservation,
  HarvestRecord,
  PartnerEnquiry,
  PartnerProduct,
  PartnerProfile,
  Rack,
  StandardizedSensorReading,
  UserRole,
  VarietyConfig,
  ZoneEnvironmentSeriesPoint,
} from '../types/domain';

export interface HarvestIQStoreState {
  farms: Farm[];
  racks: Rack[];
  zones: GrowingZone[];
  batches: CropBatch[];
  occupancyHistory: BatchZoneOccupancy[];
  observations: GrowthObservation[];
  devices: Device[];
  deviceAssignments: DeviceAssignment[];
  harvestRecords: HarvestRecord[];
  alerts: FarmAlert[];
  partners: PartnerProfile[];
  partnerProducts: PartnerProduct[];
  enquiries: PartnerEnquiry[];
  varietyConfigs: VarietyConfig[];
  activeRole: UserRole;
  selectedFarmId: string;
}

const STORAGE_KEY = 'harvestiq_stage1_state_v1';

export function getInitialStoreState(): HarvestIQStoreState {
  return {
    farms: INITIAL_FARMS,
    racks: INITIAL_RACKS,
    zones: INITIAL_ZONES,
    batches: INITIAL_BATCHES,
    occupancyHistory: INITIAL_OCCUPANCY_HISTORY,
    observations: INITIAL_OBSERVATIONS,
    devices: INITIAL_DEVICES,
    deviceAssignments: INITIAL_DEVICE_ASSIGNMENTS,
    harvestRecords: INITIAL_HARVEST_RECORDS,
    alerts: INITIAL_ALERTS,
    partners: INITIAL_PARTNERS,
    partnerProducts: INITIAL_PARTNER_PRODUCTS,
    enquiries: [],
    varietyConfigs: DEFAULT_VARIETY_CONFIGS,
    activeRole: 'farmer',
    selectedFarmId: 'ALL',
  };
}

/**
 * Service abstraction layer for Stage 1.
 * In Stage 2, these methods will delegate to FastAPI REST endpoints and PostgreSQL.
 */
export const harvestService = {
  loadState(): HarvestIQStoreState {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return getInitialStoreState();
      const parsed = JSON.parse(raw) as Partial<HarvestIQStoreState>;
      const fallback = getInitialStoreState();
      return {
        farms: parsed.farms ?? fallback.farms,
        racks: parsed.racks ?? fallback.racks,
        zones: parsed.zones ?? fallback.zones,
        batches: parsed.batches ?? fallback.batches,
        occupancyHistory: parsed.occupancyHistory ?? fallback.occupancyHistory,
        observations: parsed.observations ?? fallback.observations,
        devices: parsed.devices ?? fallback.devices,
        deviceAssignments: parsed.deviceAssignments ?? fallback.deviceAssignments,
        harvestRecords: parsed.harvestRecords ?? fallback.harvestRecords,
        alerts: parsed.alerts ?? fallback.alerts,
        partners: parsed.partners ?? fallback.partners,
        partnerProducts: parsed.partnerProducts ?? fallback.partnerProducts,
        enquiries: parsed.enquiries ?? fallback.enquiries,
        varietyConfigs: parsed.varietyConfigs ?? fallback.varietyConfigs,
        activeRole: parsed.activeRole ?? fallback.activeRole,
        selectedFarmId: parsed.selectedFarmId ?? fallback.selectedFarmId,
      };
    } catch {
      return getInitialStoreState();
    }
  },

  saveState(state: HarvestIQStoreState): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota issues in restricted browser frames
    }
  },

  resetState(): HarvestIQStoreState {
    const fresh = getInitialStoreState();
    this.saveState(fresh);
    return fresh;
  },

  getZoneEnvironmentSeries(zoneId: string): ZoneEnvironmentSeriesPoint[] {
    if (ZONE_ENVIRONMENT_SERIES[zoneId]) {
      return ZONE_ENVIRONMENT_SERIES[zoneId];
    }
    // Deterministic baseline for newly created Stage 1 demonstration zones
    return ZONE_ENVIRONMENT_SERIES['RACK-A-LEVEL-2'].map((pt) => ({
      ...pt,
      temperature: Number((pt.temperature ? pt.temperature - 0.3 : 22.0).toFixed(1)),
      humidity: pt.humidity ? pt.humidity - 1 : 62,
    }));
  },

  toStandardizedPayload(device: Device): StandardizedSensorReading {
    return {
      device_id: device.id,
      farm_id: device.farmId,
      zone_id: device.zoneId ?? 'UNASSIGNED',
      sensor_type: device.sensorType,
      value: device.lastReadingValue ?? 0,
      unit: device.unit === '°C' ? 'celsius' : device.unit,
      timestamp: device.lastCommunicationAt,
      data_quality:
        device.status === 'Connected'
          ? 'valid'
          : device.status === 'No recent data'
          ? 'stale'
          : 'missing',
    };
  },
};
