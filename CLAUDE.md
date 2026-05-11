# SmartMeal - AI 智能膳食计划

## 项目概要

手机号登录，告诉 AI 想吃什么，生成一周菜单。自动计算购物清单，扣除冰箱库存。移动端优先，PWA 支持。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: NextAuth v5 (手机号 + bcrypt 密码)
- **AI**: DeepSeek API (JSON Mode) + 智谱 GLM-4V (拍照识菜)
- **状态**: Zustand (带 persist 中间件)
- **部署**: 阿里云 ECS (Ubuntu 22.04, IP: 8.134.146.192)

## 项目结构

```
src/
├── app/
│   ├── (auth)/login, register        # 认证页
│   ├── (main)/plan, recipes, groceries, profile  # 主页面
│   └── api/                          # API 路由
│       ├── auth/[...nextauth], register
│       ├── plan/generate, current, history, cook-deduct, replace-dish, sync-to-cart
│       ├── recipes/ (CRUD, favorite, quick-add, from-url, from-pantry, upload-image)
│       ├── groceries/ (aggregate, toggle, clear-all)
│       ├── pantry/
│       ├── profile/prefs
│       └── user/intolerances
├── components/                       # UI 组件
│   ├── ui/ (button, card, bottom-sheet, dialog, input...)
│   ├── TabBar, RecipeCard, MealPlanCard, GroceryItem
│   ├── GeneratePlanSheet, ManagePlanSheet, QuickActionsSheet
│   └── Providers (Session + UserPrefsLoader)
├── lib/
│   ├── ai.ts          # DeepSeek + 智谱 API 封装
│   ├── auth.ts        # NextAuth 配置
│   ├── prisma.ts      # Prisma 客户端单例
│   ├── shopping-calculator.ts  # 购物清单计算
│   ├── unit-normalizer.ts
│   └── unsplash.ts
└── stores/
    └── userPrefs.ts   # Zustand: cuisines, intolerances, dietary, familySize
```

## 数据库模型

| 模型 | 用途 | 关键字段 |
|------|------|---------|
| User | 用户 | phone(唯一), password(bcrypt), cuisines, intolerances, dietary, familySize |
| Recipe | 食谱(仅手动添加) | title, ingredients(JSON), steps(JSON), imageUrl, tags, source |
| MealPlan | 膳食计划 | userId, weekStart, isCurrent, meals(JSON), cookedRecipes(JSON) |
| PantryItem | 冰箱库存 | userId+name+unit 联合唯一, amount |
| ShoppingItem | 购物清单 | userId+name+unit 联合唯一, amount, checked |

## 关键设计决策

1. **计划菜品不存 Recipe 表**：AI 生成的菜品用 crypto.randomUUID() 作临时 ID，只存 MealPlan.meals JSON 里，不污染菜谱库
2. **收藏 ≠ 菜谱**：用户收藏计划菜品会写入 Recipe 表(source='收藏')，但菜谱列表过滤掉 source='收藏' 的记录
3. **购物清单可重建**：reconcileShoppingList() 先删后建，确保数据一致
4. **AI 生成有兜底**：DeepSeek 失败时回退到 generateDefaultMeals()（24道中餐模板）

## 环境变量

必须的：`DATABASE_URL`, `DEEPSEEK_API_KEY`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
可选的：`ZHIPU_API_KEY`, `UNSPLASH_ACCESS_KEY`
部署注意：`NEXTAUTH_URL` 要写实际访问地址（不能是 localhost），不用域名时加 `AUTH_TRUST_HOST=true`

## 部署流程

**核心原则：本地构建通过再推送，服务器一条命令部署。**

1. 本机改代码 → `git commit` → 本地 `npm run build` 通过 → `git push origin master`
2. 服务器：`cd /root/smartmeal && git pull && npm run build && pm2 restart all`
3. 访问 `http://8.134.146.192:3000`

注意：服务器 `/root/smartmeal` 本身就是 git 仓库，直连 GitHub，不再通过 `/tmp` 中转复制文件。

## 踩过的坑

1. **NextAuth v5 + IP 访问**：部署到阿里云用 IP 直连，必须加 `AUTH_TRUST_HOST=true`，否则 UntrustedHost 错误
2. **SQLite → PostgreSQL 迁移**：删 prisma/migrations 目录后用 `prisma db push` 直接同步 schema
3. **Prisma 连接权限**：PostgreSQL 用户需要 CREATEDB 权限：`ALTER USER smartmeal CREATEDB`
4. **服务器 .env 有两行 DATABASE_URL**：删掉旧的 SQLite 行，只留 PostgreSQL
5. **废弃 cp 部署方式**：以前 `rm -rf src && cp -r /tmp/smartmeal2/src` 翻过车（rm 完 cp 失败导致目录空），服务器目录已改为 git 直连
6. **计划菜品 cooking 扣减失败**：菜品 recipeId 不在 Recipe 表，要传 ingredients 给 API
7. **Next.js 生产环境不提供运行时新增的 public 文件**：用户上传的图片不能通过 `/uploads/xxx` 访问，必须走 API 路由 `/api/uploads/[filename]` 读取磁盘文件
8. **Next.js 15 路由参数是异步的**：`params` 是 `Promise<{ filename: string }>`，必须 `await` 解包

## 为什么老出错的根因 & 改进

**根因：没有本地构建验证。** Next.js `npm run build` 会做类型检查和编译，大多数错误在这一步就能暴露。以前跳过本地构建，直接推到服务器才 build，问题延迟到生产才发现。

**改进后的铁律：**
1. 本地改完 → `npm run build` → 通过才 push（不通过就修，不带到服务器上）
2. 服务器 `/root/smartmeal` 已是 git 仓库，再也不需要 cp 搬文件
3. 部署后打开浏览器逐项验证关键功能

## 当前已知问题

- 没有 HTTPS（裸 HTTP）
- 没有数据库自动备份
- 用户偏好设置缺少入口（菜系、饮食限制、家庭人数无法修改，只有"食物不耐受"可设）
