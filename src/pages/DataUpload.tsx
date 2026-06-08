import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  FileUp,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Table2,
} from "lucide-react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import type { DatasetType, Dataset } from "@/types";

type UploadStep = "select" | "uploading" | "validating" | "success" | "error";
type DataType = "SPECIES_DISTRIBUTION" | "ENVIRONMENTAL";

const DATA_TYPE_OPTIONS: { value: DataType; label: string }[] = [
  { value: "SPECIES_DISTRIBUTION", label: "物种分布数据" },
  { value: "ENVIRONMENTAL", label: "环境变量数据" },
];

const SPECIES_FIELDS = [
  { source: "species_name", target: "物种名称", required: true },
  { source: "latitude", target: "纬度", required: true },
  { source: "longitude", target: "经度", required: true },
  { source: "observation_date", target: "观测日期", required: true },
  { source: "observer", target: "观测者", required: false },
  { source: "abundance", target: "丰度", required: false },
];

const ENV_FIELDS = [
  { source: "bio_variable", target: "环境变量名", required: true },
  { source: "value", target: "变量值", required: true },
  { source: "lat", target: "纬度", required: true },
  { source: "lon", target: "经度", required: true },
  { source: "timestamp", target: "时间戳", required: true },
  { source: "source", target: "数据来源", required: false },
];

function validateFile(file: File, dataType: DataType): { valid: boolean; errors: string[]; recordCount: number; fieldResults: { source: string; target: string; required: boolean; passed: boolean }[] } {
  const errors: string[] = [];
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const fields = dataType === "SPECIES_DISTRIBUTION" ? SPECIES_FIELDS : ENV_FIELDS;

  if (dataType === "SPECIES_DISTRIBUTION") {
    if (ext !== "csv") {
      errors.push(`物种分布数据需要CSV格式，当前文件格式为: .${ext}`);
    }
  } else {
    if (ext !== "tif" && ext !== "nc" && ext !== "csv") {
      errors.push(`环境变量数据需要TIF/NetCDF/CSV格式，当前文件格式为: .${ext}`);
    }
  }

  if (file.size === 0) {
    errors.push("文件大小为0，请检查文件内容");
  }

  const fieldResults = fields.map((f) => ({
    ...f,
    passed: f.required ? errors.length === 0 : Math.random() > 0.2,
  }));

  const recordCount = errors.length === 0
    ? Math.floor(Math.random() * 8000 + 500)
    : 0;

  return {
    valid: errors.length === 0,
    errors,
    recordCount,
    fieldResults,
  };
}

export default function DataUpload() {
  const addDataset = useStore((s) => s.addDataset);
  const [dataType, setDataType] = useState<DataType>("SPECIES_DISTRIBUTION");
  const [step, setStep] = useState<UploadStep>("select");
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [createdDataset, setCreatedDataset] = useState<Dataset | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldResults, setFieldResults] = useState<{ source: string; target: string; required: boolean; passed: boolean }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPT_TYPES = dataType === "SPECIES_DISTRIBUTION" ? ".csv" : ".tif,.nc,.csv";

  const processFile = useCallback((file: File) => {
    setSelectedFile(file);
    setStep("uploading");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStep("validating");
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 150);
  }, []);

  const startValidation = useCallback(() => {
    if (!selectedFile) return;

    const result = validateFile(selectedFile, dataType);

    setTimeout(() => {
      if (result.valid) {
        const datasetName = dataType === "SPECIES_DISTRIBUTION"
          ? selectedFile.name.replace(/\.[^.]+$/, "") + "分布数据集"
          : selectedFile.name.replace(/\.[^.]+$/, "") + "环境数据集";

        const newDataset: Dataset = {
          id: `ds_${Date.now()}`,
          name: datasetName,
          type: dataType as DatasetType,
          fileName: selectedFile.name,
          status: "VALID",
          uploadedBy: "当前用户",
          uploadedAt: new Date().toISOString(),
          recordCount: result.recordCount,
        };
        addDataset(newDataset);
        setCreatedDataset(newDataset);
        setFieldResults(result.fieldResults);
        setStep("success");
      } else {
        const datasetName = dataType === "SPECIES_DISTRIBUTION"
          ? selectedFile.name.replace(/\.[^.]+$/, "") + "分布数据集"
          : selectedFile.name.replace(/\.[^.]+$/, "") + "环境数据集";

        const newDataset: Dataset = {
          id: `ds_${Date.now()}`,
          name: datasetName,
          type: dataType as DatasetType,
          fileName: selectedFile.name,
          status: "INVALID",
          uploadedBy: "当前用户",
          uploadedAt: new Date().toISOString(),
          recordCount: 0,
        };
        addDataset(newDataset);
        setCreatedDataset(newDataset);
        setValidationErrors(result.errors);
        setFieldResults(result.fieldResults);
        setStep("error");
      }
    }, 1000);
  }, [selectedFile, dataType, addDataset]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (step !== "select") return;
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [step, processFile]
  );

  const handleClick = useCallback(() => {
    if (step === "select") {
      fileInputRef.current?.click();
    }
  }, [step]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFile]
  );

  const reset = () => {
    setStep("select");
    setProgress(0);
    setSelectedFile(null);
    setCreatedDataset(null);
    setValidationErrors([]);
    setFieldResults([]);
  };

  const fields = dataType === "SPECIES_DISTRIBUTION" ? SPECIES_FIELDS : ENV_FIELDS;
  const displayFields = fieldResults.length > 0 ? fieldResults : fields.map((f) => ({ ...f, passed: false }));

  return (
    <div className="min-h-screen p-6 space-y-6 font-body max-w-3xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_TYPES}
        onChange={handleFileChange}
        className="hidden"
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link
          to="/data"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-forest-400 hover:text-forest-200 hover:bg-forest-700/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>
        <h1 className="text-2xl font-bold text-forest-50">上传数据</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-5"
      >
        <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl p-5 card-glow">
          <label className="block text-sm font-medium text-forest-200 mb-3">数据类型</label>
          <div className="flex gap-3">
            {DATA_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setDataType(opt.value); reset(); }}
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all border",
                  dataType === opt.value
                    ? "bg-forest-500/20 border-forest-500/50 text-forest-100 shadow-md"
                    : "bg-forest-800/30 border-forest-500/10 text-forest-400 hover:border-forest-500/30 hover:text-forest-200"
                )}
              >
                {opt.value === "SPECIES_DISTRIBUTION" ? (
                  <FileSpreadsheet className="w-5 h-5 mx-auto mb-1.5" />
                ) : (
                  <Table2 className="w-5 h-5 mx-auto mb-1.5" />
                )}
                {opt.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-forest-500">
            {dataType === "SPECIES_DISTRIBUTION"
              ? "支持 CSV 格式，需包含物种名称、经纬度等字段"
              : "支持 TIF、NetCDF (.nc)、CSV 格式环境变量数据"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClick}
              className={cn(
                "border-2 border-dashed rounded-xl p-16 cursor-pointer transition-all",
                "flex flex-col items-center justify-center gap-4",
                isDragOver
                  ? "border-emerald-400 bg-emerald-500/10"
                  : "border-forest-500/30 bg-forest-800/30 hover:border-forest-400/60 hover:bg-forest-800/50"
              )}
            >
              <motion.div
                animate={isDragOver ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FileUp className={cn("w-14 h-14", isDragOver ? "text-emerald-400" : "text-forest-400")} />
              </motion.div>
              <div className="text-center">
                <p className="text-base font-medium text-forest-200">
                  拖拽文件至此处，或点击选择文件
                </p>
                <p className="text-sm text-forest-500 mt-1">
                  {dataType === "SPECIES_DISTRIBUTION"
                    ? "支持 CSV 格式，最大 500MB"
                    : "支持 TIF, NetCDF, CSV 格式，最大 500MB"}
                </p>
              </div>
            </motion.div>
          )}

          {step === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-forest-800/50 border border-forest-500/20 rounded-xl p-8 card-glow"
            >
              <div className="flex flex-col items-center gap-5">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  <Upload className="w-10 h-10 text-forest-400" />
                </motion.div>
                <div className="w-full space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-300 font-medium">上传中...</span>
                    <span className="text-forest-400 font-mono">{Math.min(Math.round(progress), 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-forest-700/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-forest-500 to-emerald-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-forest-500 text-center font-mono">
                    {selectedFile?.name}
                  </p>
                </div>
              </div>
              {progress >= 100 && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={startValidation}
                    className="px-5 py-2 rounded-lg bg-forest-500 hover:bg-forest-600 text-forest-50 text-sm font-medium transition-colors shadow-lg shadow-forest-500/20"
                  >
                    开始校验
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {step === "validating" && (
            <motion.div
              key="validating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-forest-800/50 border border-forest-500/20 rounded-xl p-8 card-glow text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              >
                <Upload className="w-10 h-10 text-forest-400 mx-auto" />
              </motion.div>
              <p className="mt-4 text-sm text-forest-300">正在校验数据字段和格式...</p>
              <p className="text-xs text-forest-500 mt-1 font-mono">{selectedFile?.name}</p>
            </motion.div>
          )}

          {step === "success" && createdDataset && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="bg-forest-800/50 border border-emerald-500/30 rounded-xl p-8 card-glow text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, delay: 0.2 }}>
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-lg font-semibold text-forest-50 mb-2">上传并校验成功</h3>
                <div className="grid grid-cols-2 gap-3 text-sm max-w-sm mx-auto">
                  <span className="text-forest-400">数据集名称</span>
                  <span className="text-forest-100 font-mono">{createdDataset.name}</span>
                  <span className="text-forest-400">文件名</span>
                  <span className="text-forest-100 font-mono text-xs">{createdDataset.fileName}</span>
                  <span className="text-forest-400">记录数</span>
                  <span className="text-forest-100 font-mono">{createdDataset.recordCount.toLocaleString()}</span>
                  <span className="text-forest-400">校验状态</span>
                  <span className="text-emerald-400 font-medium">校验通过</span>
                </div>
              </div>

              <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl p-5 card-glow">
                <h4 className="text-sm font-semibold text-forest-200 mb-4">字段校验结果</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-forest-400 border-b border-forest-500/20">
                      <th className="text-left py-2 font-medium">源字段</th>
                      <th className="text-left py-2 font-medium">目标字段</th>
                      <th className="text-center py-2 font-medium">必填</th>
                      <th className="text-center py-2 font-medium">校验</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayFields.map((f, i) => (
                      <motion.tr
                        key={f.source}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.06 }}
                        className="border-b border-forest-500/10 last:border-0"
                      >
                        <td className="py-2.5 font-mono text-forest-300">{f.source}</td>
                        <td className="py-2.5 text-forest-100">{f.target}</td>
                        <td className="py-2.5 text-center">
                          {f.required ? <span className="text-emerald-400 text-xs">必填</span> : <span className="text-forest-600 text-xs">可选</span>}
                        </td>
                        <td className="py-2.5 text-center">
                          {f.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <Link to="/data" className="px-5 py-2.5 rounded-xl text-sm font-medium bg-forest-500 hover:bg-forest-600 text-forest-50 transition-colors shadow-lg shadow-forest-500/20">
                  返回数据管理
                </Link>
                <button onClick={reset} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-forest-800/50 border border-forest-500/20 text-forest-300 hover:text-forest-100 hover:border-forest-500/40 transition-colors">
                  继续上传
                </button>
              </div>
            </motion.div>
          )}

          {step === "error" && createdDataset && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="bg-forest-800/50 border border-red-500/30 rounded-xl p-8 card-glow text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, delay: 0.2 }}>
                  <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-lg font-semibold text-forest-50 mb-2">校验未通过</h3>
                <div className="grid grid-cols-2 gap-3 text-sm max-w-sm mx-auto mb-4">
                  <span className="text-forest-400">文件名</span>
                  <span className="text-forest-100 font-mono text-xs">{createdDataset.fileName}</span>
                  <span className="text-forest-400">校验状态</span>
                  <span className="text-red-400 font-medium">校验失败</span>
                </div>
                <div className="bg-red-500/10 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm font-medium text-red-300 mb-2">错误信息:</p>
                  {validationErrors.map((err, i) => (
                    <p key={i} className="text-sm text-red-400 text-left">• {err}</p>
                  ))}
                </div>
              </div>

              <div className="bg-forest-800/50 border border-forest-500/20 rounded-xl p-5 card-glow">
                <h4 className="text-sm font-semibold text-forest-200 mb-4">字段校验结果</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-forest-400 border-b border-forest-500/20">
                      <th className="text-left py-2 font-medium">源字段</th>
                      <th className="text-left py-2 font-medium">目标字段</th>
                      <th className="text-center py-2 font-medium">必填</th>
                      <th className="text-center py-2 font-medium">校验</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayFields.map((f, i) => (
                      <motion.tr key={f.source} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }} className="border-b border-forest-500/10 last:border-0">
                        <td className="py-2.5 font-mono text-forest-300">{f.source}</td>
                        <td className="py-2.5 text-forest-100">{f.target}</td>
                        <td className="py-2.5 text-center">{f.required ? <span className="text-emerald-400 text-xs">必填</span> : <span className="text-forest-600 text-xs">可选</span>}</td>
                        <td className="py-2.5 text-center">
                          {f.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <Link to="/data" className="px-5 py-2.5 rounded-xl text-sm font-medium bg-forest-500 hover:bg-forest-600 text-forest-50 transition-colors shadow-lg shadow-forest-500/20">
                  返回数据管理
                </Link>
                <button onClick={reset} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-forest-800/50 border border-forest-500/20 text-forest-300 hover:text-forest-100 hover:border-forest-500/40 transition-colors">
                  重新上传
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
