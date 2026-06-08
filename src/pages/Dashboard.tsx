import { useMemo } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle2, Shield, TrendingUp, AlertCircle, Cog, PlusCircle, ChevronRight } from "lucide-react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import type { ActivityEvent } from "@/types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const activityIconMap: Record<ActivityEvent["type"], { icon: typeof Activity; color: string }> = {
  TASK_COMPLETED: { icon: CheckCircle2, color: "text-emerald-400" },
  WARNING_TRIGGERED: { icon: AlertTriangle, color: "text-amber-400" },
  APPROVAL_PASSED: { icon: Shield, color: "text-sky-400" },
  ADJUSTMENT_MADE: { icon: Cog, color: "text-violet-400" },
  TASK_CREATED: { icon: PlusCircle, color: "text-teal-400" },
};

const activityDotColor: Record<ActivityEvent["type"], string> = {
  TASK_COMPLETED: "bg-emerald-400",
  WARNING_TRIGGERED: "bg-amber-400",
  APPROVAL_PASSED: "bg-sky-400",
  ADJUSTMENT_MADE: "bg-violet-400",
  TASK_CREATED: "bg-teal-400",
};

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 1) return "刚刚";
  if (diffH < 24) return `${diffH}小时前`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}天前`;
  return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

function riskLabel(prob: number): { text: string; cls: string } {
  if (prob >= 0.5) return { text: "极危", cls: "text-red-400 bg-red-400/10" };
  if (prob >= 0.2) return { text: "高危", cls: "text-amber-400 bg-amber-400/10" };
  if (prob >= 0.1) return { text: "中危", cls: "text-yellow-400 bg-yellow-400/10" };
  return { text: "低危", cls: "text-emerald-400 bg-emerald-400/10" };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function Dashboard() {
  const tasks = useStore((s) => s.tasks);
  const warnings = useStore((s) => s.warnings);
  const activities = useStore((s) => s.activities);
  const dailyMetrics = useStore((s) => s.dailyMetrics);
  const species = useStore((s) => s.species);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const todayTasksCount = useMemo(
    () => tasks.filter((t) => t.createdAt.startsWith(todayStr)).length,
    [tasks, todayStr],
  );

  const activeTasksCount = useMemo(
    () => tasks.filter((t) => t.status !== "COMPLETED" && t.status !== "ERROR").length,
    [tasks],
  );

  const activeWarningsCount = useMemo(
    () => warnings.filter((w) => w.status === "ACTIVE").length,
    [warnings],
  );

  const healthPercent = useMemo(() => {
    if (dailyMetrics.length === 0) return 0;
    const latest = dailyMetrics[dailyMetrics.length - 1];
    return Math.round(latest.completionRate);
  }, [dailyMetrics]);

  const sortedSpecies = useMemo(
    () => [...species].sort((a, b) => b.extinctionProb - a.extinctionProb).slice(0, 6),
    [species],
  );

  const lineChartData = useMemo(() => {
    const labels = dailyMetrics.map((m) => {
      const d = new Date(m.date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    return {
      labels,
      datasets: [
        {
          label: "完成率 (%)",
          data: dailyMetrics.map((m) => m.completionRate),
          borderColor: "#2D6A4F",
          backgroundColor: "rgba(45,106,79,0.15)",
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: "#2D6A4F",
          pointBorderColor: "#E8F5E9",
          pointBorderWidth: 2,
        },
      ],
    };
  }, [dailyMetrics]);

  const barChartData = useMemo(() => {
    const labels = dailyMetrics.map((m) => {
      const d = new Date(m.date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    return {
      labels,
      datasets: [
        {
          label: "平均响应时间 (h)",
          data: dailyMetrics.map((m) => m.avgWarningResponseTime),
          backgroundColor: dailyMetrics.map((m) =>
            m.avgWarningResponseTime > 3 ? "rgba(212,160,23,0.7)" : "rgba(45,106,79,0.7)",
          ),
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    };
  }, [dailyMetrics]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: { color: "#A5D6A7", font: { family: '"Noto Sans SC"', size: 12 }, boxWidth: 12, padding: 16 },
        },
        tooltip: {
          backgroundColor: "rgba(13,27,22,0.95)",
          titleColor: "#E8F5E9",
          bodyColor: "#C8E6C9",
          borderColor: "rgba(45,106,79,0.3)",
          borderWidth: 1,
          cornerRadius: 8,
          titleFont: { family: '"Noto Sans SC"' },
          bodyFont: { family: '"JetBrains Mono"' },
        },
      },
      scales: {
        x: {
          ticks: { color: "#81C784", font: { family: '"JetBrains Mono"', size: 10 } },
          grid: { color: "rgba(45,106,79,0.12)" },
        },
        y: {
          ticks: { color: "#81C784", font: { family: '"JetBrains Mono"', size: 10 } },
          grid: { color: "rgba(45,106,79,0.12)" },
        },
      },
    }),
    [],
  );

  const stats = [
    {
      label: "今日模拟统计",
      value: todayTasksCount,
      unit: "项",
      gradient: "stat-gradient-green",
      icon: Activity,
      accent: "text-emerald-300",
    },
    {
      label: "活跃任务数",
      value: activeTasksCount,
      unit: "项",
      gradient: "stat-gradient-blue",
      icon: TrendingUp,
      accent: "text-sky-300",
    },
    {
      label: "活跃预警",
      value: activeWarningsCount,
      unit: "条",
      gradient: "stat-gradient-amber",
      icon: AlertTriangle,
      accent: "text-amber-300",
    },
    {
      label: "系统健康度",
      value: healthPercent,
      unit: "%",
      gradient: healthPercent >= 70 ? "stat-gradient-green" : healthPercent >= 40 ? "stat-gradient-blue" : "stat-gradient-red",
      icon: Shield,
      accent: healthPercent >= 70 ? "text-emerald-300" : healthPercent >= 40 ? "text-sky-300" : "text-red-300",
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.h1 variants={itemVariants} className="font-display text-3xl font-bold text-forest-50 tracking-wide">
        生态模拟总览
      </motion.h1>

      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className={cn(
              "relative overflow-hidden rounded-xl p-5 card-glow border border-forest-500/20",
              stat.gradient,
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-body text-forest-100/70 mb-1">{stat.label}</p>
                <p className={cn("font-mono text-3xl font-semibold", stat.accent)}>
                  {stat.value}
                  <span className="text-base ml-1 text-forest-100/60">{stat.unit}</span>
                </p>
              </div>
              <div className={cn("p-2 rounded-lg bg-white/10", stat.accent)}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/5 blur-xl" />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow"
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="font-display text-lg font-semibold text-forest-50">近期动态</h2>
            <Activity className="w-4 h-4 text-forest-300" />
          </div>
          <div className="px-5 pb-5 space-y-1 max-h-[420px] overflow-y-auto">
            {activities.map((act, i) => {
              const cfg = activityIconMap[act.type];
              const Icon = cfg.icon;
              const dotCls = activityDotColor[act.type];
              return (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.35 }}
                  className="flex items-start gap-3 py-3 border-b border-forest-500/10 last:border-0 group"
                >
                  <div className="relative mt-1 flex-shrink-0">
                    <span className={cn("absolute -top-0.5 -left-0.5 w-2 h-2 rounded-full", dotCls)} />
                    <Icon className={cn("w-4 h-4 ml-1.5", cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body text-forest-100/90 leading-relaxed">{act.message}</p>
                    <p className="text-xs font-mono text-forest-300/60 mt-0.5">{formatTimestamp(act.timestamp)}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-forest-500/40 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="lg:col-span-3 space-y-6"
        >
          <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow p-5">
            <h2 className="font-display text-lg font-semibold text-forest-50 mb-4">每日完成率</h2>
            <div className="h-[180px]">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow p-5">
            <h2 className="font-display text-lg font-semibold text-forest-50 mb-4">预警响应时间</h2>
            <div className="h-[180px]">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={itemVariants}
        className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-display text-lg font-semibold text-forest-50">物种风险概览</h2>
          <AlertCircle className="w-4 h-4 text-forest-300" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-forest-300/70 border-b border-forest-500/15">
                <th className="px-5 py-3 font-body font-medium">物种名称</th>
                <th className="px-5 py-3 font-body font-medium">当前种群</th>
                <th className="px-5 py-3 font-body font-medium">灭绝概率</th>
                <th className="px-5 py-3 font-body font-medium">连续高风险</th>
                <th className="px-5 py-3 font-body font-medium">风险等级</th>
                <th className="px-5 py-3 font-body font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {sortedSpecies.map((sp) => {
                const risk = riskLabel(sp.extinctionProb);
                return (
                  <tr
                    key={sp.id}
                    className="border-b border-forest-500/10 hover:bg-forest-700/30 transition-colors"
                  >
                    <td className="px-5 py-3 font-body text-forest-50 font-medium">{sp.name}</td>
                    <td className="px-5 py-3 font-mono text-forest-100">
                      {sp.currentPopulation === 0 ? (
                        <span className="text-red-400">功能灭绝</span>
                      ) : (
                        sp.currentPopulation.toLocaleString()
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-forest-100">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-forest-700 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              sp.extinctionProb >= 0.5
                                ? "bg-red-500"
                                : sp.extinctionProb >= 0.2
                                  ? "bg-amber-500"
                                  : "bg-emerald-500",
                            )}
                            style={{ width: `${Math.min(sp.extinctionProb * 100, 100)}%` }}
                          />
                        </div>
                        <span>{(sp.extinctionProb * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-forest-100">
                      {sp.consecutiveHighRisk > 0 ? (
                        <span className={cn("font-medium", sp.consecutiveHighRisk >= 3 ? "text-red-400" : "text-amber-400")}>
                          {sp.consecutiveHighRisk}次
                        </span>
                      ) : (
                        <span className="text-forest-300/50">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", risk.cls)}>
                        {risk.text}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {sp.isPaused ? (
                        <span className="flex items-center gap-1 text-red-400 text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                          已暂停
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          监测中
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
