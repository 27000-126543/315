import jsPDF from "jspdf";
import type { SimulationTask } from "@/types";

export function generateTaskPDF(task: SimulationTask): void {
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
}
