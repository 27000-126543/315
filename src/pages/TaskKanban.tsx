import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "@/store";
import { TASK_STATUS_LABELS, TASK_STATUS_ORDER, WARNING_LEVEL_COLORS } from "@/types";
import type { TaskStatus } from "@/types";
import { cn } from "@/lib/utils";

const COLUMN_COLORS: Record<TaskStatus, string> = {
  PENDING_REVIEW: "border-slate-500/30",
  MODEL_BUILDING: "border-blue-500/30",
  DISTRIBUTION_SIM: "border-cyan-500/30",
  POPULATION_DYNAMICS: "border-green-500/30",
  RISK_ANALYSIS: "border-amber-500/30",
  COMPLETED: "border-emerald-500/30",
  ERROR: "border-red-500/30",
};

const COLUMN_DOT: Record<TaskStatus, string> = {
  PENDING_REVIEW: "bg-slate-400",
  MODEL_BUILDING: "bg-blue-400",
  DISTRIBUTION_SIM: "bg-cyan-400",
  POPULATION_DYNAMICS: "bg-green-400",
  RISK_ANALYSIS: "bg-amber-400",
  COMPLETED: "bg-emerald-400",
  ERROR: "bg-red-400",
};

export default function TaskKanban() {
  const tasks = useStore((s) => s.tasks);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 className="text-2xl font-bold font-display text-forest-50 mb-6">任务看板</h1>

      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minWidth: 0 }}>
        {TASK_STATUS_ORDER.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <div
              key={status}
              className={cn(
                "flex-shrink-0 w-64 bg-forest-800/50 border rounded-xl card-glow flex flex-col",
                COLUMN_COLORS[status]
              )}
            >
              <div className="px-4 py-3 border-b border-forest-500/20 flex items-center gap-2">
                <span className={cn("w-2.5 h-2.5 rounded-full", COLUMN_DOT[status])} />
                <span className="text-sm font-medium text-forest-100">{TASK_STATUS_LABELS[status]}</span>
                <span className="ml-auto text-xs text-forest-400 bg-forest-700/50 px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>

              <div className="p-3 flex flex-col gap-3 flex-1 overflow-y-auto max-h-[calc(100vh-220px)]">
                {columnTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/tasks/${task.id}`}
                      className="block bg-forest-700/40 border border-forest-500/15 rounded-lg p-3 hover:border-forest-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-forest-400">#{task.id.toUpperCase()}</span>
                        {task.warningLevel > 0 && (
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                task.warningLevel >= 3
                                  ? WARNING_LEVEL_COLORS.LEVEL_3
                                  : task.warningLevel >= 2
                                    ? WARNING_LEVEL_COLORS.LEVEL_2
                                    : WARNING_LEVEL_COLORS.LEVEL_1,
                            }}
                          />
                        )}
                      </div>
                      <p className="text-sm font-medium text-forest-50 mb-2">{task.speciesName}</p>
                      <div className="flex items-center justify-between text-xs text-forest-300">
                        <span>灭绝: {(task.extinctionProbability * 100).toFixed(1)}%</span>
                        <span
                          className={cn(
                            task.extinctionProbability > 0.2
                              ? "text-red-400"
                              : task.extinctionProbability > 0.1
                                ? "text-amber-400"
                                : "text-forest-300"
                          )}
                        >
                          预警: {task.warningLevel}级
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
                {columnTasks.length === 0 && (
                  <div className="text-center py-6 text-forest-500 text-xs">暂无任务</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
