import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, TrendingDown, Clock } from "lucide-react";
import { useStore } from "@/store";
import { TASK_STATUS_LABELS, TASK_STATUS_ORDER, WARNING_LEVEL_LABELS } from "@/types";
import type { TaskStatus } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_DOT_COLORS: Record<TaskStatus, string> = {
  PENDING_REVIEW: "bg-slate-400",
  MODEL_BUILDING: "bg-blue-400",
  DISTRIBUTION_SIM: "bg-cyan-400",
  POPULATION_DYNAMICS: "bg-green-400",
  RISK_ANALYSIS: "bg-amber-400",
  COMPLETED: "bg-emerald-400",
  ERROR: "bg-red-400",
};

const STATUS_LINE_COLORS: Record<TaskStatus, string> = {
  PENDING_REVIEW: "bg-slate-400",
  MODEL_BUILDING: "bg-blue-400",
  DISTRIBUTION_SIM: "bg-cyan-400",
  POPULATION_DYNAMICS: "bg-green-400",
  RISK_ANALYSIS: "bg-amber-400",
  COMPLETED: "bg-emerald-400",
  ERROR: "bg-red-400",
};

function GaugeCircle({ value, label, color }: { value: number; label: string; color: string }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(value * 100, 100);
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-44 h-44">
        <svg className="w-44 h-44 -rotate-90" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(45,106,79,0.2)" strokeWidth="12" />
          <circle
            cx="90" cy="90" r={radius} fill="none"
            stroke={color} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-bold" style={{ color }}>{percent.toFixed(1)}%</span>
          <span className="text-xs text-forest-400 mt-1">{label}</span>
        </div>
      </div>
    </div>
  );
}

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const tasks = useStore((s) => s.tasks);
  const warnings = useStore((s) => s.warnings);
  const approvals = useStore((s) => s.approvals);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-forest-400">
        <p className="text-lg">任务未找到</p>
        <Link to="/tasks" className="mt-4 text-forest-300 hover:text-forest-100">返回任务列表</Link>
      </div>
    );
  }

  const currentStepIndex = TASK_STATUS_ORDER.indexOf(task.status);
  const taskWarnings = warnings.filter((w) => w.taskId === task.id);
  const taskApprovals = approvals.filter((a) => a.taskId === task.id);

  const extProbColor = task.extinctionProbability > 0.2 ? "#EF4444" : task.extinctionProbability > 0.1 ? "#F59E0B" : "#10B981";
  const growthRateColor = task.populationGrowthRate < -0.1 ? "#EF4444" : task.populationGrowthRate < 0 ? "#F59E0B" : "#10B981";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/tasks" className="flex items-center gap-1 text-forest-400 hover:text-forest-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>
        <h1 className="text-2xl font-display font-bold text-forest-50">
          任务详情 <span className="text-forest-400 font-mono text-lg">#{task.id.toUpperCase()}</span>
        </h1>
      </div>

      <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow p-6">
        <h2 className="text-sm font-medium text-forest-300 mb-4">状态流转</h2>
        <div className="relative flex items-center justify-between">
          {TASK_STATUS_ORDER.map((status, i) => {
            const isCompleted = i < currentStepIndex;
            const isCurrent = i === currentStepIndex;
            const isFuture = i > currentStepIndex;
            return (
              <div key={status} className="flex flex-col items-center relative z-10" style={{ width: `${100 / TASK_STATUS_ORDER.length}%` }}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                  isCompleted ? "bg-forest-500 border-forest-400 text-forest-50" :
                  isCurrent ? "bg-amber-500/20 border-amber-400 text-amber-400 scale-110 shadow-lg shadow-amber-500/20" :
                  "bg-forest-800 border-forest-500/30 text-forest-500"
                )}>
                  {isCompleted ? "✓" : i + 1}
                </div>
                <span className={cn(
                  "mt-2 text-[10px] text-center leading-tight",
                  isCurrent ? "text-amber-400 font-medium" : isFuture ? "text-forest-500" : "text-forest-300"
                )}>
                  {TASK_STATUS_LABELS[status]}
                </span>
                {i < TASK_STATUS_ORDER.length - 1 && (
                  <div className={cn(
                    "absolute top-4 left-1/2 w-full h-0.5",
                    isCompleted ? "bg-forest-500" : "bg-forest-600/30"
                  )} style={{ transform: "translateX(50%)" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow p-6 flex flex-col items-center">
          <h2 className="text-sm font-medium text-forest-300 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> 灭绝概率
          </h2>
          <GaugeCircle value={task.extinctionProbability} label="灭绝概率" color={extProbColor} />
          <div className="mt-3 text-xs text-forest-400">
            阈值: 20% | {task.extinctionProbability > 0.2 ? "已超阈值" : "正常范围"}
          </div>
        </div>

        <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow p-6 flex flex-col items-center">
          <h2 className="text-sm font-medium text-forest-300 mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" /> 种群增长率
          </h2>
          <GaugeCircle value={Math.abs(task.populationGrowthRate)} label="增长率(绝对值)" color={growthRateColor} />
          <div className="mt-3 text-xs text-forest-400">
            当前: <span className={cn("font-mono font-bold", task.populationGrowthRate < 0 ? "text-red-400" : "text-green-400")}>
              {(task.populationGrowthRate * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow p-6">
        <h2 className="text-sm font-medium text-forest-300 mb-4">任务参数</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-forest-700/30 rounded-lg p-3">
            <p className="text-xs text-forest-400">模型类型</p>
            <p className="font-mono text-forest-100 mt-1">{task.parameters.modelType}</p>
          </div>
          <div className="bg-forest-700/30 rounded-lg p-3">
            <p className="text-xs text-forest-400">时间跨度</p>
            <p className="font-mono text-forest-100 mt-1">{task.parameters.timeHorizon} 年</p>
          </div>
          <div className="bg-forest-700/30 rounded-lg p-3">
            <p className="text-xs text-forest-400">预警阈值</p>
            <p className="font-mono text-forest-100 mt-1">{(task.parameters.warningThreshold * 100).toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {taskWarnings.length > 0 && (
        <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow p-6">
          <h2 className="text-sm font-medium text-forest-300 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> 相关预警
          </h2>
          <div className="space-y-3">
            {taskWarnings.map((w) => (
              <div key={w.id} className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                w.level === "LEVEL_3" ? "border-red-500/30 bg-red-500/5" :
                w.level === "LEVEL_2" ? "border-orange-500/30 bg-orange-500/5" :
                "border-yellow-500/30 bg-yellow-500/5"
              )}>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    w.level === "LEVEL_3" ? "bg-red-500/20 text-red-400" :
                    w.level === "LEVEL_2" ? "bg-orange-500/20 text-orange-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  )}>
                    {WARNING_LEVEL_LABELS[w.level]}
                  </span>
                  <span className="text-sm text-forest-200">
                    {w.type === "EXTINCTION_PROB" ? "灭绝概率" : "种群增长率"}: {w.type === "EXTINCTION_PROB" ? `${(w.value * 100).toFixed(1)}%` : `${(w.value * 100).toFixed(1)}%`}
                  </span>
                </div>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded",
                  w.status === "ACTIVE" ? "bg-red-500/20 text-red-300" :
                  w.status === "REVIEWED" ? "bg-amber-500/20 text-amber-300" :
                  "bg-green-500/20 text-green-300"
                )}>
                  {w.status === "ACTIVE" ? "活跃" : w.status === "REVIEWED" ? "已复核" : "已解决"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {taskApprovals.length > 0 && (
        <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow p-6">
          <h2 className="text-sm font-medium text-forest-300 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" /> 审批记录
          </h2>
          <div className="space-y-3">
            {taskApprovals.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-forest-700/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    a.level === "ECOLOGIST" ? "bg-sky-500/20 text-sky-300" : "bg-violet-500/20 text-violet-300"
                  )}>
                    {a.level === "ECOLOGIST" ? "种群生态学家" : "保护权威"}
                  </span>
                  <span className="text-sm text-forest-200">{a.reviewerName || "待审批"}</span>
                </div>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded",
                  a.status === "PENDING" ? "bg-yellow-500/20 text-yellow-300" :
                  a.status === "APPROVED" ? "bg-green-500/20 text-green-300" :
                  "bg-red-500/20 text-red-300"
                )}>
                  {a.status === "PENDING" ? "待审批" : a.status === "APPROVED" ? "已通过" : "已驳回"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
