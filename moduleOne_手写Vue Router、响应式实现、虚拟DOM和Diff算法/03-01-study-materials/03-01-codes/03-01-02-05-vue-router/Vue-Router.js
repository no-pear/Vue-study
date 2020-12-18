

console.dir(Vue)
let _Vue = null
class VueRouter {
    // 实现 vue 的插件机制
    static install(Vue){
        //1 判断当前插件是否被安装
        if(VueRouter.install.installed){
            return;
        }
        VueRouter.install.installed = true
        //2 把Vue的构造函数记录在全局
        _Vue = Vue
        //3 把创建Vue的实例传入的router对象注入到Vue实例
        // _Vue.prototype.$router = this.$options.router
        // 混入
        _Vue.mixin({
            beforeCreate(){
                if(this.$options.router){
                    _Vue.prototype.$router = this.$options.router
                    
                }
               
            }
        })
    }
    // 初始化属性
    constructor(options){
        this.options = options // options 记录构造函数传入的对象
        this.routeMap = {} // routeMap 路由地址和组件的对应关系
        // observable     data 是一个响应式对象
        this.data = _Vue.observable({
            current:"/" // 当前路由地址
        })
        this.init()

    }
    // 调用 createRouteMap, initComponent, initEvent 三个方法
    init(){
        this.createRouteMap()
        this.initComponent(_Vue)
        this.initEvent()
    }
    // 用来初始化 routeMap 属性，路由规则转换为键值对
    createRouteMap(){
        //遍历所有的路由规则 把路由规则解析成键值对的形式存储到routeMap中
        this.options.routes.forEach(route => {
            this.routeMap[route.path] = route.component
        });
    }
    // 用来创建 router-link 和 router-view 组件
    initComponent(Vue){
        Vue.component("router-link",{
            props:{
                to:String
            },
            render(h){
                return h("a",{
                    attrs:{
                        href:this.to
                    },
                    on:{
                        click:this.clickhander
                    }
                },[this.$slots.default])
            },
            methods:{
                clickhander(e){
                    history.pushState({},"",this.to)
                    this.$router.data.current=this.to
                    e.preventDefault()
                }
            }
            // template:"<a :href='to'><slot></slot><>"
        })
        const self = this
        Vue.component("router-view",{
            render(h){
                // self.data.current
                const cm=self.routeMap[self.data.current]
                return h(cm)
            }
        })
        
    }
    // 用来注册 popstate 事件
    initEvent(){
        //
        window.addEventListener("popstate",()=>{
            this.data.current = window.location.pathname
        })
    }
}