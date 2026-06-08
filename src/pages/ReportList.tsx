import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileBarChart, Download, Eye, Calendar } from "lucide-react";
import { useStore } from "@/store";
import { TASK_STATUS_LABELS } from "@/types";
import { cn } from "@/lib/utils";

export default function ReportList() {
  const tasks = useStore((s) => s.tasks);
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileBarChart className="w-7 h-7 text-forest-400" />
          <h1 className="text-2xl font-display font-bold text-forest-50">报告中心</h1>
        </div>
        <Link
          to="/reports/export"
          className="flex items-center gap-2 rounded-lg bg-forest-700/50 px-4 py-2 text-sm text-forest-200 transition-colors hover:bg-forest-600/50"
        >
          <Download className="w-4 h-4" />
          数据导出
        </Link>
      </div>

      <div className="space-y-4">
        {completedTasks.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-semibold text-forest-50">{task.speciesName} 模拟报告</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    已完成
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-forest-400">灭绝概率</span>
                    <p className={cn("font-mono font-medium", task.extinctionProbability > 0.2 ? "text-red-400" : "text-forest-100")}>
                      {(task.extinctionProbability * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-forest-400">种群增长率</span>
                    <p className={cn("font-mono font-medium", task.populationGrowthRate < 0 ? "text-red-400" : "text-green-400")}>
                      {(task.populationGrowthRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-forest-400">模型类型</span>
                    <p className="font-mono text-forest-100">{task.parameters.modelType}</p>
                  </div>
                  <div>
                    <span className="text-forest-400">完成时间</span>
                    <p className="text-forest-200 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {task.completedAt ? new Date(task.completedAt).toLocaleDateString("zh-CN") : "-"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  to={`/reports/${task.id}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-forest-600/40 text-sm text-forest-200 hover:bg-forest-500/40 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  查看
                </Link>
                <button
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600/20 text-amber-300 text-sm hover:bg-amber-600/30 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {completedTasks.length === 0 && (
          <div className="text-center py-16 text-forest-500">
            <FileBarChart className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>暂无已完成报告</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
