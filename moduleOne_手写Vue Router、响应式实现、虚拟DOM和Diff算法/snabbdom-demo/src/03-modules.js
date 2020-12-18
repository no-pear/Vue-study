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