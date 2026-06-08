## 1. 架构设计

```mermaid
graph TB
    subgraph "前端层"
        A["React 18 + Vite"]
        B["Tailwind CSS"]
        C["Chart.js"]
        D["Leaflet 地图"]
    end

    subgraph "状态管理"
        E["Zustand"]
        F["React Router v6"]
    end

    subgraph "模拟服务层(Mock)"
        G["模拟任务引擎"]
        H["风险计算引擎"]
        I["预警触发引擎"]
        J["推荐引擎"]
    end

    subgraph "数据层(Mock)"
        K["LocalStorage 持久化"]
        L["Mock 数据生成器"]
    end

    A --> E
    A --> F
    A --> C
    A --> D
    E --> G
    E --> H
    E --> I
    E --> J
    G --> K
    H --> K
    I --> K
    J --> K
    L --> K
```

## 2. 技术说明

- **前端**: React@18 + TailwindCSS@3 + Vite
- **初始化工具**: Vite (npm create vite@latest)
- **后端**: 无后端，全部使用前端Mock数据模拟
- **数据库**: LocalStorage + 内存状态管理(Zustand)
- **地图**: Leaflet + React-Leaflet
- **图表**: Chart.js + react-chartjs-2
- **PDF生成**: jsPDF + html2canvas
- **图标**: Lucide React
- **动画**: Framer Motion
- **状态管理**: Zustand
- **路由**: React Router v6

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| / | 首页仪表盘 |
| /data | 数据管理中心 |
| /data/upload | 数据上传 |
| /tasks | 模拟任务列表 |
| /tasks/kanban | 任务状态看板 |
| /tasks/:id | 任务详情 |
| /tasks/create | 创建模拟任务 |
| /risk | 风险监控中心 |
| /risk/threshold | 阈值配置 |
| /conservation | 保护策略规划 |
| /conservation/log | 调整日志 |
| /approval | 审批中心 |
| /approval/:id | 审批详情 |
| /reports | 报告列表 |
| /reports/:id | 报告详情 |
| /reports/export | 数据导出 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    Species {
        string id PK
        string name
        string scientificName
        string category
        string habitat
        number currentPopulation
        number extinctionProb
        number consecutiveHighRisk
        boolean isPaused
    }

    Dataset {
        string id PK
        string name
        string type
        string fileName
        string status
        string uploadedBy
        datetime uploadedAt
        number recordCount
    }

    SimulationTask {
        string id PK
        string speciesId FK
        string datasetId FK
        string status
        number extinctionProbability
        number populationGrowthRate
        number warningLevel
        string createdBy
        datetime createdAt
        datetime completedAt
    }

    Warning {
        string id PK
        string taskId FK
        string speciesId FK
        string level
        string type
        number value
        number threshold
        string status
        string reviewedBy
        datetime triggeredAt
    }

    Approval {
        string id PK
        string taskId FK
        string level
        string status
        string reviewerId
        string comment
        datetime reviewedAt
    }

    ConservationAdjustment {
        string id PK
        string taskId FK
        string speciesId FK
        string type
        string description
        string approvedBy
        datetime adjustedAt
        json geometry
    }

    StrategyRecommendation {
        string id PK
        string speciesId FK
        string strategy
        number confidence
        string basedOn
        datetime generatedAt
    }

    DailyMetric {
        string id PK
        date date
        number completionRate
        number avgWarningResponseTime
        number optimizationCount
        number totalTasks
        number completedTasks
    }

    Species ||--o{ SimulationTask : "has"
    Dataset ||--o{ SimulationTask : "used in"
    SimulationTask ||--o{ Warning : "triggers"
    SimulationTask ||--o{ Approval : "requires"
    SimulationTask ||--o{ ConservationAdjustment : "causes"
    Species ||--o{ StrategyRecommendation : "receives"
    Species ||--o{ ConservationAdjustment : "affected by"
```

### 4.2 模拟任务状态枚举

```
PENDING_REVIEW(待校验) → MODEL_BUILDING(模型构建) → DISTRIBUTION_SIM(分布模拟) → POPULATION_DYNAMICS(种群动态) → RISK_ANALYSIS(风险分析) → COMPLETED(完成)
任何阶段 → ERROR(异常)
ERROR → PENDING_REVIEW(首席科学家审核后重新开始)
```

### 4.3 预警级别枚举

```
LEVEL_1(一级-黄色): 灭绝概率10%-15% 或 种群增长率<-5%
LEVEL_2(二级-橙色): 灭绝概率15%-20% 或 种群增长率<-10%
LEVEL_3(三级-红色): 灭绝概率>20% 或 种群增长率<-15%
```
