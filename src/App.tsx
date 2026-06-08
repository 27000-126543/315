import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import Dashboard from "@/pages/Dashboard";
import DataManagement from "@/pages/DataManagement";
import DataUpload from "@/pages/DataUpload";
import TaskList from "@/pages/TaskList";
import TaskKanban from "@/pages/TaskKanban";
import TaskDetail from "@/pages/TaskDetail";
import TaskCreate from "@/pages/TaskCreate";
import RiskMonitor from "@/pages/RiskMonitor";
import ThresholdConfig from "@/pages/ThresholdConfig";
import Conservation from "@/pages/Conservation";
import AdjustmentLog from "@/pages/AdjustmentLog";
import ApprovalCenter from "@/pages/ApprovalCenter";
import ReportList from "@/pages/ReportList";
import ReportDetail from "@/pages/ReportDetail";
import DataExport from "@/pages/DataExport";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/data" element={<DataManagement />} />
          <Route path="/data/upload" element={<DataUpload />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/tasks/kanban" element={<TaskKanban />} />
          <Route path="/tasks/create" element={<TaskCreate />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/risk" element={<RiskMonitor />} />
          <Route path="/risk/threshold" element={<ThresholdConfig />} />
          <Route path="/conservation" element={<Conservation />} />
          <Route path="/conservation/log" element={<AdjustmentLog />} />
          <Route path="/approval" element={<ApprovalCenter />} />
          <Route path="/reports" element={<ReportList />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/reports/export" element={<DataExport />} />
        </Route>
      </Routes>
    </Router>
  );
}
