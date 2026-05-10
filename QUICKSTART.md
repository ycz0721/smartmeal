# SmartMeal 快速启动指南

## 🚀 3步本地启动

### 步骤1：配置环境变量
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入以下信息：
```env
# PostgreSQL 数据库连接（本地开发可用 SQLite）
DATABASE_URL="postgresql://user:password@localhost:5432/smartmeal"

# DeepSeek API 密钥（必填）
DEEPSEEK_API_KEY="sk-xxxxxx"

# NextAuth 密钥（运行下面命令生成）
NEXTAUTH_SECRET="运行 openssl rand -base64 32 生成"

# 本地开发地址
NEXTAUTH_URL="http://localhost:3000"
```

生成 NEXTAUTH_SECRET：
```bash
openssl rand -base64 32
```

### 步骤2：安装依赖并初始化数据库
```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
```

### 步骤3：启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

**测试账号**：
- 手机号：13800138000
- 密码：password123

---

## ☁️ Zeabur 部署指南（5步）

### 步骤1：推送代码到 Git
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 步骤2：登录 Zeabur 并创建项目
1. 访问 https://zeabur.com
2. 点击 "New Project"
3. 选择 "Add Service" → "Git"
4. 选择你的 GitHub/GitLab 仓库
5. Zeabur 自动识别 Next.js 框架

### 步骤3：添加 PostgreSQL 数据库
1. 在同一 Project 中点击 "Add Service"
2. 选择 "Prebuilt" → 搜索 "PostgreSQL"
3. Zeabur 自动创建数据库并注入 `DATABASE_URL` 环境变量

### 步骤4：配置环境变量
进入 Next.js Service → Variables，添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| DEEPSEEK_API_KEY | sk-xxxxxx | DeepSeek API 密钥 |
| NEXTAUTH_SECRET | 随机字符串 | 运行 `openssl rand -base64 32` 生成 |
| NEXTAUTH_URL | https://你的域名.zeabur.app | 部署后的完整 URL |

### 步骤5：初始化数据并访问
1. Zeabur 自动触发构建（执行 `prisma generate && prisma migrate deploy && next build`）
2. 构建成功后，进入 Service → Console（或 Terminal）
3. 执行种子数据导入：
   ```bash
   npx prisma db seed
   ```
4. 访问 https://你的项目.zeabur.app

**可选**：绑定自定义域名
- Service → Networking → Add Domain

---

## 💡 切换到 SQLite（仅本地开发）

如果不想安装 PostgreSQL，可以切换到 SQLite：

1. 修改 `prisma/schema.prisma`：
```prisma
datasource db {
  provider = "sqlite"  // 改为 sqlite
  url      = env("DATABASE_URL")
}
```

2. 修改 `.env`：
```env
DATABASE_URL="file:./dev.db"
```

3. 重新初始化：
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

---

## 🎯 功能验收清单

- [ ] 用手机号注册新账号
- [ ] 登录后设置饮食偏好
- [ ] 点击"生成下周计划"，30秒内看到7天21餐
- [ ] 点击食谱查看详情，可收藏
- [ ] 进入购物清单，看到自动聚合的食材
- [ ] 添加食谱（快速添加/URL解析）
- [ ] 移动端适配完美
- [ ] UI 精致流畅

---

## 📞 获取 DeepSeek API 密钥

1. 访问 https://platform.deepseek.com
2. 注册/登录账号
3. 进入 API Keys 页面
4. 创建新密钥
5. 复制 `sk-` 开头的密钥到 `.env` 文件

---

## 🐛 常见问题

**Q: 数据库连接失败？**
A: 检查 PostgreSQL 是否启动，或切换到 SQLite

**Q: AI 生成失败？**
A: 检查 DEEPSEEK_API_KEY 是否正确，账户是否有余额

**Q: 登录失败？**
A: 确保 NEXTAUTH_SECRET 已设置，手机号格式正确（11位，1开头）

**Q: Zeabur 构建失败？**
A: 检查环境变量是否完整，DATABASE_URL 是否自动注入

---

## 📚 更多文档

详细文档请查看 [README.md](./README.md)
