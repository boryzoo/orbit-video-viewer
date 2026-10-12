<p align="right"><a href="README.md">English</a> · <strong>简体中文</strong></p>

<p align="center">
  <img src="recording-comic/output/orbit-comic-demo.gif" alt="三格漫画演示：拖动指示器移动时，主画面的观察视角随之变化" width="720">
</p>

<h1 align="center">Orbit Video Viewer</h1>

<p align="center"><strong>把预先生成的环绕视频变成可拖动控制视角的网页交互，不需要 3D 模型。</strong></p>

<p align="center">
  <a href="#体验-demo">体验 Demo</a> ·
  <a href="#通过-ai-编程工具使用-skill">使用 Skill</a> ·
  <a href="#直接使用-sdk">使用 SDK</a>
</p>

Orbit Comic 是仓库内附的演示作品；这个开源项目的主体是其下方可复用的交互能力：载入一段环绕 MP4，让用户通过拖动浏览不同视角，读取或设置当前角度，并把它嵌入自己的产品。

> **技术灵感署名：** 本项目研究了 [monoradio（@monoradio102）](https://x.com/monoradio102) 通过 Claude Artifact 分享的交互思路。代码由 Codex 独立实现，没有复制该 Artifact 的源码。

## 可以用它做什么？

<table>
  <tr>
    <td width="33%"><img src="docs/assets/concepts/product-viewer.jpg" alt="可拖动商品查看器概念图"></td>
    <td width="33%"><img src="docs/assets/concepts/game-item-inspection.jpg" alt="游戏道具多视角检查概念图"></td>
    <td width="33%"><img src="docs/assets/concepts/interactive-comic.jpg" alt="互动漫画视角探索概念图"></td>
  </tr>
  <tr>
    <td align="center"><strong>商品查看器</strong></td>
    <td align="center"><strong>游戏道具检查</strong></td>
    <td align="center"><strong>互动漫画</strong></td>
  </tr>
</table>

这些图片只用于说明可能的应用方向，不是仓库内已经完成的独立产品。同一种交互也可以用于展览、角色展示、教育、建筑和互动艺术。

## 开始使用

### 通过 AI 编程工具使用 Skill

[`integrate-orbit-video` Skill](skills/integrate-orbit-video/SKILL.md) 会指导 AI 编程工具把 SDK 和你的 MP4 接入现有网页项目，同时尽量保留原项目的视觉设计。

最简单的使用方式是下载本仓库，在 AI 编程工具中打开你自己的项目，并向工具提供三个路径：你的项目、你的 MP4 和这个 Skill 文件。然后输入：

```text
使用 integrate-orbit-video Skill，把我的环绕 MP4 接入这个项目。
```

如果需要反复使用，可以把整个 `skills/integrate-orbit-video` 文件夹安装到工具的 Skill 目录。Claude Code 项目级 Skill 可放在 `.claude/skills/integrate-orbit-video/`；兼容 Codex 的工具可以使用其本地或项目 Skill 目录，也可以直接读取仓库中的 `SKILL.md`。

这个 Skill 采用 OpenAI 与 Claude Code 所描述的开放 `SKILL.md` Agent Skills 格式。它已经在 Codex 工作流中完成真实接入测试；其他工具是否能自动发现和调用，取决于其具体版本与配置。详见 [Skill 验证记录](docs/SKILL_VALIDATION.md)。

### 直接使用 SDK

npm 包尚未公开发布。当前可先构建本仓库，再通过本地文件依赖安装：

```bash
pnpm install
pnpm build:library
pnpm add /absolute/path/to/orbit-panel-viewer
```

```html
<div id="orbit-view" tabindex="0"></div>
```

```css
#orbit-view {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
}

#orbit-view canvas { display: block; width: 100%; height: 100%; }
```

```ts
import { OrbitViewer, createMp4Source } from 'orbit-video-viewer';

const element = document.querySelector<HTMLElement>('#orbit-view');
if (!element) throw new Error('Missing orbit view.');

const viewer = new OrbitViewer({ element, initialAngle: 0 });
await viewer.load(createMp4Source('/assets/orbit.mp4'));

viewer.setAngle(90, { animate: true });
viewer.reset();
```

更多内容见[接入指南](docs/INTEGRATION.md)、[公开 API](#公开-api)和独立的 [`basic-integration`](examples/basic-integration) 消费项目。

## 公开 API

| API | 用途 |
|---|---|
| `createMp4Source(urlOrFile)` | 载入 MP4 URL、`File` 或 `Blob` |
| `load(source, options?)` | 准备并显示素材 |
| `getAngle()` / `getState()` | 读取当前视图状态 |
| `setAngle(degrees, options?)` | 移动到指定视角 |
| `rotateBy(degrees, options?)` | 相对当前视角旋转 |
| `reset(options?)` | 回到当前视频的初始视角 |
| `setInteractionEnabled(boolean)` | 启用或禁用用户输入 |
| `destroy()` | 释放资源和事件监听 |

通用 `OrbitSource` 接口把 Viewer 与解码逻辑分开。当前版本只实现浏览器端 MP4 处理，不包含预处理工具。

## 源视频要求

建议使用 H.264 MP4：画面应是一段连续的水平环绕运动，主体大小和相机高度保持稳定，不要切镜；如果希望首尾循环，结束视角应尽量接近开场视角。

这是一种受控的视角回放，不是真实 3D。它不能生成视频中不存在的角度、改变几何结构、提供碰撞或重新打光。MP4 中的音频会被忽略。

## 体验 Demo

不要直接双击 `index.html`。请启动开发服务器：

```bash
pnpm install
pnpm dev
```

然后打开 Vite 输出的本地地址。使用 **Change video** 可以尝试自己的 MP4；**Reset view** 会回到当前已载入视频的初始视角。

## 项目结构

```text
src/core/                    内部运动、帧、缓存和素材契约
src/library/                 对外 OrbitViewer SDK
src/demo/                    Orbit Comic 展示界面
skills/integrate-orbit-video AI 辅助接入流程
examples/basic-integration  独立 SDK 消费项目
public/demo/                 内置 Orbit Comic 媒体
```

## 文档

- [English README](README.md)
- [接入指南](docs/INTEGRATION.md)
- [技术报告](docs/TECHNICAL_REPORT.md)
- [浏览器兼容性](docs/COMPATIBILITY.md)
- [来源与署名](docs/ORIGIN_AND_ATTRIBUTION.md)
- [验证记录](VALIDATION.md)
- [发布清单](docs/RELEASE_CHECKLIST.md)
- [发布执行手册](docs/PUBLISHING_RUNBOOK.zh-CN.md)
- [产品与发布决策](docs/PROJECT_AND_PUBLISHING.zh-CN.md)
- [Hugging Face Space README 模板](README.huggingface.md)

## 许可

Library、Demo 源码和 Skill 使用 [MIT License](LICENSE)。Demo 与 README 媒体采用单独条款，见 [ASSETS.md](ASSETS.md)；第三方软件见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
