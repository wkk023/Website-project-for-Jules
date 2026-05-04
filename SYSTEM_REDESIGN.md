# Fire Inspection System - 高層設計文件

## 1. 系統概述

本文件概述了消防檢查系統的完全重構，以支持多消防站協作、風險等級管理和月度驗證機制。

## 2. 核心架構變化

### 2.1 認證系統
**從：** Manus OAuth（無需登入）
**到：** 消防站本地認證

**6 個消防站帳戶：**
- TSFStn（Tin Sum Fire Station）
- STFStn（Sham Tseng Fire Station）
- MOSFStn（Mong Kok Fire Station）
- SLYFStn（Sai Ying Pun Fire Station）
- TPFStn（Tuen Mun Fire Station）
- TPEFStn（Tseung Kwan O Fire Station）

**密碼：** 所有帳戶初始密碼為 P@ssword

### 2.2 資料庫結構

**新增表：**
1. `fire_stations` - 消防站帳戶
2. `buildings` - 建築物清單（來自 Tin Sum Area 資料庫）
3. `referral_departments` - 轉介部門
4. `verification_records` - 驗證記錄

**修改表：**
- `inspection_records` - 新增欄位：buildingId, stationId, floor, watchNumber, inspectionDateTime, referralDepartmentId

## 3. 用戶流程

### 3.1 檢查人員流程

**步驟 1：登入**
- 輸入消防站代碼（如 TSFStn）
- 輸入密碼（P@ssword）
- 系統驗證並創建會話

**步驟 2：提交檢查記錄**
1. 從下拉菜單選擇建築物（自動帶入 LIFIPS、地址、地點、建築類型、風險等級）
2. 輸入檢查樓層
3. 選擇消防隊編號（A/B/C）
4. 選擇檢查日期和時間
5. 輸入違規事項（可選）
6. 選擇轉介部門（可選）
7. 提交

**步驟 3：查看檢查歷史**
- 查看該消防站提交的所有檢查記錄
- 按建築物、日期等篩選

### 3.2 驗證人員流程

**月度驗證機制：**
- 每月自動生成隨機檢查記錄供驗證
- 例如：TSFStn 每月收到來自 ST、MOS、SLY、TP、TPE 各 5 筆記錄
- 驗證人員查看記錄，驗證是否與 LIFIPS 系統資料相符
- 系統記錄「已查看」狀態和驗證日期
- 可查看驗證歷史

## 4. 功能模塊

### 4.1 登入模塊
**檔案：** `client/src/pages/Login.tsx`
- 簡潔高科技 UI
- 消防站代碼輸入
- 密碼輸入
- 登入驗證
- 錯誤處理

**後端 API：** `auth.login`
- 驗證消防站代碼和密碼
- 返回會話 token

### 4.2 檢查表單模塊
**檔案：** `client/src/pages/SubmitInspection.tsx`
- 建築物選擇下拉菜單（支持搜尋）
- 自動帶入建築物資訊
- 樓層輸入
- 消防隊編號選擇（A/B/C）
- 檢查日期/時間選擇
- 違規事項文本區
- 轉介部門下拉菜單
- 提交按鈕

**後端 API：** `inspection.submit`
- 驗證輸入
- 保存到資料庫
- 返回確認

### 4.3 檢查記錄管理模塊
**檔案：** `client/src/pages/InspectionRecords.tsx`
- 表格顯示該消防站的所有檢查記錄
- 搜尋和篩選功能
- CSV 匯出功能
- 記錄詳情查看

**後端 API：** `inspection.list`, `inspection.search`, `inspection.export`

### 4.4 驗證模塊
**檔案：** `client/src/pages/VerificationDashboard.tsx`
- 顯示待驗證的記錄
- 顯示已驗證的記錄
- 驗證歷史

**後端 API：** `verification.getRecords`, `verification.markViewed`, `verification.verify`

### 4.5 統計儀表板模塊
**檔案：** `client/src/pages/Dashboard.tsx`
- 本月檢查統計
- 驗證完成率
- 違規事項分佈
- 按建築物風險等級的統計

**後端 API：** `dashboard.getStats`

## 5. 高科技 UI 設計方向

**色彩方案：**
- 主色：深藍色（#1e3a8a）或深灰色（#1f2937）
- 強調色：青色（#06b6d4）或橙色（#f97316）
- 背景：深色模式（#0f172a）

**字體：**
- 標題：Playfair Display（優雅）
- 正文：Inter（現代）

**設計元素：**
- 最小化設計，強調功能
- 平滑過渡和動畫
- 清晰的信息層級
- 響應式設計

## 6. 後端 API 設計

### 6.1 認證 API
```
POST /api/trpc/auth.login
- Input: { stationCode, password }
- Output: { token, stationId, stationName }

POST /api/trpc/auth.logout
- Output: { success: true }
```

### 6.2 檢查 API
```
GET /api/trpc/inspection.getBuildings
- Output: [{ id, lifipsNumber, address, location, buildingType, riskCategory }]

POST /api/trpc/inspection.submit
- Input: { buildingId, floor, watchNumber, inspectionDateTime, irregularities, referralDepartmentId }
- Output: { id, success: true }

GET /api/trpc/inspection.list
- Output: [{ id, building, floor, watchNumber, inspectionDateTime, irregularities, referralDepartment }]

GET /api/trpc/inspection.search
- Input: { query, buildingId, dateFrom, dateTo }
- Output: [{ ... }]

GET /api/trpc/inspection.export
- Output: CSV 檔案
```

### 6.3 驗證 API
```
GET /api/trpc/verification.getRecords
- Output: { pending: [...], verified: [...] }

POST /api/trpc/verification.markViewed
- Input: { recordId }
- Output: { success: true }

POST /api/trpc/verification.verify
- Input: { recordId, status, notes }
- Output: { success: true }

GET /api/trpc/verification.getHistory
- Output: [{ recordId, verifiedDate, status, notes }]
```

### 6.4 儀表板 API
```
GET /api/trpc/dashboard.getStats
- Output: { totalInspections, verificationRate, irregularitiesByType, ... }
```

## 7. 資料流

### 7.1 檢查提交流程
1. 消防人員登入 → 創建會話
2. 選擇建築物 → 系統查詢建築物詳情
3. 填寫表單 → 客戶端驗證
4. 提交 → 後端驗證並保存
5. 確認 → 系統返回成功訊息

### 7.2 月度驗證分配流程
1. 每月 1 日午夜觸發批處理
2. 系統隨機選擇檢查記錄
3. 為每個消防站分配 5 × 5 = 25 筆驗證任務
4. 創建驗證記錄（狀態：pending）
5. 通知消防站有新的驗證任務

### 7.3 驗證流程
1. 驗證人員查看驗證儀表板
2. 點擊待驗證記錄
3. 查看檢查詳情
4. 與 LIFIPS 系統資料對比
5. 標記為「已查看」或「已驗證」
6. 系統記錄驗證日期和狀態

## 8. 實現優先級

**第一階段（高優先級）：**
1. 消防站認證系統
2. 檢查表單重構（建築物選擇）
3. 簡化表單欄位
4. 高科技 UI 設計

**第二階段（中優先級）：**
1. 月度驗證機制（自動分配）
2. 驗證儀表板
3. 驗證歷史追蹤

**第三階段（低優先級）：**
1. 統計儀表板增強
2. 報告生成
3. 性能優化

## 9. 技術考慮

### 9.1 安全性
- 使用 bcrypt 進行密碼哈希
- 實現會話管理（JWT 或 session cookie）
- 驗證所有輸入
- 實施 CORS 保護

### 9.2 性能
- 建築物清單緩存
- 分頁查詢檢查記錄
- 優化資料庫索引

### 9.3 可擴展性
- 模塊化後端 API
- 支援後台任務（月度驗證分配）
- 支援轉介部門動態新增

## 10. 測試策略

- 單元測試：API 端點、驗證邏輯
- 集成測試：端到端檢查流程
- UI 測試：表單提交、導航
- 安全測試：認證、授權

## 11. 部署計畫

1. 資料庫遷移（已完成）
2. 後端 API 開發
3. 前端 UI 開發
4. 集成測試
5. 部署到生產環境
6. 監控和優化

---

**下一步：** 請審查此設計文件，確認是否需要任何調整或澄清。
