import { h } from 'snabbdom/build/package/h'
import { init } from 'snabbdom/build/package/init'

let patch = init([])

// 首次渲染
let vnode = h('div', 'hello, world')
let app = document.querySelector('#app');
let oldVnode = patch(app, vnode)

// patchVnode 的执行过程
vnode = h('div', 'hello snabbdom')
patch(oldVnode, vnode)