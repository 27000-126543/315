import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Eye } from "lucide-react";
import { useStore } from "@/store";
import { TASK_STATUS_LABELS } from "@/types";
import type { TaskStatus } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<TaskStatus, string> = {
  PENDING_REVIEW: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  MODEL_BUILDING: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  DISTRIBUTION_SIM: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  POPULATION_DYNAMICS: "bg-green-500/20 text-green-300 border-green-500/30",
  RISK_ANALYSIS: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  COMPLETED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  ERROR: "bg-red-500/20 text-red-300 border-red-500/30",
};

const TABS: { label: string; value: TaskStatus | "ALL" }[] = [
  { label: "全部", value: "ALL" },
  { label: "待校验", value: "PENDING_REVIEW" },
  { label: "模型构建", value: "MODEL_BUILDING" },
  { label: "分布模拟", value: "DISTRIBUTION_SIM" },
  { label: "种群动态", value: "POPULATION_DYNAMICS" },
  { label: "风险分析", value: "RISK_ANALYSIS" },
  { label: "完成", value: "COMPLETED" },
  { label: "异常", value: "ERROR" },
];

export default function TaskList() {
  const tasks = useStore((s) => s.tasks);
  const [activeTab, setActiveTab] = useState<TaskStatus | "ALL">("ALL");

  const filtered = activeTab === "ALL" ? tasks : tasks.filter((t) => t.status === activeTab);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-display text-forest-50">模拟任务</h1>
        <Link
          to="/tasks/create"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-forest-500 hover:bg-forest-600 text-forest-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          创建任务
        </Link>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm whitespace-nowrap border transition-colors",
              activeTab === tab.value
                ? "bg-forest-500/30 text-forest-50 border-forest-500/50"
                : "bg-forest-800/50 text-forest-200 border-forest-500/20 hover:border-forest-500/40"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-forest-500/20">
              <th className="text-left px-4 py-3 text-forest-300 font-medium">ID</th>
              <th className="text-left px-4 py-3 text-forest-300 font-medium">物种名</th>
              <th className="text-left px-4 py-3 text-forest-300 font-medium">状态</th>
              <th className="text-left px-4 py-3 text-forest-300 font-medium">灭绝概率</th>
              <th className="text-left px-4 py-3 text-forest-300 font-medium">种群增长率</th>
              <th className="text-left px-4 py-3 text-forest-300 font-medium">预警等级</th>
              <th className="text-left px-4 py-3 text-forest-300 font-medium">创建时间</th>
              <th className="text-left px-4 py-3 text-forest-300 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((task) => (
              <tr key={task.id} className="border-b border-forest-500/10 hover:bg-forest-700/20 transition-colors">
                <td className="px-4 py-3 font-mono text-forest-200">#{task.id.toUpperCase()}</td>
                <td className="px-4 py-3 text-forest-50 font-medium">{task.speciesName}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-block px-2.5 py-0.5 rounded-full text-xs border", STATUS_COLORS[task.status])}>
                    {TASK_STATUS_LABELS[task.status]}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono">
                  <span className={task.extinctionProbability > 0.2 ? "text-red-400" : task.extinctionProbability > 0.1 ? "text-amber-400" : "text-forest-200"}>
                    {(task.extinctionProbability * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 font-mono">
                  <span className={task.populationGrowthRate < 0 ? "text-red-400" : "text-green-400"}>
                    {(task.populationGrowthRate * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  {task.warningLevel > 0 ? (
                    <span className={cn(
                      "inline-block px-2 py-0.5 rounded text-xs",
                      task.warningLevel >= 3 ? "bg-red-500/20 text-red-300" : task.warningLevel >= 2 ? "bg-amber-500/20 text-amber-300" : "bg-yellow-500/20 text-yellow-300"
                    )}>
                      {task.warningLevel}级
                    </span>
                  ) : (
                    <span className="text-forest-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-forest-300 text-xs">
                  {new Date(task.createdAt).toLocaleDateString("zh-CN")}
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/tasks/${task.id}`}
                    className="flex items-center gap-1 text-forest-400 hover:text-forest-200 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    查看详情
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-forest-400">
                  暂无任务
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
