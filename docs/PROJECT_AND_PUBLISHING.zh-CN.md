# Orbit Video Viewer：产品与发布决策

这份文档记录当前已经确定的产品规则，以及 GitHub、Hugging Face 的发布分工。以后继续设计或发布时，以这里为共同基准，不必依赖聊天记录。

## 1. 产品定位

开源项目的主体是 **Orbit Video Viewer**：一种可以集成到游戏、商品展示、互动叙事、教育内容和其他网页中的浏览器 Library。

它把预生成的环绕视角视频转换成可实时操控的观察视图，不要求真实 3D 模型或 3D 引擎。

**Orbit Comic** 是面向普通访问者的演示作品，不是开源项目的全部。

- 页面首先服务普通访问者：打开、看见画面、拖动并发现视角变化。
- 技术人员看到同一件简洁的作品；架构、实现原理和部署说明放在 README 与技术文章中。
- 页面只保留作品身份、必要操作、克制的加载和错误反馈。
- 不在主界面解释 WebCodecs、抽帧、缓存、服务器架构等技术细节。

### 三个层次

- **Core**：角度、帧映射、惯性、缓存、Canvas 渲染和素材接口等内部能力；
- **Library**：开发者直接使用的 `OrbitViewer`、`createMp4Source()` 和公开控制方法；
- **Demo**：Orbit Comic 的标题、按钮、样式、加载界面和沙漠素材。

对外提供两个使用入口，但底层不是两套技术：

- **Skill**：给不熟悉开发的人使用。用户把项目文件夹和环绕视频交给 Codex、Claude Code 等兼容工具，Skill 指导 AI 调用 Library 完成接入；
- **SDK / Library**：给开发者直接安装和编程使用。

Skill 只是“如何使用 SDK”的操作说明，不复制、不替代 Core 或 Library。当前真实接入测试已在 Codex 工作流中通过；Claude Code 支持相同的 `SKILL.md` 开放格式和项目级 `.claude/skills/` 目录，但仍应如实区分“格式兼容”和“已经在该工具中实测”。

GitHub 使用英文 `README.md` 与中文 `README.zh-CN.md`，并在顶部互相切换。GitHub README 优先介绍 Library 的用途、集成方法、公开接口、素材要求和技术边界。Hugging Face Space 展示 Orbit Comic；技术报告解释具体实现原理。

### README 浏览顺序

README 应按以下顺序组织：

1. 首先看到 Orbit Comic 的拖动效果动图和一句核心说明；
2. 看到商品查看、游戏道具检查、互动漫画三种用途概念图；
3. 再选择通过 Skill 或 SDK 开始使用；
4. API、素材要求、技术边界和详细原理放在后面。

三张用途图只表达想象空间，必须写明不是已经完成的独立产品。

### 技术来源声明

本项目学习的交互技术思路来自 [monoradio（@monoradio102）](https://x.com/monoradio102) 发布在 Claude Artifact 上的作品。页面头部和 README 都必须保留这一来源声明。

当前项目没有沿用或复制原 Artifact 的源码、HTML 或 CSS，而是理解“环绕视频 → 浏览器抽帧 → 拖动控制帧序号 → Canvas 显示”这条路线后，使用 Codex 独立重新实现。若以后取得原 Artifact 的直接网址，应在现有作者主页链接之外补充该直达链接。

## 2. 当前界面与交互语义

### Reset view

界面使用 **Reset view**，其无障碍说明是 “Return to the original view”。

它只重置**当前已加载视频**的视角：

- 默认沙漠视频中，回到沙漠视频的初始视角；
- 用户换成自己的视频后，回到该视频的初始视角；
- 它不会重新加载默认沙漠视频，也不会撤销换视频操作。

如果将来需要恢复内置作品，应另设语义完全不同的操作，例如 **Restore original artwork**，不能让 Reset view 同时承担两种职责。

### Change video

**Change video** 是低频的“更换作品”操作，不与高频的视角重置并排。它位于画面下方的作品说明区域。

用户选择的文件：

- 只在本机浏览器内读取和抽帧；
- 不上传服务器、不写入项目，也不会永久保存；
- 刷新或关闭页面后消失；
- 更换成功后成为当前作品，Reset view 以它为准。

### 标题规则

- 内置演示作品保留专属标题 **Desert Standoff**。
- 用户载入本地视频后，标题改为中性的 **Untitled Orbit**。
- 原始文件名作为较小的作品信息显示，长文件名会被省略显示，但完整文件名保留在悬停提示中。

这样既保留沙漠作品的个性，也不会把它的名字错误套用到访问者自己的内容上。未来如果增加作品命名功能，可允许用户直接编辑 “Untitled Orbit”，但当前版本不需要增加这一层操作。

## 3. GitHub 发布什么

GitHub 是项目的**唯一源代码基准（source of truth）**。公开仓库包含：

- 可编辑的完整源代码；
- README、验证记录和技术文档；
- 测试、依赖清单与锁文件；
- 构建和本地运行方法；
- 授权文件；
- 当前演示媒体（前提是先确定媒体授权）。

不提交 `node_modules/`、临时缓存、日志等生成内容。访问者既可以 `git clone`，也可以直接使用 GitHub 的 **Download ZIP** 下载源码。正式公开时建议创建 `v0.1.0` 标签和 GitHub Release，后续版本按相同方式发布。

当前视频约 14 MB，低于 GitHub 单文件 100 MiB 的阻止限制，可以作为普通 Git 文件提交。若以后演示媒体显著变大，再考虑 Git LFS 或外部媒体托管。

官方资料：

- [About releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
- [Downloading source code archives](https://docs.github.com/en/repositories/working-with-files/using-files/downloading-source-code-archives)
- [About large files on GitHub](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)

## 4. Hugging Face 发布什么

Hugging Face Space 是同一项目的**在线体验展览页**，不是另一套独立产品。

- 建立公开的 Static Space；
- 放入与 GitHub 某个正式版本相同的源码；
- 将仓库中的 `README.huggingface.md` 作为 Space 根目录的 `README.md`：保留英文在前、中文在后的单文件说明，以及最顶部的 Static Space YAML；
- Hugging Face 根据 README 顶部配置运行 `npm run build:demo`，发布 `dist/index.html`；
- 不需要 GPU、后端服务器或模型推理端点；
- 访问者可以直接体验，也可以查看和克隆公开 Space 的代码仓库。

推荐维护方式：先在 GitHub 完成修改、测试和版本标记，再把**同一个发布提交**同步到 Hugging Face。不要分别在两个网站修改代码，否则两个版本很快会漂移。

官方资料：

- [Spaces overview](https://huggingface.co/docs/hub/en/spaces-overview)
- [Static HTML Spaces](https://huggingface.co/docs/hub/main/spaces-sdks-static)

## 5. 技术文章扮演什么角色

技术文章是开源项目的解释与展示，不是一个不同的软件包。文章应同时链接：

- GitHub：源码、版本、安装、贡献与授权；
- Hugging Face Space：无需安装即可体验的在线作品。

文章可以采用以下结构：

1. 最终交互效果与创作目标；
2. 为什么采用“环绕视频 → 浏览器抽帧 → 拖动映射帧序号”；
3. 浏览器端内存、缓存和兼容性方案；
4. 如何替换成自己的环绕视频；
5. 局限、适合的源视频条件与后续方向；
6. GitHub 与在线 Space 链接。

Hugging Face 的站内 Blog Articles 当前要求个人账号具有有效 PRO，或由符合条件的 Team / Enterprise 组织发布。如果账号不满足条件，可以先把技术说明写进 Space README 和 GitHub 文档，再发布到其他博客平台；这不影响 Space 本身公开展示。

官方资料：[Hugging Face Blog Articles](https://huggingface.co/docs/hub/blog-articles)

## 6. 推荐发布流程

1. 确认演示视频和海报的公开授权；
2. 运行 `pnpm check:release`，完成测试、生产构建、独立消费项目和 npm 包内容检查；
3. 补入最终 GitHub、主页和问题反馈 URL；
4. 在 GitHub 建立公开仓库并推送源码；
5. 打 `v0.1.0` 标签并创建 GitHub Release；
6. 把同一发布提交同步到 Hugging Face Static Space，并把 `README.huggingface.md` 用作 Space 根 `README.md`；
7. 验证线上拖动、Reset view、Change video、移动端布局和错误提示；
8. 发布技术文章，并互相链接 GitHub 与 Space。

### 当前发布前状态

已经完成：Library 构建、类型声明、npm tarball、独立项目安装、Skill 结构验证、Skill 全新项目接入、Chromium 浏览器交互、第三方依赖许可清单、参考技术来源说明、README 视觉重组。

GitHub 源码仓库已经发布：<https://github.com/boryzoo/orbit-video-viewer>。仓库名为 `orbit-video-viewer`，公开项目名为 **Orbit Video Viewer**。

仍待完成：

- 决定是否同时发布 npm 包；
- 建立 Hugging Face Static Space 并填写线上 Demo 链接；
- 在 Safari、Firefox 做同等手动浏览器验收；
- 如即梦平台条款或画面中的第三方权利存在疑问，发布前再次确认或替换素材。

在用户最终确认前，不创建公开仓库、不推送、不发布 npm 包、不建立公开 Space。

## 7. 授权边界

代码采用 MIT License。演示视频和海报由项目所有者使用即梦 AI 制作，并在权利允许的范围内采用 CC BY 4.0 开放许可；具体说明记录在 `ASSETS.md`。

代码与媒体是两套许可：

- 源代码：MIT；
- `public/demo/poster.png` 与 `public/demo/video_01.mp4`：CC BY 4.0；
- 用户自行导入的文件：仍由用户自己决定授权，不会因为使用本项目而改变许可。

若即梦平台条款或素材中包含的第三方权利对公开再分发另有限制，应以这些限制为准，并在发布前替换有疑问的素材。
