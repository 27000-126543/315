import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, FlaskConical } from "lucide-react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";

const MODEL_TYPES = [
  { value: "MaxEnt", label: "MaxEnt (最大熵模型)" },
  { value: "BRT", label: "BRT (增强回归树)" },
  { value: "GLM", label: "GLM (广义线性模型)" },
  { value: "RandomForest", label: "RandomForest (随机森林)" },
];

export default function TaskCreate() {
  const navigate = useNavigate();
  const species = useStore((s) => s.species);
  const datasets = useStore((s) => s.datasets);
  const addTask = useStore((s) => s.addTask);
  const runTaskSimulation = useStore((s) => s.runTaskSimulation);

  const availableSpecies = species.filter((sp) => !sp.isPaused);
  const validDatasets = datasets.filter((d) => d.status === "VALID");

  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");
  const [modelType, setModelType] = useState("MaxEnt");
  const [timeHorizon, setTimeHorizon] = useState(50);
  const [warningThreshold, setWarningThreshold] = useState(0.2);
  const [showPausedWarning, setShowPausedWarning] = useState(false);

  const selectedSpeciesData = species.find((sp) => sp.id === selectedSpecies);

  const handleSubmit = () => {
    if (!selectedSpecies || !selectedDataset) return;

    const sp = species.find((s) => s.id === selectedSpecies);
    const newTask = {
      id: `t${Date.now().toString(36)}`,
      speciesId: selectedSpecies,
      datasetId: selectedDataset,
      status: "PENDING_REVIEW" as const,
      extinctionProbability: 0,
      populationGrowthRate: 0,
      warningLevel: 0,
      createdBy: "当前用户",
      createdAt: new Date().toISOString(),
      completedAt: null,
      speciesName: sp?.name || "",
      parameters: { modelType, timeHorizon, warningThreshold },
    };
    addTask(newTask);
    setTimeout(() => runTaskSimulation(newTask.id), 500);
    navigate("/tasks");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/tasks" className="flex items-center gap-1 text-forest-400 hover:text-forest-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>
        <h1 className="text-2xl font-display font-bold text-forest-50">创建模拟任务</h1>
      </div>

      <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-forest-200 mb-2">选择物种</label>
          <select
            value={selectedSpecies}
            onChange={(e) => {
              setSelectedSpecies(e.target.value);
              const sp = species.find((s) => s.id === e.target.value);
              setShowPausedWarning(sp?.isPaused ?? false);
            }}
            className="w-full bg-forest-700/50 border border-forest-500/30 rounded-lg px-4 py-2.5 text-forest-100 text-sm focus:outline-none focus:border-forest-400"
          >
            <option value="">-- 请选择物种 --</option>
            {availableSpecies.map((sp) => (
              <option key={sp.id} value={sp.id}>{sp.name} ({sp.scientificName})</option>
            ))}
          </select>
          {showPausedWarning && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-2 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              该物种已被暂停，无法创建新任务
            </motion.div>
          )}
          {selectedSpeciesData && (
            <div className="mt-2 text-xs text-forest-400">
              当前种群: <span className="font-mono text-forest-200">{selectedSpeciesData.currentPopulation.toLocaleString()}</span>
              {" | "}灭绝概率: <span className={cn("font-mono", selectedSpeciesData.extinctionProb > 0.2 ? "text-red-400" : "text-forest-200")}>
                {(selectedSpeciesData.extinctionProb * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-forest-200 mb-2">选择数据集</label>
          <select
            value={selectedDataset}
            onChange={(e) => setSelectedDataset(e.target.value)}
            className="w-full bg-forest-700/50 border border-forest-500/30 rounded-lg px-4 py-2.5 text-forest-100 text-sm focus:outline-none focus:border-forest-400"
          >
            <option value="">-- 请选择数据集 --</option>
            {validDatasets.map((ds) => (
              <option key={ds.id} value={ds.id}>{ds.name} ({ds.recordCount.toLocaleString()} 条)</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-forest-200 mb-2">模型类型</label>
          <div className="grid grid-cols-2 gap-3">
            {MODEL_TYPES.map((mt) => (
              <button
                key={mt.value}
                onClick={() => setModelType(mt.value)}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium transition-all border text-left",
                  modelType === mt.value
                    ? "bg-forest-500/20 border-forest-500/50 text-forest-100"
                    : "bg-forest-800/30 border-forest-500/10 text-forest-400 hover:border-forest-500/30"
                )}
              >
                {mt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-forest-200 mb-2">时间跨度 (年)</label>
            <input
              type="number" value={timeHorizon}
              onChange={(e) => setTimeHorizon(parseInt(e.target.value) || 0)}
              className="w-full bg-forest-700/50 border border-forest-500/30 rounded-lg px-4 py-2.5 text-forest-100 font-mono text-sm focus:outline-none focus:border-forest-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-forest-200 mb-2">预警阈值 (%)</label>
            <input
              type="number" value={warningThreshold * 100} step={1}
              onChange={(e) => setWarningThreshold((parseInt(e.target.value) || 0) / 100)}
              className="w-full bg-forest-700/50 border border-forest-500/30 rounded-lg px-4 py-2.5 text-forest-100 font-mono text-sm focus:outline-none focus:border-forest-400"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSubmit}
          disabled={!selectedSpecies || !selectedDataset || showPausedWarning}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all",
            selectedSpecies && selectedDataset && !showPausedWarning
              ? "bg-forest-500 hover:bg-forest-600 text-forest-50 shadow-lg shadow-forest-500/20"
              : "bg-forest-700/30 text-forest-500 cursor-not-allowed"
          )}
        >
          <FlaskConical className="w-4 h-4" />
          创建任务
        </button>
        <Link to="/tasks" className="px-6 py-2.5 rounded-xl text-sm text-forest-400 hover:text-forest-200 transition-colors">
          取消
        </Link>
      </div>
    </motion.div>
  );
}
