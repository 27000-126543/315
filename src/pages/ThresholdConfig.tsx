import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThresholdForm {
  level1ExtProb: number;
  level1PopGrowth: number;
  level2ExtProb: number;
  level2PopGrowth: number;
  level3ExtProb: number;
  level3PopGrowth: number;
  pauseThreshold: number;
}

const defaultValues: ThresholdForm = {
  level1ExtProb: 0.1,
  level1PopGrowth: -0.05,
  level2ExtProb: 0.15,
  level2PopGrowth: -0.1,
  level3ExtProb: 0.2,
  level3PopGrowth: -0.15,
  pauseThreshold: 3,
};

export default function ThresholdConfig() {
  const [form, setForm] = useState<ThresholdForm>(defaultValues);
  const [saved, setSaved] = useState(false);

  const updateField = <K extends keyof ThresholdForm>(key: K, value: number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const fields: {
    section: string;
    items: { label: string; key: keyof ThresholdForm; min: number; max: number; step: number; unit: string }[];
  }[] = [
    {
      section: "一级预警阈值",
      items: [
        { label: "灭绝概率 10%-15%", key: "level1ExtProb", min: 0.1, max: 0.15, step: 0.01, unit: "%" },
        { label: "种群增长率 < -5%", key: "level1PopGrowth", min: -0.1, max: -0.05, step: 0.01, unit: "%" },
      ],
    },
    {
      section: "二级预警阈值",
      items: [
        { label: "灭绝概率 15%-20%", key: "level2ExtProb", min: 0.15, max: 0.2, step: 0.01, unit: "%" },
        { label: "种群增长率 < -10%", key: "level2PopGrowth", min: -0.2, max: -0.1, step: 0.01, unit: "%" },
      ],
    },
    {
      section: "三级预警阈值",
      items: [
        { label: "灭绝概率 > 20%", key: "level3ExtProb", min: 0.2, max: 0.5, step: 0.01, unit: "%" },
        { label: "种群增长率 < -15%", key: "level3PopGrowth", min: -0.3, max: -0.15, step: 0.01, unit: "%" },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/risk"
          className="flex items-center gap-1 rounded-lg bg-forest-700/50 px-3 py-2 text-sm text-forest-200 transition-colors hover:bg-forest-600/50"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>
        <h1 className="text-2xl font-bold text-forest-50">阈值配置</h1>
      </div>

      <div className="space-y-4">
        {fields.map((group, gi) => (
          <motion.div
            key={group.section}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.08 }}
            className="rounded-xl border border-forest-500/20 bg-forest-800/50 p-5 card-glow"
          >
            <h2 className="mb-4 text-base font-semibold text-forest-100">{group.section}</h2>
            <div className="space-y-4">
              {group.items.map((item) => (
                <div key={item.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-forest-300">{item.label}</label>
                    <span className="font-mono text-sm text-forest-100">
                      {(form[item.key] * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={item.min}
                    max={item.max}
                    step={item.step}
                    value={form[item.key]}
                    onChange={(e) => updateField(item.key, parseFloat(e.target.value))}
                    className="w-full accent-forest-500"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="rounded-xl border border-forest-500/20 bg-forest-800/50 p-5 card-glow"
        >
          <h2 className="mb-4 text-base font-semibold text-forest-100">连续超阈值暂停次数</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-forest-300">
                物种连续超过三级阈值的次数达到此值后自动暂停
              </label>
              <span className="font-mono text-sm text-forest-100">{form.pauseThreshold} 次</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={form.pauseThreshold}
              onChange={(e) => updateField("pauseThreshold", parseInt(e.target.value))}
              className="w-full accent-forest-500"
            />
          </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-forest-600 px-6 py-2.5 text-sm font-medium text-forest-50 transition-colors hover:bg-forest-500"
        >
          <Save className="h-4 w-4" />
          保存配置
        </button>
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-green-400"
          >
            配置已保存
          </motion.span>
        )}
      </div>
    </div>
  );
}
