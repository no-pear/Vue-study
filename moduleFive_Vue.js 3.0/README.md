### vue 3.0 介绍
#### 性能提升
+ 响应系统升级
    - 2.x defineProperty
    - 3.0 proxy
        1. 可以监听动态新增的属性
        2. 可以监听删除的属性
        3. 可以监听数组的索引和length属性
+ 编译优化
    - 2.x 通过标记静态根节点，优化diff
    - 3.0 标记和提升所有的静态根节点，diff的时候只需要对比动态节点内容
+ 优化打包提交
    + Vue.js 3.0 移除了一些不常用的 API
        + inline-template、filter 等
    + Tree-shaking

### Composition Api
+ 生命周期钩子函数
+ reactive()  把一个对象转化成响应式对象
+ toRefs 把一个响应式对象的所有属性也转化成响应式的
+ ref   把一个基本类型数据转化成响应式的
+ computed  计算属性

```html
<body>
  <div id="app">
    <button @click="push">按钮</button>
    未完成：{{ activeCount }}
  </div>
  <script type="module">
    import { createApp, reactive, computed } from './node_modules/vue/dist/vue.esm-browser.js'
    const data = [
      { text: '看书', completed: false },
      { text: '敲代码', completed: false },
      { text: '约会', completed: true }
    ]

    createApp({
      setup () {
        const todos = reactive(data)

        const activeCount = computed(() => {
          return todos.filter(item => !item.completed).length
        })

        return {
          activeCount,
          push: () => {
            todos.push({
              text: '开会',
              completed: false
            })
          }
        }
      }
    }).mount('#app')
  </script>
</body>
```



+ watch  监听器
    - watch接收三个参数
        1. 要监听的数据
        2. 监听到数据变化后的函数，这个函数有两个参数分别是**新值**和**旧值**
        3. 选项对象， deep和immediate
    - watch的返回值--->取消监听的函数

```html
<body>
  <div id="app">
    <p>
      请问一个 yes/no 的问题:
      <input v-model="question">
    </p>
    <p>{{ answer }}</p>
  </div>

  <script type="module">
    // https://www.yesno.wtf/api
    import { createApp, ref, watch } from './node_modules/vue/dist/vue.esm-browser.js'

    createApp({
      setup () {
        const question = ref('')
        const answer = ref('')

        watch(question, async (newValue, oldValue) => {
          const response = await fetch('https://www.yesno.wtf/api')
          const data = await response.json()
          answer.value = data.answer
        })

        return {
          question,
          answer
        }
      }
    }).mount('#app')
  </script>
</body>
```



+ watchEffect
    - 立即执行一次
    - 接收一个函数作为参数，监听函数内响应式数据的变化
    - 返回一个取消监听的函数
    
    ```html
    <body>
      <div id="app">
        <button @click="increase">increase</button>
        <button @click="stop">stop</button>
        <br>
        {{ count }}
      </div>
    
      <script type="module">
        import { createApp, ref, watchEffect } from './node_modules/vue/dist/vue.esm-browser.js'
    
        createApp({
          setup () {
            const count = ref(0)
            const stop = watchEffect(() => {
              console.log(count.value)
            })
    
            return {
              count,
              stop,
              increase: () => {
                count.value++
              }
            }
          }
        }).mount('#app')
      </script>
    </body>
    ```
    
+ 自定义指令

    + Vue 2.x

    ![image-20201209113211805](D:\lagou\lg_phase_one\partThree_vue\moduleFive_Vue.js 3.0\images\image-20201209113211805.png)

    

    ![image-20201209113446730](D:\lagou\lg_phase_one\partThree_vue\moduleFive_Vue.js 3.0\images\image-20201209113446730.png)

    

    + Vue 3

    ![image-20201209113307806](D:\lagou\lg_phase_one\partThree_vue\moduleFive_Vue.js 3.0\images\image-20201209113307806.png)

    

    ![image-20201209113509036](C:\Users\hansxiang\AppData\Roaming\Typora\typora-user-images\image-20201209113509036.png)

### vue.js 3.0响应式系统原理实现
#### 1）Vue.js 响应式回顾

+ **Proxy** 对象实现属性监听
+ 多层属性嵌套，在访问属性过程中处理下一级属性
+ 默认监听**动态添加**的属性
+ 默认监听属性的**删除**操作
+ 默认监听**数组索引**和 **length** 属性
+ 可以作为单独的模块使用

#### 2）Proxy

```js
'use strict'
    // 问题1： set 和 deleteProperty 中需要返回布尔类型的值
    //        在严格模式下，如果返回 false 的话会出现 Type Error 的异常
    const target = {
      foo: 'xxx',
      bar: 'yyy'
    }
    // Reflect.getPrototypeOf()
    // Object.getPrototypeOf()
    const proxy = new Proxy(target, {
      // 访问
      // receiver 表示当前的 proxy 对象或者继承的 proxy对象
      get (target, key, receiver) {
        // return target[key]
        // Reflect(用来操作对象的成员) 反射 es6中新增的成员 代码运行期间用来获取或者设置对象的成员
        // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect
        return Reflect.get(target, key, receiver)
      },
      // 赋值
      set (target, key, value, receiver) {
        // target[key] = value
        return Reflect.set(target, key, value, receiver)
      },
      // 删除
      deleteProperty (target, key) {
        // delete target[key]
        return Reflect.deleteProperty(target, key)
      }
    })

    proxy.foo = 'zzz'
    // delete proxy.foo
```

```js
    // 问题2：Proxy 和 Reflect 中使用的 receiver

    // Proxy 中 receiver：Proxy 或者继承 Proxy 的对象
    // Reflect 中 receiver：如果 target 对象中设置了 getter，getter 中的 this 指向 receiver

    const obj = {
      get foo() {
        console.log(this)
        return this.bar
      }
    }

    const proxy = new Proxy(obj, {
      get (target, key, receiver) {
        if (key === 'bar') { 
          return 'value - bar' 
        }
        return Reflect.get(target, key, receiver)
      }
    })
    console.log(proxy.foo)
```

#### 3）reactive

+ 接收一个参数，判断这参数是否是对象
+ 创建拦截器对象 **handler**, 设置 **get/set/deleteProperty**
+ 返回 Proxy 对象

#### 4）收集依赖

![image-20201211112542926](D:\lagou\lg_phase_one\partThree_vue\moduleFive_Vue.js 3.0\images\image-20201211112542926.png)

#### 5）effect / track / trigger

+ effect **跟踪属性变化并调用回调函数**

+ tarck 收集依赖
+ trigger 触发更新

#### 6）ref

把一个基本数据类型数据，转成响应式对象，后续通过 **.value** 使用

#### 7）reactive vs ref

+ **ref** 可以把基本数据类型数据，转成响应式对象
+ **ref** 返回的对象，重新赋值成对象也是响应式的
+ **reactive** 返回的对象，重新赋值丢失响应式
+ **reactive** 返回的对象不可以解构 

![image-20201211115331558](D:\lagou\lg_phase_one\partThree_vue\moduleFive_Vue.js 3.0\images\image-20201211115331558.png)

#### 8）toRefs

**将reactive()创建出来的响应式对象，转换为普通对象，只不过这个对象上的每个属性节点，都是ref()类型的响应式数据**

#### 9）实现代码

```js
// index.js
// 判断是否是对象
const isObject = val => val!==null && typeof val ==='object'
// 判断是否是对象，如果是转换成响应式对象，不是则返回本身
const convert = target => isObject(target) ? reactive(target) : target
// 判断某个对象本身是否具有指定的属性
const hasOwnProperty = Object.prototype.hasOwnProperty
const hasOwn = (target, key) => hasOwnProperty.call(target, key)

export function reactive (target) {
    if(!isObject(target)) return target

    // 
    const handler = {
        get (target, key, receiver) {
            // 收集依赖
            // console.log('get', target)
            track(target, key)

            const result = Reflect.get(target, key, receiver)

            return convert(result)
        },

        set (target, key, value, receiver) {
            const oldValue = Reflect.get(target, key, receiver)
            let result = true
            if (oldValue !== value) {
                result = Reflect.set(target, key, value, receiver)
                // 触发更新
                // console.log('set', key, value)
                trigger(target, key)
            }

            return result
        },

        deleteProperty (target, key) {
            const hadKey = hasOwn(target, key)
            const result = Reflect.deleteProperty(target, key)
            if (hadKey && result) {
                //触发更新
                // console.log('delete', key)
                trigger(target, key)
            }

            return result
        }
    }

    return new Proxy(target, handler)
}

let activeEffect = null
export function effect (callback) {
    activeEffect = callback
    callback()   // 访问响应式对象属性，去收集依赖
    activeEffect = null
}

let targetMap = new WeakMap()

// 收集依赖
export function track (target, key) {
    if (!activeEffect) return
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
        depsMap.set(key, (dep = new Set()))
    }

    dep.add(activeEffect)
}

// 触发更新
export function trigger (target, key) {
    // console.log("🚀 ~ file: index.js ~ line 79 ~ trigger ~ target", target)
    // console.log("🚀 ~ file: index.js ~ line 87 ~ trigger ~ targetMap", targetMap)
    const depsMap = targetMap.get(target)

    // console.log("🚀 ~ file: index.js ~ line 80 ~ trigger ~ depsMap", depsMap)
    if (!depsMap) return
    const dep = depsMap.get(key)
    if (dep) {
        dep.forEach(effect => {
            effect()
        })
    }
}

export function ref (raw) {
    // 判断 raw 是否是 ref 创建的对象，如果是的话直接返回
    if (isObject(raw) && raw.__v_isRef) {
        return
    }

    // raw 如果是对象，调用 reactive 转换成响应式对象
    let value = convert(raw)

    const r = {
        __v_isRef: true,
        get value () {
            track(r, 'value')
            return value
        },
        set value (newValue) {
            if (newValue !== value) {
                raw = newValue
                value = convert(raw)
                trigger(r, 'value')
            }
        }
    }
    return r
}

export function toRefs (proxy) {
    const ret = proxy instanceof Array ? new Array(proxy.length) : {}

    for (const key in proxy) {
        ret[key] = toProxyRef(proxy, key)
    }

    return ret
}

function toProxyRef (proxy, key) {
    const r = {
        __v_isRef: true,
        get value () {
            return proxy[key]
        },
        set value (newValue) {
            proxy[key] = newValue
        }
    }
    return r
}

export function computed (getter) {
    const result = ref()

    // effect(() => (result.value = getter()))
    effect(() => result.value = getter())


    return result
}
```

#### 10）测试代码

**index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <script type="module">
        import { reactive } from './index.js'

        const obj = reactive({
            name: 'xcc',
            age: 18
        })

        obj.name = 'nopear'
        delete obj.age
        console.log(obj)
    </script>
</body>
</html>
```

**effect-demo.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <script type="module">
    // import { reactive, effect } from './node_modules/@vue/reactivity/dist/reactivity.esm-browser.js'
    import { reactive, effect } from './index.js'

    const product = reactive({
      name: 'iPhone',
      price: 5000,
      count: 3
    })
    let total = 0 
    effect(() => {
        // console.log(111)
      total = product.price * product.count
    })
    console.log(total)

    product.price = 4000
    console.log(total)

    product.count = 1
    console.log(total)

  </script>
</body>
</html>
```

**ref.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <script type="module">
    import { reactive, effect, ref } from './index.js'

    const price = ref(5000)
    const count = ref(3)
   
    let total = 0 
    effect(() => {
      total = price.value * count.value
    })
    console.log(total)

    price.value = 4000
    console.log(total)

    count.value = 1
    console.log(total)

  </script>
</body>
</html>
```

**toRefs.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <script type="module">
    import { reactive, effect, toRefs } from './index.js'

    function useProduct () {
      const product = reactive({
        name: 'iPhone',
        price: 5000,
        count: 3
      })
      
      return toRefs(product)
    }

    const { price, count } = useProduct()


    let total = 0 
    effect(() => {
      total = price.value * count.value
    })
    console.log(total)

    price.value = 4000
    console.log(total)

    count.value = 1
    console.log(total)

  </script>
</body>
</html>
```

**computed.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <script type="module">
    import { reactive, effect, computed } from './index.js'

    const product = reactive({
      name: 'iPhone',
      price: 5000,
      count: 3
    })
    let total = computed(() => {
      return product.price * product.count
    })
   
    console.log(total.value)

    product.price = 4000
    console.log(total.value)

    product.count = 1
    console.log(total.value)

  </script>
</body>
</html>
```

### Vite 实现原理

#### 1）Vite 概念

+ Vite 是一个面向现代浏览器的一个更轻、更快的 Web 应用开发工具
+ 它基于 ECMAScript 标准原生模块系统 (ES Module) 实现

#### 2）对比 vue-cli-service serve

+ vite serve

![image-20201214143955417](D:\lagou\lg_phase_one\partThree_vue\moduleFive_Vue.js 3.0\images\image-20201214143955417.png)

+ vue-cli-service serve

![image-20201214143829071](D:\lagou\lg_phase_one\partThree_vue\moduleFive_Vue.js 3.0\images\image-20201214143829071.png)

#### 3）HMR

+ Vite HMR
  + 立即编译当前所修改的文件
+ Webpack HMR
  + 会自动以这个文件为入口重写 build 一次，所有的涉及到的依赖也都会被加载一遍

#### 4）Vite 特性

+ 快速冷启动
+ 模块热更新
+ 按需编译
+ 开箱即用

#### 5）模拟实现

这里只实现了 **静态 web 服务器**、**加载第三方模块**、**编译单文件组件(.vue)** ，没有处理 css等文件

```js
#!/usr/bin/env node

const Koa = require('koa')
const send = require('koa-send')
const path = require('path')
const compilerSFC = require('@vue/compiler-sfc')
const { Readable } = require('stream')

const app = new Koa()

// 流转换为字符串
const streamToString = stream => new Promise((resolve, reject) => {
    const chunks = []
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    stream.on('error', reject)
  })

// 字符串转换为流
const stringToStream = text => {
    const stream = new Readable()
    stream.push(text)
    stream.push(null)
    return stream
  }

// 3. 加载第三方模块
app.use(async (ctx,next) => {
    // ctx.path --> /@modules/vue
    if (ctx.path.startsWith('/@modules/')) {
        const moduleName = ctx.path.substr(10)
        // console.log("🚀 ~ file: index.js ~ line 22 ~ app.use ~ moduleName", moduleName)

        const pkgPath = path.join(process.cwd(), 'node_modules', moduleName, 'package.json')
        // console.log("🚀 ~ file: index.js ~ line 24 ~ app.use ~ pkgPath", pkgPath)

        const pkg = require(pkgPath)
        // console.log("🚀 ~ file: index.js ~ line 26 ~ app.use ~ pkg", pkg)

        ctx.path = path.join('/node_modules', moduleName, pkg.module)
        // console.log("🚀 ~ file: index.js ~ line 28 ~ app.use ~ ctx.path", ctx.path)
    }
    await next()
})

// 1. 静态文件服务器
app.use(async (ctx, next) => {
    console.log('ctx.path----', ctx.path)
    
    await send(ctx, ctx.path, {root: process.cwd(), index: 'index.html'})
    await next()
})

// 4. 处理单文件组件
app.use(async (ctx, next) => {
    if (ctx.path.endsWith('.vue')) {
        const contents = await streamToString(ctx.body)
        // console.log("🚀 ~ file: index.js ~ line 58 ~ app.use ~ contents", contents)
        // console.log('compilerSFC.parse(contents)----', compilerSFC.parse(contents))
        const { descriptor } = compilerSFC.parse(contents)
        let code
        if (!ctx.query.type) {
            // 单文件组件第一次请求
            // 单文件组件编译成选项对象，返回给浏览器
            code = descriptor.script.content
            // console.log(code)
            code = code.replace(/export\s+default\s+/g, 'const __script = ')
            // console.log("🚀 ~ file: index.js ~ line 66 ~ app.use ~ code", code)
            code += `
                import { render as __render } from "${ctx.path}?type=template"
                __script.render = __render
                export default __script
            `
        } else if (ctx.query.type === 'template') {
            // 单文件组件第二次请求
            // 服务器编译模板，返回编译之后的 render 函数
            const templateRender = compilerSFC.compileTemplate({ source: descriptor.template.content })
            console.log("🚀 ~ file: index.js ~ line 77 ~ app.use ~ templateRender", templateRender)
            code = templateRender.code
        }

        ctx.type = 'application/javascript'
        ctx.body = stringToStream(code)
    }

    await next()
})

// 2. 修改第三方模块的路径
app.use(async (ctx, next) => {
    if (ctx.type === 'application/javascript') {
        const contents = await streamToString(ctx.body)
        // import vue from 'vue'
        // import App from './App.vue'
        ctx.body = contents
            .replace(/(from\s+['"])(?![\.\/])/g, '$1/@modules/')
            .replace(/process\.env\.NODE_ENV/g, '"development"')
    }
})

app.listen(3000)
console.log('Server runing @ 3000')
```

