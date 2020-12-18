### 3-1-1 Vue.js基础回顾

#### 1）vue.js 基础结构

#### 2）vue.js 生命周期

#### 3）vue.js 语法和概念

+ 差值表达式
+ 指令
+ 计算属性和侦听器
+ Class 和 Style 绑定
+ 条件渲染、列表渲染
+ 表单输入绑定
+ 组件
+ 插槽
+ 插件（vue-router, vuex)
+ 混入 mixin
+ 深入响应式原理
+ 不同构件版本的 Vue

### 3-1-2-1 Vue-Router 基础回顾

#### 1) Vue-Router 基础回顾

```
1. 创建视图组件
2. 注册路由插件  
import VueRouter from 'vue-router'
Vue.use(VueRouter)
3. 创建路由对象，配置规则
4. 通过 router-view 设置占位
5. 通过 router-link 创建连接
```

+ $route 路由规则
+ $router 路由对象，一些信息（mode) 和 方法 （push, go)

#### 2）动态路由

```js
// router/index.js
{
    path: '/detail/:id',
    name: 'Detail',
    // 开启 props，会把 URL 中的参数传递给组件
    // 在组件中通过 props 来接收 URL 参数
    props: true,
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "detail" */ '../views/Detail.vue')
  }

// Detail.vue
<template>
  <div>
    <!-- 方式1： 通过当前路由规则，获取数据 -->
    通过当前路由规则获取：{{ $route.params.id }}

    <br>
    <!-- 方式2：路由规则中开启 props 传参 -->
    通过开启 props 获取：{{ id }}
  </div>
</template>

<script>
export default {
  name: 'Detail',
  props: ['id']
}
</script>
```

#### 3) 嵌套路由

```js
// router/index.js
// 嵌套路由
  {
    path: '/',
    component: Layout,
    children: [
      {
        name: 'index',
        path: '',
        component: Index
      },
      {
        name: 'detail',
        path: 'detail/:id',
        props: true,
        component: () => import('@/views/Detail.vue')
      }
    ]
  }
```



#### 4) 编程式导航

+    this.$router.push({ name: 'Detail', params: { id: 1 } })
+    this.$router.replace('/login')
+    this.$router.go(-2)

#### 5）Hash 和 History 模式区别（客户端路由实现方式）

+ Hash

  + 基于锚点，以及 onhashchange 事件

+ History

  + 基于 HTML5 中的 History API
    + history.pushState()  // IE10 以后才支持
    + history.replaceState()
  + 使用
    + 需要服务器的支持
    + 单页应用中，服务端不存在 http:// www.testurl.com/login 这样的地址会返回找不到该页面
    + 在服务端应该除了静态资源都返回单页应用的 index.html
  + node.js 配置

  ```js
  // 导入处理 history 模式的模块
  const history = require('connect-history-api-fallback')
  // 注册处理 history 模式的中间件
  app.use(history())
  ```

  + nginx 配置

  ```js
  // nginx.conf
  
  location / {
              root   html;
              index  index.html index.htm;
              try_files $uri $uri/ /index.html;
          }
  ```

  



### 3-1-2-2 Vue Router实现原理

#### 1) 基本原理

+ hash
  + URL 中 # 后面的内容作为路径地址
  + 监听 hashchange 事件
  + 根据当前路由地址找到对应组件重新渲染
+ history
  + 通过 history.pushState() 方法改变地址栏
  + 监听 popState 事件
  + 根据当前路由地址找到对应组件重新渲染

#### 2）模拟实现

#### 1）Vue 的构建版本

+ 运行时版：不支持 template 模板，需要打包的时候提前编译（vue-cli 创建的项目默认是 运行时版）
+ 完整版：包含运行时和编译器，体积比运行时版大 10k 左右，程序运行的时候把模板转换成 render 函数

```js
import Vue from 'vue'
console.dir(Vue)
let _Vue = null
export default class VueRouter {
  // 实现 vue 的插件机制
  static install(Vue) {
    //1 判断当前插件是否被安装
    if (VueRouter.install.installed) {
      return;
    }
    VueRouter.install.installed = true
    //2 把Vue的构造函数记录在全局
    _Vue = Vue
    //3 把创建Vue的实例传入的router对象注入到Vue实例
    // _Vue.prototype.$router = this.$options.router
    // 混入
    _Vue.mixin({
      beforeCreate() {
        if (this.$options.router) {
          _Vue.prototype.$router = this.$options.router

        }
      }
    })
  }

  // 初始化属性
  constructor(options) {
    this.options = options // options 记录构造函数传入的对象
    this.routeMap = {} // routeMap 路由地址和组件的对应关系
    // observable     data 是一个响应式对象
    this.data = _Vue.observable({
      current: "/" // 当前路由地址
    })
    this.init()

  }

  // 调用 createRouteMap, initComponent, initEvent 三个方法
  init() {
    this.createRouteMap()
    this.initComponent(_Vue)
    this.initEvent()
  }

  // 用来初始化 routeMap 属性，路由规则转换为键值对
  createRouteMap() {
    //遍历所有的路由规则 把路由规则解析成键值对的形式存储到routeMap中
    this.options.routes.forEach(route => {
      this.routeMap[route.path] = route.component
    });
  }

  // 用来创建 router-link 和 router-view 组件
  initComponent(Vue) {
    // router-link 组件
    Vue.component('router-link', {
      props: {
        to: String
      },
      // 模板 --- 需要 vue 完整版
      // 在 vue.config.js 中设置 runtimeCompiler: true,  
      // template: '<a :href="to"><slot></slot></a>'

      // render --- 可在 vue 运行时版直接使用
      render(h) {
        // h(选择器（标签的名字）， 属性，生成的某个标签的内容)
        return h('a', {
          attrs: {
            href: this.to,
          },
          // 注册事件
          on: {
            click: this.clickHandler // 点击事件
          },
        }, [this.$slots.default]) // this.$slot.default 默认插槽
      },
      methods: {
        clickHandler(e) {
          // history.pushState(事件对象，网页标题，url地址)
          history.pushState({}, '', this.to)
          this.$router.data.current = this.to
          e.preventDefault() // preventDefault 阻止事件的默认行为
        }
      }
    });
    // router-view 组件
    const self = this; //这里的 this 指向 vueRouter 实例
    Vue.component('router-view', {
      render(h) {
        // 根据 routerMap 中的对应关系，拿到当前路由地址所对应的组件
        const component = self.routeMap[self.data.current]
        return h(component)
      }
    })
  }

  // 用来注册 popstate 事件
  initEvent () {
      window.addEventListener('popstate', () => {
          // 当前 url 地址的 pathname 部分赋值给 data.current
          this.data.current = window.location.pathname
      })
  }
}

```



### 3-1-3-1 Vue.js 响应式原理

#### 1）数据响应式

+ 数据模型仅仅是普通的 JavaScript 对象，而当我们修改数据时，视图会进行更新，避免了频繁的 DOM 操作，提高开发效率

#### 2）双向绑定

+ 数据改变，视图改变；视图改变，数据也随之改变
+ 我们可以使用 v-model 在表单元素上创建双向数据绑定

#### 3）数据驱动是 Vue 最独特的特性之一

+ 开发过程中仅需要关注数据本身，不需要关心数据是如何渲染到视图

#### 4）数据响应式核心原理 ---- Vue2 ---- Object.defineProperty

```js
// 模拟 Vue 中的 data 选项
    let data = {
      msg: 'hello',
      count: 10
    }

    // 模拟 Vue 的实例
    let vm = {}

    proxyData(data)

    function proxyData(data) {
      // 遍历 data 对象的所有属性
      Object.keys(data).forEach(key => {
        // 把 data 中的属性，转换成 vm 的 setter/setter
        Object.defineProperty(vm, key, {
          enumerable: true,
          configurable: true,
          get () {
            console.log('get: ', key, data[key])
            return data[key]
          },
          set (newValue) {
            console.log('set: ', key, newValue)
            if (newValue === data[key]) {
              return
            }
            data[key] = newValue
            // 数据更改，更新 DOM 的值
            document.querySelector('#app').textContent = data[key]
          }
        })
      })
    }

    // 测试
    vm.msg = 'Hello World'
    console.log(vm.msg)
```

#### 5）数据响应式核心原理 ---- Vue3 ---- Proxy

+ 直接监听对象，而非属性
+ ES6 中新增，IE 不支持，性能由浏览器优化

```js
// 模拟 Vue 中的 data 选项
    let data = {
      msg: 'hello',
      count: 0
    }

    // 模拟 Vue 实例
    let vm = new Proxy(data, {
      // 执行代理行为的函数
      // 当访问 vm 的成员会执行
      get (target, key) {
        console.log('get, key: ', key, target[key])
        return target[key]
      },
      // 当设置 vm 的成员会执行
      set (target, key, newValue) {
        console.log('set, key: ', key, newValue)
        if (target[key] === newValue) {
          return
        }
        target[key] = newValue
        document.querySelector('#app').textContent = target[key]
      }
    })

    // 测试
    vm.msg = 'Hello World'
    console.log(vm.msg)
```

#### 6) 发布订阅模式

+ 发布/订阅模式

+ 订阅者
+ 发布者
+ 信号中心

我们假定，存在一个 **“信号中心”**，某个任务执行完成，就向信号中心**“发布”** 一个信号，其他任务可以向信号中心 **“订阅”** 这个信号，从而知道什么时候自己可以开始执行。这就叫做 **发布/订阅模式** 



+ 自定义事件

  ```js
  / Vue 自定义事件
      let vm = new Vue()
      // { 'click': [fn1, fn2], 'change': [fn] }
  
      // 注册事件(订阅消息)
      vm.$on('dataChange', () => {
        console.log('dataChange')
      })
  
      vm.$on('dataChange', () => {
        console.log('dataChange1')
      })
      // 触发事件(发布消息)
      vm.$emit('dataChange')
  ```

  

+ 兄弟组件通信过程
```js
// eventBus.js
// 事件中心
let eventHub = new Vue()

// ComponentA.vue
// 发布者
addTodo: function () {
  // 发布消息(事件)
  eventHub.$emit('add-todo', { text: this.newTodoText })
  this.newTodoText = ''
}

// ComponentB.vue
// 订阅者
created: function () {
  // 订阅消息(事件)
  eventHub.$on('add-todo', this.addTodo)
}
模拟 Vue 自定义事件的实现
```



+ 模拟 Vue 自定义事件的实现

  ```js
   // 事件触发器
      class EventEmitter {
        constructor () {
          // { 'click': [fn1, fn2], 'change': [fn] }
          this.subs = Object.create(null) // 创建对象
        }
  
        // 注册事件
        $on (eventType, handler) {
          this.subs[eventType] = this.subs[eventType] || []
          this.subs[eventType].push(handler)
        }
  
        // 触发事件
        $emit (eventType) {
          if (this.subs[eventType]) {
            this.subs[eventType].forEach(handler => {
              handler()
            })
          }
        }
      }
  
      // 测试
      let em = new EventEmitter()
      em.$on('click', () => {
        console.log('click1')
      })
      em.$on('click', () => {
        console.log('click2')
      })
  
      em.$emit('click')
  ```

  
#### 7）观察者模式

+ 观察者（订阅者）-- Watcher
  + update(): 当事件发生时，具体要做的事情
+ 目标（发布者）-- Dep
  + subs 数组：存储所有的观察者
  + addSub(): 添加观察者
  + notify(): 当事件发生时，调用所有观察者的 update() 方法
+ 没有事件中心
+ 模拟 观察者模式 实现

```js
// 发布者-目标
    class Dep {
      constructor () {
        // 记录所有的订阅者
        this.subs = []
      }
      // 添加订阅者
      addSub (sub) {
        if (sub && sub.update) {
          this.subs.push(sub)
        }
      }
      // 发布通知
      notify () {
        this.subs.forEach(sub => {
          sub.update()
        })
      }
    }
    // 订阅者-观察者
    class Watcher {
      update () {
        console.log('update')
      }
    }

    // 测试
    let dep = new Dep()
    let watcher = new Watcher()

    dep.addSub(watcher)

    dep.notify()
```



总结：

+ **观察者模式 **是由具体目标调度，比如当事件触发，**Dep** 就会去调用观察者的方法，所以观察者模式的订阅者与发布者之间是**存在依赖**的
+ **发布/订阅模式** 由统一调度中心调用，因此发布者与订阅者不需要对方的存在

### 3-1-3-2 Vue 响应式原理模拟实现

#### 1）整体分析

+ Vue 基本结构
+ 打印 Vue 实例观察
+ 整体结构

![image-20201021173535164](C:\Users\hansxiang\AppData\Roaming\Typora\typora-user-images\image-20201021173535164.png)

+ Vue
  + 把 data 中的成员注入到 Vue 实例，并且把 data 中的成员转成 getter/setter
+ Observer
  + 能够对数据对象的所有属性进行监听，如有变动可拿到最新值并通知 Dep

#### 2）Vue

+ 功能
  + 负责接收初始化的参数（选项）
  + 负责把 data 中的属性注入到 Vue 实例，转换成 getter/setter
  + 负责调用 observer 监听 data 中所有属性的变化
  + 负责调用 compiler 解析指令/插值表达式
+ 结构

![image-20201020150507539](D:\lagou\lg_phase_one\partThree_vue\moduleOne_手写Vue Router、响应式实现、虚拟DOM和Diff算法\imgs\image-20201020150507539.png)

+ 代码

```js
// vue.js
class Vue {
    constructor (options) {
        // 1. 通过属性保存选项的对象
        this.$options = options || {}
        this.$data = options.data || {}
        this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el

        // 2. 把 data 中的成员转换成 getter/setter, 注入到 vue 实例中
        this._proxyData(this.$data)

        // 3. 调用 observer 对象，监听数据的变化
        new Observer(this.$data)
        
        // 4. 调用 compiler 对象，解析指令和插值表达式
        new Compiler(this)
    }

    _proxyData (data) {
        // 遍历 data 中的所有属性
        Object.keys(data).forEach( key => {
            // 把 data 的属性注入到 vue 实例中
            Object.defineProperty(this, key, {
                // 可遍历
                enumerable: true,
                // 可配置
                configurable: true,
                get () {
                    return data[key]
                },
                set (newValue) {
                    if(newValue === data[key]) {
                        return
                    }
                    data[key] = newValue
                }
            })
        })
    }
}
```

#### 3) Observer

+ 功能
  + 负责把 data 选项中的属性转换成响应式数据
  + data 中的某个属性也是对象，把该属性转换成响应式数据
  + 数据变化通知
+ 结构

![image-20201020152804938](D:\lagou\lg_phase_one\partThree_vue\moduleOne_手写Vue Router、响应式实现、虚拟DOM和Diff算法\imgs\image-20201020152804938.png)

+ 代码

```js
// observer.js
class Observer {
    constructor (data) {
        this.walk(data)
    }

    // 遍历对象的所有属性
    walk (data) {
        // 1. 判断 data 是否是对象
        if(!data || typeof data !== 'object' ) {
            return
        }
        // 2. 遍历 data 对象的所有属性
        Object.keys(data).forEach( key => {
            this.defineReactive(data, key, data[key])
        })
    }

    // 调用 Object.defineProperty 把属性转换成 getter/setter
    defineReactive (obj, key, val) { // obj--data数据对象，key--data中属性，val--data[key]的值
        // 记录此时的 this
        const that = this

        // 负责收集依赖，并发送通知
        let dep = new Dep()

        // 如果 obj 中某个属性（val)也是一个对象，把 val 内部的属性也转换成响应式数据
        this.walk(val)

        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get () {
                // 收集依赖
                Dep.target && dep.addSub(Dep.target)
                
                return val
            },
            set (newValue) {
                if(newValue === val) {
                    return
                }
                val = newValue
                // 如果 newValue 是一个对象，把赋值后的 newValue 部的属性也转换成响应式数据
                that.walk(newValue)

                // 发送通知
                dep.notify()
            }
        })
    }

}
```

#### 4) Compiler

+ 功能
  + 负责编译模板，解析指令/插值表达式
  + 负责页面的首次渲染
  + 当数据变化后重新渲染视图
+ 结构

![image-20201020160606047](D:\lagou\lg_phase_one\partThree_vue\moduleOne_手写Vue Router、响应式实现、虚拟DOM和Diff算法\imgs\image-20201020160606047.png)

+ 代码

```js
// compiler.js
class Compiler {
    constructor (vm) {
        this.el = vm.$el
        this.vm = vm
        this.compile(this.el)
    }

    // 编译模板,处理文本节点和元素节点
    compile (el) {
        const childNodes = [...el.childNodes]
        // let childNodes = Array.from(el.childNodes)
        childNodes.forEach(node => {
            if (this.isTextNode(node)){
                // 处理文本节点
                this.compileText(node)
            } else if (this.isElementNode(node)){
                // 处理元素节点
                this.compileElement(node)
            }

            // 判断 node 节点，是否有子节点，如果有子节点，要递归调用 compile
            if (node.childNodes && node.childNodes.length) {
                this.compile(node)
            }
        })
    }

    // 编译元素节点，处理指令
    compileElement (node) {
        // console.log(Array.from(node.attributes))
        // 遍历所有的属性节点
        Array.from(node.attributes).forEach(attr =>{
            console.log(attr)
            // 判断是否是指令
            let attrName = attr.name
            // console.log("Compiler -> compileElement -> attrName", attrName)
            if (this.isDirective(attrName)) {
                // v-text --> text
                attrName = attrName.substr(2)  //v-text
                let key = attr.value //如 <div v-text="msg"></div> 中的 msg
                // console.log("Compiler -> compileElement -> key", key)
                this.update(node, key, attrName)
            }
        })
    }

    // 不同指令所调用的函数
    update (node, key, attrName) {
        let updateFn = this[attrName + 'Updater'];
        updateFn && updateFn.call(this, node, this.vm[key], key) // 此处的 this 就是 compiler 对象
    }

    // 处理 v-text 指令
    textUpdater (node, value, key) {
        node.textContent = value

        new Watcher(this.vm, key, (newValue) => {
            node.textContent = newValue
        })
    }

    // 处理 v-model 指令
    modelUpdater (node, value, key) {
        node.value = value

        new Watcher(this.vm, key, (newValue) => {
            node.value = newValue
        })

        // 双向绑定
        node.addEventListener('input', () => {
            this.vm[key] = node.value
        })
    }

    // 编译文本节点，处理插值表达式
    compileText (node) {
        // console.dir(node)
        // {{ msg }}
        const reg = /\{\{(.+?)\}\}/
        const value = node.textContent // 获取文本节点内容
        if (reg.test(value)) {
            let key = RegExp.$1.trim()  // 获取到差值表达式内的内容
            node.textContent = value.replace(reg, this.vm[key])

            // 创建 watcher 对象，当数据改变更新视图
            new Watcher(this.vm, key, (newValue) => {
                node.textContent = newValue
            })
        }
    }

    // 判断元素属性是否是指令
    isDirective (attrName) {
        return attrName.startsWith('v-')
    }

    // 判断节点是否是文本节点
    isTextNode (node) {
        return node.nodeType === 3
    }

    // 判断节点是否是元素节点
    isElementNode (node) {
        return node.nodeType === 1
    }
}
```

#### 5) Dep 

+ 功能
  + 收集依赖，添加观察者（watcher）
  + 通知所有观察者
+ 结构

![image-20201021173652311](D:\lagou\lg_phase_one\partThree_vue\moduleOne_手写Vue Router、响应式实现、虚拟DOM和Diff算法\imgs\image-20201021173652311.png)

+ 代码

```js
// dep.js
class Dep {
    constructor () {
        // 存储所有的观察者
        this.subs = []
    }

    // 添加观察者
    addSub (sub) {
        if (sub && sub.update) {
            this.subs.push(sub)
        }
    }

    // 发送通知
    notify () {
        this.subs.forEach( sub => {
            sub.update();
        })
    }
}
```



#### 6) Watcher

![image-20201021175152375](D:\lagou\lg_phase_one\partThree_vue\moduleOne_手写Vue Router、响应式实现、虚拟DOM和Diff算法\imgs\image-20201021175152375.png)

+ 功能
  + 当数据变化触发依赖，dep 通知所有的 Watcher 实例更新视图
  + 自身实例化的时候往 dep 对象中添加自己
+ 结构

![image-20201021175317468](D:\lagou\lg_phase_one\partThree_vue\moduleOne_手写Vue Router、响应式实现、虚拟DOM和Diff算法\imgs\image-20201021175317468.png)

+ 代码

```js
// watcher.js
class Watcher {
    constructor (vm, key, cb) {
        this.vm = vm
        // data 中的属性名称
        this.key = key
        // 回调函数负责更新视图
        this.cb = cb

        // 把 watcher 对象记录到 Dep 类的静态属性 target
        Dep.target = this
        //  触发 get 方法，在 get 方法中会调用 addSub (在observer类中实现)

        // 更新前的值
        this.oldValue = vm[key]

        Dep.target = null // 防止重复添加
    }

    // 当数据发生变化的时候更新视图
    update () {
        let newValue = this.vm[this.key]
        if (this.oldValue === newValue) {
            return
        }
        this.cb(newValue)
    }
}
```

#### 7) 调试

+ 调试页面首次渲染的过程
+ 调试数据改变更新视图的过程

#### 8）总结

+ 给属性重新赋值成对象，是否是响应式的？ ------  **是**
+ 给 Vue 实例 新增一个成员，是否是响应式的？------ **否**
+ 流程图

![image-20201022113532401](D:\lagou\lg_phase_one\partThree_vue\moduleOne_手写Vue Router、响应式实现、虚拟DOM和Diff算法\imgs\image-20201022113532401.png)

### 3-1-4 Virtual DOM 的实现原理

#### 1）Virtual DOM

+ Virtual DOM (虚拟 DOM )，是由普通的 JS 对象来描述 DOM 对象，因为不是真实的 DOM 对象，所以叫 Virtual DOM
+ 真实 DOM

```js
let element = document.querySelector('#app')
let s = ''
for (const key in element) {
    s += key + ','
}
console.log(s)
```

+ 可以使用 Virtual DOM 来描述真实 DOM , 示例

```js
{
    sel: 'div',
    data: {},
    children: undefined,
    text: 'heloo virtual dom',
    elm: undefined,
    key: undefined
}
```

+ 为什么使用  virtual DOM

  + 手动操作 DOM 笔记麻烦，还需要考虑浏览器兼容性问题
  + 为了简化 DOM 的复杂操作于是出现了各种 MVVM 框架，MVVM 框架解决了**视图**和**状态**的**同步**问题
  + 为了简化视图的操作我们可以使用模板引擎，但是模板引擎没有解决跟踪状态变化的问题，于是 virtual DOM 出现了
  + virtual DOM 的好处是当状态改变时不需要立即更新 DOM, 只需要创建一个**虚拟树**来描述 DOM, virtual DOM 内部将弄清楚如何有效（**diff**）的更新 DOM
  + 参考 github 上 [virtual-dom](https://github.com/Matt-Esch/virtual-dom) 的描述
    + **虚拟 DOM 可以维护程序的状态，跟踪上一次的状态**
    + **通过比较前后两次状态的差异更新真实 DOM**

+ 虚拟 DOM 的作用

  + 维护视图和状态的关系
  + 复杂视图情况下提升渲染性能
  + 处理渲染 DOM 以外，还可以实现 SSR(Nuxt.js/Next.js)、原生应用(Weex/React Native)、小程序(mpvue/uni-app)等

  ![image-20201022151556528](D:\lagou\lg_phase_one\partThree_vue\moduleOne_手写Vue Router、响应式实现、虚拟DOM和Diff算法\imgs\image-20201022151556528.png)

+ virtual DOM 库
  + Snabbdom
    + Vue 2.x 内部使用的 Virtual DOM 就是改造的 Snabbdom
    + 大约 200 SLOC
    + 通过模块可扩展
    + 源码使用 TypeScript 开发
    + 最快的 Virtual DOM 之一
  + virtual-dom

#### 2）Snabbdom 基本使用

[snabbdom 官网](https://github.com/snabbdom/snabbdom)

[Snabbdom 官方文档翻译](https://github.com/coconilu/Blog/issues/152)

+ 创建项目

  + 打包工具为了方便使用 **parcel**
  + 创建项目，并安装 parcel

  ```
  md snabbdom-dom
  
  cd snabbdom-dom
  
  yarn init -y
  
  yarn add parcel-bundler --dev
  ```

  

  + 配置 package.json 的 scripts

  ```js
    "scripts": {
      "dev": "parcel index.html --open",
      "build": "parcel build index.html"
    },
  ```

  

  + 创建目录结构

  ```js
  | index.html
  | package.json
  |_src
  	| 01-basicusage.js
  ```

  

+ 导入项目

  + 安装

  ```
  yarn add snabbdom
  ```

  

  

  + "snabbdom": "^2.1.0" （与低版本使用 0.7.4 有区别）

  ```js
  import { h } from 'snabbdom/build/package/h'
  import { thunk } from 'snabbdom/build/package/thunk'
  import { init } from 'snabbdom/build/package/init'
  ```

  **注意**：

  导入的时候不能使用 `import snabbdom from 'snabbdom'`, 因为 `node_modules/snabbdom/src/package/*.ts 末尾导出使用的语法是 **export 导出 API **，**没有使用 export default 导出默认输出 ** 

  ![image-20201022173017349](D:\lagou\lg_phase_one\partThree_vue\moduleOne_手写Vue Router、响应式实现、虚拟DOM和Diff算法\imgs\image-20201022173017349.png)

  + snabbdom 的核心仅提供最基本的功能
    + **snabbdom.init**      核心仅暴露出一个函数`snabbdom.init`。`init`接收一个模块列表，并返回一个使用指定模块集的`patch`函数。
    + **snabbdom/h**     建议使用`snabbdom/h`创建虚拟节点（vnodes）。`h`函数接收一个字符串形式的标签/选择器、一个可选的数据对象、一个可选的字符串或数组作为子代。
    + **thunk**   是一个优化策略，可用于处理不可变数据

+ 基本案例

  + ### `patch`

    `init`返回的`patch`函数有两个参数。第一个是表示当前视图的DOM元素或vnode。第二个是表示更新后的新视图的vnode。

    如果传递带有父节点的DOM元素，`newVnode`将被转换为DOM节点，传递的元素将被创建的DOM节点替换。如果传递旧的vnode, Snabbdom将有效地修改它以匹配新vnode中的描述。

    传递的任何旧vnode都必须是上一个`patch`调用的结果vnode。这是必要的，因为Snabbdom将信息存储在vnode中。这使得实现更简单、更高性能的体系结构成为可能。这也避免了创建新的旧vnode树。

  ```js
  // 01-basicusage.js
  import { h } from 'snabbdom/build/package/h'
  import { init } from 'snabbdom/build/package/init'
  // import { thunk } from 'snabbdom/build/package/thunk'
  // import { classModule } from 'snabbdom/build/package/modules/class'
  
  // console.log(h, thunk, init, classModule)
  
  // 1. 实现一个 hello world
  // init 参数：数组，模块   返回值：patch函数，作用对比两个 VNode 的差异更新到真实 DOM
  let patch = init([])
  
  // h  参数（标签+选择器，如果是字符串的话就是标签中的内容）
  let vnode = h('div#container.cls', 'hello world')
  
  let app = document.querySelector('#app')
  
  // patch函数有两个参数。第一个是表示当前视图的DOM元素或vnode。第二个是表示更新后的新视图的vnode。
  // 第一个参数：可以是 DOM 元素，内部会把 DOM 元素转换成 VNode
  // 第二个参数：VNode
  // 返回值：VNode
  let oldVnode = patch(app, vnode)
  
  // 更新数据
  let newVnode = h('div', 'hello snabbdom')
  patch(oldVnode, newVnode)
  
  ```

  ```js
  // 02-basicusage.js
  import { h } from 'snabbdom/build/package/h'
  import { init } from 'snabbdom/build/package/init'
  
  // 2. div 中放置子元素 h1, p
  
  let patch = init([])
  
  let vnode = h('div#container', [
      h('h1', 'hello snabbdom'),
      h('p', 'this is a label')
  ])
  
  const app = document.querySelector('#app')
  
  let oldVnode = patch(app, vnode)
  
  // 更新数据
  setTimeout(() => {
      vnode = h('div#container', [
          h('h1', 'hello world'),
          h('p', 'hello p')
      ])
      patch(oldVnode, vnode)
      
      // 清空页面元素 --- 错误
      // patch(oldVnode, null)
  
      // 清空页面元素 --- 正确
      patch(oldVnode, h('!'))
  }, 2000)
  ```

+ 模块

  snabbdom 的核心库并不能处理元素的属性/样式/事件等，如果需要的话，可以使用模块

  + attributes  特性模块
    + 设置 DOM 元素的属性，使用 setAttributes
    + 处理布尔类型的属性
  + props  属性模块
    + 和 attribute 模块相似，设置 DOM 元素的属性 element[attr] = value
  + class  类模块
    + 切换类样式
    + 注意：给元素设置类样式是通过 sel 选择器
  + dataset  数据集模块
    + 设置 data-* 的自定义属性
  + eventlisteners  事件监听器模块
    + 注册和移除事件
  + style  样式模块
    + 设置行内样式，支持动画
    + delayed/remove/destroy

+ 模块使用

  + 导入需要的模块
  + init() 中注册模块
  + 使用 h() 函数创建 VNode 的时候，可以把第二个参数设置为对象，其他参数往后移

  ```js
  03-modules.js
  import { h } from 'snabbdom/build/package/h'
  import { init } from 'snabbdom/build/package/init'
  
  // 1. 导入模块
  import { styleModule } from 'snabbdom/build/package/modules/style'
  import { eventListenersModule } from 'snabbdom/build/package/modules/eventlisteners'
  
  // 2. 注册模块
  let patch = init([
      styleModule,
      eventListenersModule
  ])
  
  // 3. 使用 h() 函数的第二个参数传入模块所需要的数据（对象）
  let vnode = h('div', {
      style: {
          backgroundColor: 'pink'
      },
      on: {
          click: evnetHandler
      }
  }, [
      h('h1', 'hello snabbdom'),
      h('p', 'this is a p label')
  ])
  
  function evnetHandler () {
      console.log('click me !')
  }
  
  const app = document.querySelector('#app')
  
  patch(app, vnode)
  ```

#### 3) snabbdom 源码解析

![image-20201023175759953](C:\Users\hansxiang\Desktop\面试题汇总-高薪5期\image-20201023175759953.png)

![image-20201024111500379](D:\lagou\lg_phase_one\partThree_vue\moduleOne_手写Vue Router、响应式实现、虚拟DOM和Diff算法\imgs\image-20201024111500379.png)

#### 4）h 函数

+ h() 函数介绍

  + 在使用 Vue 的时候见过 h() 函数

  ```js
  new Vue({
      router,
      store,
      render: h => h(App)
  }).$mount('#app')
  ```

  + h() 函数最早见于 **hyperscript**， 使用 JavaScript 创建超文本
  + Snabbdom 中的 h() 函数不是用来创建超文本，而是创建 VNode

+ 函数重载

  + 概念
    + **参数个数** 或 **类型** 不同的函数
    + JavaScript 中没有重载的概念
    + TypeScript 中有重载，不过重载的实现还是通过代码调整参数
  + 重载的示例

  ```js
  // 假设支持重载的某种语言
  function add (a, b) {
      console.log(a + b)
  }
  function add (a, b, c) {
      console.log(a + b + c)
  }
  
  add(1, 2) //调用第一个add
  add(1, 2, 3) //调用第二个add
  ```

  

#### 5）updateChildren

+ 功能：

  + **diff 算法**的核心，对比新旧节点的 children， 更新 DOM

+ 执行过程

  + 要对比两棵树的差异，我们可以取第一棵树的每一个节点一次和第二棵树的每一个节点比较，但是这样的时间复杂度为 O(n^3)
  + 在 DOM 操作的时候我们很少很少会把一个父节点移动/更新到某一个子节点
  + 因此只需要找 **同级别**  的子节点依次**比较**，然后再找下一基本的节点比较，这样算法的时间复杂度为 O(n)

  ![image-20201024164157240](D:\lagou\lg_phase_one\partThree_vue\moduleOne_手写Vue Router、响应式实现、虚拟DOM和Diff算法\imgs\image-20201024164157240.png)

  + 在进行同级别节点比较的时候，首先会对新老节点数组的开始和结尾节点设置标记索引，遍历的过程中移动索引

  + 在对**开始和结束节点**比较的时候，总共有四种情况：

    + oldStartVNode / newStartVNode（旧开始节点 / 新开始节点）
    + oldEndVNode / newEndVNode（旧结束节点 / 新结束节点）
    + oldStartVNode  / newEndVNode（旧开始节点 / 新结束节点）
    + oldEndVNode  / newStartVNode（旧结束节点 / 新开始节点）

    ![image-20201024164839447](D:\lagou\lg_phase_one\partThree_vue\moduleOne_手写Vue Router、响应式实现、虚拟DOM和Diff算法\imgs\image-20201024164839447.png)

  + 开始节点和结束节点比较，这两种情况类似

    + oldStartVNode / newStartVNode（旧开始节点 / 新开始节点）
    + oldEndVNode / newEndVNode（旧结束节点 / 新结束节点）

  + 如果 oldStartVNode 和 newStartVNode 是 sameVnode（key 和 sel 相同）

    + 调用 patchVnode() 对比和更新节点
    + 把旧开始和新开始索引往后移动 oldStartdx++/oldEnddx++

    ![image-20201027161604646](D:\lagou\lg_phase_one\partThree_vue\moduleOne_手写Vue Router、响应式实现、虚拟DOM和Diff算法\imgs\image-20201027161604646.png)

  + oldStartVnode / newEndVnode（旧开始节点 / 新结束节点）相同

    + 调用 pathchVnode() 对比和更新节点
    + 把 oldStartVnode 对应的 DOM 元素，移动到右边
    + 更新索引

    ![image-20201027161901718](D:\lagou\lg_phase_one\partThree_vue\moduleOne_手写Vue Router、响应式实现、虚拟DOM和Diff算法\imgs\image-20201027161901718.png)

  + oldEndVNode  / newStartVNode（旧结束节点 / 新开始节点）相同

    + 调用 pathchVnode() 对比和更新节点
    + 把 oldStartVnode 对应的 DOM 元素，移动到左边
    + 更新索引

    ![image-20201027162050684](D:\lagou\lg_phase_one\partThree_vue\moduleOne_手写Vue Router、响应式实现、虚拟DOM和Diff算法\imgs\image-20201027162050684.png)

  + 如果不是以上四种情况

    + 遍历新节点，使用 newStartVNode 的 key 在老节点数组中找相同节点

    + 如果没有找到，说明 newStartVNode 是新节点

      + 创建新节点对应的 DOM 元素，插入到 DOM 树中

    + 如果找到了

      + 判断新节点和找到的老节点的 sel 选择器是否相同
      + 如果不相同，说明节点被修改了
        + 创建新节点对应的 DOM 元素，插入到 DOM 树中
      + 如果相同，把 eleToMove 对应的 DOM 元素，移动到左边

      ![image-20201027162441758](D:\lagou\lg_phase_one\partThree_vue\moduleOne_手写Vue Router、响应式实现、虚拟DOM和Diff算法\imgs\image-20201027162441758.png)

    + 循环结束

      + 当老节点的所有子节点遍历完（oldStartldx > oldEndldx），循环结束
      + 新节点所有子节点先遍历完（newStartldx > newEndldx），循环结束

    + 如果老节点的数组先遍历完oldStartldx > oldEndldx），说明新节点有剩余，把剩余节点批量插入到右边

    ![image-20201027162751500](D:\lagou\lg_phase_one\partThree_vue\moduleOne_手写Vue Router、响应式实现、虚拟DOM和Diff算法\imgs\image-20201027162751500.png)

    + 如果新节点数组先遍历完（newStartldx > newEndldx），说明老节点有剩余，把剩余节点批量删除

    ![image-20201027162856933](D:\lagou\lg_phase_one\partThree_vue\moduleOne_手写Vue Router、响应式实现、虚拟DOM和Diff算法\imgs\image-20201027162856933.png)

#### 6）Modules 源码

+ patch() ---> patchVnode() ---> updateChildren()
+ Snabbdom 为了保证核心库的精简，把处理元素的属性/事件/样式等工作，放置到模块中
+ 模块可以按需引入
+ 模块的使用可以查看[官方文档](https://github.com/coconilu/Blog/issues/152)
+ 模块实现的核心是基于 Hooks

#### 7）Hooks

+ 预定义的钩子函数的名称
+ 源码位置：src/package/hooks.ts

```js
import { VNode } from './vnode'

// patch 函数开始的时候触发
export type PreHook = () => any
// createElm 函数开始之前的时候触发
// 再把 VNode 转换成真实 DOM 之前触发
export type InitHook = (vNode: VNode) => any
// createElm 函数末尾调用
// 创建完真实 DOM 后触发
export type CreateHook = (emptyVNode: VNode, vNode: VNode) => any
// patch 函数末尾执行
// 真实 DOM 添加到 DOM 树中触发
export type InsertHook = (vNode: VNode) => any
// patchVNode 函数开头调用
// 开始对比两个 VNode 的差异之前触发 
export type PrePatchHook = (oldVNode: VNode, vNode: VNode) => any
// patchVNode 函数开头调用
// 两个 VNode 对比过程中触发，比 prepatch 稍晚
export type UpdateHook = (oldVNode: VNode, vNode: VNode) => any
// patchVNode 的最末尾调用
// 两个 VNode 对比结束执行
export type PostPatchHook = (oldVNode: VNode, vNode: VNode) => any
// removeVnodes -> invokeDestroyHook 中调用
// 在删除元素之前触发，子节点的 destroy 也被触发
export type DestroyHook = (vNode: VNode) => any
// removeVNodes 中调用
// 元素被删除的时候触发
export type RemoveHook = (vNode: VNode, removeCallback: () => void) => any
// patch 函数的最后调用
export type PostHook = () => any

export interface Hooks {
  pre?: PreHook
  init?: InitHook
  create?: CreateHook
  insert?: InsertHook
  prepatch?: PrePatchHook
  update?: UpdateHook
  postpatch?: PostPatchHook
  destroy?: DestroyHook
  remove?: RemoveHook
  post?: PostHook
}

```



