# V0.3 验证记录

验证日期：2026-10-12（Asia/Shanghai）

## 本次验收范围

- Core、Library、Demo 已明确分层；
- Orbit Comic 改为通过公开 Library API 运行；
- Library 可以生成独立 ES Module 和 TypeScript 类型声明；
- 独立项目通过本地包依赖安装 Library，没有直接引用主项目 `src/`；
- 没有实现预处理工具或其他超出范围的扩展。
- 新增基于同一 Library 的 `integrate-orbit-video` Skill；
- 完成 Skill 驱动的全新临时项目接入验收；
- README 已按“作品效果 → 使用想象 → Skill / SDK”重新组织；
- 完成依赖许可、参考来源和浏览器支持范围检查。

## 测试素材

- `public/demo/video_01.mp4`；
- H.264，852 × 480，约 10.05 秒，约 14 MB；
- 视频包含 AAC 音轨，但 Library 只使用视频轨；
- 内容经过正面、侧面、背面、另一侧并返回正面。

## 自动检查

- TypeScript 严格检查：通过；
- Vitest：1 个文件、4 个用例通过；
- Orbit Comic Demo 生产构建：通过；
- Library ES Module 构建：通过；
- Library TypeScript 类型声明构建：通过；
- npm tarball 内容检查：通过；
- `examples/basic-integration` 独立项目 TypeScript 检查与 Vite 构建：通过。
- Skill 官方结构验证器：通过；
- Skill 临时消费项目安装、TypeScript 与 Vite 生产构建：通过。

Library 构建结果：

- `dist/library/orbit-viewer.js`：约 15.8 KB，gzip 后约 5.1 KB；
- `dist/types/`：公开 API 及其依赖类型声明。

## 独立项目浏览器实测

独立项目位于 `examples/basic-integration`，拥有自己的 `package.json`，通过 `file:../..` 安装构建后的 `orbit-video-viewer` 包。

实测结果：

- MP4 成功加载并显示第 0 帧；
- `onChange` 正确报告 `0° · frame 0`；
- `setAngle(90)` 到达 `90° · frame 31`；
- `setAngle(180)` 到达 `180° · frame 62`；
- `reset()` 返回 `0° · frame 0`；
- 鼠标拖动后角度与帧持续变化；
- 浏览器控制台无 warning、无 error。

## Orbit Comic 回归实测

- 默认沙漠作品成功加载；
- 原页面视觉、标题、署名、Change video 和 Reset view 保留；
- 拖动正常；
- Reset view 返回当前视频的初始视角；
- 浏览器控制台无 warning、无 error。

## Skill 独立接入实测

- 在系统临时目录新建了独立 Vite / TypeScript 项目；
- 项目从 npm tarball 安装 `orbit-video-viewer@0.1.0`，没有引用主仓库 `src/`；
- 页面采用与 Orbit Comic 不同的“Relic Study”视觉，不复制 Demo UI；
- MP4 加载成功，拖动后角度发生变化；
- Reset view 返回当前视频的 `0°` 初始视角；
- 控制台无 warning、无 error；
- 详细步骤见 `docs/SKILL_VALIDATION.md`。

## 已知边界

- 已验证的快速路径是 H.264 MP4，不代表所有 MP4 编码都已验证；
- `video fallback` 已保留，但本轮没有强制关闭 WebCodecs 单独覆盖该路径；
- 当前只实现浏览器即时处理 MP4；
- 已添加通用 `OrbitSource` 接口，但没有实现预处理工具或图片清单加载；
- 首尾连续性和角色一致性仍由源视频决定；
- Library 尚未发布到 npm，本轮验证使用本地构建包。
- Skill 使用开放的 `SKILL.md` 格式并通过结构验证，但目前只在 Codex 执行流程中完成真实接入测试；Claude Code 的目录兼容性有官方依据，尚未在本机 Claude Code 中运行同一验收。
- Safari 和 Firefox 尚未完成与 Chromium 相同的手动交互矩阵，因此 README 不宣称它们已经完整验证。
