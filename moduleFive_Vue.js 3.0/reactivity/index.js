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