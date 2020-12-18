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