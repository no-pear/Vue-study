### 3-3-1 Vuex 状态管理

#### 1）状态管理

+ state，驱动应用的数据源
+ view，以声明的方式将 state 映射到视图
+ action，响应在 view 上的用户输入导致的状态变化
+ ![image-20201028162459781](D:\lagou\lg_phase_one\partThree_vue\moduleThree_Vuex数据流管理及Vue.js服务端渲染\imgs\image-20201028162459781.png)

#### 2）组件间通信方式回顾

+ 父组件给子组件传值
  + 子组件通过 props 接收数据
  + 父组件中给子组件通过相应属性传值
+ 子组件给父组件传值
+ 不相干组件之间传值
  + eventbus
  + ref
    + 在普通 HTML 标签上使用 ref， 获取到的是 DOM
    + 在组件标签上使用 ref， 获取到的是组件实例

#### 3）Vuex

![image-20201028174217296](D:\lagou\lg_phase_one\partThree_vue\moduleThree_Vuex数据流管理及Vue.js服务端渲染\imgs\image-20201028174217296.png)

+ Store
+ State
+ Getter
+ Mutation
+ Action
+ Module

```js
// App.vue
<template>
  <div id="app">
    <h1>Vuex - Demo</h1>
    <!-- count：{{ $store.state.count }} <br>
    msg: {{ $store.state.msg }} -->
    <!-- count：{{ count }} <br>
    msg: {{ msg }} -->

    count：{{ num }} <br>
    msg: {{ message }}

    <h2>Getter</h2>
    <!-- reverseMsg: {{ $store.getters.reverseMsg }} -->
    reverseMsg: {{ reverseMsg }}

    <h2>Mutation</h2>
    <!-- <button @click="$store.commit('increate', 2)">Mutation</button> -->
    <button @click="increate(3)">Mutation</button>

    <h2>Action</h2>
    <!-- <button @click="$store.dispatch('increateAsync', 5)">Action</button> -->
    <button @click="increateAsync(6)">Action</button>

    <h2>Module</h2>
    <!-- products: {{ $store.state.products.products }} <br>
    <button @click="$store.commit('setProducts', [])">Mutation</button> -->
    products: {{ products }} <br>
    <button @click="setProducts([])">Mutation</button>

    <h2>strict</h2>
    <button @click="$store.state.msg = 'Lagou'">strict</button>
  </div>
</template>
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
export default {
  computed: {
    // count: state => state.count
    // ...mapState(['count', 'msg'])
    ...mapState({ num: 'count', message: 'msg' }),
    ...mapGetters(['reverseMsg']),
    ...mapState('products', ['products'])
  },
  methods: {
    ...mapMutations(['increate']),
    ...mapActions(['increateAsync']),
    ...mapMutations('products', ['setProducts'])
  }
}
</script>
<style>

</style>

```

```ja
// store/index.js
import Vue from 'vue'
import Vuex from 'vuex'
import products from './modules/products'
import cart from './modules/cart'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    count: 0,
    msg: 'Hello Vuex'
  },
  getters: {
    reverseMsg (state) {
      return state.msg.split('').reverse().join('')
    }
  },
  mutations: {
    increate (state, payload) {
      state.count += payload
    }
  },
  actions: {
    increateAsync (context, payload) {
      setTimeout(() => {
        context.commit('increate', payload)
      }, 2000)
    }
  },
  modules: {
    products,
    cart
  }
})


// store/modules/carts.js
const state = {}
const getters = {}
const mutations = {}
const actions = {}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}


// store/modules/products.js
const state = {
  products: [
    { id: 1, title: 'iPhone 11', price: 8000 },
    { id: 2, title: 'iPhone 12', price: 10000 }
  ]
}
const getters = {}
const mutations = {
  setProducts (state, payload) {
    state.products = payload
  }
}
const actions = {}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

```



#### 4）Vuex 插件

+ Vuex 的插件就是一个函数
+ 这个函数接收一个 store 的参数

```js
// store/index.js
const myPlugin = store = > {
    // 当 store 初始化后调用
    store.subscribe((mutation, state) => {
        // 每次 mutation 之后调用
        // mutation 的格式为 {type, payload}
        if (mutation.type.startsWith('cart/')) {
      window.localStorage.setItem('cart-products', JSON.stringify(state.cart.cartProducts))
    }
    })
}

const store = new Vuex.Store({
    // ...
    plugins: [myplugin]
})
```

#### 5）模拟 Vuex 

```js
// myvuex/index.js
let _Vue = null
class Store {
  constructor (options) {
    const {
      state = {},
      getters = {},
      mutations = {},
      actions = {}
    } = options
    this.state = _Vue.observable(state)
    this.getters = Object.create(null)
    Object.keys(getters).forEach(key => {
      Object.defineProperty(this.getters, key, {
        get: () => getters[key](state)
      })
    })
    this._mutations = mutations
    this._actions = actions
  }

  commit (type, payload) {
    this._mutations[type](this.state, payload)
  }

  dispatch (type, payload) {
    this._actions[type](this, payload)
  }
}

function install (Vue) {
  _Vue = Vue
  _Vue.mixin({
    beforeCreate () {
      if (this.$options.store) {
        _Vue.prototype.$store = this.$options.store
      }
    }
  })
}

export default {
  Store,
  install
}

```



### 3-3-2 服务端渲染基础

#### 1）SPA 单页面应用

+ 优点
  + 用户体验好
  + 开发效率高
  + 渲染性能好
  + 可维护性好
+ 缺点
  + 首屏渲染时间长
  + 不利于 SEO

#### 2）同构应用

+ 通过服务端渲染首屏直出，解决 SPA 应用首屏渲染慢以及不利于 SEO 问题
+ 通过该客户端渲染接管页面内容交互得到更好的用户体验
+ 这种方式通常称之为现代化的服务端渲染，也叫同构渲染
+ 这种方式构建的应用称之为服务端渲染应用或者是同构应用

#### 3）传统的服务端渲染

`早期的 Web 页面渲染都是在服务端进行的`

![image-20201029191551177](D:\lagou\lg_phase_one\partThree_vue\moduleThree_Vuex数据流管理及Vue.js服务端渲染\imgs\image-20201029191551177.png)

+ 前后端代码完全耦合在一起，不利于开发和维护
+ 前端没有足够发挥空间
+ 服务端压力大
+ 用户体验一般

#### 4）客户端渲染

![image-20201029194300525](D:\lagou\lg_phase_one\partThree_vue\moduleThree_Vuex数据流管理及Vue.js服务端渲染\imgs\image-20201029194300525.png)

+ **后端** 负责处理数据接口
+ **前端** 负责将接口数据渲染到页面中

**前端** 更为 **独立**，不在受限制于 **后端**

+ 缺点
  + 首屏渲染慢
  + 不利于 SEO

#### 5）同构渲染

+ 基于 React，Vue 等框架，客户端渲染和服务器端渲染的结合
  + 在服务器端执行一次，用于实现服务器端渲染（首屏直出）
  + 在客户端再执行一次，用于接管页面交换
+ 核心解决 SEO 和首屏渲染慢的问题
+ 拥有传统服务端渲染的优点，也有客户端渲染的优点

![image-20201030143242946](D:\lagou\lg_phase_one\partThree_vue\moduleThree_Vuex数据流管理及Vue.js服务端渲染\imgs\image-20201030143242946.png)

### 3-3-3 Nuxt.js 基础

#### 1）基本介绍

+ 一个基于 Vue.js 生态的第三方开源服务端渲染应用框架
+ 他可以帮我们轻松的使用 Vue.js 技术栈构建同构应用
+ [官网](https://zh.nuxtjs.org/)
+ [GitHub 仓库](https://github.com/nuxt/nuxt.js)

#### 2) 基础使用

+ 初始项目
  + [官方文档](https://zh.nuxtjs.org/guide/installation)
  + 方式一：使用 create-nuxt-app
  + 方式二：手动创建
+ 已有的 Node.js 服务端项目
  + 直接把 Nuxt 当做一个中间件集成到 Node Web Server 中
+ 现有的 Vue.js 项目
  + 非常熟悉 Nuxt.js
  + 至少百分之 10 的代码改动

#### 3）路由

[官方文档](https://zh.nuxtjs.org/guide/routing)

+ 基础路由

```
// 目录
pages/
--| user/
-----| index.vue
-----| one.vue
--| index.vue
```

```js
// Nuxt.js 自动生成的路由配置如下
router: {
  routes: [
    {
      name: 'index',
      path: '/',
      component: 'pages/index.vue'
    },
    {
      name: 'user',
      path: '/user',
      component: 'pages/user/index.vue'
    },
    {
      name: 'user-one',
      path: '/user/one',
      component: 'pages/user/one.vue'
    }
  ]
}
```

+ 动态路由

在 Nuxt.js 里面定义带参数的动态路由，需要创建对应的**以下划线作为前缀**的 Vue 文件 或 目录。

+ 嵌套路由

创建内嵌子路由，你需要添加一个 Vue 文件，同时添加一个**与该文件同名**的目录用来存放子视图组件。

**Warning:** 别忘了在父组件(`.vue`文件) 内增加 `<nuxt-child/>` 用于显示子视图内容。

#### 4）Nuxt.js 视图

[官方文档](https://zh.nuxtjs.org/guide/views)

+ 结构

![image-20201030171635102](D:\lagou\lg_phase_one\partThree_vue\moduleThree_Vuex数据流管理及Vue.js服务端渲染\imgs\image-20201030171635102.png)

+ 模板

定制化默认的 html 模板，只需要在 src 文件夹下（默认是应用根目录）创建一个 `app.html` 的文件

```js
<!DOCTYPE html>
<html {{ HTML_ATTRS }}>
  <head {{ HEAD_ATTRS }}>
    {{ HEAD }}
  </head>
  <body {{ BODY_ATTRS }}>
    // 默认的内容最终会注入到这里
    {{ APP }}
  </body>
</html>
```



+ 布局

可通过添加 `layouts/default.vue` 文件来扩展应用的默认布局。

**提示:** 别忘了在布局文件中添加 `<nuxt/>` 组件用于显示页面的主体内容。

```js
<template>
  <div>
    <div>我的博客导航栏在这里</div>
	//页面出口，类似于子路由出口
    <nuxt />
  </div>
</template>
```



+ 页面

#### 5）异步数据 --- asyncData

+ 基本用法
  + 它会将 asyncData 返回的数据融合组件 data 方法返回数据一并给组件
  + 调用时机：**服务端渲染期间 **和 **客户端路由更新之前**
+ 注意事项
  + 只能在页面组件中使用
  + 没有 this，因为它是在组件初始化之前被调用的

#### 6）异步数据 --- 上下文对象

### 3-3-4 Nuxt.js 综合案例

[gothinkster/realworld](gothinkster/realworld)   一个功能完整的web示例程序，包含注册登录、标签、分类、文章发布、评论等功能。

#### 1）案例相关资源

+ [页面模板](https://github.com/gothinkster/realworld-starter-kit/blob/master/FRONTEND_INSTRUCTIONS.md)

+ [接口文档](https://github.com/gothinkster/realworld/tree/master/api)

#### 2）创建项目

+ mkdir realworld-nuxtjs
+ npm init -y
+ npm i nuxt
+ 配置启动脚本
+ 创建 pages 目录

#### 3）导入页面模板

+ 导入样式资源
+ 配置布局组件
+ 配置页面组件

#### 4）登录/注册

+ 封装请求方法
+ 登录/注册 表单验证
+ 登录/注册 错误处理
+ 用户注册
+ 登录状态存储到容器中
+ 登录状态持久化
+ 处理导航栏链接展示状态
+ 处理页面访问权限

#### 5）首页

+ 展示公共文章列表
+ 列表分页-分页参数的使用
+ 列表分页-页码处理
+ 展示文章标签列表
+ 处理标签列表链接和数据
+ 处理文章列表导航栏-展示状态、标签高亮及链接
+ 展示用户关注的文章列表
+ 统一设置用 token
+ 文章发布时间格式化处理
+ 文章点赞

#### 6）文章详情

+ 展示基本信息
+ 把 Markdown 转为 HTML
+ 展示文章作者相关信息
+ 设置页面 meta 优化 SEO
+ 通过客户端渲染展示评论列表

#### 7）发布部署 - Nuxt.js 应用

+ 打包
  + nuxt    启动一个热加载的 Web 服务器（开发模式） [localhost:3000](http://localhost:3000/)。
  + nuxt build    利用 webpack 编译应用，压缩 JS 和 CSS 资源（发布用）。
  + nuxt start    以生产模式启动一个 Web 服务器 (需要先执行`nuxt build`)。
  + nuxt generate    编译应用，并依据路由配置生成对应的 HTML 文件 (用于静态站点的部署)。
+ 最简单的部署方式
  + 配置 Host + Port
  + 压缩发布包
  + 把发布包传到服务器
  + 解压
  + 安装依赖
  + 启动服务
+ 使用 pm2 启动 Node 服务
  + [官方文档](https://pm2.io/)
  + 安装：npm install pm2 -g
  + 启动：pm2 start 脚本路径
  + 常用命令
    + pm2 list   查看应用列表
    + pm2 start   启动应用
    + pm2 stop    停止应用
    + pm2 reload   重载应用
    + pm2 restart    重启应用
    + pm2 delete    删除应用

#### 8）自动化部署(CI/CD)

![image-20201105191138782](D:\lagou\lg_phase_one\partThree_vue\moduleThree_Vuex数据流管理及Vue.js服务端渲染\imgs\image-20201105191138782.png)

+ Jenkins
+ Gitlab CI
+ GitHub CI
+ Travis CI
+ Circle CI
+ ...

#### 9）GitActions

+ 生成：https://github.com/settings/tokens
+ 配置到项目的 Secrets 中：https://github.com/no-pear/realworld-nuxtjs/settings/secrets

#### 10）配置 GitHub Actions 执行脚本

+ 在项目根目录创建 .github/workflows 目录
+ 下载 main.yml 到 workflows 目录中
  + https://gist.github.com/lipengzhou/b92f80142afa37aea397da47366bd872
+ 修改配置
+ 配置 pm2 配置文件
+ 提交更新
+ 查看自动部署状态
+ 访问网站
+ 提交更新