# [1.0.0](https://github.com/leoweyr/LegacyScriptEngine_Scaffold/compare/v0.2.2...v1.0.0) (2025-11-10)


### Bug Fixes

* resolve hanging terminal issue when deploying new plugins to remote LeviLamina server ([64b1d0e](https://github.com/leoweyr/LegacyScriptEngine_Scaffold/commit/64b1d0eb70d14c7dee5d634be2b247d872bfa4f2))



# [1.0.0-rc.1](https://github.com/leoweyr/LegacyScriptEngine_Scaffold/compare/v0.2.2...v1.0.0-rc.1) (2025-11-04)


### Known Issues

* When deploying to a remote LeviLamina server where the target plugin has never been installed before, the local terminal may still be waiting after the deployment task is completed.

### Features

* **cli:** add LeviLamina server debugging functionality with automatic plugin hot-reload when deploying to debugger ([605aa81](https://github.com/leoweyr/LegacyScriptEngine_Scaffold/commit/605aa8143d618aa11d3798d073cc6d3dd17cec90))
* **cli:** enable remote deployment capability for deploy ([58efafd](https://github.com/leoweyr/LegacyScriptEngine_Scaffold/commit/58efafda6124007f0c3c40943037aa06636a3481))



# [0.2.2](https://github.com/leoweyr/LSEScaffold/compare/v0.2.1...v0.2.2) (2025-06-15)


### Bug Fixes

* enable proper handling of multi-repo projects ([7f95b9b](https://github.com/leoweyr/LSEScaffold/commit/7f95b9ba5a5625e5bc5131746f050d525b6a0186))



# [0.2.1](https://github.com/leoweyr/LSEScaffold/compare/v0.2.0...v0.2.1) (2025-01-27)


### Bug Fixes

* correct entry resolution in manifest.json handling based on package.json ([d597bab](https://github.com/leoweyr/LSEScaffold/commit/d597babf6a6d50e68f9100873f9ef08460c7d678))
* **scripts:** correct local deployment to prevent npm install override ([ea61ebd](https://github.com/leoweyr/LSEScaffold/commit/ea61ebd52e655a95d34c9080ceb0e82f9cfdaaa1))



# [0.2.0](https://github.com/leoweyr/LSEScaffold/compare/v0.1.0...v0.2.0) (2025-01-25)


### Features

* **cli:** add support for local deployment of Legacy Script Engine plugins ([ea9ef70](https://github.com/leoweyr/LSEScaffold/commit/ea9ef70701d127b2b114f503102359dbffbea673))
* enable deployment of plugins to local Levilamina server ([6aeec36](https://github.com/leoweyr/LSEScaffold/commit/6aeec36daa2653f3563c00a06e53880b2293d024))
* introduce handling for the project-generated plugin package ([e51a169](https://github.com/leoweyr/LSEScaffold/commit/e51a1691c39bf3c8ee515fc2bdc072e89d8ff0de))



# [0.1.0](https://github.com/leoweyr/LSEScaffold/compare/13da1825083f91d0b7fed1ffc5f56ccc3159695f...v0.1.0) (2025-01-25)


### Features

* add manifest.json handling for Legacy Script Engine plugin package ([57b8ba1](https://github.com/leoweyr/LSEScaffold/commit/57b8ba1c108e89181572e72cf5bc47c4b8af7169))
* add package.json parsing capability ([13da182](https://github.com/leoweyr/LSEScaffold/commit/13da1825083f91d0b7fed1ffc5f56ccc3159695f))
* add packaging functionality for Legacy Script Engine plugin ([58be2a4](https://github.com/leoweyr/LSEScaffold/commit/58be2a4c75317a4991bd455c44ed5f2c0e616db9))
* add support for TypeScript projects ([3265ace](https://github.com/leoweyr/LSEScaffold/commit/3265ace38012aab5cf531ae33b2d8f8cd8e65ab4))
* add tsconfig.json parsing capability ([fa8f3b9](https://github.com/leoweyr/LSEScaffold/commit/fa8f3b90d73de8d234e87790f9922771f6636a65))
* **cli:** add support for manifest and packaging of Legacy Script Engine plugins ([2933e01](https://github.com/leoweyr/LSEScaffold/commit/2933e0100765d7785f87472e113c077112a46e9a))
