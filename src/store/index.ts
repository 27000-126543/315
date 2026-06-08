import { create } from "zustand";
import type {
  Species,
  Dataset,
  SimulationTask,
  Warning,
  Approval,
  ConservationAdjustment,
  StrategyRecommendation,
  DailyMetric,
  ActivityEvent,
  TaskStatus,
  WarningLevel,
  ApprovalStatus,
} from "@/types";

const TASK_STATUS_FLOW: TaskStatus[] = [
  "PENDING_REVIEW",
  "MODEL_BUILDING",
  "DISTRIBUTION_SIM",
  "POPULATION_DYNAMICS",
  "RISK_ANALYSIS",
  "COMPLETED",
];

function getNextStatus(current: TaskStatus): TaskStatus | null {
  const idx = TASK_STATUS_FLOW.indexOf(current);
  if (idx < 0 || idx >= TASK_STATUS_FLOW.length - 1) return null;
  return TASK_STATUS_FLOW[idx + 1];
}

function computeWarningLevel(extProb: number, growthRate: number): number {
  if (extProb > 0.2 || growthRate < -0.15) return 3;
  if (extProb > 0.15 || growthRate < -0.1) return 2;
  if (extProb > 0.1 || growthRate < -0.05) return 1;
  return 0;
}

function getWarningLevelEnum(level: number): WarningLevel {
  if (level >= 3) return "LEVEL_3";
  if (level >= 2) return "LEVEL_2";
  return "LEVEL_1";
}

interface AppState {
  species: Species[];
  datasets: Dataset[];
  tasks: SimulationTask[];
  warnings: Warning[];
  approvals: Approval[];
  adjustments: ConservationAdjustment[];
  recommendations: StrategyRecommendation[];
  dailyMetrics: DailyMetric[];
  activities: ActivityEvent[];

  addDataset: (d: Dataset) => void;
  removeDataset: (id: string) => void;
  addTask: (t: SimulationTask) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  updateTaskMetrics: (id: string, extProb: number, growthRate: number) => void;
  addWarning: (w: Warning) => void;
  resolveWarning: (id: string, reviewer: string) => void;
  addApproval: (a: Approval) => void;
  updateApproval: (id: string, status: ApprovalStatus, comment: string) => void;
  addAdjustment: (a: ConservationAdjustment) => void;
  addActivity: (e: ActivityEvent) => void;
  incrementConsecutiveRisk: (speciesId: string) => void;
  resetConsecutiveRisk: (speciesId: string) => void;
  pauseSpecies: (speciesId: string) => void;
  unpauseSpecies: (speciesId: string) => void;
  runTaskSimulation: (taskId: string) => void;
}

const initialSpecies: Species[] = [
  { id: "sp1", name: "华南虎", scientificName: "Panthera tigris amoyensis", category: "哺乳类", habitat: "亚热带森林", currentPopulation: 30, extinctionProb: 0.28, consecutiveHighRisk: 2, isPaused: false },
  { id: "sp2", name: "大熊猫", scientificName: "Ailuropoda melanoleuca", category: "哺乳类", habitat: "温带竹林", currentPopulation: 1864, extinctionProb: 0.08, consecutiveHighRisk: 0, isPaused: false },
  { id: "sp3", name: "朱鹮", scientificName: "Nipponia nippon", category: "鸟类", habitat: "湿地", currentPopulation: 7000, extinctionProb: 0.12, consecutiveHighRisk: 1, isPaused: false },
  { id: "sp4", name: "金丝猴", scientificName: "Rhinopithecus roxellana", category: "哺乳类", habitat: "高山森林", currentPopulation: 25000, extinctionProb: 0.06, consecutiveHighRisk: 0, isPaused: false },
  { id: "sp5", name: "藏羚羊", scientificName: "Pantholops hodgsonii", category: "哺乳类", habitat: "高原草甸", currentPopulation: 300000, extinctionProb: 0.04, consecutiveHighRisk: 0, isPaused: false },
  { id: "sp6", name: "扬子鳄", scientificName: "Alligator sinensis", category: "爬行类", habitat: "淡水湿地", currentPopulation: 300, extinctionProb: 0.22, consecutiveHighRisk: 3, isPaused: true },
  { id: "sp7", name: "白鱀豚", scientificName: "Lipotes vexillifer", category: "哺乳类", habitat: "长江流域", currentPopulation: 0, extinctionProb: 0.95, consecutiveHighRisk: 5, isPaused: true },
  { id: "sp8", name: "雪豹", scientificName: "Panthera uncia", category: "哺乳类", habitat: "高山裸岩", currentPopulation: 4500, extinctionProb: 0.15, consecutiveHighRisk: 1, isPaused: false },
];

const initialDatasets: Dataset[] = [
  {
    id: "ds1", name: "华南虎分布调查2025", type: "SPECIES_DISTRIBUTION", fileName: "tiger_distribution_2025.csv", status: "VALID", uploadedBy: "张研究员", uploadedAt: "2025-12-01T08:30:00Z", recordCount: 1520,
    fieldValidations: [
      { source: "species_name", target: "物种名称", required: true, passed: true, sampleValue: "Panthera tigris amoyensis", typeCheck: "OK" },
      { source: "latitude", target: "纬度", required: true, passed: true, sampleValue: "29.5631", typeCheck: "OK" },
      { source: "longitude", target: "经度", required: true, passed: true, sampleValue: "115.8925", typeCheck: "OK" },
      { source: "observation_date", target: "观测日期", required: true, passed: true, sampleValue: "2025-03-15", typeCheck: "OK" },
      { source: "observer", target: "观测者", required: false, passed: true, sampleValue: "张研究员", typeCheck: "OK" },
      { source: "abundance", target: "丰度", required: false, passed: true, sampleValue: "3", typeCheck: "OK" },
    ],
    csvPreview: { headers: ["species_name", "latitude", "longitude", "observation_date", "observer", "abundance"], rows: [["Panthera tigris amoyensis", "29.5631", "115.8925", "2025-03-15", "张研究员", "3"], ["Panthera tigris amoyensis", "28.7412", "114.3281", "2025-04-02", "李研究员", "1"], ["Panthera tigris amoyensis", "30.1298", "116.5124", "2025-05-10", "王研究员", "2"]] },
  },
  {
    id: "ds2", name: "秦岭环境变量", type: "ENVIRONMENTAL", fileName: "qinling_env_2025.tif", status: "VALID", uploadedBy: "李研究员", uploadedAt: "2025-11-28T14:20:00Z", recordCount: 8500,
    fieldValidations: [
      { source: "bio_variable", target: "环境变量名", required: true, passed: true, sampleValue: "bio1_annual_mean_temp", typeCheck: "OK" },
      { source: "value", target: "变量值", required: true, passed: true, sampleValue: "12.35", typeCheck: "OK" },
      { source: "lat", target: "纬度", required: true, passed: true, sampleValue: "33.75", typeCheck: "OK" },
      { source: "lon", target: "经度", required: true, passed: true, sampleValue: "107.82", typeCheck: "OK" },
      { source: "timestamp", target: "时间戳", required: true, passed: true, sampleValue: "2025-01-01", typeCheck: "OK" },
      { source: "source", target: "数据来源", required: false, passed: true, sampleValue: "WorldClim v2.1", typeCheck: "OK" },
    ],
    rasterMetadata: { spatialExtent: "107.5°E-109.5°E, 32.8°N-34.5°N", resolution: "30 arc-seconds (~1km)", timeDimension: "2025-01 至 2025-12", crs: "WGS84 (EPSG:4326)", bandCount: 19 },
  },
  {
    id: "ds3", name: "大熊猫栖息地数据", type: "SPECIES_DISTRIBUTION", fileName: "panda_habitat_2025.csv", status: "VALID", uploadedBy: "王研究员", uploadedAt: "2025-12-03T09:10:00Z", recordCount: 3200,
    fieldValidations: [
      { source: "species_name", target: "物种名称", required: true, passed: true, sampleValue: "Ailuropoda melanoleuca", typeCheck: "OK" },
      { source: "latitude", target: "纬度", required: true, passed: true, sampleValue: "33.4512", typeCheck: "OK" },
      { source: "longitude", target: "经度", required: true, passed: true, sampleValue: "107.7834", typeCheck: "OK" },
      { source: "observation_date", target: "观测日期", required: true, passed: true, sampleValue: "2025-06-20", typeCheck: "OK" },
      { source: "observer", target: "观测者", required: false, passed: true, sampleValue: "王研究员", typeCheck: "OK" },
      { source: "abundance", target: "丰度", required: false, passed: false, sampleValue: "-", typeCheck: "MISSING" },
    ],
    csvPreview: { headers: ["species_name", "latitude", "longitude", "observation_date", "observer"], rows: [["Ailuropoda melanoleuca", "33.4512", "107.7834", "2025-06-20", "王研究员"], ["Ailuropoda melanoleuca", "33.5201", "107.6952", "2025-07-05", "赵研究员"], ["Ailuropoda melanoleuca", "33.3897", "107.8201", "2025-07-18", "李研究员"]] },
  },
  {
    id: "ds4", name: "长江流域气候数据", type: "ENVIRONMENTAL", fileName: "yangtze_climate_2025.nc", status: "VALID", uploadedBy: "赵研究员", uploadedAt: "2025-12-05T11:45:00Z", recordCount: 12000,
    fieldValidations: [
      { source: "bio_variable", target: "环境变量名", required: true, passed: true, sampleValue: "precipitation", typeCheck: "OK" },
      { source: "value", target: "变量值", required: true, passed: true, sampleValue: "856.2", typeCheck: "OK" },
      { source: "lat", target: "纬度", required: true, passed: true, sampleValue: "30.25", typeCheck: "OK" },
      { source: "lon", target: "经度", required: true, passed: true, sampleValue: "112.35", typeCheck: "OK" },
      { source: "timestamp", target: "时间戳", required: true, passed: true, sampleValue: "2025-06-01", typeCheck: "OK" },
      { source: "source", target: "数据来源", required: false, passed: false, sampleValue: "-", typeCheck: "MISSING" },
    ],
    rasterMetadata: { spatialExtent: "90°E-122°E, 24°N-35°N", resolution: "0.25° (~25km)", timeDimension: "2025-01 至 2025-12 (月均值)", crs: "WGS84 (EPSG:4326)", bandCount: 12 },
  },
];

const now = new Date();
const fmt = (d: Date) => d.toISOString();
const hoursAgo = (h: number) => fmt(new Date(now.getTime() - h * 3600000));
const daysAgo = (d: number) => fmt(new Date(now.getTime() - d * 86400000));

const initialTasks: SimulationTask[] = [
  { id: "t1", speciesId: "sp1", datasetId: "ds1", status: "RISK_ANALYSIS", extinctionProbability: 0.28, populationGrowthRate: -0.12, warningLevel: 3, createdBy: "张研究员", createdAt: daysAgo(2), completedAt: null, speciesName: "华南虎", parameters: { modelType: "MaxEnt", timeHorizon: 50, warningThreshold: 0.2 } },
  { id: "t2", speciesId: "sp2", datasetId: "ds3", status: "COMPLETED", extinctionProbability: 0.08, populationGrowthRate: 0.03, warningLevel: 0, createdBy: "王研究员", createdAt: daysAgo(5), completedAt: daysAgo(3), speciesName: "大熊猫", parameters: { modelType: "BRT", timeHorizon: 30, warningThreshold: 0.2 } },
  { id: "t3", speciesId: "sp3", datasetId: "ds2", status: "POPULATION_DYNAMICS", extinctionProbability: 0.12, populationGrowthRate: -0.04, warningLevel: 1, createdBy: "李研究员", createdAt: daysAgo(1), completedAt: null, speciesName: "朱鹮", parameters: { modelType: "GLM", timeHorizon: 40, warningThreshold: 0.2 } },
  { id: "t4", speciesId: "sp6", datasetId: "ds4", status: "ERROR", extinctionProbability: 0.22, populationGrowthRate: -0.18, warningLevel: 3, createdBy: "赵研究员", createdAt: daysAgo(3), completedAt: null, speciesName: "扬子鳄", parameters: { modelType: "RandomForest", timeHorizon: 60, warningThreshold: 0.2 } },
  { id: "t5", speciesId: "sp8", datasetId: "ds2", status: "MODEL_BUILDING", extinctionProbability: 0, populationGrowthRate: 0, warningLevel: 0, createdBy: "李研究员", createdAt: hoursAgo(4), completedAt: null, speciesName: "雪豹", parameters: { modelType: "MaxEnt", timeHorizon: 50, warningThreshold: 0.2 } },
  { id: "t6", speciesId: "sp4", datasetId: "ds3", status: "DISTRIBUTION_SIM", extinctionProbability: 0, populationGrowthRate: 0, warningLevel: 0, createdBy: "王研究员", createdAt: hoursAgo(8), completedAt: null, speciesName: "金丝猴", parameters: { modelType: "BRT", timeHorizon: 35, warningThreshold: 0.2 } },
  { id: "t7", speciesId: "sp5", datasetId: "ds4", status: "PENDING_REVIEW", extinctionProbability: 0, populationGrowthRate: 0, warningLevel: 0, createdBy: "赵研究员", createdAt: hoursAgo(1), completedAt: null, speciesName: "藏羚羊", parameters: { modelType: "GLM", timeHorizon: 25, warningThreshold: 0.2 } },
  { id: "t8", speciesId: "sp7", datasetId: "ds1", status: "COMPLETED", extinctionProbability: 0.95, populationGrowthRate: -0.45, warningLevel: 3, createdBy: "张研究员", createdAt: daysAgo(10), completedAt: daysAgo(7), speciesName: "白鱀豚", parameters: { modelType: "MaxEnt", timeHorizon: 20, warningThreshold: 0.2 } },
];

const initialWarnings: Warning[] = [
  { id: "w1", taskId: "t1", speciesId: "sp1", level: "LEVEL_3", type: "EXTINCTION_PROB", value: 0.28, threshold: 0.2, status: "ACTIVE", reviewedBy: null, triggeredAt: hoursAgo(6), speciesName: "华南虎", taskName: "华南虎模拟 #T1" },
  { id: "w2", taskId: "t3", speciesId: "sp3", level: "LEVEL_1", type: "EXTINCTION_PROB", value: 0.12, threshold: 0.1, status: "ACTIVE", reviewedBy: null, triggeredAt: hoursAgo(12), speciesName: "朱鹮", taskName: "朱鹮模拟 #T3" },
  { id: "w3", taskId: "t4", speciesId: "sp6", level: "LEVEL_3", type: "POPULATION_GROWTH", value: -0.18, threshold: -0.1, status: "REVIEWED", reviewedBy: "陈生态学家", triggeredAt: daysAgo(2), speciesName: "扬子鳄", taskName: "扬子鳄模拟 #T4" },
  { id: "w4", taskId: "t1", speciesId: "sp1", level: "LEVEL_2", type: "POPULATION_GROWTH", value: -0.12, threshold: -0.1, status: "ACTIVE", reviewedBy: null, triggeredAt: hoursAgo(5), speciesName: "华南虎", taskName: "华南虎模拟 #T1" },
  { id: "w5", taskId: "t8", speciesId: "sp7", level: "LEVEL_3", type: "EXTINCTION_PROB", value: 0.95, threshold: 0.2, status: "RESOLVED", reviewedBy: "陈生态学家", triggeredAt: daysAgo(7), speciesName: "白鱀豚", taskName: "白鱀豚模拟 #T8" },
];

const initialApprovals: Approval[] = [
  { id: "a1", taskId: "t2", level: "ECOLOGIST", status: "APPROVED", reviewerId: "u2", reviewerName: "陈生态学家", comment: "模型参数合理，结果可信", reviewedAt: daysAgo(4), taskSpeciesName: "大熊猫" },
  { id: "a2", taskId: "t2", level: "AUTHORITY", status: "APPROVED", reviewerId: "u3", reviewerName: "刘保护权威", comment: "同意保护策略", reviewedAt: daysAgo(3), taskSpeciesName: "大熊猫" },
  { id: "a3", taskId: "t8", level: "ECOLOGIST", status: "APPROVED", reviewerId: "u2", reviewerName: "陈生态学家", comment: "已确认功能灭绝判断", reviewedAt: daysAgo(8), taskSpeciesName: "白鱀豚" },
  { id: "a4", taskId: "t8", level: "AUTHORITY", status: "APPROVED", reviewerId: "u3", reviewerName: "刘保护权威", comment: "紧急保护措施已启动", reviewedAt: daysAgo(7), taskSpeciesName: "白鱀豚" },
  { id: "a5", taskId: "t1", level: "ECOLOGIST", status: "PENDING", reviewerId: "", reviewerName: "", comment: "", reviewedAt: null, taskSpeciesName: "华南虎" },
];

const initialAdjustments: ConservationAdjustment[] = [
  { id: "adj1", taskId: "t2", speciesId: "sp2", type: "BOUNDARY", description: "扩大秦岭大熊猫保护区东界3.5km", approvedBy: "刘保护权威", adjustedAt: daysAgo(3), speciesName: "大熊猫" },
  { id: "adj2", taskId: "t8", speciesId: "sp7", type: "CORRIDOR", description: "新增长江中游生态廊道连接鄱阳湖", approvedBy: "刘保护权威", adjustedAt: daysAgo(7), speciesName: "白鱀豚" },
  { id: "adj3", taskId: "t2", speciesId: "sp2", type: "CORRIDOR", description: "建设佛坪-长青保护区廊道", approvedBy: "刘保护权威", adjustedAt: daysAgo(2), speciesName: "大熊猫" },
];

const initialRecommendations: StrategyRecommendation[] = [
  { id: "r1", speciesId: "sp1", strategy: "建议在华南虎历史分布区建立3个核心保护区并构建生态廊道连接，同时加强反盗猎巡逻力度", confidence: 0.87, basedOn: "基于12次历史模拟数据", generatedAt: daysAgo(1), speciesName: "华南虎" },
  { id: "r2", speciesId: "sp2", strategy: "维持现有保护区规模，优化竹林结构以提升栖息地质量，建议增加竹林连通性", confidence: 0.92, basedOn: "基于25次历史模拟数据", generatedAt: daysAgo(2), speciesName: "大熊猫" },
  { id: "r3", speciesId: "sp6", strategy: "紧急扩大扬子鳄人工繁殖计划，恢复湿地栖息地，建议限制周边农业开发", confidence: 0.78, basedOn: "基于8次历史模拟数据", generatedAt: daysAgo(1), speciesName: "扬子鳄" },
  { id: "r4", speciesId: "sp7", strategy: "启动长江生态系统全面修复计划，恢复鱼类资源作为食物链基础", confidence: 0.65, basedOn: "基于6次历史模拟数据", generatedAt: daysAgo(3), speciesName: "白鱀豚" },
  { id: "r5", speciesId: "sp8", strategy: "加强高原牧区社区参与保护，建立雪豹-牧民共存机制，减少人兽冲突", confidence: 0.83, basedOn: "基于15次历史模拟数据", generatedAt: daysAgo(1), speciesName: "雪豹" },
];

const initialMetrics: DailyMetric[] = Array.from({ length: 14 }, (_, i) => ({
  id: `dm${i + 1}`,
  date: fmt(new Date(now.getTime() - (13 - i) * 86400000)).split("T")[0],
  completionRate: Math.round((60 + Math.random() * 30) * 10) / 10,
  avgWarningResponseTime: Math.round((1.5 + Math.random() * 3) * 10) / 10,
  optimizationCount: Math.floor(Math.random() * 5),
  totalTasks: 20 + Math.floor(i * 1.2),
  completedTasks: 12 + Math.floor(i * 1.1),
}));

const initialActivities: ActivityEvent[] = [
  { id: "ev1", type: "WARNING_TRIGGERED", message: "华南虎灭绝概率升至28%，触发三级预警", timestamp: hoursAgo(6) },
  { id: "ev2", type: "TASK_COMPLETED", message: "大熊猫种群动态模拟已完成", timestamp: daysAgo(3) },
  { id: "ev3", type: "APPROVAL_PASSED", message: "大熊猫保护策略已通过保护权威确认", timestamp: daysAgo(3) },
  { id: "ev4", type: "ADJUSTMENT_MADE", message: "秦岭大熊猫保护区东界已扩展3.5km", timestamp: daysAgo(3) },
  { id: "ev5", type: "TASK_CREATED", message: "雪豹分布模拟任务已创建", timestamp: hoursAgo(4) },
  { id: "ev6", type: "WARNING_TRIGGERED", message: "朱鹮灭绝概率达12%，触发一级预警", timestamp: hoursAgo(12) },
  { id: "ev7", type: "TASK_COMPLETED", message: "白鱀豚风险评估已完成(功能灭绝)", timestamp: daysAgo(7) },
  { id: "ev8", type: "APPROVAL_PASSED", message: "白鱀豚紧急保护措施已获批准", timestamp: daysAgo(7) },
];

export const useStore = create<AppState>((set, get) => ({
  species: initialSpecies,
  datasets: initialDatasets,
  tasks: initialTasks,
  warnings: initialWarnings,
  approvals: initialApprovals,
  adjustments: initialAdjustments,
  recommendations: initialRecommendations,
  dailyMetrics: initialMetrics,
  activities: initialActivities,

  addDataset: (d) => set((s) => ({ datasets: [...s.datasets, d] })),
  removeDataset: (id) => set((s) => ({ datasets: s.datasets.filter((d) => d.id !== id) })),
  addTask: (t) => set((s) => ({ tasks: [...s.tasks, t] })),
  updateTaskStatus: (id, status) => set((s) => ({
    tasks: s.tasks.map((t) => (t.id === id ? { ...t, status, completedAt: status === "COMPLETED" ? new Date().toISOString() : t.completedAt } : t)),
  })),
  updateTaskMetrics: (id, extProb, growthRate) => {
    const wl = computeWarningLevel(extProb, growthRate);
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, extinctionProbability: extProb, populationGrowthRate: growthRate, warningLevel: Math.max(t.warningLevel, wl) } : t)),
    }));
  },
  addWarning: (w) => set((s) => ({ warnings: [w, ...s.warnings] })),
  resolveWarning: (id, reviewer) => {
    const state = get();
    const warning = state.warnings.find((w) => w.id === id);
    if (!warning || warning.status !== "ACTIVE") return;

    const adjId = `adj_${Date.now()}`;
    const adjType = Math.random() > 0.5 ? "BOUNDARY" as const : "CORRIDOR" as const;
    const adjDescription = adjType === "BOUNDARY"
      ? `根据${warning.speciesName}预警复核结果，扩大保护区边界${(Math.random() * 5 + 1).toFixed(1)}km`
      : `根据${warning.speciesName}预警复核结果，新增生态廊道连接核心栖息地`;

    const adj: ConservationAdjustment = {
      id: adjId,
      taskId: warning.taskId,
      speciesId: warning.speciesId,
      type: adjType,
      description: adjDescription,
      approvedBy: reviewer,
      adjustedAt: new Date().toISOString(),
      speciesName: warning.speciesName,
    };

    const actId = `ev_${Date.now()}`;
    const act: ActivityEvent = {
      id: actId,
      type: "ADJUSTMENT_MADE",
      message: adjType === "BOUNDARY"
        ? `${warning.speciesName}保护区边界已调整(复核通过)`
        : `${warning.speciesName}生态廊道已新增(复核通过)`,
      timestamp: new Date().toISOString(),
    };

    set((s) => ({
      warnings: s.warnings.map((w) => (w.id === id ? { ...w, status: "RESOLVED" as const, reviewedBy: reviewer } : w)),
      adjustments: [adj, ...s.adjustments],
      activities: [act, ...s.activities],
    }));
  },
  addApproval: (a) => set((s) => ({ approvals: [...s.approvals, a] })),
  updateApproval: (id, status, comment) => {
    const state = get();
    const approval = state.approvals.find((a) => a.id === id);
    if (!approval) return;

    if (status === "APPROVED" && approval.level === "ECOLOGIST") {
      const authorityApproval: Approval = {
        id: `a_${Date.now()}`,
        taskId: approval.taskId,
        level: "AUTHORITY",
        status: "PENDING",
        reviewerId: "",
        reviewerName: "",
        comment: "",
        reviewedAt: null,
        taskSpeciesName: approval.taskSpeciesName,
      };
      set((s) => ({
        approvals: [
          ...s.approvals.map((a) => (a.id === id ? { ...a, status, comment, reviewedAt: new Date().toISOString(), reviewerName: "陈生态学家", reviewerId: "u2" } : a)),
          authorityApproval,
        ],
      }));
    } else if (status === "APPROVED" && approval.level === "AUTHORITY") {
      const actId = `ev_${Date.now()}`;
      const act: ActivityEvent = {
        id: actId,
        type: "APPROVAL_PASSED",
        message: `${approval.taskSpeciesName}保护策略已通过保护权威确认，已推送至保护区管理局`,
        timestamp: new Date().toISOString(),
      };
      set((s) => ({
        approvals: s.approvals.map((a) => (a.id === id ? { ...a, status, comment, reviewedAt: new Date().toISOString(), reviewerName: "刘保护权威", reviewerId: "u3" } : a)),
        activities: [act, ...s.activities],
      }));
    } else if (status === "REJECTED") {
      const actId = `ev_${Date.now()}`;
      const act: ActivityEvent = {
        id: actId,
        type: "WARNING_TRIGGERED",
        message: `${approval.taskSpeciesName}${approval.level === "ECOLOGIST" ? "种群生态学家" : "保护权威"}审批被驳回`,
        timestamp: new Date().toISOString(),
      };
      set((s) => ({
        approvals: s.approvals.map((a) => (a.id === id ? {
          ...a, status, comment, reviewedAt: new Date().toISOString(),
          reviewerName: approval.level === "ECOLOGIST" ? "陈生态学家" : "刘保护权威",
          reviewerId: approval.level === "ECOLOGIST" ? "u2" : "u3",
        } : a)),
        tasks: s.tasks.map((t) => (t.id === approval.taskId ? { ...t, status: "ERROR" as const } : t)),
        activities: [act, ...s.activities],
      }));
    } else {
      set((s) => ({
        approvals: s.approvals.map((a) => (a.id === id ? { ...a, status, comment, reviewedAt: new Date().toISOString() } : a)),
      }));
    }
  },
  addAdjustment: (a) => set((s) => ({ adjustments: [a, ...s.adjustments] })),
  addActivity: (e) => set((s) => ({ activities: [e, ...s.activities] })),
  incrementConsecutiveRisk: (speciesId) => set((s) => {
    const sp = s.species.find((x) => x.id === speciesId);
    if (!sp) return s;
    const newCount = sp.consecutiveHighRisk + 1;
    const shouldPause = newCount >= 3;
    return {
      species: s.species.map((x) => (x.id === speciesId ? { ...x, consecutiveHighRisk: newCount, isPaused: shouldPause ? true : x.isPaused } : x)),
      ...(shouldPause ? {
        activities: [{
          id: `ev_${Date.now()}`,
          type: "WARNING_TRIGGERED" as const,
          message: `${sp.name}连续${newCount}次灭绝概率超过20%，已暂停新任务并通知首席科学家`,
          timestamp: new Date().toISOString(),
        }, ...s.activities],
      } : {}),
    };
  }),
  resetConsecutiveRisk: (speciesId) => set((s) => ({ species: s.species.map((sp) => (sp.id === speciesId ? { ...sp, consecutiveHighRisk: 0 } : sp)) })),
  pauseSpecies: (speciesId) => set((s) => ({ species: s.species.map((sp) => (sp.id === speciesId ? { ...sp, isPaused: true } : sp)) })),
  unpauseSpecies: (speciesId) => set((s) => ({ species: s.species.map((sp) => (sp.id === speciesId ? { ...sp, isPaused: false, consecutiveHighRisk: 0 } : sp)) })),

  runTaskSimulation: (taskId: string) => {
    const state = get();
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task || task.status === "COMPLETED" || task.status === "ERROR") return;

    const species = state.species.find((sp) => sp.id === task.speciesId);
    const baseExtProb = species ? species.extinctionProb : Math.random() * 0.3;
    const baseGrowthRate = species ? -species.extinctionProb * 0.5 : -(Math.random() * 0.1);

    const steps: TaskStatus[] = ["PENDING_REVIEW", "MODEL_BUILDING", "DISTRIBUTION_SIM", "POPULATION_DYNAMICS", "RISK_ANALYSIS", "COMPLETED"];
    const startIdx = steps.indexOf(task.status);
    if (startIdx < 0) return;

    let currentIdx = startIdx;
    let currentExtProb = task.extinctionProbability;
    let currentGrowthRate = task.populationGrowthRate;

    const advance = () => {
      currentIdx++;
      if (currentIdx >= steps.length) return;

      const nextStatus = steps[currentIdx];
      const s = get();
      const currentTask = s.tasks.find((t) => t.id === taskId);
      if (!currentTask || currentTask.status === "ERROR") return;

      if (currentIdx >= 2) {
        currentExtProb = Math.round((baseExtProb + Math.random() * 0.1) * 1000) / 1000;
        currentGrowthRate = Math.round((baseGrowthRate + (Math.random() - 0.5) * 0.05) * 1000) / 1000;
      }
      if (currentIdx === 3) {
        currentExtProb = Math.round((currentExtProb + Math.random() * 0.05) * 1000) / 1000;
        currentGrowthRate = Math.round((currentGrowthRate - Math.random() * 0.03) * 1000) / 1000;
      }
      if (currentIdx === 4) {
        currentExtProb = Math.round((currentExtProb + Math.random() * 0.03) * 1000) / 1000;
        currentGrowthRate = Math.round((currentGrowthRate - Math.random() * 0.02) * 1000) / 1000;
      }

      const wl = computeWarningLevel(currentExtProb, currentGrowthRate);

      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === taskId ? {
          ...t,
          status: nextStatus,
          extinctionProbability: currentIdx >= 2 ? currentExtProb : t.extinctionProbability,
          populationGrowthRate: currentIdx >= 2 ? currentGrowthRate : t.populationGrowthRate,
          warningLevel: Math.max(t.warningLevel, wl),
          completedAt: nextStatus === "COMPLETED" ? new Date().toISOString() : null,
        } : t)),
      }));

      if (wl > 0 && (nextStatus === "POPULATION_DYNAMICS" || nextStatus === "RISK_ANALYSIS")) {
        const checkValue = currentExtProb;
        const warningType = checkValue > (task.parameters.warningThreshold || 0.2) ? "EXTINCTION_PROB" as const : "POPULATION_GROWTH" as const;
        const warningValue = warningType === "EXTINCTION_PROB" ? currentExtProb : currentGrowthRate;
        const warningThreshold = warningType === "EXTINCTION_PROB" ? (task.parameters.warningThreshold || 0.2) : -0.1;

        const wId = `w_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const newWarning: Warning = {
          id: wId,
          taskId,
          speciesId: task.speciesId,
          level: getWarningLevelEnum(wl),
          type: warningType,
          value: warningValue,
          threshold: warningThreshold,
          status: "ACTIVE",
          reviewedBy: null,
          triggeredAt: new Date().toISOString(),
          speciesName: task.speciesName,
          taskName: `${task.speciesName}模拟 #${taskId.toUpperCase()}`,
        };

        const actId = `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const levelLabel = wl >= 3 ? "三级" : wl >= 2 ? "二级" : "一级";

        set((s) => ({
          warnings: [newWarning, ...s.warnings],
          activities: [{
            id: actId,
            type: "WARNING_TRIGGERED",
            message: `${task.speciesName}灭绝概率升至${(currentExtProb * 100).toFixed(1)}%，触发${levelLabel}预警`,
            timestamp: new Date().toISOString(),
          }, ...s.activities],
        }));

        if (currentExtProb > 0.2) {
          get().incrementConsecutiveRisk(task.speciesId);
        }
      }

      if (nextStatus === "COMPLETED") {
        const actId = `ev_${Date.now()}`;
        set((s) => ({
          activities: [{
            id: actId,
            type: "TASK_COMPLETED",
            message: `${task.speciesName}模拟任务已完成`,
            timestamp: new Date().toISOString(),
          }, ...s.activities],
        }));

        const existingEcologist = get().approvals.find(
          (a) => a.taskId === taskId && a.level === "ECOLOGIST"
        );
        if (!existingEcologist) {
          get().addApproval({
            id: `a_${Date.now()}`,
            taskId,
            level: "ECOLOGIST",
            status: "PENDING",
            reviewerId: "",
            reviewerName: "",
            comment: "",
            reviewedAt: null,
            taskSpeciesName: task.speciesName,
          });
        }
      }

      if (nextStatus !== "COMPLETED") {
        setTimeout(advance, 2000);
      }
    };

    setTimeout(advance, 1500);
  },
}));
