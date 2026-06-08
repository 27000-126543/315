import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TreePine, MapPin, Lightbulb, ArrowRight, Clock, Route } from "lucide-react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";

export default function Conservation() {
  const recommendations = useStore((s) => s.recommendations);
  const adjustments = useStore((s) => s.adjustments);
  const addAdjustment = useStore((s) => s.addAdjustment);
  const [activeTab, setActiveTab] = useState<"recommend" | "adjust">("recommend");

  const handleApplyRecommendation = (recId: string) => {
    const rec = recommendations.find((r) => r.id === recId);
    if (!rec) return;
    const adj = {
      id: `adj_${Date.now()}`,
      taskId: "",
      speciesId: rec.speciesId,
      type: "BOUNDARY" as const,
      description: `基于推荐策略调整: ${rec.strategy.slice(0, 30)}...`,
      approvedBy: "当前用户",
      adjustedAt: new Date().toISOString(),
      speciesName: rec.speciesName,
    };
    addAdjustment(adj);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TreePine className="w-7 h-7 text-forest-400" />
          <h1 className="text-2xl font-display font-bold text-forest-50">保护策略规划</h1>
        </div>
        <Link
          to="/conservation/log"
          className="flex items-center gap-2 rounded-lg bg-forest-700/50 px-4 py-2 text-sm text-forest-200 transition-colors hover:bg-forest-600/50"
        >
          <Clock className="w-4 h-4" />
          调整日志
        </Link>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("recommend")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
            activeTab === "recommend"
              ? "bg-forest-500/30 text-forest-50 border-forest-500/50"
              : "bg-forest-800/50 text-forest-200 border-forest-500/20 hover:border-forest-500/40"
          )}
        >
          <Lightbulb className="w-4 h-4 inline mr-1.5" />
          智能推荐
        </button>
        <button
          onClick={() => setActiveTab("adjust")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
            activeTab === "adjust"
              ? "bg-forest-500/30 text-forest-50 border-forest-500/50"
              : "bg-forest-800/50 text-forest-200 border-forest-500/20 hover:border-forest-500/40"
          )}
        >
          <MapPin className="w-4 h-4 inline mr-1.5" />
          保护区调整
        </button>
      </div>

      {activeTab === "recommend" && (
        <div className="space-y-4">
          {recommendations.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-base font-semibold text-forest-50">{rec.speciesName}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      置信度 {(rec.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-forest-200 leading-relaxed mb-3">{rec.strategy}</p>
                  <div className="flex items-center gap-4 text-xs text-forest-400">
                    <span>{rec.basedOn}</span>
                    <span>生成于 {new Date(rec.generatedAt).toLocaleDateString("zh-CN")}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleApplyRecommendation(rec.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-forest-600/40 text-sm text-forest-200 transition-colors hover:bg-forest-500/40 shrink-0"
                >
                  应用
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === "adjust" && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow overflow-hidden" style={{ height: 480 }}>
              <div className="flex items-center justify-center h-full text-forest-400">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">交互式保护区地图</p>
                  <p className="text-xs mt-1 text-forest-500">需要后端地图服务支持</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-forest-300">近期调整</h3>
            {adjustments.slice(0, 5).map((adj) => (
              <div key={adj.id} className="bg-forest-700/30 border border-forest-500/15 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-medium",
                    adj.type === "BOUNDARY" ? "bg-sky-500/20 text-sky-300" : "bg-violet-500/20 text-violet-300"
                  )}>
                    {adj.type === "BOUNDARY" ? "边界" : "廊道"}
                  </span>
                  <span className="text-xs text-forest-400">{adj.speciesName}</span>
                </div>
                <p className="text-xs text-forest-200 leading-relaxed">{adj.description}</p>
                <p className="text-[10px] text-forest-500 mt-2">{new Date(adj.adjustedAt).toLocaleDateString("zh-CN")} | {adj.approvedBy}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
