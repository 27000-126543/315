import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Database, CheckCircle2, XCircle, FlaskConical, FileText, Calendar, Hash } from "lucide-react";
import { useStore } from "@/store";
import { TASK_STATUS_LABELS } from "@/types";
import { cn } from "@/lib/utils";

export default function DatasetDetail() {
  const { id } = useParams<{ id: string }>();
  const datasets = useStore((s) => s.datasets);
  const tasks = useStore((s) => s.tasks);
  const ds = datasets.find((d) => d.id === id);

  if (!ds) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-forest-400">
        <p className="text-lg">数据集未找到</p>
        <Link to="/data" className="mt-4 text-forest-300 hover:text-forest-100">返回数据管理</Link>
      </div>
    );
  }

  const relatedTasks = tasks.filter((t) => t.datasetId === ds.id);
  const isValid = ds.status === "VALID";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/data" className="flex items-center gap-1 text-forest-400 hover:text-forest-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>
        <h1 className="text-2xl font-display font-bold text-forest-50">数据集详情</h1>
      </div>

      <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow p-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-forest-50">{ds.name}</h2>
          <span className={cn("px-2.5 py-0.5 rounded-md text-xs font-medium", isValid ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30")}>
            {isValid ? "校验通过" : "校验失败"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-forest-700/30 rounded-lg p-3 flex items-center gap-3">
            <FileText className="w-4 h-4 text-forest-400 shrink-0" />
            <div>
              <p className="text-xs text-forest-400">原始文件名</p>
              <p className="font-mono text-forest-100 mt-0.5 text-xs">{ds.fileName}</p>
            </div>
          </div>
          <div className="bg-forest-700/30 rounded-lg p-3 flex items-center gap-3">
            <Database className="w-4 h-4 text-forest-400 shrink-0" />
            <div>
              <p className="text-xs text-forest-400">数据类型</p>
              <p className="text-forest-100 mt-0.5">{ds.type === "SPECIES_DISTRIBUTION" ? "物种分布" : "环境变量"}</p>
            </div>
          </div>
          <div className="bg-forest-700/30 rounded-lg p-3 flex items-center gap-3">
            <Hash className="w-4 h-4 text-forest-400 shrink-0" />
            <div>
              <p className="text-xs text-forest-400">记录数</p>
              <p className="font-mono text-forest-100 mt-0.5">{ds.recordCount.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-forest-700/30 rounded-lg p-3 flex items-center gap-3">
            <Calendar className="w-4 h-4 text-forest-400 shrink-0" />
            <div>
              <p className="text-xs text-forest-400">上传时间</p>
              <p className="font-mono text-forest-100 mt-0.5">{new Date(ds.uploadedAt).toLocaleString("zh-CN")}</p>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-forest-400">上传者: {ds.uploadedBy}</p>
      </div>

      {ds.validationErrors && ds.validationErrors.length > 0 && (
        <div className="bg-forest-800/50 border border-red-500/30 rounded-xl card-glow p-6">
          <h3 className="text-sm font-semibold text-red-300 mb-3">校验错误</h3>
          <div className="bg-red-500/10 rounded-lg p-4 space-y-1">
            {ds.validationErrors.map((err, i) => (
              <p key={i} className="text-sm text-red-400">• {err}</p>
            ))}
          </div>
        </div>
      )}

      {ds.rasterMetadata && (
        <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow p-6">
          <h3 className="text-sm font-semibold text-forest-200 mb-4">栅格元信息</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-forest-700/30 rounded-lg p-3">
              <p className="text-xs text-forest-400">空间范围</p>
              <p className="font-mono text-forest-100 mt-1 text-xs">{ds.rasterMetadata.spatialExtent}</p>
            </div>
            <div className="bg-forest-700/30 rounded-lg p-3">
              <p className="text-xs text-forest-400">分辨率</p>
              <p className="font-mono text-forest-100 mt-1 text-xs">{ds.rasterMetadata.resolution}</p>
            </div>
            <div className="bg-forest-700/30 rounded-lg p-3">
              <p className="text-xs text-forest-400">时间维度</p>
              <p className="font-mono text-forest-100 mt-1 text-xs">{ds.rasterMetadata.timeDimension}</p>
            </div>
            <div className="bg-forest-700/30 rounded-lg p-3">
              <p className="text-xs text-forest-400">坐标系</p>
              <p className="font-mono text-forest-100 mt-1 text-xs">{ds.rasterMetadata.crs}</p>
            </div>
            <div className="bg-forest-700/30 rounded-lg p-3">
              <p className="text-xs text-forest-400">波段数</p>
              <p className="font-mono text-forest-100 mt-1">{ds.rasterMetadata.bandCount}</p>
            </div>
          </div>
        </div>
      )}

      {ds.csvPreview && (
        <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow p-6">
          <h3 className="text-sm font-semibold text-forest-200 mb-4">数据预览 (前3行)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-forest-500/20">
                  {ds.csvPreview.headers.map((h) => (
                    <th key={h} className="text-left py-2 px-3 font-mono text-forest-400 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ds.csvPreview.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-forest-500/10 last:border-0">
                    {row.map((cell, ci) => (
                      <td key={ci} className="py-2 px-3 font-mono text-forest-200 whitespace-nowrap">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {ds.fieldValidations && ds.fieldValidations.length > 0 && (
        <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow p-6">
          <h3 className="text-sm font-semibold text-forest-200 mb-4">字段校验明细</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-forest-400 border-b border-forest-500/20">
                <th className="text-left py-2 font-medium">源字段</th>
                <th className="text-left py-2 font-medium">目标字段</th>
                <th className="text-center py-2 font-medium">必填</th>
                <th className="text-center py-2 font-medium">类型检查</th>
                <th className="text-center py-2 font-medium">校验</th>
                <th className="text-left py-2 font-medium">样例值</th>
              </tr>
            </thead>
            <tbody>
              {ds.fieldValidations.map((f) => (
                <tr key={f.source} className="border-b border-forest-500/10 last:border-0">
                  <td className="py-2.5 font-mono text-forest-300">{f.source}</td>
                  <td className="py-2.5 text-forest-100">{f.target}</td>
                  <td className="py-2.5 text-center">{f.required ? <span className="text-emerald-400 text-xs">必填</span> : <span className="text-forest-600 text-xs">可选</span>}</td>
                  <td className="py-2.5 text-center">
                    <span className={cn("text-xs px-1.5 py-0.5 rounded", f.typeCheck === "OK" ? "bg-emerald-500/20 text-emerald-300" : f.typeCheck === "MISSING" ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300")}>
                      {f.typeCheck === "OK" ? "通过" : f.typeCheck === "MISSING" ? "缺失" : "不匹配"}
                    </span>
                  </td>
                  <td className="py-2.5 text-center">{f.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}</td>
                  <td className="py-2.5 font-mono text-forest-400 text-xs max-w-[140px] truncate">{f.sampleValue || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {relatedTasks.length > 0 && (
        <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl card-glow p-6">
          <h3 className="text-sm font-semibold text-forest-200 mb-4 flex items-center gap-2">
            <FlaskConical className="w-4 h-4" /> 关联模拟任务
          </h3>
          <div className="space-y-3">
            {relatedTasks.map((t) => (
              <Link key={t.id} to={`/tasks/${t.id}`} className="flex items-center justify-between p-3 bg-forest-700/30 rounded-lg hover:bg-forest-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-forest-100">{t.speciesName}</span>
                  <span className="text-xs text-forest-400 font-mono">#{t.id.toUpperCase()}</span>
                </div>
                <span className={cn("text-xs px-2 py-0.5 rounded",
                  t.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-300" :
                  t.status === "ERROR" ? "bg-red-500/20 text-red-300" :
                  "bg-amber-500/20 text-amber-300"
                )}>
                  {TASK_STATUS_LABELS[t.status]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {isValid && (
        <div className="flex gap-3 justify-center">
          <Link to={`/tasks/create?datasetId=${ds.id}`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-amber-600/30 text-amber-300 hover:bg-amber-600/50 transition-colors">
            <FlaskConical className="w-4 h-4" />
            用此数据集创建任务
          </Link>
        </div>
      )}
    </motion.div>
  );
}
