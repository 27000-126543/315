import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, Database, FileText, BarChart3 } from "lucide-react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import type { DatasetType, DatasetStatus } from "@/types";

const TYPE_LABELS: Record<DatasetType, string> = {
  SPECIES_DISTRIBUTION: "物种分布",
  ENVIRONMENTAL: "环境变量",
};

const STATUS_CONFIG: Record<
  DatasetStatus,
  { label: string; className: string }
> = {
  VALID: { label: "已验证", className: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" },
  INVALID: { label: "无效", className: "bg-red-500/20 text-red-400 border border-red-500/30" },
  VALIDATING: { label: "验证中", className: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" },
  UPLOADING: { label: "上传中", className: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
};

type FilterTab = "ALL" | DatasetType;

const TABS: { key: FilterTab; label: string }[] = [
  { key: "ALL", label: "全部" },
  { key: "SPECIES_DISTRIBUTION", label: "物种分布" },
  { key: "ENVIRONMENTAL", label: "环境变量" },
];

const TYPE_ICONS: Record<DatasetType, typeof FileText> = {
  SPECIES_DISTRIBUTION: FileText,
  ENVIRONMENTAL: BarChart3,
};

export default function DataManagement() {
  const { datasets, removeDataset } = useStore();
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

  const filtered =
    activeTab === "ALL"
      ? datasets
      : datasets.filter((d) => d.type === activeTab);

  return (
    <div className="min-h-screen p-6 space-y-6 font-body">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Database className="w-7 h-7 text-forest-400" />
          <h1 className="text-2xl font-bold text-forest-50">数据管理中心</h1>
        </div>
        <Link
          to="/data/upload"
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm",
            "bg-forest-500 hover:bg-forest-600 text-forest-50 transition-colors",
            "shadow-lg shadow-forest-500/20"
          )}
        >
          <Upload className="w-4 h-4" />
          上传数据
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-1 p-1 bg-forest-800/50 rounded-xl border border-forest-500/20 w-fit"
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.key
                ? "bg-forest-500 text-forest-50 shadow-md"
                : "text-forest-300 hover:text-forest-100 hover:bg-forest-700/50"
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">
              {tab.key === "ALL"
                ? datasets.length
                : datasets.filter((d) => d.type === tab.key).length}
            </span>
          </button>
        ))}
      </motion.div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((dataset, i) => {
            const Icon = TYPE_ICONS[dataset.type];
            const statusCfg = STATUS_CONFIG[dataset.status];
            return (
              <motion.div
                key={dataset.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "bg-forest-800/50 border border-forest-500/20 rounded-xl p-5",
                  "card-glow transition-shadow"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="p-2.5 bg-forest-700/50 rounded-lg border border-forest-500/10 shrink-0">
                      <Icon className="w-5 h-5 text-forest-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-base font-semibold text-forest-50 truncate">
                          {dataset.name}
                        </h3>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-xs font-medium",
                            "bg-forest-700/50 text-forest-300 border border-forest-500/20"
                          )}
                        >
                          {TYPE_LABELS[dataset.type]}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-xs font-medium",
                            statusCfg.className
                          )}
                        >
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-5 text-sm text-forest-400 font-mono flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          {dataset.fileName}
                        </span>
                        <span>{dataset.uploadedBy}</span>
                        <span>
                          {new Date(dataset.uploadedAt).toLocaleDateString("zh-CN")}
                        </span>
                        <span className="text-forest-300">
                          {dataset.recordCount.toLocaleString()} 条记录
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeDataset(dataset.id)}
                    className={cn(
                      "p-2 rounded-lg transition-colors shrink-0",
                      "text-forest-500 hover:text-red-400 hover:bg-red-500/10"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-forest-500"
        >
          <Database className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">暂无数据集</p>
          <p className="text-sm mt-1">点击上方按钮上传数据</p>
        </motion.div>
      )}
    </div>
  );
}
