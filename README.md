# // DAILY_TASK.SYS

賽博龐克風格的單日時程規劃器，以 Vue 3 + Vite 實作。

---

## 功能

| 功能 | 操作方式 |
|------|----------|
| 新增任務 | 點擊空白時間格 → 輸入名稱 → 按 Enter |
| 完成任務 | 點擊左側方框 `[ ]` |
| 編輯任務 | 點擊 `ED` 按鈕 → 修改 → 按 Enter 或 `OK` |
| 刪除任務 | 點擊 `RM` 按鈕 |
| 拖拉排序 | 抓住 `⠿` 把手上下拖動 |
| 延長時數 | 滑鼠移到任務下緣 → 出現虛線 → 向下拖動 |
| 進度追蹤 | 頂部進度條即時顯示完成百分比 |

---

## 專案結構

```
dayMission/
├── index.html                    # Vite 入口 HTML
├── package.json
├── vite.config.js
│
└── src/
    ├── main.js                   # createApp + mount
    ├── style.css                 # 所有 CSS 樣式與 CSS 變數
    ├── constants.js              # HOURS、SLOT_H 常數
    ├── App.vue                   # 根元件，管理狀態與 SortableJS
    │
    ├── composables/
    │   ├── useSlots.js           # 時間格狀態、任務 CRUD、computed
    │   └── useResize.js          # 拖拉延長 duration 邏輯
    │
    └── components/
        ├── AppHeader.vue         # 頂部標題、日期、進度條
        └── ScheduleRow.vue       # 單列：時間格 + 任務格 + 拉伸把手
```

---

## 快速開始

### 前置需求

- [Node.js](https://nodejs.org/) v18 以上
- npm（隨 Node.js 附帶）

### 安裝與啟動

```bash
# 1. 進入專案目錄
cd dayMission

# 2. 安裝依賴套件
npm install

# 3. 啟動開發伺服器
npm run dev
```

瀏覽器開啟 `http://localhost:5173` 即可看到應用程式。

---

## 可用指令

```bash
npm run dev      # 啟動開發伺服器（熱更新）
npm run build    # 打包至 dist/ 資料夾
npm run preview  # 預覽 build 結果
```

---

## 架構說明

### 資料流

```
App.vue
 ├── useSlots()   →  slots（17 個時間格）、visibleRows、任務 CRUD
 ├── useResize()  →  startResize（拉伸 duration）
 └── SortableJS   →  onEnd 事件，重新排列 slots 並更新 startHour
       │
       ├── <AppHeader>       接收 today / doneCount / taskCount / donePercent
       └── <ScheduleRow> ×N  接收 row / editingId / editValue，向上 emit 事件
```

### 核心：visibleRows computed

`slots` 陣列維持完整 17 格的順序，`visibleRows` 是 computed，會自動跳過被 `duration > 1` 的任務「佔用」的格子，確保時間欄與任務欄永遠對齊，且合併後下方格子真的消失。

```js
// useSlots.js
const visibleRows = computed(() => {
  const result = []
  let skipCount = 0
  for (let i = 0; i < slots.value.length; i++) {
    const slot = slots.value[i]
    if (skipCount > 0) { skipCount--; continue }
    const dur = slot.task?.duration ?? 1
    result.push({ ...slot, displayDuration: dur })
    if (dur > 1) skipCount = dur - 1
  }
  return result
})
```

### SortableJS 索引對應

SortableJS 的 `oldIndex` / `newIndex` 是對 `visibleRows` 的索引（跳過被合併的格子），需要轉回 `slots` 陣列的實際位置。`onEnd` 在 `App.vue` 中處理這個轉換，拖動完後重新指派每格的 `startHour`。

---

## 依賴套件

| 套件 | 用途 |
|------|------|
| `vue` | UI 框架 |
| `sortablejs` | 拖拉排序 |
| `vite` | 建置工具 |
| `@vitejs/plugin-vue` | Vite 的 Vue 支援 |

---

## 自訂時間範圍

編輯 `src/constants.js`：

```js
// 目前：06:00 ~ 22:00（17 格）
export const HOURS = Array.from({ length: 17 }, (_, i) => i + 6)

// 範例：改成 08:00 ~ 20:00（12 格）
export const HOURS = Array.from({ length: 12 }, (_, i) => i + 8)
```

---

## 原始版本

專案原為單一 `index,html` 檔案（Vue 3 CDN + SortableJS CDN）。
此版本改為 Vue+Vite 架構，功能與視覺完全相同，差異僅在於：

- CSS 移至 `src/style.css`（從 Google Fonts CDN 改為 CSS `@import`）
- 邏輯拆分為 composable + component
- 依賴改由 npm 管理，支援熱更新與 tree-shaking 打包
