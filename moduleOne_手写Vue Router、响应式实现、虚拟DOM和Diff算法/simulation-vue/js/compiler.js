class Compiler {
    constructor (vm) {
        this.el = vm.$el
        this.vm = vm
        this.compile(this.el)
    }

    // 编译模板,处理文本节点和元素节点
    compile (el) {
        const childNodes = [...el.childNodes]
        // let childNodes = Array.from(el.childNodes)
        childNodes.forEach(node => {
            if (this.isTextNode(node)){
                // 处理文本节点
                this.compileText(node)
            } else if (this.isElementNode(node)){
                // 处理元素节点
                this.compileElement(node)
            }

            // 判断 node 节点，是否有子节点，如果有子节点，要递归调用 compile
            if (node.childNodes && node.childNodes.length) {
                this.compile(node)
            }
        })
    }

    // 编译元素节点，处理指令
    compileElement (node) {
        // console.log(Array.from(node.attributes))
        // 遍历所有的属性节点
        Array.from(node.attributes).forEach(attr =>{
            console.log(attr)
            // 判断是否是指令
            let attrName = attr.name
            // console.log("Compiler -> compileElement -> attrName", attrName)
            if (this.isDirective(attrName)) {
                // v-text --> text
                attrName = attrName.substr(2)  //v-text
                let key = attr.value //如 <div v-text="msg"></div> 中的 msg
                // console.log("Compiler -> compileElement -> key", key)
                this.update(node, key, attrName)
            }
        })
    }

    // 不同指令所调用的函数
    update (node, key, attrName) {
        let updateFn = this[attrName + 'Updater'];

        // 处理 v-on 指令
        if (attrName.startsWith('on:')) {
            updateFn = this['on' + 'Updater']
            const eventType = attrName.split(':')[1]
            updateFn.call(this, node, this.vm[key], key, eventType)
            return
        }
        console.log('~~~~', this.vm)
        updateFn && updateFn.call(this, node, this.vm[key], key) // 此处的 this 就是 compiler 对象
    }

    // 处理 v-text 指令
    textUpdater (node, value, key) {
        node.textContent = value

        new Watcher(this.vm, key, (newValue) => {
            node.textContent = newValue
        })
    }

    // 处理 v-model 指令
    modelUpdater (node, value, key) {
        node.value = value

        new Watcher(this.vm, key, (newValue) => {
            node.value = newValue
        })

        // 双向绑定
        node.addEventListener('input', () => {
            this.vm[key] = node.value
        })
    }

    // 处理 v-html 指令
    htmlUpdater (node, value, key) {
        node.innerHTML = value

        new Watcher(this.vm, key, (newValue) => {
            node.innerHTML = newValue
        })
    }

    // 处理 v-on 指令
    onUpdater (node, value, key, eventType) {
        console.log("Compiler -> onUpdater -> eventType", eventType)
        // console.log(value, key, eventType, this.vm.$options.methods[key])
        console.log('111',this.vm.$options.methods[key])
        node.addEventListener(eventType, this.vm.$options.methods[key])

    }

    // 编译文本节点，处理插值表达式
    compileText (node) {
        // console.dir(node)
        // {{ msg }}
        const reg = /\{\{(.+?)\}\}/
        const value = node.textContent // 获取文本节点内容
        // console.log("Compiler -> compileText -> value", value)
        if (reg.test(value)) {
            let key = RegExp.$1.trim()  // 获取到差值表达式内的内容
            node.textContent = value.replace(reg, this.vm[key])
            // console.log("Compiler -> compileText -> this.vm[key]", this.vm[key])

            // 创建 watcher 对象，当数据改变更新视图
            new Watcher(this.vm, key, (newValue) => {
                node.textContent = newValue
            })
        }
    }

    // 判断元素属性是否是指令
    isDirective (attrName) {
        return attrName.startsWith('v-')
    }

    // 判断节点是否是文本节点
    isTextNode (node) {
        return node.nodeType === 3
    }

    // 判断节点是否是元素节点
    isElementNode (node) {
        return node.nodeType === 1
    }
}