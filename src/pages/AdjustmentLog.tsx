import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, MapPin, Route } from "lucide-react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";

export default function AdjustmentLog() {
  const adjustments = useStore((s) => s.adjustments);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/conservation" className="flex items-center gap-1 text-forest-400 hover:text-forest-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>
        <h1 className="text-2xl font-display font-bold text-forest-50">调整日志</h1>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-forest-500/20" />
        <div className="space-y-6">
          {adjustments.map((adj, i) => (
            <motion.div
              key={adj.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative pl-14"
            >
              <div className={cn(
                "absolute left-4 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                adj.type === "BOUNDARY" ? "bg-sky-500/20 border-sky-500/50" : "bg-violet-500/20 border-violet-500/50"
              )}>
                {adj.type === "BOUNDARY" ? <MapPin className="w-2.5 h-2.5 text-sky-400" /> : <Route className="w-2.5 h-2.5 text-violet-400" />}
              </div>

              <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    adj.type === "BOUNDARY" ? "bg-sky-500/20 text-sky-300" : "bg-violet-500/20 text-violet-300"
                  )}>
                    {adj.type === "BOUNDARY" ? "保护区边界调整" : "生态廊道布局"}
                  </span>
                  <span className="text-sm font-medium text-forest-100">{adj.speciesName}</span>
                </div>
                <p className="text-sm text-forest-200 leading-relaxed">{adj.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-forest-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(adj.adjustedAt).toLocaleString("zh-CN")}
                  </span>
                  <span>审批: {adj.approvedBy}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {adjustments.length === 0 && (
        <div className="text-center py-16 text-forest-500">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>暂无调整记录</p>
        </div>
      )}
    </motion.div>
  );
}
