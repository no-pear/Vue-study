#!/usr/bin/env node

const Koa = require('koa')
const send = require('koa-send')
const path = require('path')
const compilerSFC = require('@vue/compiler-sfc')
const { Readable } = require('stream')

const app = new Koa()

// 流转换为字符串
const streamToString = stream => new Promise((resolve, reject) => {
    const chunks = []
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    stream.on('error', reject)
  })

// 字符串转换为流
const stringToStream = text => {
    const stream = new Readable()
    stream.push(text)
    stream.push(null)
    return stream
  }

// 3. 加载第三方模块
app.use(async (ctx,next) => {
    // ctx.path --> /@modules/vue
    if (ctx.path.startsWith('/@modules/')) {
        const moduleName = ctx.path.substr(10)
        // console.log("🚀 ~ file: index.js ~ line 22 ~ app.use ~ moduleName", moduleName)

        const pkgPath = path.join(process.cwd(), 'node_modules', moduleName, 'package.json')
        // console.log("🚀 ~ file: index.js ~ line 24 ~ app.use ~ pkgPath", pkgPath)

        const pkg = require(pkgPath)
        // console.log("🚀 ~ file: index.js ~ line 26 ~ app.use ~ pkg", pkg)

        ctx.path = path.join('/node_modules', moduleName, pkg.module)
        // console.log("🚀 ~ file: index.js ~ line 28 ~ app.use ~ ctx.path", ctx.path)
    }
    await next()
})

// 1. 静态文件服务器
app.use(async (ctx, next) => {
    console.log('ctx.path----', ctx.path)
    
    await send(ctx, ctx.path, {root: process.cwd(), index: 'index.html'})
    await next()
})

// 4. 处理单文件组件
app.use(async (ctx, next) => {
    if (ctx.path.endsWith('.vue')) {
        const contents = await streamToString(ctx.body)
        // console.log("🚀 ~ file: index.js ~ line 58 ~ app.use ~ contents", contents)
        // console.log('compilerSFC.parse(contents)----', compilerSFC.parse(contents))
        const { descriptor } = compilerSFC.parse(contents)
        let code
        if (!ctx.query.type) {
            // 单文件组件第一次请求
            // 单文件组件编译成选项对象，返回给浏览器
            code = descriptor.script.content
            // console.log(code)
            code = code.replace(/export\s+default\s+/g, 'const __script = ')
            // console.log("🚀 ~ file: index.js ~ line 66 ~ app.use ~ code", code)
            code += `
                import { render as __render } from "${ctx.path}?type=template"
                __script.render = __render
                export default __script
            `
        } else if (ctx.query.type === 'template') {
            // 单文件组件第二次请求
            // 服务器编译模板，返回编译之后的 render 函数
            const templateRender = compilerSFC.compileTemplate({ source: descriptor.template.content })
            console.log("🚀 ~ file: index.js ~ line 77 ~ app.use ~ templateRender", templateRender)
            code = templateRender.code
        }

        ctx.type = 'application/javascript'
        ctx.body = stringToStream(code)
    }

    await next()
})

// 2. 修改第三方模块的路径
app.use(async (ctx, next) => {
    if (ctx.type === 'application/javascript') {
        const contents = await streamToString(ctx.body)
        // import vue from 'vue'
        // import App from './App.vue'
        ctx.body = contents
            .replace(/(from\s+['"])(?![\.\/])/g, '$1/@modules/')
            .replace(/process\.env\.NODE_ENV/g, '"development"')
    }
})

app.listen(3000)
console.log('Server runing @ 3000')