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