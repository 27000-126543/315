export type TaskStatus =
  | "PENDING_REVIEW"
  | "MODEL_BUILDING"
  | "DISTRIBUTION_SIM"
  | "POPULATION_DYNAMICS"
  | "RISK_ANALYSIS"
  | "COMPLETED"
  | "ERROR";

export type WarningLevel = "LEVEL_1" | "LEVEL_2" | "LEVEL_3";

export type ApprovalLevel = "ECOLOGIST" | "AUTHORITY";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type WarningStatus = "ACTIVE" | "REVIEWED" | "RESOLVED";

export type DatasetType = "SPECIES_DISTRIBUTION" | "ENVIRONMENTAL";

export type DatasetStatus = "UPLOADING" | "VALIDATING" | "VALID" | "INVALID";

export interface Species {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  habitat: string;
  currentPopulation: number;
  extinctionProb: number;
  consecutiveHighRisk: number;
  isPaused: boolean;
}

export interface FieldValidation {
  source: string;
  target: string;
  required: boolean;
  passed: boolean;
  sampleValue?: string;
  typeCheck?: "OK" | "MISMATCH" | "MISSING";
}

export interface RasterMetadata {
  spatialExtent: string;
  resolution: string;
  timeDimension: string;
  crs: string;
  bandCount: number;
}

export interface Dataset {
  id: string;
  name: string;
  type: DatasetType;
  fileName: string;
  status: DatasetStatus;
  uploadedBy: string;
  uploadedAt: string;
  recordCount: number;
  fieldValidations?: FieldValidation[];
  validationErrors?: string[];
  rasterMetadata?: RasterMetadata;
  csvPreview?: { headers: string[]; rows: string[][] };
}

export interface SimulationTask {
  id: string;
  speciesId: string;
  datasetId: string;
  status: TaskStatus;
  extinctionProbability: number;
  populationGrowthRate: number;
  warningLevel: number;
  createdBy: string;
  createdAt: string;
  completedAt: string | null;
  speciesName: string;
  parameters: {
    modelType: string;
    timeHorizon: number;
    warningThreshold: number;
  };
}

export interface Warning {
  id: string;
  taskId: string;
  speciesId: string;
  level: WarningLevel;
  type: "EXTINCTION_PROB" | "POPULATION_GROWTH";
  value: number;
  threshold: number;
  status: WarningStatus;
  reviewedBy: string | null;
  triggeredAt: string;
  speciesName: string;
  taskName: string;
}

export interface Approval {
  id: string;
  taskId: string;
  level: ApprovalLevel;
  status: ApprovalStatus;
  reviewerId: string;
  reviewerName: string;
  comment: string;
  reviewedAt: string | null;
  taskSpeciesName: string;
}

export interface ConservationAdjustment {
  id: string;
  taskId: string;
  speciesId: string;
  type: "BOUNDARY" | "CORRIDOR";
  description: string;
  approvedBy: string;
  adjustedAt: string;
  speciesName: string;
}

export interface StrategyRecommendation {
  id: string;
  speciesId: string;
  strategy: string;
  confidence: number;
  basedOn: string;
  generatedAt: string;
  speciesName: string;
}

export interface DailyMetric {
  id: string;
  date: string;
  completionRate: number;
  avgWarningResponseTime: number;
  optimizationCount: number;
  totalTasks: number;
  completedTasks: number;
}

export interface ActivityEvent {
  id: string;
  type: "TASK_COMPLETED" | "WARNING_TRIGGERED" | "APPROVAL_PASSED" | "ADJUSTMENT_MADE" | "TASK_CREATED";
  message: string;
  timestamp: string;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING_REVIEW: "待校验",
  MODEL_BUILDING: "模型构建",
  DISTRIBUTION_SIM: "分布模拟",
  POPULATION_DYNAMICS: "种群动态",
  RISK_ANALYSIS: "风险分析",
  COMPLETED: "完成",
  ERROR: "异常",
};

export const TASK_STATUS_ORDER: TaskStatus[] = [
  "PENDING_REVIEW",
  "MODEL_BUILDING",
  "DISTRIBUTION_SIM",
  "POPULATION_DYNAMICS",
  "RISK_ANALYSIS",
  "COMPLETED",
  "ERROR",
];

export const WARNING_LEVEL_LABELS: Record<WarningLevel, string> = {
  LEVEL_1: "一级预警",
  LEVEL_2: "二级预警",
  LEVEL_3: "三级预警",
};

export const WARNING_LEVEL_COLORS: Record<WarningLevel, string> = {
  LEVEL_1: "#EAB308",
  LEVEL_2: "#F97316",
  LEVEL_3: "#EF4444",
};
