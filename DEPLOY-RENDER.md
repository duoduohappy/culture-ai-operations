# 集团管理 AI的 Render 部署

本项目已准备 render.yaml，并通过 Render 官方 JSON Schema 结构校验；尚未在 Render 上部署。配置按“本项目单独一个 Git 仓库、仓库根目录为当前目录”编写。两个项目各自导入各自的 Blueprint，不共用数据库或部署身份。

## 服务配置

运行时 Node.js 24.21.0，构建命令 npm ci --omit=dev --ignore-scripts，启动命令 npm start，健康检查 /api/health。绑定 HOST=0.0.0.0，并使用 Render 注入的 PORT。

SQLite 和集成日志写入 DATA_DIR=/var/data。Blueprint 使用 starter 服务和 1 GB 持久磁盘；这是付费磁盘方案，不是免费临时文件系统方案。当前没有替你创建任何 Render 服务。使用免费服务会丢失重启或重新部署后的本地文件，因此不能用于这版持久化验收。

Render 官方说明：https://render.com/docs/disks 和 https://render.com/docs/web-services 。

## 模型配置

在 Render 设置可从云端访问的 AI_BASE_URL、AI_MODEL、AI_API_KEY。AI_PROVIDER 默认 compatible，接口需支持 /chat/completions；管理项目的资料分析使用 JSON Schema 结构化输出，需选用支持该格式的服务。

本机 127.0.0.1:8790 不能直接被 Render 访问。当前源码包不在 Render 上启动 Windows llama.cpp 或下载模型；若要自托管模型，应另外准备可访问的模型服务。未配置时页面可以展示业务流程，但 AI 请求会明确失败，不会返回伪造成功结果。

## 部署步骤

1. 将本项目源码推送到你自己的独立 Git 仓库，保留根目录 render.yaml。
2. 在 Render 导入该仓库的 Blueprint，检查服务与磁盘方案后由你确认创建。
3. 设置模型地址、模型名及密钥，等待部署成功。
4. 访问 /api/health，再按本项目演示步骤验证数据和权限。
5. 重启服务，确认已创建的业务或演出记录仍在。

PUBLIC_HOST 可用于自定义域名；未设置时采用 Render 提供的外部主机名。同源校验不接受任意网页来源。

## 角色账号

DEMO_PASSWORD 由 Blueprint 自动生成，用于首次初始化五个角色账号。部署后在 Render 环境变量页读取并用于演示。账号名不变。密码哈希保存在 SQLite；修改环境变量不会自动更改已初始化账号的密码，应通过维护迁移处理，不能把改变量当成完成密码轮换。

首次部署从 data/demo.json 导入基准样本。后续重启不会重新导入或清空业务。不要把本机 business.sqlite 上传覆盖线上磁盘。

## 运行边界

该方案为单实例面试作品。SQLite 持久磁盘不用于多实例共享写入。尚未接入 SSO、组织隔离、密码找回和正式审批授权系统。

## 备份

可在具备服务端维护权限的终端执行 npm run backup，使用 SQLite 在线备份接口创建一致快照。备份与数据库同在持久磁盘，需另外保留离盘备份；复制运行中的主数据库文件而忽略 WAL 不是可靠备份方式。
