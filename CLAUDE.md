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

1. 本机改代码 → `git commit` → `git push origin master`
2. 服务器：`cd /tmp/smartmeal2 && git pull`
3. 复制源码：`rm -rf /root/smartmeal/src && cp -r /tmp/smartmeal2/src /root/smartmeal/src`
4. 构建：`cd /root/smartmeal && npm run build`
5. 重启：`pm2 restart all`
6. 访问 `http://8.134.146.192:3000`

## 踩过的坑

1. **NextAuth v5 + IP 访问**：部署到阿里云用 IP 直连，必须加 `AUTH_TRUST_HOST=true`，否则 UntrustedHost 错误
2. **SQLite → PostgreSQL 迁移**：删 prisma/migrations 目录后重新 `prisma migrate dev`
3. **Prisma 连接权限**：PostgreSQL 用户需要 CREATEDB 权限：`ALTER USER smartmeal CREATEDB`
4. **服务器 .env 有两行 DATABASE_URL**：删掉旧的 SQLite 行，只留 PostgreSQL
5. **cp 命令用相对路径会翻车**：rm 完目录后相对路径找不到源，始终用绝对路径
6. **计划菜品 cooking 扣减失败**：菜品 recipeId 不在 Recipe 表，要传 ingredients 给 API

## 当前已知问题

- 没有 HTTPS（裸 HTTP）
- 没有数据库自动备份
- 用户偏好设置缺少入口（菜系、饮食限制、家庭人数无法修改，只有"食物不耐受"可设）
- 食谱无真实图片（仅显示首字占位符）
