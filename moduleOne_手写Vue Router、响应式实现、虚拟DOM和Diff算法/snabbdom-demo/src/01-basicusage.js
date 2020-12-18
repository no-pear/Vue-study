import { h } from 'snabbdom/build/package/h'
import { init } from 'snabbdom/build/package/init'
// import { thunk } from 'snabbdom/build/package/thunk'
// import { classModule } from 'snabbdom/build/package/modules/class'

// console.log(h, thunk, init, classModule)

// 1. 实现一个 hello world
// init 参数：数组，模块   返回值：patch函数，作用对比两个 VNode 的差异更新到真实 DOM
let patch = init([])

// h  参数（标签+选择器，如果是字符串的话就是标签中的内容）
// let vnode = h('div#container.cls', 'hello world')
let vnode = h('div#container.cls', {
    hook: {
        init (vnode) {
            console.log(vnode.elm)
        },
        create (emptyVnode, vnode) {
            console.log(vnode.elm)
        }
    }
}, 'hello world')


let app = document.querySelector('#app')

// patch函数有两个参数。第一个是表示当前视图的DOM元素或vnode。第二个是表示更新后的新视图的vnode。
// 第一个参数：可以是 DOM 元素，内部会把 DOM 元素转换成 VNode
// 第二个参数：VNode
// 返回值：VNode
let oldVnode = patch(app, vnode)

// 更新数据
let newVnode = h('div', 'hello snabbdom')
patch(oldVnode, newVnode)
