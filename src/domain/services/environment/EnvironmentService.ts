return Promise.resolve();
  105|    }
  
      at failureErrorWithLog (/home/project/node_modules/esbuild/lib/main.js:1462:15)
      at eval (/home/project/node_modules/esbuild/lib/main.js:745:50)
      at responseCallbacks.<computed> (/home/project/node_modules/esbuild/lib/main.js:612:9)
11:04:59 [vite] Internal server error: Failed to resolve import "../../../utils/logger" from "src/domain/factories/EntityFactory.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: /home/project/src/domain/factories/EntityFactory.ts:14:23
  7  |  import { Quest } from "../entities/implementations/Quest";
  8  |  import { Room } from "../entities/implementations/Room";
  9  |  import { logger } from "../../../utils/logger";
     |                          ^
  10 |  export class EntityFactory {
  11 |    constructor() {
      at TransformPluginContext._formatError (file:///home/project/node_modules/vite/dist/node/chunks/dep-CDnG8rE7.js:49242:41)
      at TransformPluginContext.error (file:///home/project/node_modules/vite/dist/node/chunks/dep-CDnG8rE7.js:49237:16)
      at normalizeUrl (file:///home/project/node_modules/vite/dist/node/chunks/dep-CDnG8rE7.js:64033:23)
      at async eval (file:///home/project/node_modules/vite/dist/node/chunks/dep-CDnG8rE7.js:64165:39)
      at async TransformPluginContext.transform (file:///home/project/node_modules/vite/dist/node/chunks/dep-CDnG8rE7.js:64092:7)
      at async PluginContainer.transform (file:///home/project/node_modules/vite/dist/node/chunks/dep-CDnG8rE7.js:49083:18)
      at async loadAndTransform (file:///home/project/node_modules/vite/dist/node/chunks/dep-CDnG8rE7.js:51916:27)
11:04:59 [vite] Pre-transform error: Failed to resolve import "../../../utils/logger" from "src/domain/factories/EntityFactory.ts". Does the file exist?
