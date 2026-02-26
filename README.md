# Nova 项目系统

## 功能
- 日历背景的多项目甘特图视图
- 项目进度颜色标记
- 每日工作内容、心情、日常打卡
- 多用户登录
- SQLite 数据库存储

## 开始使用
1. 安装依赖
   - `npm install`
2. 配置环境变量
   - 复制 `.env.example` 为 `.env`，修改 `NEXTAUTH_SECRET`
3. 初始化数据库
   - `npm run prisma:migrate -- --name init`
4. 启动开发
   - `npm run dev`

## 目录
- `src/app`：页面与 API 路由
- `src/components`：前端组件
- `prisma/schema.prisma`：数据库模型
