# 集团管理 AI的 Render 部署

本项目已准备 render.yaml，并通过 Render 官方 JSON Schema 结构校验；尚未在 Render 上部署。配置按“本项目单独一个 Git 仓库、仓库根目录为当前目录”编写。两个项目各自导入各自的 Blueprint，不共用数据库或部署身份。

## 服务配置

运行时 Node.js 24.21.0，构建命令 npm ci --omit=dev --ignore-scripts，启动命令 npm start，健康检查 /api/health。绑定 HOST=0.0.0.0，并使用 Render 注入的 PORT。

默认 Blueprint 已切换为免费 Web Service，服务名 culture-ai-operations，plan=free，不挂载磁盘。SQLite 和集成日志写入 DATA_DIR=/tmp/culture-ai-operations。该版本用于面试展示；休眠唤醒、服务重启或重新部署后，新增单据、资料、会话、节目版本和执行记录可能丢失。管理端会重新载入完整测试数据，演出端会恢复默认样板。页面会持续显示临时数据提示。本机运行的数据库持久化能力保持不变。

Render 官方说明：https://render.com/docs/free 。免费服务闲置约十五分钟可能休眠，首次唤醒可能等待约一分钟。免费实例时数和用量限额由同一 workspace 共享；两个项目并非各自独享额度。

## 模型配置

默认模型变量为空，创建 Blueprint 时不强制填写模型密钥。你可以先免费部署并体验业务和控制界面，再在 Render 设置可从云端访问的 AI_BASE_URL、AI_MODEL、AI_API_KEY。Render 免费托管不代表模型供应商的推理调用免费。AI_PROVIDER 默认 compatible，接口需支持 /chat/completions；管理项目的资料分析使用 JSON Schema 结构化输出，需选用支持该格式的服务。

本机 127.0.0.1:8790 不能直接被 Render 访问。当前源码包不在 Render 上启动 Windows llama.cpp 或下载模型；若要自托管模型，应另外准备可访问的模型服务。未配置时页面可以展示业务流程，但 AI 请求会明确失败，不会返回伪造成功结果。

## 部署步骤

1. 将本项目源码推送到你自己的独立 Git 仓库，保留根目录 render.yaml。
2. 取消旧的付费弹窗，刷新或重新导入 Blueprint，名称可填 culture-ai-operations；确认实例为 Free 且没有磁盘。
3. 等待服务部署成功；需要真实 AI 时，再配置模型地址、模型名及密钥。
4. 访问 /api/health，再按本项目演示步骤验证数据和权限。
5. 检查页面上的临时数据提示；重启后重新登录，并确认基准测试数据或默认节目能恢复。不要用此配置验收长期数据保留。

PUBLIC_HOST 可用于自定义域名；未设置时采用 Render 提供的外部主机名。同源校验不接受任意网页来源。

## 角色账号

DEMO_PASSWORD 由 Blueprint 自动生成，用于首次初始化五个角色账号。部署后在 Render 环境变量页读取并用于演示。账号名不变。密码哈希保存在 SQLite；修改环境变量不会自动更改已初始化账号的密码，应通过维护迁移处理，不能把改变量当成完成密码轮换。

数据库不存在时，从 data/demo.json.gz 解压导入完整基准样本。免费实例的数据目录不保证跨重启保留，因此可能重新初始化。不要上传本机数据库。

## 运行边界

该方案为单实例免费面试作品，SQLite 仅在当前实例的存续期间保存操作。尚未接入 SSO、组织隔离、密码找回和正式审批授权系统。

## 备份

可在具备服务端维护权限的终端执行 npm run backup，使用 SQLite 在线备份接口创建一致快照。本机仍可备份；免费 Render 实例没有 Shell 访问和持久磁盘，不能把此命令当成云端持久保留方案。复制运行中的主数据库文件而忽略 WAL 不是可靠备份方式。

## 可选升级

以后确需跨重启保留新增记录，可以改为支持持久磁盘的付费服务，挂载 /var/data 并设置 DATA_DIR=/var/data，同时移除 DEMO_MODE=ephemeral。当前默认配置不会创建该付费磁盘。
