# Orbit Video Viewer 发布执行手册

这份手册只描述正式发布时的顺序和核对点，不授权创建公开仓库、发布 npm 包或建立 Hugging Face Space。任何对外操作都必须等仓库所有者最终确认。

## 1. 当前本地产物

| 对外表面 | 准备使用的文件 | 发布角色 |
|---|---|---|
| GitHub 英文首页 | `README.md` | 英文项目入口、SDK 与 Skill 用法 |
| GitHub 中文首页 | `README.zh-CN.md` | 与英文首页对应的中文入口 |
| GitHub 首屏动图 | `recording-comic/output/orbit-comic-demo.gif` | 三格漫画交互预览 |
| 视频发布素材 | `recording-comic/output/orbit-comic-demo.mp4` | 支持视频的平台或文章嵌入 |
| Hugging Face Space 说明 | `README.huggingface.md` | 发布时改名为 Space 根 `README.md` |
| Static Space 应用 | 根项目源码，由 `npm run build:demo` 生成 `dist/index.html` | 在线可操作 Demo |
| npm 包（若决定发布） | `orbit-video-viewer@0.1.0` | Library、类型声明与许可文件 |

`recording-comic/` 只是可复现首屏素材的录制页，不应被描述成 SDK 功能或漫画编辑器。

## 2. 发布前必须由所有者确定

1. 对外项目名与 GitHub 仓库名；
2. GitHub 账号或组织；
3. Hugging Face Space 名称与账号或组织；
4. 是否同步发布 npm `0.1.0`，以及 npm 包名是否继续使用 `orbit-video-viewer`；
5. 即梦生成媒体及画面内可识别元素是否允许按 `ASSETS.md` 所述方式公开再分发；
6. Safari、Firefox 是在首发前补测，还是继续明确标记为未完整验证。

这些决定会产生最终 URL。在 URL 确定前，不要在 `package.json` 中编造 `repository`、`homepage` 或 `bugs` 字段。

## 3. 本地候选版本检查

在项目根目录执行：

```bash
pnpm install --frozen-lockfile
pnpm check:release
```

检查输出应同时覆盖：

- Vitest 单元测试；
- Demo 与 Library 生产构建；
- TypeScript 类型声明；
- `examples/basic-integration` 独立消费构建；
- npm tarball 文件清单。

另外手动打开普通 Demo 和 `recording-comic/?capture=1`，确认控制台无报错，三格录制页可以在独立 clone 中载入自己的 `assets/shot.png` 与 `assets/impact.png`。

## 4. GitHub 发布顺序

1. 得到最终确认后再初始化 Git，并创建公开 GitHub 仓库；
2. 在 `package.json` 写入真实的 `repository`、`homepage` 与 `bugs` URL；
3. 把 Hugging Face 在线地址补入 `README.md` 与 `README.zh-CN.md`；如果 Space 尚未建立，先保持本地 Demo 说明，不放假链接；
4. 重新运行本地候选版本检查；
5. 推送同一个通过检查的提交；
6. 建立 `v0.1.0` 标签和 GitHub Release；
7. Release 说明至少列出 Library、Demo、Skill、浏览器验证范围和已知限制。

推荐仓库 Topics：`orbit-viewer`、`interactive-video`、`canvas`、`webcodecs`、`typescript`。Topics 是发布后仓库设置，不需要写进源码。

## 5. Hugging Face Static Space 顺序

1. 建立 **Static Space**，不要建立 Dataset；
2. 从 GitHub 的正式发布提交同步源码，不在两个平台分别维护功能修改；
3. 将 `README.huggingface.md` 的占位源码段落换成真实 GitHub、Release 和问题反馈链接；
4. 在 Space 仓库中让该文件成为根 `README.md`，并保留最顶部 YAML；
5. 确认构建命令为 `npm run build:demo`，入口为 `dist/index.html`；
6. 记录 Space 实际对应的 Git commit SHA；
7. 在线测试拖动、键盘方向键、Reset view、Change video、本地文件隐私说明、窄屏布局、加载与错误反馈。

[Hugging Face 官方文档](https://huggingface.co/docs/hub/main/spaces-sdks-static)确认 Static Space 通过根 `README.md` 顶部 YAML 中的 `sdk: static` 配置，并可使用 `app_build_command` 生成由 `app_file` 指向的静态入口。

## 6. npm 可选发布

只有在所有者明确决定同时发布 npm 后才执行：

1. 确认包名可用且最终包名与 import 示例一致；
2. 确认 `package.json` 的 URL 字段已经是真实公开地址；
3. 再次运行 `pnpm pack --dry-run`，确认只包含 Library、类型声明、双语 README 和许可文件；
4. 在临时消费项目中安装最终 tarball并构建；
5. 发布 `0.1.0`，然后用公开 registry 安装再做一次最小接入验证。

如果首发不发布 npm，README 继续保留本地文件依赖方式，不把未存在的 registry 安装命令写成可用路径。

## 7. 发布完成判定

只有以下条件同时满足，才把本次发布标记为完成：

- GitHub Release、Hugging Face Space（以及可选 npm 包）来自同一候选版本；
- GitHub 双语 README 的语言切换、图片和内部链接有效；
- Space 显示英文在前、中文在后的说明，并能实际操作 Demo；
- monoradio 技术灵感署名、Codex 独立实现说明、即梦素材来源和许可边界均保留；
- 线上浏览器检查结果与文档声明一致；
- 没有把 `recording-comic/` 误称为 SDK 核心能力，也没有宣称存在预处理工具。
