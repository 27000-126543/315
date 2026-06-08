import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert, Settings, CheckCircle2, Play } from "lucide-react";
import { useStore } from "@/store";
import { WARNING_LEVEL_LABELS, WARNING_LEVEL_COLORS } from "@/types";
import type { WarningLevel, Warning } from "@/types";
import { cn } from "@/lib/utils";

const WARNING_TYPE_LABELS: Record<Warning["type"], string> = {
  EXTINCTION_PROB: "灭绝概率",
  POPULATION_GROWTH: "种群增长率",
};

const LEVEL_BORDER_COLORS: Record<WarningLevel, string> = {
  LEVEL_1: "#EAB308",
  LEVEL_2: "#F97316",
  LEVEL_3: "#EF4444",
};

export default function RiskMonitor() {
  const warnings = useStore((s) => s.warnings);
  const species = useStore((s) => s.species);
  const resolveWarning = useStore((s) => s.resolveWarning);
  const unpauseSpecies = useStore((s) => s.unpauseSpecies);

  const activeWarnings = useMemo(
    () => warnings.filter((w) => w.status === "ACTIVE"),
    [warnings]
  );

  const stats = useMemo(() => {
    const active = warnings.filter((w) => w.status === "ACTIVE");
    return {
      total: active.length,
      level1: active.filter((w) => w.level === "LEVEL_1").length,
      level2: active.filter((w) => w.level === "LEVEL_2").length,
      level3: active.filter((w) => w.level === "LEVEL_3").length,
    };
  }, [warnings]);

  const formatValue = (type: Warning["type"], value: number) => {
    if (type === "EXTINCTION_PROB") return `${(value * 100).toFixed(1)}%`;
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getExtinctionColor = (prob: number) => {
    if (prob >= 0.2) return "text-red-400";
    if (prob >= 0.15) return "text-orange-400";
    if (prob >= 0.1) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-7 w-7 text-forest-400" />
          <h1 className="text-2xl font-bold text-forest-50">风险监控中心</h1>
        </div>
        <Link
          to="/risk/threshold"
          className="flex items-center gap-2 rounded-lg bg-forest-700/50 px-4 py-2 text-sm text-forest-200 transition-colors hover:bg-forest-600/50"
        >
          <Settings className="h-4 w-4" />
          阈值配置
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "活跃预警数", value: stats.total, gradient: "stat-gradient-blue" },
          { label: "一级预警", value: stats.level1, gradient: "stat-gradient-amber" },
          { label: "二级预警", value: stats.level2, gradient: "stat-gradient-amber" },
          { label: "三级预警", value: stats.level3, gradient: "stat-gradient-red" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("rounded-xl p-5 card-glow", stat.gradient)}
          >
            <p className="text-sm text-forest-200/80">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-forest-50">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-forest-100">活跃预警列表</h2>
        {activeWarnings.length === 0 ? (
          <div className="rounded-xl border border-forest-500/20 bg-forest-800/50 p-8 text-center text-forest-400">
            暂无活跃预警
          </div>
        ) : (
          <div className="space-y-3">
            {activeWarnings.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex overflow-hidden rounded-xl border border-forest-500/20 bg-forest-800/50 card-glow"
              >
                <div
                  className="w-1.5 shrink-0"
                  style={{ backgroundColor: LEVEL_BORDER_COLORS[w.level] }}
                />
                <div className="flex flex-1 items-center justify-between p-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-forest-50">{w.speciesName}</span>
                      <span
                        className="rounded-md px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `${WARNING_LEVEL_COLORS[w.level]}20`,
                          color: WARNING_LEVEL_COLORS[w.level],
                        }}
                      >
                        {WARNING_LEVEL_LABELS[w.level]}
                      </span>
                      <span className="rounded-md bg-forest-700/60 px-2 py-0.5 text-xs text-forest-300">
                        {WARNING_TYPE_LABELS[w.type]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-forest-300">
                      <span>
                        当前值: <span className="font-mono text-forest-100">{formatValue(w.type, w.value)}</span>
                      </span>
                      <span>
                        阈值: <span className="font-mono text-forest-100">{formatValue(w.type, w.threshold)}</span>
                      </span>
                      <span>触发时间: {formatTime(w.triggeredAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => resolveWarning(w.id, "当前用户")}
                    className="ml-4 flex items-center gap-1.5 rounded-lg bg-forest-600/40 px-3 py-1.5 text-sm text-forest-200 transition-colors hover:bg-forest-500/40"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    复核
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-forest-100">物种风险面板</h2>
        <div className="overflow-hidden rounded-xl border border-forest-500/20 bg-forest-800/50 card-glow">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-500/20 text-left text-forest-300">
                <th className="px-4 py-3 font-medium">物种名称</th>
                <th className="px-4 py-3 font-medium">当前种群</th>
                <th className="px-4 py-3 font-medium">灭绝概率</th>
                <th className="px-4 py-3 font-medium">连续高风险次数</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {species.map((sp) => (
                <tr
                  key={sp.id}
                  className="border-b border-forest-500/10 transition-colors hover:bg-forest-700/20"
                >
                  <td className="px-4 py-3 font-medium text-forest-100">{sp.name}</td>
                  <td className="px-4 py-3 font-mono text-forest-200">
                    {sp.currentPopulation.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("font-mono", getExtinctionColor(sp.extinctionProb))}>
                      {(sp.extinctionProb * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-forest-200">
                    {sp.consecutiveHighRisk}
                  </td>
                  <td className="px-4 py-3">
                    {sp.consecutiveHighRisk >= 3 ? (
                      <span className="inline-flex items-center rounded-md bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
                        已暂停
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-forest-600/30 px-2 py-0.5 text-xs font-medium text-forest-300">
                        正常
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {sp.isPaused && (
                      <button
                        onClick={() => unpauseSpecies(sp.id)}
                        className="flex items-center gap-1 rounded-lg bg-forest-600/40 px-3 py-1 text-xs text-forest-200 transition-colors hover:bg-forest-500/40"
                      >
                        <Play className="h-3 w-3" />
                        恢复
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
