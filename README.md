# 集团管理 AI项目

独立面试作品 v0.3，支持本机运行，默认 Render 配置为免费演示版（不挂载磁盘）。新增操作不保证跨休眠、重启或部署保留，完整测试数据或默认节目会在数据库重新初始化时恢复。当前使用虚构业务数据；没有连接银行、真实 HR 决策或实体舞台设备。

## 启动和入口

要求 Node.js 24 或更高版本。执行 npm ci --ignore-scripts，然后 npm start。本机地址 http://127.0.0.1:8787/。当前工作区也可以执行 Start-Local.ps1 复用已下载的模型运行时。

默认入口为“采购经营闭环”。本机演示账号 applicant、approver、buyer、warehouse、finance，分别对应申请、审批、采购、验收和财务角色；密码均为 demo123!。Render 使用环境变量 DEMO_PASSWORD 初始化账号，不使用公开测试密码。

SQLite 业务数据位于 DATA_DIR/business.sqlite，DATA_DIR 未设置时使用本项目 data/。原来的七模块浏览器模拟流程保留，明确标注为旧版演示，不能与服务端闭环混为一谈。

## 已实现

- 15,184 条基准数据首次导入 SQLite，保留编号、关联及金额校验。数据页支持检索和分页。
- 服务端项目立项、角色审批、采购下单、验收回执、付款登记、预算占用和经营台账同步。
- 申请与审批分离，超预算审批拒绝，未验收不得登记付款；幂等键、版本检查和事务回滚防止重复、过期操作。
- 本地模型或兼容 API 分析；项目文字资料检索、结构化来源标签校验，原文可追溯。AI 没有写库审批权限。

已实际复用 Node 内置 SQLite、dotenv、llama.cpp 和 Qwen2.5 模型。Dify 适配保留但未部署，ERPNext/RAGFlow/Frappe HR/pretix 未安装，不计入已实现能力。

## 测试

npm test
npm run test:data
npm run test:business

业务单元测试使用隔离临时数据库。evidence/business-e2e.json 为真实本机 HTTP、SQLite 与模型调用记录。

## 交付说明

- docs/DEMO.md：面试演示步骤。
- docs/ARCHITECTURE.md：架构、选型、成本和边界。
- docs/TEST-REPORT.md：测试结果和证据。
- DEPLOY-RENDER.md：Render 部署配置和限制。

可选执行 npm run test:e2e 对运行中的本机服务做端到端验证；该测试会新增虚构业务或操作真实 OBS。演出测试还需要 ffmpeg。npm run backup 使用 SQLite 在线备份接口保存一致快照到 DATA_DIR/backups。

源码包不包含 node_modules、.env、运行中的数据库、OBS 安装目录或模型权重。不要将本机配置文件提交到公开仓库。

基准测试数据以 data/demo.json.gz 提交，程序自动解压读取；仍包含完整的 15,184 条记录。
