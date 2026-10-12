---
title: Orbit Comic Demo
emoji: 🎞️
colorFrom: gray
colorTo: red
sdk: static
app_file: dist/index.html
app_build_command: npm run build:demo
fullWidth: true
header: mini
short_description: A live demo of the Orbit Video Viewer library.
---

# Orbit Video Viewer

**Turn pre-rendered orbit videos into interactive, drag-controlled views. No 3D models required.**

Orbit Comic is the live demonstration above. Drag horizontally across the artwork to browse the viewpoints encoded in the MP4. Use **Change video** to try your own local MP4; the file stays in your browser and is not uploaded by this app.

The reusable open-source project provides `OrbitViewer`, browser-side MP4 processing, a public control API, an integration Skill for AI coding agents, and a standalone consumer example.

> **Technique credit:** This project studies an interaction technique shared by [monoradio (@monoradio102)](https://x.com/monoradio102) through a Claude Artifact. The code was independently implemented with Codex and does not copy the Artifact's source.

## Source and local use

The canonical source is [boryzoo/orbit-video-viewer on GitHub](https://github.com/boryzoo/orbit-video-viewer). Use GitHub for the editable source, installation documentation, version history, and [issue tracking](https://github.com/boryzoo/orbit-video-viewer/issues). This Space is the live demonstration of the same project.

For a local source checkout:

```bash
pnpm install
pnpm dev
```

The verified release target is Chromium with H.264 MP4. Safari and Firefox support remains pending the same manual interaction matrix. This is controlled viewpoint playback rather than real 3D; it cannot reveal angles absent from the source video.

---

# Orbit Video Viewer（中文）

**把预先生成的环绕视频变成可拖动控制视角的网页交互，不需要 3D 模型。**

上方的 Orbit Comic 是在线演示。请在画面中水平拖动，浏览 MP4 已经包含的不同观察视角。使用 **Change video** 可以尝试自己的本地 MP4；文件只在浏览器内处理，不会由这个应用上传。

可复用的开源项目包含 `OrbitViewer`、浏览器端 MP4 处理、公开控制 API、供 AI 编程工具使用的接入 Skill，以及一个独立消费示例。

> **技术灵感署名：** 本项目研究了 [monoradio（@monoradio102）](https://x.com/monoradio102) 通过 Claude Artifact 分享的交互思路。代码由 Codex 独立实现，没有复制该 Artifact 的源码。

## 源码与本地运行

项目的唯一源码基准是 GitHub 上的 [boryzoo/orbit-video-viewer](https://github.com/boryzoo/orbit-video-viewer)。可编辑源码、安装说明和版本历史以 GitHub 为准；问题可提交到 [GitHub Issues](https://github.com/boryzoo/orbit-video-viewer/issues)。这个 Space 是同一项目的在线演示入口。

本地源码运行方式：

```bash
pnpm install
pnpm dev
```

当前已经验证的发布目标是 Chromium + H.264 MP4；Safari 与 Firefox 尚待完成同等手动交互测试。这是受控的视角回放，不是真实 3D，不能生成源视频中不存在的角度。

## License / 许可

Software is MIT licensed. Demo media has separate terms documented in `ASSETS.md`. 技术代码使用 MIT License；演示媒体的独立条款见 `ASSETS.md`。
