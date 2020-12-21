# Vue.js + Vuex + TypeScript

## 搭建项目结构

### 一、创建项目

#### 1）使用 Vue CLI 创建项目

#### 2）加入 Git 版本管理

#### 3）初始目录结构说明

#### TypeScript 相关配置介绍

+ 依赖项

| dependencies           | 说明                                      |
| ---------------------- | ----------------------------------------- |
| vue-class-component    | 提供使用 **Class** 语法写 Vue 组件        |
| vue-property-decorator | 在 Class 语法基础之上提供了一些辅助装饰器 |

| DevDependencies                  | 说明                                                         |
| -------------------------------- | ------------------------------------------------------------ |
| @typescript-eslint/eslint-plugin | 使用 **ESLint** 校验 TypeScript 代码                         |
| @typescript-eslint/parser        | 将 TypeScript 转为 AST 供 ESLint 校验使用                    |
| @vue/cli-plugin-typescript       | 使用 TypeScript + ts-loader + fork-ts-checker-webpack-plugin 进行更快的类型检查 |
| @vue/eslint-config-typescript    | 兼容 ESLint 的 TypeScript  校验规则                          |
| typescript                       | TypeScript 编辑器，提供类型校验和转换 JavaScript 功能        |

+ TypeScript 配置文件 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "strict": true,
    "jsx": "preserve",
    "importHelpers": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "baseUrl": ".",
    "types": [
      "webpack-env"
    ],
    "paths": {
      "@/*": [
        "src/*"
      ]
    },
    "lib": [
      "esnext",
      "dom",
      "dom.iterable",
      "scripthost"
    ]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "tests/**/*.ts",
    "tests/**/*.tsx"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

+ shims-vue.d.ts

```tsx
// 主要用于 TypeScript 识别 .vue 文件模块
// TypeScript 默认不支持导入 .vue 模块，这个文件告诉 TypeScript 导入 .vue 文件模块都按 VueConstructor<Vue> 类型识别出来
declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

```



+ shims-tsx.d.ts

```tsx
// 为 jsx 组件模板补充类型声明
import Vue, { VNode } from 'vue'

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}

```

