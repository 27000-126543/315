import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Filter } from "lucide-react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";

type ExportDimension = "species" | "habitat" | "time";

export default function DataExport() {
  const tasks = useStore((s) => s.tasks);
  const species = useStore((s) => s.species);
  const [dimension, setDimension] = useState<ExportDimension>("species");
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedHabitat, setSelectedHabitat] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const habitats = [...new Set(species.map((sp) => sp.habitat))];

  const filteredTasks = tasks.filter((t) => {
    if (dimension === "species" && selectedSpecies && t.speciesId !== selectedSpecies) return false;
    if (dimension === "habitat" && selectedHabitat) {
      const sp = species.find((s) => s.id === t.speciesId);
      if (sp && sp.habitat !== selectedHabitat) return false;
    }
    if (dimension === "time") {
      if (dateFrom && t.createdAt < dateFrom) return false;
      if (dateTo && t.createdAt > dateTo + "T23:59:59") return false;
    }
    return true;
  });

  const handleExport = (format: string) => {
    if (format === "csv") {
      const headers = ["任务ID", "物种名称", "状态", "灭绝概率", "种群增长率", "预警等级", "创建时间"];
      const rows = filteredTasks.map((t) => [
        t.id,
        t.speciesName,
        t.status,
        (t.extinctionProbability * 100).toFixed(1) + "%",
        (t.populationGrowthRate * 100).toFixed(1) + "%",
        String(t.warningLevel),
        t.createdAt,
      ]);
      const bom = "\uFEFF";
      const csvContent = bom + [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `biodiversity_export_${dimension}_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const data = filteredTasks.map((t) => ({
        任务ID: t.id,
        物种名称: t.speciesName,
        状态: t.status,
        灭绝概率: (t.extinctionProbability * 100).toFixed(1) + "%",
        种群增长率: (t.populationGrowthRate * 100).toFixed(1) + "%",
        预警等级: t.warningLevel,
        创建时间: t.createdAt,
      }));
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `biodiversity_export_${dimension}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/reports" className="flex items-center gap-1 text-forest-400 hover:text-forest-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>
        <h1 className="text-2xl font-display font-bold text-forest-50">数据导出</h1>
      </div>

      <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-forest-200 mb-2">
            <Filter className="w-4 h-4 inline mr-1.5" />
            导出维度
          </label>
          <div className="flex gap-3">
            {[
              { key: "species" as const, label: "按物种" },
              { key: "habitat" as const, label: "按生境" },
              { key: "time" as const, label: "按时间" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setDimension(opt.key)}
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all border",
                  dimension === opt.key
                    ? "bg-forest-500/20 border-forest-500/50 text-forest-100"
                    : "bg-forest-800/30 border-forest-500/10 text-forest-400 hover:border-forest-500/30"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {dimension === "species" && (
          <div>
            <label className="block text-sm font-medium text-forest-200 mb-2">选择物种</label>
            <select
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
              className="w-full bg-forest-700/50 border border-forest-500/30 rounded-lg px-4 py-2.5 text-forest-100 text-sm focus:outline-none focus:border-forest-400"
            >
              <option value="">全部物种</option>
              {species.map((sp) => (
                <option key={sp.id} value={sp.id}>{sp.name} ({sp.scientificName})</option>
              ))}
            </select>
          </div>
        )}

        {dimension === "habitat" && (
          <div>
            <label className="block text-sm font-medium text-forest-200 mb-2">选择生境</label>
            <select
              value={selectedHabitat}
              onChange={(e) => setSelectedHabitat(e.target.value)}
              className="w-full bg-forest-700/50 border border-forest-500/30 rounded-lg px-4 py-2.5 text-forest-100 text-sm focus:outline-none focus:border-forest-400"
            >
              <option value="">全部生境</option>
              {habitats.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        )}

        {dimension === "time" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-forest-200 mb-2">起始日期</label>
              <input
                type="date" value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-forest-700/50 border border-forest-500/30 rounded-lg px-4 py-2.5 text-forest-100 text-sm focus:outline-none focus:border-forest-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-200 mb-2">结束日期</label>
              <input
                type="date" value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-forest-700/50 border border-forest-500/30 rounded-lg px-4 py-2.5 text-forest-100 text-sm focus:outline-none focus:border-forest-400"
              />
            </div>
          </div>
        )}

        <div className="bg-forest-700/20 rounded-lg p-4">
          <p className="text-sm text-forest-300">
            筛选结果: <span className="font-mono text-forest-100 font-medium">{filteredTasks.length}</span> 条模拟任务
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleExport("csv")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-500 hover:bg-forest-600 text-forest-50 text-sm font-medium transition-colors shadow-lg shadow-forest-500/20"
        >
          <Download className="w-4 h-4" />
          导出 CSV
        </button>
        <button
          onClick={() => handleExport("json")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-700/50 border border-forest-500/20 text-forest-200 text-sm font-medium hover:bg-forest-600/50 transition-colors"
        >
          <Download className="w-4 h-4" />
          导出 JSON
        </button>
      </div>
    </motion.div>
  );
}
