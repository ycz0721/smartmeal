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

## 产品功能清单

### 🔐 认证系统
| 功能 | 路径 | 说明 |
|------|------|------|
| 手机号注册 | `/register` | 中国手机号(1[3-9]\d{9})，bcrypt 加密密码 |
| 手机号登录 | `/login` | NextAuth v5 JWT Session |
| 退出登录 | 设置页 | signOut → `/login` |
| 路由保护 | 全局 | 未登录自动跳 `/login`，已登录跳 `/plan` |

### 📅 膳食计划 (核心功能)
| 功能 | 说明 |
|------|------|
| AI 生成周计划 | 输入想吃什么 → DeepSeek 生成 1-7 天菜单(早中晚)，支持菜系/饮食限制/不耐受/家庭人数/荤素搭配 |
| 每日菜品展示 | 切换"第1天"~"第7天"，按早中晚显示菜品卡片 |
| 菜品详情弹窗 | 点击菜品弹出 BottomSheet：食材清单 + 烹饪步骤 |
| 收藏菜品 | 点心形图标，计划菜品保存到个人菜谱(source='收藏') |
| 烹饪扣减 | 点"烹饪"按钮，自动从冰箱库存扣除对应食材 |
| 替换菜品 | 管理计划中替换某道菜，跳转菜谱库选择 |
| 同步购物车 | 根据计划+冰箱重新计算购物清单 |
| 历史计划 | 查看所有历史计划，展开查看详情 |
| AI 兜底 | AI 失败时回退到 24 道中餐模板 |
| 去重策略 | 参考近 3 期计划避免重复菜品 |

### 🍳 菜谱管理
| 功能 | 路径/API | 说明 |
|------|-----------|------|
| 菜谱浏览 | `/recipes` | 卡片网格 + 标签筛选(快手菜/素食/肉类/海鲜/汤羹/适合儿童) |
| 菜谱详情 | `/recipes/[id]` | 大图 + 食材清单(可展开) + 编号烹饪步骤 |
| 快速添加(AI) | `POST /api/recipes/quick-add` | 输入菜名 → DeepSeek 自动生成完整食谱 |
| 拍照识菜(AI) | `POST /api/recipes/upload-image` | 拍照/选图 → 智谱 GLM-4V 视觉识别 → 自动生成食谱 |
| URL 导入 | `POST /api/recipes/from-url` | 粘贴网址 → AI 抓取解析生成食谱 |
| 冰箱联想 | `POST /api/recipes/from-pantry` | AI 根据冰箱现有食材推荐能做的菜 |
| 收藏切换 | `PATCH /api/recipes/[id]/favorite` | 收藏/取消收藏 |
| 编辑菜谱 | `PATCH /api/recipes/[id]` | 修改标题/描述/食材/步骤/标签 |
| 标签分类 | `GET /api/recipes/tags` | 添加菜谱后可补充标签 |

### 🛒 购物清单 + 冰箱
| 功能 | 说明 |
|------|------|
| 智能购物清单 | 根据当前计划所需食材 - 冰箱库存 = 只需购买的部分 |
| 勾选采购 | 勾选清单项 → 自动添加食材到冰箱 |
| 取消勾选 | 取消勾选 → 从冰箱扣除对应数量 |
| 一键清空 | "全部买完"→ 批量移入冰箱 |
| 冰箱管理 | 手动添加/删除食材(名称+数量+单位) |
| 单位换算 | 支持 g/kg/斤/ml/l/杯/勺/茶勺/个/根/片/块/瓣 自动换算合并 |

### 👤 用户中心
| 功能 | 说明 |
|------|------|
| 个人信息 | 头像/手机号(脱敏显示138****5678)/收藏菜谱数 |
| 食物不耐受 | 添加/删除不吃的食材(即时生效，AI 生成计划时自动排除) |
| 用户偏好 | 菜系/饮食限制/家庭人数(通过 API 存取，UI 暂缺设置入口) |
| 同步加载 | 登录后自动从服务器拉取偏好到本地 Zustand |

### 🤖 AI 能力
| 模型 | 用途 |
|------|------|
| DeepSeek V4-Flash | 生成周计划、菜名→食谱、URL→食谱、冰箱→食谱 |
| 智谱 GLM-4V-Flash | 拍照识菜(视觉识别)、图片压缩用 sharp(1024px) |
| 超时 | 30 秒超时保护 |
| 降级 | AI 失败返回本地模板兜底 |

### 📱 UI 组件
| 组件 | 用途 |
|------|------|
| TabBar | 底部导航(计划/食谱/购物/我的)，中间浮起 + 号 |
| BottomSheet | 滑动弹出面板(生成计划/管理计划/快捷操作) |
| RecipeCard | 食谱卡片(图片/标题/描述/时间/份数/标签) |
| MealPlanCard | 计划菜品卡片(可收藏/可点击查看详情) |
| GroceryItem | 购物清单项(复选框/名称/数量) |
| LoadingSkeleton | 骨架屏(grid/list/recipe 三种) |
| EmptyState | 空状态卡片(图标+标题+描述+操作按钮) |

### 🔗 全部 API 路由 (25 个)
| 模块 | 端点 | 方法 |
|------|------|------|
| Auth | `/api/auth/[...nextauth]` | GET/POST |
| Auth | `/api/auth/register` | POST |
| Plan | `/api/plan/generate` | POST |
| Plan | `/api/plan/current` | GET |
| Plan | `/api/plan/history` | GET |
| Plan | `/api/plan/cook-deduct` | POST |
| Plan | `/api/plan/replace-dish` | POST |
| Plan | `/api/plan/sync-to-cart` | POST |
| Recipes | `/api/recipes` | GET |
| Recipes | `/api/recipes/[id]` | GET/PATCH |
| Recipes | `/api/recipes/[id]/favorite` | PATCH |
| Recipes | `/api/recipes/quick-add` | POST |
| Recipes | `/api/recipes/upload-image` | POST |
| Recipes | `/api/recipes/from-url` | POST |
| Recipes | `/api/recipes/from-pantry` | POST |
| Recipes | `/api/recipes/favorite-from-plan` | POST |
| Recipes | `/api/recipes/tags` | GET |
| Groceries | `/api/groceries/aggregate` | GET |
| Groceries | `/api/groceries` | POST/DELETE |
| Groceries | `/api/groceries/[id]/toggle` | POST |
| Groceries | `/api/groceries/clear-all` | POST |
| Pantry | `/api/pantry` | GET/POST |
| Pantry | `/api/pantry/[id]` | DELETE |
| Prefs | `/api/profile/prefs` | GET/POST |
| Prefs | `/api/user/intolerances` | GET/POST/DELETE |
| Uploads | `/api/uploads/[filename]` | GET |

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
2. 服务器：`cd /root/smartmeal && git pull && npx prisma db push && npm run build && npx pm2 restart all`
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
9. **pm2 命令不在全局 PATH**：服务器上必须用 `npx pm2 restart all`，不能用 `pm2 restart all`（会报 Command not found）
10. **服务器 git pull 可能分叉**：如果服务器直接 commit 过，用 `git fetch origin && git reset --hard origin/master` 强制同步

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
- AI 生成的下周计划菜品没有真实菜品图片（计划菜品不存 Recipe 表，无法关联图片）
