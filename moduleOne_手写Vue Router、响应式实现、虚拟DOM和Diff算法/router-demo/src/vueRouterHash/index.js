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
      // render --- 可在 vue 运行时版直接使用
      render(h) {
        // h(选择器（标签的名字）， 属性，生成的某个标签的内容)
        return h('a', {
          attrs: {
            href: '#' + this.to,
          },
          // 注册事件
        //   on: {
        //     click: this.clickHandler // 点击事件
        //   },
        }, [this.$slots.default]) // this.$slot.default 默认插槽
      },
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

  // 用来注册 hashchange 事件
  initEvent () {
     window.addEventListener('hashchange', () => {
      this.data.current = this.getHash();
    });
    window.addEventListener('load', () => {
      if (!window.location.hash) {
        window.location.hash = '#/';
      }
    });
  }

  getHash() {
    return window.location.hash.slice(1) || '/';
  }
  
}
