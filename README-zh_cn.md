# Legacy Script Engine Scaffold

#### [English](README.md) | 简体中文

支持 Node.js 平台原生体验、辅助 Legacy Script Engine 插件开发的脚手架工具。

> 当前仅支持 TypeScript 项目

## 📦 准备工作

这是一个非侵入式工具，它不会在你的项目中保留任何强制性配置文件。建议将其添加为项目的开发依赖以方便在环境中使用：

```bash
npm install @levimc-lse/scaffold --save-dev
```

## 🚀 使用方法

生成 Legacy Script Engine 插件的 manifest.json 文件：

```bash
npx lses manifest
```

打包 Legacy Script Engine 插件：

```bash
npx lses pack
```

将 Legacy Script Engine 插件包部署到本地 LeviLamina 服务器：

```bash
npx lses deploy <path>
```

| 命令行参数    | 描述                        | 类型  |
|----------|---------------------------|-----|
| `<path>` | 所指定本地 LeviLamina 服务器的工作目录 | 字符串 |

## ❗ 重要提示

package.json 中的 `main` 入口文件路径配置应相对于项目的工作目录，<font color="red">而不是 Legacy Script Engine 已打包插件的目录。</font>

例如，在 TypeScript 项目中，若源码已定义 index.ts 为程序入口，并在 tsconfig.json 中配置 TypeScript 编译器输出目录为 dist，则应该将 package.json 中的 `main` 入口文件路径配置设置为 `dist/index.js`。

这样确保通过 `npx lses manifest` 生成的 manifest.json 文件中的 `entry` 插件程序入口配置能够被 LeviLamina 正确识别和定位。
