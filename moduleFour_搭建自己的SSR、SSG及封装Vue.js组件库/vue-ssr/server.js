const Vue = require('vue')
const express = require('express')
const fs = require('fs')
const {
    createRenderer,
    createBundleRenderer
} = require('vue-server-renderer')
const setupDevServer = require('./build/setup-dev-server')

const server = express()

server.use('/dist', express.static('./dist'))

// const serverBundle = require('./dist/vue-ssr-server-bundle.json')
// const clientManifest = require('./dist/vue-ssr-client-manifest.json')
// const template = fs.readFileSync('./index.template.html', 'utf-8')

// let renderer = createBundleRenderer(serverBundle, {
//     template,
//     clientManifest
// })

const isProd = process.env.NODE_ENV === 'production'

let renderer
let onReady
if (isProd) {
    // 生成模式
    const serverBundle = require('./dist/vue-ssr-server-bundle.json')
    const clientManifest = require('./dist/vue-ssr-client-manifest.json')
    const template = fs.readFileSync('./index.template.html', 'utf-8')
    
    renderer = createBundleRenderer(serverBundle,{
        template,
        clientManifest
    })
} else {
    // 开发模式 -> 监视打包构建 -> 重新生成 renderer 渲染器 
    onReady = setupDevServer(server, (serverBundle, template, clientManifest) => {
        renderer = createBundleRenderer(serverBundle,{
            template,
            clientManifest
        })
    })
}


const render = (req, res) => {

    // 将 Vue 实例渲染为字符串。上下文对象 (context object) 可选。
    renderer.renderToString({
        title: '拉勾教育',
        meta: ` <meta name="description" content="拉勾教育"> `
    }, (err, html) => {
        // 回调函数是典型的 Node.js 风格回调，其中第一个参数是可能抛出的错误，第二个参数是渲染完毕的字符串。
        console.log(err)
        // 

        if (err) {
            res.status(500).end('Internam Server Error.')
            // res.send(err)
        }
        res.send(html)
    })
}

server.get('/', isProd 
    ? render
    : async (req, res) => {
        // 等待有了 renderer 渲染器以后，调用 render 进行渲染
        await onReady
        render(req, res)

    }
)
// server.get('/', (req, res) => {
//     renderer.renderToString({
//         title: '拉勾教育',
//         meta: ` <meta name="description" content="拉勾教育"> `
//     }, (err, html) => {
//         if (err) {
//             return res.status(500).end('Internal Server Error.')
//         }
//         res.setHeader('Content-Type', 'text/html; charset=utf8') 
//         res.end(html)
//     })
// })


server.listen(3000, () => {
    console.log('server runing at port 3000')
})