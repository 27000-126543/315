import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, User, Shield } from "lucide-react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import type { ApprovalStatus, ApprovalLevel } from "@/types";

const STATUS_CONFIG: Record<ApprovalStatus, { label: string; cls: string; icon: typeof Clock }> = {
  PENDING: { label: "待审批", cls: "bg-yellow-500/20 text-yellow-300", icon: Clock },
  APPROVED: { label: "已通过", cls: "bg-green-500/20 text-green-300", icon: CheckCircle },
  REJECTED: { label: "已驳回", cls: "bg-red-500/20 text-red-300", icon: XCircle },
};

const LEVEL_CONFIG: Record<ApprovalLevel, { label: string; cls: string; icon: typeof User }> = {
  ECOLOGIST: { label: "种群生态学家验证", cls: "bg-sky-500/20 text-sky-300", icon: User },
  AUTHORITY: { label: "保护权威确认", cls: "bg-violet-500/20 text-violet-300", icon: Shield },
};

export default function ApprovalCenter() {
  const approvals = useStore((s) => s.approvals);
  const updateApproval = useStore((s) => s.updateApproval);
  const [filter, setFilter] = useState<ApprovalStatus | "ALL">("ALL");
  const [commentMap, setCommentMap] = useState<Record<string, string>>({});

  const filtered = filter === "ALL" ? approvals : approvals.filter((a) => a.status === filter);
  const pendingCount = approvals.filter((a) => a.status === "PENDING").length;

  const handleAction = (id: string, status: ApprovalStatus) => {
    updateApproval(id, status, commentMap[id] || "");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-7 h-7 text-forest-400" />
          <h1 className="text-2xl font-display font-bold text-forest-50">审批中心</h1>
          {pendingCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {pendingCount} 待审批
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm border transition-colors",
              filter === f
                ? "bg-forest-500/30 text-forest-50 border-forest-500/50"
                : "bg-forest-800/50 text-forest-200 border-forest-500/20 hover:border-forest-500/40"
            )}
          >
            {f === "ALL" ? "全部" : STATUS_CONFIG[f].label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((approval, i) => {
          const levelCfg = LEVEL_CONFIG[approval.level];
          const statusCfg = STATUS_CONFIG[approval.status];
          const StatusIcon = statusCfg.icon;
          const LevelIcon = levelCfg.icon;

          return (
            <motion.div
              key={approval.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium", levelCfg.cls)}>
                      <LevelIcon className="w-3 h-3" />
                      {levelCfg.label}
                    </span>
                    <span className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium", statusCfg.cls)}>
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-base font-semibold text-forest-50">{approval.taskSpeciesName} 模拟结果</p>
                    <p className="text-sm text-forest-300 mt-1">任务ID: #{approval.taskId.toUpperCase()}</p>
                  </div>

                  {approval.reviewerName && (
                    <p className="text-sm text-forest-300">
                      审批人: <span className="text-forest-100">{approval.reviewerName}</span>
                      {approval.reviewedAt && (
                        <span className="ml-3 text-forest-400">
                          {new Date(approval.reviewedAt).toLocaleString("zh-CN")}
                        </span>
                      )}
                    </p>
                  )}

                  {approval.comment && (
                    <p className="mt-2 text-sm text-forest-200 bg-forest-700/30 rounded-lg px-3 py-2">
                      "{approval.comment}"
                    </p>
                  )}
                </div>

                {approval.status === "PENDING" && (
                  <div className="flex flex-col gap-2 shrink-0 w-56">
                    <textarea
                      value={commentMap[approval.id] || ""}
                      onChange={(e) => setCommentMap((prev) => ({ ...prev, [approval.id]: e.target.value }))}
                      placeholder="填写审批意见..."
                      className="w-full bg-forest-700/50 border border-forest-500/30 rounded-lg px-3 py-2 text-sm text-forest-100 placeholder-forest-500 focus:outline-none focus:border-forest-400 resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(approval.id, "APPROVED")}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-green-600/30 text-green-300 text-sm font-medium hover:bg-green-600/50 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        通过
                      </button>
                      <button
                        onClick={() => handleAction(approval.id, "REJECTED")}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-600/30 text-red-300 text-sm font-medium hover:bg-red-600/50 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        驳回
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-forest-500">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>暂无审批记录</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
