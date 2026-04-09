---
theme: default
background: https://cover.sli.dev
class: text-center
highlighter: shiki
lineNumbers: false
transition: slide-left
title: 部署到 Vercel
---

# 部署环节
## 把本地项目上线到互联网

Next.js 14 × Vercel · 从本地到生产只需几分钟

---
layout: two-cols
---

# 什么是 Vercel？

Vercel 是专为前端和全栈应用设计的**云部署平台**，由 Next.js 的创造者开发。

**核心特点**
- 🚀 与 Next.js 深度集成，零配置开箱即用
- 🌍 全球 CDN 边缘网络，国内访问也较快
- 🔄 Push 代码自动触发部署（CI/CD）
- 🔒 自动 HTTPS，无需手动配置证书
- 📊 内置日志、性能监控、函数日志

::right::

<div class="pl-8 pt-4">

**适合什么项目？**

| 类型 | 支持 |
|------|------|
| Next.js | ✅ 原生支持 |
| React / Vue | ✅ 静态托管 |
| API Routes | ✅ Serverless 函数 |
| 数据库 | ⚠️ 需外部服务 |

**免费套餐包含**
- 每月 100GB 流量
- 无限个人项目
- 自动预览部署

</div>

---
layout: center
---

# 我们项目的部署架构

```
用户浏览器
    │
    ▼
Vercel 边缘网络（全球 CDN）
    │
    ├─ 静态资源（HTML/CSS/JS）→ 直接从 CDN 返回
    │
    └─ API Routes（/api/*）→ Serverless 函数执行
              │
              ▼
         ⚠️  SQLite 问题
         本地文件数据库无法在 Serverless 环境持久化
              │
              ▼
         替换为 Vercel Postgres（云数据库）
```

<div class="mt-4 text-sm text-gray-500">
Serverless 函数每次调用是独立容器，本地文件不会保留
</div>

---

# 部署前的改造点

SQLite 在 Serverless 环境中无法持久化，需要切换到云数据库。

| 改造项 | 当前（本地） | 部署后（云端） |
|--------|------------|--------------|
| 数据库 | SQLite `dev.db` | Vercel Postgres |
| 连接方式 | 本地文件路径 | 环境变量 `POSTGRES_URL` |
| Schema | 无需改动 | 无需改动（Prisma 兼容） |
| 迁移命令 | `prisma db push` | `prisma db push`（云端执行） |
| 代码改动 | — | 仅修改 `schema.prisma` provider |

**改动量极小，只需两步：**

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"   // 从 sqlite 改为 postgresql
  url      = env("POSTGRES_URL")
}
```

---

# 部署流程（5 步上线）

<div class="grid grid-cols-5 gap-2 mt-6 text-center text-sm">

<div class="bg-indigo-50 rounded-2xl p-3">
  <div class="text-2xl mb-2">1️⃣</div>
  <div class="font-semibold text-indigo-700">创建<br/>Postgres</div>
  <div class="text-xs text-gray-500 mt-1">Vercel 控制台<br/>一键创建数据库</div>
</div>

<div class="bg-indigo-50 rounded-2xl p-3">
  <div class="text-2xl mb-2">2️⃣</div>
  <div class="font-semibold text-indigo-700">修改<br/>Schema</div>
  <div class="text-xs text-gray-500 mt-1">provider 改为<br/>postgresql</div>
</div>

<div class="bg-indigo-50 rounded-2xl p-3">
  <div class="text-2xl mb-2">3️⃣</div>
  <div class="font-semibold text-indigo-700">导入<br/>项目</div>
  <div class="text-xs text-gray-500 mt-1">Vercel 连接<br/>GitHub 仓库</div>
</div>

<div class="bg-indigo-50 rounded-2xl p-3">
  <div class="text-2xl mb-2">4️⃣</div>
  <div class="font-semibold text-indigo-700">配置<br/>环境变量</div>
  <div class="text-xs text-gray-500 mt-1">粘贴数据库<br/>连接字符串</div>
</div>

<div class="bg-indigo-50 rounded-2xl p-3">
  <div class="text-2xl mb-2">5️⃣</div>
  <div class="font-semibold text-indigo-700">Push<br/>上线</div>
  <div class="text-xs text-gray-500 mt-1">git push 触发<br/>自动部署</div>
</div>

</div>

<div class="mt-8 bg-green-50 rounded-2xl p-4 text-sm text-green-700">
  ✅ 部署完成后，每次 <code>git push</code> 都会自动触发重新部署，无需手动操作
</div>

---
layout: end
---

# 准备好了，开始部署 →
