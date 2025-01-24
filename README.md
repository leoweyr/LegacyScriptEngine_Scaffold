# Legacy Script Engine Scaffold

A utility for assisting in the development of Legacy Script Engine plugins, supporting a native development experience on the Node.js platform.

> Only TypeScript projects are supported at the moment.

## 📦 Prepare

It is a non-intrusive tool, meaning it does not require any mandatory files to be kept in your project. However, it is recommended to add it as a development dependency to your environment for convenient usage:

```bash
npm install legacy-script-engine-scaffold --save-dev
```

## 🚀 Usage

Generate manifest.json for the Legacy Script Engine plugin:

```bash
npx lses manifest
```

Package the Legacy Script Engine plugin:

```bash
npx lses pack
```
