export type UserRole = 'farmer' | 'infrastructure_partner' | 'sensor_partner';

export type LettuceVariety = 'Romaine' | 'Butterhead' | 'Crisphead' | 'Lollo Rosso';

export type GrowthStage =
  | 'Early Growth'
  | 'Vegetative Growth'
  | 'Approaching Maturity'
  | 'Ready for Harvest'
  | 'Harvested';

export type BatchStatus = 'Active' | 'Attention' | 'Ready' | 'Harvested';

export type DeviceStatus =
  | 'Connected'
  | 'Offline'
  | 'No recent data'
  | 'Authentication error'
  | 'Integration pending';

export type ConnectionMethod =
  | 'REST API'
  | 'MQTT'
  | 'HTTPS Webhook'
  | 'LoRaWAN Gateway'
  | 'Modbus TCP';

export type SensorType =
  | 'temperature'
  | 'humidity'
  | 'par'
  | 'ph'
  | 'ec'
  | 'water_temp'
  | 'water_level'
  | 'water_flow'
  | 'co2'
  | 'camera';

export type CompatibilityStatus =
  | 'Compatible and verified'
  | 'Integration available'
  | 'Integration under review'
  | 'Not currently supported';

export type PartnerCategory = 'Infrastructure' | 'Sensor & IoT';

export type AlertCategory =
  | 'sensor_fault'
  | 'environmental_deviation'
  | 'growth_concern'
  | 'harvest_window';

export type AlertSeverity = 'Critical' | 'Attention' | 'Info';

export interface Farm {
  id: string;
  name: string;
  location: string;
  state: string;
  facilityType: string;
  totalAreaSqM: number;
  establishedDate: string;
  managerName: string;
  notes?: string;
}

export interface Rack {
  id: string;
  farmId: string;
  name: string;
  levelsCount: number;
  systemType: 'NFT Channels' | 'Ebb & Flow' | 'Deep Water Culture';
  dimensionsLabel: string;
}

export interface GrowingZone {
  id: string;
  farmId: string;
  rackId: string;
  rackName: string;
  levelNumber: number;
  name: string;
  capacityPlants: number;
  lightingSpec: string;
  irrigationSpec: string;
  status: 'Active' | 'Idle' | 'Maintenance';
}

export interface VarietyConfig {
  variety: LettuceVariety;
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  phMin: number;
  phMax: number;
  ecMin: number;
  ecMax: number;
  parMin: number;
  parMax: number;
  targetDaysMin: number;
  targetDaysMax: number;
  sampleAvgHeadWeightGrams: number;
}

export interface CropBatch {
  id: string;
  batchCode: string;
  cropName: 'Lettuce';
  variety: LettuceVariety;
  farmId: string;
  zoneId: string;
  plantingDate: string; // YYYY-MM-DD
  plantCount: number;
  status: BatchStatus;
  notes?: string;
  hasHistoricalYieldLabel: boolean;
}

export interface BatchZoneOccupancy {
  id: string;
  batchId: string;
  batchCode: string;
  zoneId: string;
  startDate: string;
  endDate: string | null; // null if currently occupying
}

export interface GrowthObservation {
  id: string;
  batchId: string;
  observedDate: string;
  dayNumber: number;
  avgHeightCm: number;
  avgLeafCount: number;
  note: string;
  isSampleData: boolean;
}

export interface Device {
  id: string;
  manufacturer: string;
  model: string;
  sensorType: SensorType;
  unit: string;
  farmId: string;
  zoneId: string | null;
  connectionMethod: ConnectionMethod;
  status: DeviceStatus;
  lastReadingValue: number | null;
  lastCommunicationAt: string;
  calibrationNote: string;
  isSimulated: boolean;
}

export interface DeviceAssignment {
  id: string;
  deviceId: string;
  zoneId: string;
  assignedAt: string;
  unassignedAt: string | null;
}

export interface StandardizedSensorReading {
  device_id: string;
  farm_id: string;
  zone_id: string;
  sensor_type: SensorType;
  value: number;
  unit: string;
  timestamp: string;
  data_quality: 'valid' | 'stale' | 'suspect' | 'missing';
}

export interface ZoneEnvironmentSeriesPoint {
  timestamp: string;
  label: string;
  temperature: number | null;
  humidity: number | null;
  par: number | null;
  ph: number | null;
  ec: number | null;
  waterTemp: number | null;
  co2: number | null;
}

export interface HarvestPrediction {
  batchId: string;
  batchCode: string;
  isDemoModel: true;
  currentStage: GrowthStage;
  cropAgeDays: number;
  estimatedHarvestDate: string;
  windowStart: string;
  windowEnd: string;
  daysRemaining: number;
  uncertaintyDays: number;
  dataCompletenessPct: number;
  estimatedYieldKg: number | null;
  yieldSupported: boolean;
  factors: string[];
  updatedAt: string;
}

export interface HarvestRecord {
  id: string;
  batchId: string;
  batchCode: string;
  variety: LettuceVariety;
  farmId: string;
  zoneId: string;
  plantingDate: string;
  predictedWindowStart: string;
  predictedWindowEnd: string;
  predictedYieldKg: number | null;
  actualHarvestDate: string;
  actualWeightKg: number;
  harvestedPlantCount: number;
  notes: string;
}

export interface FarmAlert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  explanation: string;
  suggestedAction: string;
  farmId: string;
  zoneId: string | null;
  batchId: string | null;
  deviceId: string | null;
  occurredAt: string;
  isRead: boolean;
  isResolved: boolean;
}

export interface PartnerProfile {
  id: string;
  name: string;
  category: PartnerCategory;
  headquarters: string;
  description: string;
  contactEmail: string;
  website: string;
  isDemonstrationListing: true;
}

export interface PartnerProduct {
  id: string;
  partnerId: string;
  partnerName: string;
  name: string;
  category: PartnerCategory;
  subCategory: string;
  sensorType?: SensorType;
  imageUrl: string;
  description: string;
  specs: Record<string, string>;
  measurementUnit?: string;
  connectivityMethods: ConnectionMethod[];
  compatibilityStatus: CompatibilityStatus;
  compatibilityNote: string;
  isDemonstrationListing: true;
}

export interface PartnerEnquiry {
  id: string;
  productId: string;
  productName: string;
  partnerName: string;
  senderName: string;
  senderEmail: string;
  farmName: string;
  message: string;
  submittedAt: string;
}
