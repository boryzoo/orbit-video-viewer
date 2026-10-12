# Release checklist

Last updated: 2026-10-12

## Complete

- [x] Core, Library, Demo, and Skill responsibilities are separated.
- [x] Unit tests pass.
- [x] Demo production build passes.
- [x] Library ES module build passes.
- [x] TypeScript declarations build and work in a consumer project.
- [x] Public exports include the Viewer, MP4 source, controls, state, and source contracts.
- [x] `examples/basic-integration` builds without importing repository source files.
- [x] npm tarball contains JavaScript, declarations, README, MIT License, and third-party notices.
- [x] Skill manifest passes the Skill creator validator.
- [x] Skill workflow was followed in a fresh project using the packed SDK.
- [x] Fresh Skill integration loads, drags, resets, and reports no Chromium console errors.
- [x] Chromium H.264 MP4 behavior is documented as the verified browser target.
- [x] Runtime and development dependency licenses are recorded.
- [x] Reference technique credit and independent-implementation boundary are recorded.
- [x] Demo and README media licensing is recorded.
- [x] README leads with the interaction, then use cases, then Skill and SDK entry points.
- [x] GitHub README uses the three-panel comic recording and links to a complete Chinese README.
- [x] Hugging Face has a separate bilingual Static Space README template with build metadata.
- [x] The recording page is self-contained inside the repository and its media is listed in `ASSETS.md`.
- [x] Package metadata declares Node.js 20+, public npm access, and both README languages in the tarball.
- [x] A single release-check command covers tests, both production builds, the consumer build, and package contents.
- [x] Technical report describes the same engine, Skill, runtime processing, and limitations.

## Before public release

- [ ] Repository owner gives final approval to publish.
- [x] Confirm the public project name **Orbit Video Viewer** and repository name `orbit-video-viewer`.
- [x] Create the local Git repository and public GitHub remote at `boryzoo/orbit-video-viewer`.
- [ ] Decide whether version `0.1.0` will also be published to npm.
- [x] Add the final `repository`, `homepage`, and issue-tracker fields to `package.json`.
- [ ] Replace the placeholder source paragraph in `README.huggingface.md`, then use that file as the Space repository's root `README.md`.
- [ ] Create the Hugging Face Static Space and add its public URL to both GitHub READMEs.
- [ ] Run the manual interaction matrix in Safari and Firefox, or keep their support explicitly unverified.
- [ ] Reconfirm that Jimeng's applicable terms and all visible media elements permit the intended CC BY 4.0 redistribution; replace the Demo media if uncertain.
- [ ] Add the direct Claude Artifact URL if it becomes available.
- [ ] Verify the deployed GitHub and Hugging Face versions come from the same release commit.

## Final local gate

Run from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm check:release
```

Then inspect the package file list printed by `pnpm pack --dry-run`. Do not publish it yet. The owner approval, final public URLs, browser matrix, and media-rights confirmation remain human release gates.

No public repository, npm package, or Hugging Face Space should be created until the owner approves release.
