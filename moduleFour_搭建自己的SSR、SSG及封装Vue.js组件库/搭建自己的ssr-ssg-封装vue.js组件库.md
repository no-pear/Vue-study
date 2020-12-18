### 3-4-1 搭建自己的 SSR

### 3-4-2 静态站点生成

### 3-4-3 封装 Vue.js 组件库

#### 1）CDD

+ 自上而下
+ 从组件级别开始，到页面级别结束

#### 2）处理组件的边界情况

+ $root  访问vue根实例
+ $parent / \$children
+ $refs
+ 依赖注入 provide / inject

#### 3）$attrs / \$listeners

+ $attrs
  + 把父组件中非 prop 属性绑定到内部组件
+ $listeners
  + 把父组件中的 DOM 对象的原生事件绑定到内部组件

#### 4）快速原型开发

+ VueCLI 中提供了一个插件可以进行原型快速开发
+ 需要先额外安装一个全局的扩展
  + npm install -g @vue/cli-service-global
+ 使用 vue serve 快速查看组件的运行效果
+ vue serve 如果不指定参数默认会在当前目录找以下的入口文件
  + main.js  index.js   App.vue   app.vue
+ 可以指定要加载的组件
  + vue serve ./src/login.vue

#### 5）安装 element UI

+ 初始化 package.json
  + npm init -y
+ 安装 element UI
  + vue add element
+ 加载 element UI，使用 Vue.use() 安装插件

#### 6）两种项目的组织方式

+ Multirepo  每一个包对应一个项目
+ Monorepo  一个项目仓库中管理多个模块 / 包

#### 7）目录结构

![image-20201126145843430](D:\lagou\lg_phase_one\partThree_vue\moduleFour_搭建自己的SSR、SSG及封装Vue.js组件库\imgs\package-lock.json)

#### 8）Storybook

+ 可视化的组件展示平台
+ 在隔离的开发环境中，以交互式的方式展示组件
+ 独立开发组件
+ 支持的框架
  + React, React Native, Vue, Angular
  + Ember, Html, Svelte, Mithril, Riot

#### 9）Storybook安装

+ 自动安装
  + npx -p @storybook/cli sb init --type vue
  + yarn add vue
  + vue yarn add vue-loader vue-template-compiler --dev
+ 手动安装

#### 10）开启 yarn 的工作区

+ 项目根目录的 package.json

```json
"private": true,
"workspaces": [
    "./packages/*"
]
```

#### 11）yarn workspaces 使用

+ 给工作区根目录安装开发依赖
  + yarn add jest -D -W
+ 给指定工作区安装依赖
  + yarn workspace lg-button add lodash@4
+ 给所有的工作区安装依赖
  + yarn install

#### 12）Lerna 介绍

+ Lerna 是一个优化使用 git 和 npm 管理多包仓库的工作流工具
+ 用于管理具有多个包的 JavaScript 项目
+ 它可以一键把代码提交到 git 和 npm 仓库

#### 13）Lerna 使用

+ 全局安装
  + yarn global add lerna
+ 初始化
  + lerna init
+ 发布
  + lerna publish

### 3-4-4 Rollup

#### 1）简介