# Vue.js + Vuex + TypeScript

## 搭建项目结构

### 一、创建项目

#### 1）使用 Vue CLI 创建项目

+ 安装 Vue CLI

```
npm i @vue/cli -g
```

+ 创建项目

```
1. vue create xxx

2. 选择相应的配置

3. cd xxx // 进入你的项目目录

4. npm run serve // 启动开发服务
```



#### 2）加入 Git 版本管理

+ 创建远程仓库
+ 将本地仓库推到线上

```
1. git init // 创建本地仓库

2. git add . // 将文件添加到暂存区

3. git commit -m 'xxx' // 提交历史记录

4. git remote add origin 远程仓库地址 // 添加远端仓库地址

5. git branch -M main // 更改分支名

6. git push -u origin main // 推送提交


```



#### 3）初始目录结构说明

默认生成的目录结构我们进行一些小的调整：

+ 删除初始化的默认文件
  + src/views/About.vue 
  + src/views/Home.vue
  + src/components/HelloWorld.vue 
  + src/assets/logo.png 
+ 新增调整我们需要的目录结构
  + src/services ⽬录，接⼝模块
  + src/utils ⽬录，存储⼀些⼯具模块 
  + src/styles ⽬录，存储⼀些样式资源 
+ 修改 `App.vue`

```vue
<template>
  <div id="app">
    <h1>hello world</h1>
    <!-- 跟路由出口 -->
    <router-view/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  
})
</script>

<style lang="scss" scoped>

</style>

```



+ 修改 `router/index.ts`

```tsx
import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

Vue.use(VueRouter)

// 路由配置规则
const routes: Array<RouteConfig> = []

const router = new VueRouter({
  routes
})

export default router

```

+ 最终目录结构：

```

```

#### 4）TypeScript 相关配置介绍

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



### 二、代码格式规范

#### 1）标准是什么

没有绝对的标准，下面给大家提供一些大厂制定的编码规范：

+ [JavaScript Standard Style](https://standardjs.com/)
+ [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
+ [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)

#### 2）项目中的代码规范

`.eslintrc.js`

```js
module.exports = {
  root: true,
  env: {
    node: true
  },
  // 使用插件的编码校验规则
  extends: [
    'plugin:vue/essential', // eslint-plugin-vue
    '@vue/standard', // @vue/eslint-config-standard
    '@vue/typescript/recommended' // @vue/eslint-config-typescript
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  // 自定义编码校验规则
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}

```

+ eslint-plugin-vue

  + GitHub 仓库：https://github.com/vuejs/eslint-plugin-vue
  + 官⽅⽂档：https://eslint.vuejs.org/ 
  + 该插件使我们可以使⽤ ESLint 检查 .vue ⽂件的 <template> 和 <script> 
  + 查找语法错误 
  + 查找对Vue.js指令的错误使⽤ 
  + 查找违反Vue.js样式指南的⾏为 

+ @vue/eslint-config-standard

  + [JavaScript Standard Style](https://standardjs.com/)

+ @vue/eslint-config-typescript

  + 规则列表：https://github.com/typescript-eslint/typescript- 

    eslint/tree/master/packages/eslint-plugin#supported-rules 

#### 3）自定义校验规则

[ESLint](https://cn.eslint.org/docs/user-guide)

ESLint 附带有大量的规则。你可以使用注释或配置文件修改你项目中要使用的规则。要改变一个规则设置，你必须将规则 ID 设置为下列值之一：

- `"off"` 或 `0` - 关闭规则
- `"warn"` 或 `1` - 开启规则，使用警告级别的错误：`warn` (不会导致程序退出)
- `"error"` 或 `2` - 开启规则，使用错误级别的错误：`error` (当被触发的时候，程序会退出)

**Using Configuration Comments**

为了在文件注释里配置规则，使用以下格式的注释：

```
/* eslint eqeqeq: "off", curly: "error" */
```

在这个例子里，[`eqeqeq`](https://cn.eslint.org/docs/rules/eqeqeq) 规则被关闭，[`curly`](https://cn.eslint.org/docs/rules/curly) 规则被打开，定义为错误级别。你也可以使用对应的数字定义规则严重程度：

```
/* eslint eqeqeq: 0, curly: 2 */
```

这个例子和上个例子是一样的，只不过它是用的数字而不是字符串。`eqeqeq` 规则是关闭的，`curly` 规则被设置为错误级别。

如果一个规则有额外的选项，你可以使用数组字面量指定它们，比如：

```
/* eslint quotes: ["error", "double"], curly: 2 */
```

这条注释为规则 [`quotes`](https://cn.eslint.org/docs/rules/quotes) 指定了 “double”选项。数组的第一项总是规则的严重程度（数字或字符串）。

**Using Configuration Files**

还可以使用 `rules` 连同错误级别和任何你想使用的选项，在配置文件中进行规则配置。例如：

```
{
    "rules": {
        "eqeqeq": "off",
        "curly": "error",
        "quotes": ["error", "double"]
    }
}
```

### 三、基础样式处理

#### 1）导入 element 组件库

[Element - 网站快速成型工具](https://element.eleme.cn/#/zh-CN)

+ 安装 `npm i element-ui -S`
+ 完整引入

```js
// main.js
import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';

Vue.use(ElementUI);

new Vue({
  el: '#app',
  render: h => h(App)
});
```

#### 2）样式处理

```
src/styles
├── index.scss # 全局样式（在⼊⼝模块被加载⽣效） 
├── mixin.scss # 公共的 mixin 混⼊（可以把重复的样式封装为 mixin 混⼊到复⽤ 的地⽅） 
├── reset.scss # 重置基础样式 5 └── variables.scss # 公共样式变量
```

**variables.scss**

```scss
$primary-color: #40586F;
$success-color: #51cf66;
$warning-color: #fcc419;
$danger-color: #ff6b6b;
$info-color: #868e96; // #22b8cf;

$body-bg: #E9EEF3; // #f5f5f9;

$sidebar-bg: #F8F9FB;
$navbar-bg: #F8F9FB;

$font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;

```

**index.scss**

```scss
@import './variables.scss';

// globals
html {
  font-family: $font-family;
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  // better Font Rendering
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  background-color: $body-bg;
}

// custom element theme
$--color-primary: $primary-color;
$--color-success: $success-color;
$--color-warning: $warning-color;
$--color-danger: $danger-color;
$--color-info: $info-color;
// change font path, required
$--font-path: '~element-ui/lib/theme-chalk/fonts';
// import element default theme
@import '~element-ui/packages/theme-chalk/src/index';
// node_modules/element-ui/packages/theme-chalk/src/common/var.scss

// overrides

// .el-menu-item, .el-submenu__title {
//   height: 50px;
//   line-height: 50px;
// }

.el-pagination {
  color: #868e96;
}

// components

.status {
  display: inline-block;
  cursor: pointer;
  width: .875rem;
  height: .875rem;
  vertical-align: middle;
  border-radius: 50%;

  &-primary {
    background: $--color-primary;
  }

  &-success {
    background: $--color-success;
  }

  &-warning {
    background: $--color-warning;
  }

  &-danger {
    background: $--color-danger;
  }

  &-info {
    background: $--color-info;
  }
}

```



#### 3） 共享全局样式变量

[向预处理器-loader-传递选项](https://cli.vuejs.org/zh/guide/css.html#%E5%90%91%E9%A2%84%E5%A4%84%E7%90%86%E5%99%A8-loader-%E4%BC%A0%E9%80%92%E9%80%89%E9%A1%B9)

```js
module.exports = {
    css: {
      loaderOptions: {
        // 给 sass-loader 传递选项
        // sass: {
        //   // @/ 是 src/ 的别名
        //   // 所以这里假设你有 `src/variables.sass` 这个文件
        //   // 注意：在 sass-loader v8 中，这个选项名是 "prependData"
        //   additionalData: `@import "~@/variables.sass"`
        // },
        // 默认情况下 `sass` 选项会同时对 `sass` 和 `scss` 语法同时生效
        // 因为 `scss` 语法在内部也是由 sass-loader 处理的
        // 但是在配置 `prependData` 选项的时候
        // `scss` 语法会要求语句结尾必须有分号，`sass` 则要求必须没有分号
        // 在这种情况下，我们可以使用 `scss` 选项，对 `scss` 语法进行单独配置
        scss: {
            prependData: `@import "~@/styles/variables.scss";`
        },
        
      }
    }
  }
```

### 四、与服务端交互

#### 1）配置后端代理

后台为我们提供了数据接⼝，分别是：

+ http://eduboss.lagou.com 
+ http://edufront.lagou.com

这两个接⼝都没有提供 CORS 跨域请求，所以需要在客户端配置服务端代理处理跨域请求。 

配置客户端层⾯的服务端代理跨域可以参考官方文档中的说明：

+ https://cli.vuejs.org/zh/config/#devserver-proxy 
+ https://github.com/chimurai/http-proxy-middleware 

#### 2）封装请求模块

+ 安装 **axios**    `npm i axios`
+ `src/utils/request.ts`

```ts
import axios from 'axios'

const request = axios.create({
  // 配置选项
  // baseURL,
  // timeout
})

// 请求拦截器

// 响应拦截器

export default request

```



### 五、布局

#### 1）初始化路由页面组件

| 路径          | 说明       |
| ------------- | ---------- |
| /             | 首页       |
| /login        | 用户登录   |
| /role         | 角色管理   |
| /menu         | 菜单管理   |
| /resource     | 资源管理   |
| /course       | 课程管理   |
| /user         | 用户管理   |
| /advert       | 广告管理   |
| /advert-space | 广告位管理 |
| *             | 404        |

`src/router/index.ts`

```ts
import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Layout from '@/layout/index.vue'

Vue.use(VueRouter)

// 路由配置规则
const routes: Array<RouteConfig> = [
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: 'login' */ '@/views/login/index.vue')
  },
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '', // 默认子路由
        name: 'home',
        component: () => import(/* webpackChunkName: 'home' */ '@/views/home/index.vue')
      },
      {
        path: '/role',
        name: 'role',
        component: () => import(/* webpackChunkName: 'role' */ '@/views/role/index.vue')
      },
      {
        path: '/menu',
        name: 'menu',
        component: () => import(/* webpackChunkName: 'menu' */ '@/views/menu/index.vue')
      },
      {
        path: '/resource',
        name: 'resource',
        component: () => import(/* webpackChunkName: 'resource' */ '@/views/resource/index.vue')
      },
      {
        path: '/course',
        name: 'course',
        component: () => import(/* webpackChunkName: 'course' */ '@/views/course/index.vue')
      },
      {
        path: '/user',
        name: 'user',
        component: () => import(/* webpackChunkName: 'user' */ '@/views/user/index.vue')
      },
      {
        path: '/advert',
        name: 'advert',
        component: () => import(/* webpackChunkName: 'advert' */ '@/views/advert/index.vue')
      },
      {
        path: '/advert-space',
        name: 'advert-space',
        component: () => import(/* webpackChunkName: 'advert-space' */ '@/views/advert-space/index.vue')
      }
    ]
  },
  {
    path: '*',
    name: '404',
    component: () => import(/* webpackChunkName: '404' */ '@/views/error/index.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router

```

**页面目录结构**

![image-20201224111302404](D:\lagou\lg_phase_one\partThree_vue\moduleSix_Vue.js+Vuex+TypeScript 项目实战\images\image-20201224111302404.png)

#### 2）Container 布局容器

`src/layout/index.vue`

```vue
<template>
  <el-container>
    <el-aside width="200px">Aside</el-aside>
    <el-container>
      <el-header>Header</el-header>
      <el-main>Main</el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'LayoutIndex'
})
</script>

<style lang="scss" scoped>
.el-container {
    min-height: 100vh;
}
.el-aside {
    background-color: #D3DCE6
}
.el-header {
    background-color: #B3C0D1
}
.el-main {
    background-color: #E9EEF3
}
</style>

```

