<p align="right"><a href="README.md">English</a> · <strong>简体中文</strong></p>

<p align="center">
  <a href="https://huggingface.co/spaces/BreadStudio/orbit-video-viewer"><img src="docs/assets/orbit-comic-demo.gif" alt="用户拖动画面时，漫画主画面的观察视角随之变化" width="720"></a>
</p>

<h1 align="center">Orbit Video Viewer</h1>

<p align="center"><strong>把环绕视频变成可拖动控制视角的网页交互，不需要 3D 模型。</strong></p>

<p align="center">
  <a href="https://huggingface.co/spaces/BreadStudio/orbit-video-viewer"><strong>在线体验</strong></a> ·
  <a href="#通过-ai-编程工具使用-skill">使用 Skill</a> ·
  <a href="#直接使用-sdk">使用 SDK</a>
</p>

Orbit Video Viewer 是一个小型浏览器组件，可用于商品展示、游戏道具、角色、展览、互动漫画以及其他需要控制观察视角的网页体验。

> **技术来源：** 本项目的交互技术路线受到 [monoradio（@monoradio102）](https://x.com/monoradio102) 公开作品的启发，代码为独立实现。

## 在线体验

打开 Hugging Face Spaces 上公开的 [Orbit Comic 演示](https://huggingface.co/spaces/BreadStudio/orbit-video-viewer)，等待画面加载完成，然后在画面上左右拖动。

点击 **Change video** 可以选择自己的 MP4。文件只在你的浏览器内处理，不会被这个应用上传。

## 工作原理

环绕视频本身已经包含不同视角。Viewer 把左右拖动对应到视频中的不同位置，在浏览器内提取所需画面，并通过 Canvas 显示当前帧。它不会重建真正的 3D 场景，也不能生成源视频中不存在的角度。

建议使用符合以下条件的 H.264 MP4：

- 一段连续的水平环绕运动，中间不要切镜；
- 主体大小和相机高度保持稳定；
- 如果需要首尾循环，结束视角应尽量接近开场视角。

MP4 中的音频会被忽略。当前版本不包含视频预处理工具。

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

这些图片只用于说明可能的应用方向，不是仓库内附带的三个独立产品。

## 怎么使用？

### 通过 AI 编程工具使用 Skill

向兼容的 AI 编程工具提供三项内容：

1. 你的网页项目；
2. 你的环绕 MP4；
3. [`skills/integrate-orbit-video/SKILL.md`](skills/integrate-orbit-video/SKILL.md)。

然后输入：

```text
使用 integrate-orbit-video Skill，把我的环绕 MP4 接入这个项目。
```

Skill 会告诉 AI 如何接入这个组件，并尽量保留原项目已有的设计。完整流程和要求都写在 Skill 文件中。

### 直接使用 SDK

npm 包尚未公开发布。请先克隆并构建本仓库，再把它作为本地文件依赖安装：

```bash
git clone https://github.com/boryzoo/orbit-video-viewer.git
cd orbit-video-viewer
pnpm install
pnpm build:library

# 在你自己的项目中执行：
pnpm add /absolute/path/to/orbit-video-viewer
```

添加一个容器：

```html
<div id="orbit-view" tabindex="0"></div>
```

给容器设置尺寸：

```css
#orbit-view {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  cursor: grab;
  touch-action: pan-y;
}

#orbit-view canvas { display: block; width: 100%; height: 100%; }
```

载入视频：

```ts
import { OrbitViewer, createMp4Source } from 'orbit-video-viewer';

const element = document.querySelector<HTMLElement>('#orbit-view');
if (!element) throw new Error('Missing orbit view.');

const viewer = new OrbitViewer({ element, initialAngle: 0 });
await viewer.load(createMp4Source('/assets/orbit.mp4'));
```

完整接入方法见[接入指南](docs/INTEGRATION.md)和独立的 [`basic-integration`](examples/basic-integration) 示例。

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

## 在本地运行 Demo

```bash
pnpm install
pnpm dev
```

打开 Vite 输出的本地地址，不要直接双击 `index.html`。

当前版本已经在 Chromium 浏览器中完成手动验证。Safari 和 Firefox 的当前状态见[浏览器兼容性说明](docs/COMPATIBILITY.md)。

## 文档

- [English README](README.md)
- [接入指南](docs/INTEGRATION.md)
- [技术报告](docs/TECHNICAL_REPORT.md)
- [浏览器兼容性](docs/COMPATIBILITY.md)
- [来源与署名](docs/ORIGIN_AND_ATTRIBUTION.md)

## 技术灵感署名

本项目的交互思路受到 [monoradio（@monoradio102）](https://x.com/monoradio102) 公开作品的启发，详细说明见[来源与署名](docs/ORIGIN_AND_ATTRIBUTION.md)。

## 许可

Library、Demo 源码和 Skill 使用 [MIT License](LICENSE)。Demo 与 README 媒体采用单独条款，见 [ASSETS.md](ASSETS.md)；第三方软件见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
