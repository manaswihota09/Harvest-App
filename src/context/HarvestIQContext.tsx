import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  BatchZoneOccupancy,
  CropBatch,
  Device,
  Farm,
  GrowingZone,
  HarvestPrediction,
  HarvestRecord,
  LettuceVariety,
  PartnerEnquiry,
  PartnerProduct,
  Rack,
  UserRole,
  VarietyConfig,
} from '../types/domain';
import { HarvestIQStoreState, harvestService } from '../services/harvestService';
import {
  DEMO_REFERENCE_DATE,
  buildDemoHarvestPrediction,
  computeBatchStatus,
} from '../utils/calculations';

interface HarvestIQContextValue extends HarvestIQStoreState {
  predictionsByBatchId: Record<string, HarvestPrediction>;
  unreadAlertCount: number;
  setSelectedFarmId: (farmId: string) => void;
  setActiveRole: (role: UserRole) => void;
  addFarm: (farm: Omit<Farm, 'id'>) => Farm;
  updateFarm: (farm: Farm) => void;
  addRack: (rack: Omit<Rack, 'id'>) => Rack;
  addZone: (zone: Omit<GrowingZone, 'id'>) => GrowingZone;
  updateZone: (zone: GrowingZone) => void;
  addBatch: (batch: Omit<CropBatch, 'id' | 'status'>) => CropBatch;
  updateBatch: (batch: CropBatch) => void;
  deleteBatch: (batchId: string) => void;
  addDevice: (device: Omit<Device, 'isSimulated'>) => void;
  assignDeviceToZone: (deviceId: string, zoneId: string | null) => void;
  toggleDeviceConnection: (deviceId: string) => void;
  recordHarvest: (input: {
    batchId: string;
    actualHarvestDate: string;
    actualWeightKg: number;
    harvestedPlantCount: number;
    notes: string;
  }) => void;
  markAlertRead: (alertId: string, isRead: boolean) => void;
  resolveAlert: (alertId: string) => void;
  updateVarietyConfig: (config: VarietyConfig) => void;
  submitPartnerEnquiry: (enquiry: Omit<PartnerEnquiry, 'id' | 'submittedAt'>) => void;
  addPartnerProduct: (product: Omit<PartnerProduct, 'id' | 'isDemonstrationListing'>) => void;
  resetDemoData: () => void;
}

const HarvestIQContext = createContext<HarvestIQContextValue | null>(null);

export const HarvestIQProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<HarvestIQStoreState>(() => harvestService.loadState());

  useEffect(() => {
    harvestService.saveState(state);
  }, [state]);

  const predictionsByBatchId = useMemo(() => {
    const map: Record<string, HarvestPrediction> = {};
    for (const batch of state.batches) {
      const config =
        state.varietyConfigs.find((v) => v.variety === batch.variety) ?? state.varietyConfigs[0];
      const zoneDevices = state.devices.filter((d) => d.zoneId === batch.zoneId);
      const zoneSeries = harvestService.getZoneEnvironmentSeries(batch.zoneId);
      map[batch.id] = buildDemoHarvestPrediction(
        batch,
        config,
        zoneDevices,
        zoneSeries,
        DEMO_REFERENCE_DATE
      );
    }
    return map;
  }, [state.batches, state.varietyConfigs, state.devices]);

  const unreadAlertCount = useMemo(
    () => state.alerts.filter((a) => !a.isRead && !a.isResolved).length,
    [state.alerts]
  );

  const setSelectedFarmId = (farmId: string) => {
    setState((prev) => ({ ...prev, selectedFarmId: farmId }));
  };

  const setActiveRole = (role: UserRole) => {
    setState((prev) => ({ ...prev, activeRole: role }));
  };

  const addFarm = (farmInput: Omit<Farm, 'id'>): Farm => {
    const nextNum = state.farms.length + 1;
    const newFarm: Farm = {
      ...farmInput,
      id: `FARM-${String(nextNum).padStart(3, '0')}`,
    };
    setState((prev) => ({
      ...prev,
      farms: [...prev.farms, newFarm],
    }));
    return newFarm;
  };

  const updateFarm = (updated: Farm) => {
    setState((prev) => ({
      ...prev,
      farms: prev.farms.map((f) => (f.id === updated.id ? updated : f)),
    }));
  };

  const addRack = (rackInput: Omit<Rack, 'id'>): Rack => {
    const slug = rackInput.name.toUpperCase().replace(/[^A-Z0-9]+/g, '-');
    const newRack: Rack = {
      ...rackInput,
      id: `${slug}-${Date.now().toString().slice(-4)}`,
    };
    setState((prev) => ({
      ...prev,
      racks: [...prev.racks, newRack],
    }));
    return newRack;
  };

  const addZone = (zoneInput: Omit<GrowingZone, 'id'>): GrowingZone => {
    const rackSlug = zoneInput.rackName.toUpperCase().replace(/[^A-Z0-9]+/g, '-');
    const newZone: GrowingZone = {
      ...zoneInput,
      id: `${rackSlug}-LEVEL-${zoneInput.levelNumber}-${Date.now().toString().slice(-3)}`,
    };
    setState((prev) => ({
      ...prev,
      zones: [...prev.zones, newZone],
    }));
    return newZone;
  };

  const updateZone = (updated: GrowingZone) => {
    setState((prev) => ({
      ...prev,
      zones: prev.zones.map((z) => (z.id === updated.id ? updated : z)),
    }));
  };

  const addBatch = (batchInput: Omit<CropBatch, 'id' | 'status'>): CropBatch => {
    const config =
      state.varietyConfigs.find((v) => v.variety === batchInput.variety) ?? state.varietyConfigs[0];
    const zoneDevices = state.devices.filter((d) => d.zoneId === batchInput.zoneId);
    const zoneSeries = harvestService.getZoneEnvironmentSeries(batchInput.zoneId);
    const hasEnvAlert = state.alerts.some(
      (a) => a.zoneId === batchInput.zoneId && !a.isResolved && a.severity !== 'Info'
    );

    const tempBatch: CropBatch = {
      ...batchInput,
      id: `BATCH-${Date.now().toString().slice(-5)}`,
      status: 'Active',
    };
    const pred = buildDemoHarvestPrediction(
      tempBatch,
      config,
      zoneDevices,
      zoneSeries,
      DEMO_REFERENCE_DATE
    );
    tempBatch.status = computeBatchStatus(tempBatch, pred.currentStage, hasEnvAlert);

    const occupancy: BatchZoneOccupancy = {
      id: `OCC-${Date.now().toString().slice(-5)}`,
      batchId: tempBatch.id,
      batchCode: tempBatch.batchCode,
      zoneId: tempBatch.zoneId,
      startDate: tempBatch.plantingDate,
      endDate: null,
    };

    setState((prev) => ({
      ...prev,
      batches: [tempBatch, ...prev.batches],
      occupancyHistory: [occupancy, ...prev.occupancyHistory],
    }));
    return tempBatch;
  };

  const updateBatch = (updated: CropBatch) => {
    setState((prev) => ({
      ...prev,
      batches: prev.batches.map((b) => (b.id === updated.id ? updated : b)),
    }));
  };

  const deleteBatch = (batchId: string) => {
    setState((prev) => ({
      ...prev,
      batches: prev.batches.filter((b) => b.id !== batchId),
      occupancyHistory: prev.occupancyHistory.filter((o) => o.batchId !== batchId),
      alerts: prev.alerts.filter((a) => a.batchId !== batchId),
    }));
  };

  const addDevice = (deviceInput: Omit<Device, 'isSimulated'>) => {
    const newDevice: Device = {
      ...deviceInput,
      isSimulated: true,
    };
    setState((prev) => ({
      ...prev,
      devices: [newDevice, ...prev.devices],
      deviceAssignments: newDevice.zoneId
        ? [
            {
              id: `DA-${Date.now().toString().slice(-5)}`,
              deviceId: newDevice.id,
              zoneId: newDevice.zoneId,
              assignedAt: DEMO_REFERENCE_DATE,
              unassignedAt: null,
            },
            ...prev.deviceAssignments,
          ]
        : prev.deviceAssignments,
    }));
  };

  const assignDeviceToZone = (deviceId: string, zoneId: string | null) => {
    setState((prev) => {
      const targetZone = prev.zones.find((z) => z.id === zoneId);
      const updatedDevices = prev.devices.map((d) =>
        d.id === deviceId
          ? {
              ...d,
              zoneId,
              farmId: targetZone ? targetZone.farmId : d.farmId,
              status: zoneId && d.status === 'Integration pending' ? 'Connected' : d.status,
              lastCommunicationAt: zoneId ? `${DEMO_REFERENCE_DATE}T09:30:00+05:30` : d.lastCommunicationAt,
            }
          : d
      );

      const updatedAssignments = prev.deviceAssignments.map((a) =>
        a.deviceId === deviceId && a.unassignedAt === null
          ? { ...a, unassignedAt: DEMO_REFERENCE_DATE }
          : a
      );

      if (zoneId) {
        updatedAssignments.unshift({
          id: `DA-${Date.now().toString().slice(-5)}`,
          deviceId,
          zoneId,
          assignedAt: DEMO_REFERENCE_DATE,
          unassignedAt: null,
        });
      }

      return {
        ...prev,
        devices: updatedDevices,
        deviceAssignments: updatedAssignments,
      };
    });
  };

  const toggleDeviceConnection = (deviceId: string) => {
    setState((prev) => ({
      ...prev,
      devices: prev.devices.map((d) => {
        if (d.id !== deviceId) return d;
        const nextStatus = d.status === 'Connected' ? 'Offline' : 'Connected';
        return {
          ...d,
          status: nextStatus,
          lastCommunicationAt:
            nextStatus === 'Connected' ? `${DEMO_REFERENCE_DATE}T09:30:00+05:30` : d.lastCommunicationAt,
        };
      }),
    }));
  };

  const recordHarvest = (input: {
    batchId: string;
    actualHarvestDate: string;
    actualWeightKg: number;
    harvestedPlantCount: number;
    notes: string;
  }) => {
    const batch = state.batches.find((b) => b.id === input.batchId);
    if (!batch) return;
    const pred = predictionsByBatchId[batch.id];

    const record: HarvestRecord = {
      id: `HR-${String(state.harvestRecords.length + 1).padStart(3, '0')}`,
      batchId: batch.id,
      batchCode: batch.batchCode,
      variety: batch.variety as LettuceVariety,
      farmId: batch.farmId,
      zoneId: batch.zoneId,
      plantingDate: batch.plantingDate,
      predictedWindowStart: pred?.windowStart ?? input.actualHarvestDate,
      predictedWindowEnd: pred?.windowEnd ?? input.actualHarvestDate,
      predictedYieldKg: pred?.estimatedYieldKg ?? null,
      actualHarvestDate: input.actualHarvestDate,
      actualWeightKg: input.actualWeightKg,
      harvestedPlantCount: input.harvestedPlantCount,
      notes: input.notes,
    };

    setState((prev) => ({
      ...prev,
      batches: prev.batches.map((b) =>
        b.id === batch.id ? { ...b, status: 'Harvested', hasHistoricalYieldLabel: true } : b
      ),
      occupancyHistory: prev.occupancyHistory.map((occ) =>
        occ.batchId === batch.id && occ.endDate === null
          ? { ...occ, endDate: input.actualHarvestDate }
          : occ
      ),
      harvestRecords: [record, ...prev.harvestRecords],
      alerts: prev.alerts.map((a) =>
        a.batchId === batch.id && a.category === 'harvest_window'
          ? { ...a, isRead: true, isResolved: true }
          : a
      ),
    }));
  };

  const markAlertRead = (alertId: string, isRead: boolean) => {
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) => (a.id === alertId ? { ...a, isRead } : a)),
    }));
  };

  const resolveAlert = (alertId: string) => {
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) =>
        a.id === alertId ? { ...a, isResolved: true, isRead: true } : a
      ),
    }));
  };

  const updateVarietyConfig = (config: VarietyConfig) => {
    setState((prev) => ({
      ...prev,
      varietyConfigs: prev.varietyConfigs.map((v) =>
        v.variety === config.variety ? config : v
      ),
    }));
  };

  const submitPartnerEnquiry = (enquiry: Omit<PartnerEnquiry, 'id' | 'submittedAt'>) => {
    const newEnquiry: PartnerEnquiry = {
      ...enquiry,
      id: `ENQ-${Date.now().toString().slice(-5)}`,
      submittedAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      enquiries: [newEnquiry, ...prev.enquiries],
    }));
  };

  const addPartnerProduct = (product: Omit<PartnerProduct, 'id' | 'isDemonstrationListing'>) => {
    const newProd: PartnerProduct = {
      ...product,
      id: `PROD-${Date.now().toString().slice(-4)}`,
      isDemonstrationListing: true,
    };
    setState((prev) => ({
      ...prev,
      partnerProducts: [newProd, ...prev.partnerProducts],
    }));
  };

  const resetDemoData = () => {
    const fresh = harvestService.resetState();
    setState(fresh);
  };

  return (
    <HarvestIQContext.Provider
      value={{
        ...state,
        predictionsByBatchId,
        unreadAlertCount,
        setSelectedFarmId,
        setActiveRole,
        addFarm,
        updateFarm,
        addRack,
        addZone,
        updateZone,
        addBatch,
        updateBatch,
        deleteBatch,
        addDevice,
        assignDeviceToZone,
        toggleDeviceConnection,
        recordHarvest,
        markAlertRead,
        resolveAlert,
        updateVarietyConfig,
        submitPartnerEnquiry,
        addPartnerProduct,
        resetDemoData,
      }}
    >
      {children}
    </HarvestIQContext.Provider>
  );
};

export function useHarvestIQ(): HarvestIQContextValue {
  const ctx = useContext(HarvestIQContext);
  if (!ctx) {
    throw new Error('useHarvestIQ must be used inside HarvestIQProvider');
  }
  return ctx;
}
