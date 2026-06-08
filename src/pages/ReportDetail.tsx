import { useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Map, TrendingUp, Flame, Download } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, BarElement } from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import jsPDF from "jspdf";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

type Tab = "distribution" | "population" | "heatmap";

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const tasks = useStore((s) => s.tasks);
  const task = tasks.find((t) => t.id === id);
  const [activeTab, setActiveTab] = useState<Tab>("distribution");

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-forest-400">
        <p className="text-lg">报告未找到</p>
        <Link to="/reports" className="mt-4 text-forest-300 hover:text-forest-100">返回报告列表</Link>
      </div>
    );
  }

  const populationData = {
    labels: Array.from({ length: 20 }, (_, i) => `${2025 + i}`),
    datasets: [{
      label: "种群数量预测",
      data: Array.from({ length: 20 }, (_, i) => {
        const base = task.extinctionProbability < 0.5 ? 1000 : 50;
        const rate = task.populationGrowthRate;
        return Math.max(0, Math.round(base * Math.pow(1 + rate, i)));
      }),
      borderColor: task.populationGrowthRate < 0 ? "#EF4444" : "#10B981",
      backgroundColor: task.populationGrowthRate < 0 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
      fill: true,
      tension: 0.4,
      pointRadius: 3,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#A5D6A7", font: { family: '"Noto Sans SC"', size: 12 } } },
      tooltip: { backgroundColor: "rgba(13,27,22,0.95)", titleColor: "#E8F5E9", bodyColor: "#C8E6C9" },
    },
    scales: {
      x: { ticks: { color: "#81C784", font: { size: 10 } }, grid: { color: "rgba(45,106,79,0.12)" } },
      y: { ticks: { color: "#81C784", font: { size: 10 } }, grid: { color: "rgba(45,106,79,0.12)" } },
    },
  };

  const tabs: { key: Tab; label: string; icon: typeof Map }[] = [
    { key: "distribution", label: "分布图", icon: Map },
    { key: "population", label: "种群趋势", icon: TrendingUp },
    { key: "heatmap", label: "风险热力图", icon: Flame },
  ];

  const chartRef = useRef<HTMLDivElement>(null);

  const generatePDF = useCallback(() => {
    if (!task) return;
    const doc = new jsPDF("p", "mm", "a4");
    const pageW = doc.internal.pageSize.getWidth();

    doc.setFillColor(13, 27, 22);
    doc.rect(0, 0, pageW, 297, "F");

    doc.setTextColor(232, 245, 233);
    doc.setFontSize(20);
    doc.text(`${task.speciesName} Biodiversity Simulation Report`, pageW / 2, 25, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(165, 214, 167);
    doc.text(`Task ID: #${task.id.toUpperCase()}  |  Model: ${task.parameters.modelType}  |  Date: ${new Date().toLocaleDateString("zh-CN")}`, pageW / 2, 33, { align: "center" });

    doc.setDrawColor(45, 106, 79);
    doc.line(15, 38, pageW - 15, 38);

    doc.setFontSize(13);
    doc.setTextColor(232, 245, 233);
    doc.text("1. Key Metrics", 15, 48);

    doc.setFontSize(10);
    const extColor = task.extinctionProbability > 0.2 ? [239, 68, 68] : task.extinctionProbability > 0.1 ? [245, 158, 11] : [16, 185, 129];
    const growthColor = task.populationGrowthRate < 0 ? [239, 68, 68] : [16, 185, 129];

    doc.setTextColor(129, 199, 132);
    doc.text("Extinction Probability:", 20, 58);
    doc.setTextColor(extColor[0], extColor[1], extColor[2]);
    doc.text(`${(task.extinctionProbability * 100).toFixed(1)}%`, 70, 58);

    doc.setTextColor(129, 199, 132);
    doc.text("Population Growth Rate:", 20, 66);
    doc.setTextColor(growthColor[0], growthColor[1], growthColor[2]);
    doc.text(`${(task.populationGrowthRate * 100).toFixed(1)}%`, 70, 66);

    doc.setTextColor(129, 199, 132);
    doc.text("Warning Level:", 20, 74);
    doc.setTextColor(245, 158, 11);
    doc.text(task.warningLevel > 0 ? `Level ${task.warningLevel}` : "None", 70, 74);

    doc.setTextColor(129, 199, 132);
    doc.text("Time Horizon:", 20, 82);
    doc.setTextColor(232, 245, 233);
    doc.text(`${task.parameters.timeHorizon} years`, 70, 82);

    doc.setFontSize(13);
    doc.setTextColor(232, 245, 233);
    doc.text("2. Species Distribution Map", 15, 96);

    doc.setFillColor(27, 67, 50);
    doc.roundedRect(15, 100, pageW - 30, 60, 3, 3, "F");
    doc.setTextColor(129, 199, 132);
    doc.setFontSize(9);
    doc.text("Species predicted distribution range based on MaxEnt/BRT model", pageW / 2, 125, { align: "center" });
    doc.text(`High suitability (green) | Medium suitability (yellow) | Low suitability (red)`, pageW / 2, 133, { align: "center" });

    doc.setFontSize(13);
    doc.setTextColor(232, 245, 233);
    doc.text("3. Population Trend", 15, 175);

    const years = Array.from({ length: 10 }, (_, i) => `${2025 + i}`);
    const basePop = task.extinctionProbability < 0.5 ? 1000 : 50;
    const popData = years.map((_, i) => Math.max(0, Math.round(basePop * Math.pow(1 + task.populationGrowthRate, i))));

    doc.setFillColor(27, 67, 50);
    doc.roundedRect(15, 179, pageW - 30, 50, 3, 3, "F");

    const chartX = 25;
    const chartY = 185;
    const chartW = pageW - 50;
    const chartH = 35;
    const maxPop = Math.max(...popData, 1);

    doc.setDrawColor(45, 106, 79);
    doc.line(chartX, chartY + chartH, chartX + chartW, chartY + chartH);

    doc.setTextColor(129, 199, 132);
    doc.setFontSize(7);
    years.forEach((y, i) => {
      const x = chartX + (i / (years.length - 1)) * chartW;
      doc.text(y, x, chartY + chartH + 4, { align: "center" });
    });

    if (task.populationGrowthRate < 0) {
      doc.setDrawColor(239, 68, 68);
    } else {
      doc.setDrawColor(16, 185, 129);
    }
    doc.setLineWidth(0.5);
    popData.forEach((val, i) => {
      const x = chartX + (i / (popData.length - 1)) * chartW;
      const y = chartY + chartH - (val / maxPop) * chartH;
      if (i === 0) doc.moveTo(x, y);
      else doc.lineTo(x, y);
    });
    doc.stroke();

    doc.setFontSize(13);
    doc.setTextColor(232, 245, 233);
    doc.text("4. Risk Heatmap", 15, 245);

    doc.setFillColor(27, 67, 50);
    doc.roundedRect(15, 249, pageW - 30, 30, 3, 3, "F");
    doc.setTextColor(129, 199, 132);
    doc.setFontSize(9);
    doc.text(`${task.speciesName} extinction risk spatial distribution`, pageW / 2, 262, { align: "center" });
    doc.text("High risk (red) | Medium risk (orange) | Low risk (green)", pageW / 2, 270, { align: "center" });

    doc.save(`${task.speciesName}_biodiversity_report.pdf`);
  }, [task]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/reports" className="flex items-center gap-1 text-forest-400 hover:text-forest-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>
        <h1 className="text-2xl font-display font-bold text-forest-50">{task.speciesName} 综合报告</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl p-4 card-glow">
          <p className="text-xs text-forest-400">灭绝概率</p>
          <p className={cn("font-mono text-2xl font-bold mt-1", task.extinctionProbability > 0.2 ? "text-red-400" : task.extinctionProbability > 0.1 ? "text-amber-400" : "text-green-400")}>
            {(task.extinctionProbability * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl p-4 card-glow">
          <p className="text-xs text-forest-400">种群增长率</p>
          <p className={cn("font-mono text-2xl font-bold mt-1", task.populationGrowthRate < 0 ? "text-red-400" : "text-green-400")}>
            {(task.populationGrowthRate * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl p-4 card-glow">
          <p className="text-xs text-forest-400">模型类型</p>
          <p className="font-mono text-lg text-forest-100 mt-1">{task.parameters.modelType}</p>
        </div>
        <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl p-4 card-glow">
          <p className="text-xs text-forest-400">预警等级</p>
          <p className={cn("font-mono text-2xl font-bold mt-1", task.warningLevel >= 3 ? "text-red-400" : task.warningLevel >= 1 ? "text-amber-400" : "text-green-400")}>
            {task.warningLevel > 0 ? `${task.warningLevel}级` : "无"}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border",
              activeTab === tab.key
                ? "bg-forest-500/30 text-forest-50 border-forest-500/50"
                : "bg-forest-800/50 text-forest-200 border-forest-500/20 hover:border-forest-500/40"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div ref={chartRef} className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow" style={{ height: 420 }}>
        {activeTab === "distribution" && (
          <div className="flex items-center justify-center h-full text-forest-400">
            <div className="text-center">
              <Map className="w-16 h-16 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">物种分布图</p>
              <p className="text-sm text-forest-500 mt-2">{task.speciesName} 预测分布范围</p>
              <div className="mt-4 flex justify-center gap-4">
                <div className="flex items-center gap-2 text-xs text-forest-300">
                  <span className="w-3 h-3 rounded-full bg-green-500/60" /> 高适宜区
                </div>
                <div className="flex items-center gap-2 text-xs text-forest-300">
                  <span className="w-3 h-3 rounded-full bg-yellow-500/60" /> 中适宜区
                </div>
                <div className="flex items-center gap-2 text-xs text-forest-300">
                  <span className="w-3 h-3 rounded-full bg-red-500/60" /> 低适宜区
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "population" && (
          <div className="p-6 h-full">
            <h3 className="text-sm font-medium text-forest-300 mb-4">种群数量趋势预测 ({task.parameters.timeHorizon}年)</h3>
            <div className="h-[340px]">
              <Line data={populationData} options={chartOptions} />
            </div>
          </div>
        )}

        {activeTab === "heatmap" && (
          <div className="flex items-center justify-center h-full text-forest-400">
            <div className="text-center">
              <Flame className="w-16 h-16 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">风险热力图</p>
              <p className="text-sm text-forest-500 mt-2">{task.speciesName} 灭绝风险空间分布</p>
              <div className="mt-4 flex justify-center gap-4">
                <div className="flex items-center gap-2 text-xs text-forest-300">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" /> 高风险区
                </div>
                <div className="flex items-center gap-2 text-xs text-forest-300">
                  <span className="w-3 h-3 rounded-full bg-orange-500/80" /> 中风险区
                </div>
                <div className="flex items-center gap-2 text-xs text-forest-300">
                  <span className="w-3 h-3 rounded-full bg-green-500/80" /> 低风险区
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600/30 text-amber-300 text-sm font-medium hover:bg-amber-600/50 transition-colors"
        >
          <Download className="w-4 h-4" />
          下载PDF报告
        </button>
      </div>
    </motion.div>
  );
}
