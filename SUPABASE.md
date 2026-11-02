# 岸标 × Supabase 部署说明

当前版本的后端已经替换为 Supabase，不再需要运行 `server.py`。  
项目地址：`https://qdphpjcxluayglvzvafp.supabase.co`  
存储桶：`images`

## 1. 执行数据库初始化

打开 Supabase Dashboard → SQL Editor，把 [supabase-setup.sql](<supabase-setup.sql>) 整段执行。

它会创建：

- `profiles`：用户资料，和 `auth.users` 一对一
- `sites`：站点与公开快照，`owner_id` 绑定发布者账号；数据库触发器限制每个账号最多 5 个
- `comments`：评论，`user_id` 绑定评论账号
- `visits`：访客记录，主人可读
- RLS 权限
- `images` Storage bucket（公开读取、登录用户上传）
- Realtime 发布（`sites`、`comments`）

> 如果你之前已经执行过旧版 SQL，需要重新执行一次当前 [supabase-setup.sql](<supabase-setup.sql>)，以安装“每个账号最多 5 个网页”的触发器。前端本地也会限制 5 个。

## 2. 开启邮箱确认

Supabase Dashboard → Authentication → Providers → Email：

- 开启 Email provider
- 开启 **Confirm email**
- 按需配置 SMTP（免费的 Supabase 邮件服务有发送限制，正式使用建议自己的 SMTP）

注册后不会立刻登录，用户需要点击确认邮件中的链接。确认链接会回到当前静态站点。

## 3. 配置 Auth URL

Supabase Dashboard → Authentication → URL Configuration：

- **Site URL**：你的静态站点地址，例如 `https://anbiao.example.com/`
- **Redirect URLs**：把同一个地址加入允许列表

如果使用 Cloudflare Pages/Netlify 的预览地址，也要把预览域名加入 Redirect URLs。

## 4. 托管静态网页

Supabase 不是静态网站托管服务。把项目根目录的：

- `index.html`
- `assets/`
- `SUPABASE.md`（可选）
- `supabase-setup.sql`（可选，仅用于初始化）

部署到 Cloudflare Pages、Netlify、Vercel 或 GitHub Pages。

所有用户访问同一个静态站点地址，数据通过 Supabase 共享，所以不同局域网的用户也能看到彼此的主页和最新公示。

## 5. 数据与账号

- 账号：Supabase Auth
- 网页：`sites`，发布者 `owner_id`
- 评论：`comments`，评论者 `user_id`
- 访客：`visits`，主人可读
- 媒体：Storage bucket `images`
- 最新发布：`sites` 更新后，前端通过 Realtime 订阅刷新；同时保留 15 秒轮询兜底

### 关于旧数据

本地浏览器中的草稿、图片、评论和下载设置仍在浏览器本地；重新登录并在 Supabase 中公示后，会生成新的 Supabase 站点记录。

旧 `server.py` 的用户密码是 PBKDF2 哈希，且旧用户没有邮箱字段，不能直接迁移到 Supabase Auth。要让旧用户继续使用，需要重新注册（或由管理员在 Supabase 中创建用户）。旧评论/访客记录如果需要保留，需要先从 `server_data/` 导出，再按 Supabase 表结构导入；仅靠当前仓库无法恢复已经删除的服务器数据。

## 6. 安全说明

- 浏览器中使用的是 Supabase anon/publishable key，这是设计上公开的 key；真正的权限由 RLS 控制。
- 不要把 service_role key 放进前端。
- `images` bucket 设为 public read；所有登录用户可上传。若需要严格隔离，应改为私有 bucket + signed URL。
- 当前 RLS 允许登录用户上传媒体；生产环境建议按 `auth.uid()` 限制 Storage 路径。
- 邮箱确认、密码重置、限流和 SMTP 需要在 Supabase Dashboard 中配置。
