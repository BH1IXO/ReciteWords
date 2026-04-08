---
theme: default
background: https://cover.sli.dev
class: text-center
highlighter: shiki
lineNumbers: false
transition: slide-left
title: 背单词 App · 三轮迭代演示
---

# 背单词 App · 三轮迭代演示

Next.js 14 + Tailwind CSS + Prisma · 从 MVP 到完整产品

---
layout: two-cols
---

# 当前 MVP 状态

**已实现**
- 翻转卡片展示单词
- 已掌握 / 下一个 按钮
- 今日进度条
- 数据持久化到 SQLite

::right::

**三个明显痛点**

❶ 单词无法自定义添加，靠 seed 硬编码

❷ 没有记忆曲线，每天全量重复复习

❸ 无学习历史，不知道哪里薄弱

---
layout: center
---

# 迭代路线图

```
MVP
 │
 ▼
第一轮：体验打磨  ── 让用户"用得爽"
 │
 ▼
第二轮：学习系统  ── 让 App"有记忆"
 │
 ▼
第三轮：数据洞察  ── 让用户"看见成长"
```

---

# 第一轮：体验打磨

**目标：让用户用得爽**

| 功能 | 实现要点 |
|------|---------|
| 单词管理页 `/manage` | 增删改单词，表单验证 |
| 键盘快捷键 | 空格翻转 · `←` `→` 切换 · `Enter` 已掌握 |
| 骨架屏加载态 | 替换"加载中..."纯文字 |
| 空状态引导 | 无单词时直接引导到添加页 |

**代码变动**
- 新增 `src/app/manage/page.tsx`
- 扩展 API：PUT / DELETE `/api/words/[id]`
- 新增 `src/hooks/useKeyboard.ts`
- 新增 `src/components/Skeleton.tsx`

---

# 第一轮：效果对比

<div class="grid grid-cols-2 gap-8 mt-4">
<div class="border rounded-xl p-4 bg-gray-50">

**迭代前**
- 空白 loading 文字
- 无单词时白屏
- 只能用鼠标点击
- 无法添加/删除单词

</div>
<div class="border rounded-xl p-4 bg-indigo-50">

**迭代后**
- 骨架屏占位动画
- 空状态引导按钮
- 键盘全程可操作
- 完整的单词管理页

</div>
</div>

---

# 第二轮：学习系统

**目标：让 App 有记忆**

| 功能 | 实现要点 |
|------|---------|
| 艾宾浩斯复习队列 | 掌握后按 1/3/7/14 天自动加入复习 |
| 学习记录表 | 每次操作写入 `StudyLog` |
| 复习 / 新学 Tab | 首页 Tab 切换两种模式 |
| 掌握程度分级 | 生疏→熟悉→掌握，影响复习间隔 |

**Schema 变动**
```prisma
model StudyLog {
  id        Int      @id @default(autoincrement())
  wordId    Int
  action    String   // "flip" | "mastered" | "skip"
  createdAt DateTime @default(now())
}
// Word 新增字段：reviewAt DateTime? · level Int @default(0)
```

---
layout: center
---

# 第二轮：数据流

```
用户点击"已掌握"
    │
    ├─ 写入 StudyLog（时间戳 + action = "mastered"）
    │
    ├─ Word.level += 1
    │
    └─ Word.reviewAt = today + INTERVALS[level]
              │
              INTERVALS = [1, 3, 7, 14, 30] 天
```

---

# 第三轮：数据洞察

**目标：让用户看见成长**

| 功能 | 实现要点 |
|------|---------|
| 统计页 `/stats` | 连续学习天数 · 总掌握数 · 本周趋势折线图 |
| 热力图日历 | 仿 GitHub Contribution 风格，纯 SVG 实现 |
| 单词详情页 | 查看某个词的完整学习轨迹 |
| CSV 导入/导出 | 批量导入单词，导出学习记录 |

**技术亮点**
- 纯 Prisma 聚合查询，无额外图表库
- SVG 热力图零依赖
- CSV 解析用原生 API

---

# 三轮对比总结

| | MVP | 第一轮 | 第二轮 | 第三轮 |
|---|---|---|---|---|
| **核心价值** | 能用 | 好用 | 有效 | 可信 |
| **新增文件** | — | 4 | 4 | 4 |
| **Schema 变更** | — | 无 | 中 | 小 |
| **用户感知** | 基础可用 | 流畅 | 科学记忆 | 成就感 |
| **亮点技术** | App Router | Custom Hook | 间隔算法 | SVG 热力图 |

---
layout: center
---

# 未来方向

🔐 **认证系统** — 当前单用户，后续支持多账号

📖 **词典 API** — 自动获取音标、例句、词根

📱 **PWA** — 离线使用 + 手机桌面安装

---
layout: end
---

# 开始迭代
