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

### 生成 Legacy Script Engine 插件的 manifest.json 文件

```bash
npx lses manifest
```

### 打包 Legacy Script Engine 插件

```bash
npx lses pack
```

### 根据路径将 Legacy Script Engine 插件包部署到 LeviLamina 服务器

> ⚠️ **已知问题**
>
> 当部署到从未安装过目标插件的远程 LeviLamina 服务器时，部署任务完成后本地终端可能仍在等待，请使用 CTRL + C 手动终止本地终端。

```bash
npx lses deploy-path <path> [options]
```

| 命令行参数    | 描述                              | 类型   |
| ------------- | --------------------------------- | ------ |
| `<path>`      | 指定的 LeviLamina 服务器工作目录    | 字符串 |

| 选项                                  | 描述                          | 类型    | 默认值  |
| ------------------------------------- | ----------------------------- | ------- | ------- |
| `-h, --host <remoteHost>`             | 远程 Windows OpenSSH 主机      | 字符串  |         |
| `-P, --port <remotePort>`             | 远程 Windows OpenSSH 端口      | 整数    | 22      |
| `-u, --username <remoteUsername>`     | 远程 Windows OpenSSH 用户名    | 字符串  |         |
| `-p, --password <remotePassword>`     | 远程 Windows OpenSSH 密码      | 字符串  |         |

### 启动 LeviLamina 服务器作为调试器

```bash
npx lses debug <path> <name> [options]
```

| 命令行参数    | 描述                     | 类型   |
| ------------- |------------------------| ------ |
| `<path>`      | 指定的 LeviLamina 服务器工作目录 | 字符串 |
| `<name>`      | 对应调试器实例的名称             | 字符串 |

| 选项                                  | 描述                          | 类型    | 默认值  |
| ------------------------------------- | ----------------------------- | ------- | ------- |
| `-h, --host <remoteHost>`             | 远程 Windows OpenSSH 主机      | 字符串  |         |
| `-P, --port <remotePort>`             | 远程 Windows OpenSSH 端口      | 整数    | 22      |
| `-u, --username <remoteUsername>`     | 远程 Windows OpenSSH 用户名    | 字符串  |         |
| `-p, --password <remotePassword>`     | 远程 Windows OpenSSH 密码      | 字符串  |         |

### 将 Legacy Script Engine 插件包部署到 LeviLamina 服务器调试器实例

> 💡  **关键特性**
>
> 相较于 `npx lses deploy-path`，这种方式在插件部署后会自动进行热重载。

```bash
npx lses deploy-debug <debuggerName>
```

| 命令行参数        | 描述                        | 类型   |
| ----------------- |---------------------------| ------ |
| `<debuggerName>`  | 指定的 LeviLamina 服务器调试器实例名称 | 字符串 |

## ❗ 重要提示

1. package.json 中的 `main` 入口文件路径配置应相对于项目的工作目录，<font color="red">而不是 Legacy Script Engine 已打包插件的目录。</font>

   例如，在 TypeScript 项目中，若源码已定义 index.ts 为程序入口，并在 tsconfig.json 中配置 TypeScript 编译器输出目录为 dist，则应该将 package.json 中的 `main` 入口文件路径配置设置为 `dist/index.js`。

   这样确保通过 `npx lses manifest` 生成的 manifest.json 文件中的 `entry` 插件程序入口配置能够被 LeviLamina 正确识别和定位。

2. 在使用 `npx lses deploy-debug` 之前，确保对应的 LeviLamina 服务器调试器实例已开启，如果没有请先使用 `npx lses debug` 来启动它。