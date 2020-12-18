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