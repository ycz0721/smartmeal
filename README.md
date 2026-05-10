# SmartMeal - 智能膳食计划应用

基于 Next.js 15 + TypeScript + Prisma + DeepSeek AI 的个性化膳食计划应用。

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Prisma ORM
- **数据库**: PostgreSQL
- **认证**: NextAuth.js v5 (手机号+密码)
- **AI**: DeepSeek API (通过 OpenAI SDK)
- **状态管理**: Zustand
- **UI 组件**: shadcn/ui

## 功能特性

- 用户注册/登录 (手机号认证)
- AI 生成个性化膳食计划
- 食谱管理 (收藏、搜索、分类)
- 购物清单自动聚合
- 食材单位归一化
- PWA 支持

## 本地开发

### 环境要求

- Node.js 18+
- PostgreSQL 14+
- pnpm/npm/yarn

### 安装步骤

1. 克隆项目
```bash
git clone <your-repo-url>
cd smartmeal
```

2. 安装依赖
```bash
pnpm install
```

3. 配置环境变量
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
DATABASE_URL="postgresql://user:password@localhost:5432/smartmeal"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
DEEPSEEK_API_KEY="your-deepseek-api-key"
```

4. 初始化数据库
```bash
pnpm prisma migrate dev
pnpm db:seed
```

5. 启动开发服务器
```bash
pnpm dev
```

访问 http://localhost:3000

## Zeabur 部署

### 一键部署

1. Fork 本项目到你的 GitHub
2. 访问 [Zeabur](https://zeabur.com)
3. 创建新项目，选择 GitHub 仓库
4. 添加 PostgreSQL 服务
5. 配置环境变量：
   - `NEXTAUTH_SECRET`: 随机字符串
   - `NEXTAUTH_URL`: 你的域名
   - `DEEPSEEK_API_KEY`: DeepSeek API 密钥
6. 部署完成

### 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| DATABASE_URL | PostgreSQL 连接字符串 | 自动注入 |
| NEXTAUTH_SECRET | NextAuth 密钥 | 随机生成 |
| NEXTAUTH_URL | 应用 URL | https://your-app.zeabur.app |
| DEEPSEEK_API_KEY | DeepSeek API 密钥 | sk-xxx |

## 项目结构

```
smartmeal/
├── prisma/
│   ├── schema.prisma      # 数据库模型
│   └── seed.ts            # 种子数据
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # 认证页面
│   │   ├── (main)/        # 主应用页面
│   │   └── api/           # API 路由
│   ├── components/        # React 组件
│   ├── lib/               # 工具函数
│   ├── stores/            # Zustand 状态
│   └── types/             # TypeScript 类型
└── public/                # 静态资源
```

## API 文档

### 认证

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/[...nextauth]` - NextAuth 认证

### 膳食计划

- `POST /api/plan/generate` - 生成膳食计划
- `GET /api/plan/current` - 获取当前计划

### 食谱

- `POST /api/recipes/quick-add` - 快速添加食谱
- `POST /api/recipes/from-url` - 从 URL 解析食谱
- `POST /api/recipes/from-pantry` - 根据 Pantry 生成食谱

### 购物清单

- `GET /api/groceries/aggregate` - 聚合购物清单

## 许可证

MIT
