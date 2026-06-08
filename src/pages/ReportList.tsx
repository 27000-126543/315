import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileBarChart, Download, Eye, Calendar, Filter, CheckSquare, Square } from "lucide-react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import { generateTaskPDF } from "@/lib/pdfGenerator";

type SpeciesFilter = "ALL" | string;
type WarningFilter = "ALL" | "HIGH" | "MEDIUM" | "NONE";

export default function ReportList() {
  const tasks = useStore((s) => s.tasks);
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>("ALL");
  const [warningFilter, setWarningFilter] = useState<WarningFilter>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const speciesNames = [...new Set(completedTasks.map((t) => t.speciesName))];

  const filtered = completedTasks.filter((t) => {
    if (speciesFilter !== "ALL" && t.speciesName !== speciesFilter) return false;
    if (warningFilter === "HIGH" && t.extinctionProbability <= 0.2) return false;
    if (warningFilter === "MEDIUM" && (t.extinctionProbability <= 0.1 || t.extinctionProbability > 0.2)) return false;
    if (warningFilter === "NONE" && t.extinctionProbability > 0.1) return false;
    if (dateFrom && t.completedAt && t.completedAt < dateFrom) return false;
    if (dateTo && t.completedAt && t.completedAt > dateTo + "T23:59:59") return false;
    return true;
  });

  const selectedInFiltered = filtered.filter((t) => selectedIds.has(t.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((t) => t.id)));
    }
  };

  const handleBatchDownload = () => {
    selectedInFiltered.forEach((task, i) => {
      setTimeout(() => generateTaskPDF(task), i * 500);
    });
  };

  const selectedCount = selectedInFiltered.length;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileBarChart className="w-7 h-7 text-forest-400" />
          <h1 className="text-2xl font-display font-bold text-forest-50">报告中心</h1>
        </div>
        <div className="flex gap-2">
          {selectedCount > 0 && (
            <button
              onClick={handleBatchDownload}
              className="flex items-center gap-2 rounded-lg bg-amber-600/30 px-4 py-2 text-sm text-amber-300 transition-colors hover:bg-amber-600/50"
            >
              <Download className="w-4 h-4" />
              批量下载 ({selectedCount})
            </button>
          )}
          <Link
            to="/reports/export"
            className="flex items-center gap-2 rounded-lg bg-forest-700/50 px-4 py-2 text-sm text-forest-200 transition-colors hover:bg-forest-600/50"
          >
            <Download className="w-4 h-4" />
            数据导出
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all",
            showFilters ? "bg-forest-500/30 text-forest-50 border-forest-500/50" : "bg-forest-800/50 text-forest-200 border-forest-500/20 hover:border-forest-500/40"
          )}
        >
          <Filter className="w-4 h-4" />
          筛选
        </button>
        {speciesFilter !== "ALL" && (
          <span className="px-2.5 py-1 rounded-full text-xs bg-sky-500/20 text-sky-300">{speciesFilter}</span>
        )}
        {warningFilter !== "ALL" && (
          <span className="px-2.5 py-1 rounded-full text-xs bg-amber-500/20 text-amber-300">
            {warningFilter === "HIGH" ? "高风险" : warningFilter === "MEDIUM" ? "中风险" : "低风险"}
          </span>
        )}
        {(speciesFilter !== "ALL" || warningFilter !== "ALL" || dateFrom || dateTo) && (
          <button
            onClick={() => { setSpeciesFilter("ALL"); setWarningFilter("ALL"); setDateFrom(""); setDateTo(""); }}
            className="text-xs text-forest-400 hover:text-forest-200"
          >
            清除筛选
          </button>
        )}
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
          className="bg-forest-800/50 border border-forest-500/20 rounded-xl p-5 card-glow"
        >
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-forest-400 mb-1.5">物种</label>
              <select value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)}
                className="w-full bg-forest-700/50 border border-forest-500/30 rounded-lg px-3 py-2 text-forest-100 text-sm focus:outline-none focus:border-forest-400">
                <option value="ALL">全部物种</option>
                {speciesNames.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-forest-400 mb-1.5">预警等级</label>
              <select value={warningFilter} onChange={(e) => setWarningFilter(e.target.value as WarningFilter)}
                className="w-full bg-forest-700/50 border border-forest-500/30 rounded-lg px-3 py-2 text-forest-100 text-sm focus:outline-none focus:border-forest-400">
                <option value="ALL">全部</option>
                <option value="HIGH">高风险 (&gt;20%)</option>
                <option value="MEDIUM">中风险 (10-20%)</option>
                <option value="NONE">低风险 (&lt;10%)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-forest-400 mb-1.5">起始日期</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-forest-700/50 border border-forest-500/30 rounded-lg px-3 py-2 text-forest-100 text-sm focus:outline-none focus:border-forest-400" />
            </div>
            <div>
              <label className="block text-xs text-forest-400 mb-1.5">结束日期</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-forest-700/50 border border-forest-500/30 rounded-lg px-3 py-2 text-forest-100 text-sm focus:outline-none focus:border-forest-400" />
            </div>
          </div>
        </motion.div>
      )}

      {filtered.length > 0 && (
        <div className="flex items-center gap-3 text-xs text-forest-400">
          <button onClick={toggleSelectAll} className="flex items-center gap-1.5 hover:text-forest-200 transition-colors">
            {selectedIds.size === filtered.length ? <CheckSquare className="w-4 h-4 text-forest-300" /> : <Square className="w-4 h-4" />}
            {selectedIds.size === filtered.length ? "取消全选" : "全选"}
          </button>
          <span>共 {filtered.length} 份报告</span>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={cn(
              "bg-forest-800/50 border rounded-xl card-glow p-5 transition-colors",
              selectedIds.has(task.id) ? "border-forest-500/50 bg-forest-800/70" : "border-forest-500/20"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <button onClick={() => toggleSelect(task.id)} className="mt-1 shrink-0">
                  {selectedIds.has(task.id) ? <CheckSquare className="w-4 h-4 text-forest-300" /> : <Square className="w-4 h-4 text-forest-500 hover:text-forest-300" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-semibold text-forest-50">{task.speciesName} 模拟报告</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">已完成</span>
                    {task.extinctionProbability > 0.2 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">高风险</span>
                    )}
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
              </div>
              <div className="flex gap-2 shrink-0">
                <Link to={`/reports/${task.id}`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-forest-600/40 text-sm text-forest-200 hover:bg-forest-500/40 transition-colors">
                  <Eye className="w-3.5 h-3.5" />查看
                </Link>
                <button onClick={() => generateTaskPDF(task)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600/20 text-amber-300 text-sm hover:bg-amber-600/30 transition-colors">
                  <Download className="w-3.5 h-3.5" />PDF
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-forest-500">
            <FileBarChart className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>暂无匹配报告</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
