# ReciteWords 项目规范

## 项目简介
基于 Next.js 14 + Tailwind CSS + Prisma + SQLite 的背单词 Web 应用。

## 技术栈
- Next.js 14 (App Router)
- Tailwind CSS
- Prisma + SQLite
- TypeScript

## 代码提交规范
每次完成功能开发或修改后，自动执行以下步骤提交并推送到 GitHub：

1. `git add .`
2. `git commit -m "描述"` —— commit message 用中文，简洁描述本次改动内容
3. `git push`

commit message 格式参考：
- 新功能：`feat: 新增单词管理页`
- 修复：`fix: 修复翻转动画在 Safari 的兼容问题`
- 优化：`chore: 更新 .gitignore`
