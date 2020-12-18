const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const webpack = require('webpack')
const devMiddleware = require('webpack-dev-middleware')

const resolve = file => path.resolve(__dirname, file)

module.exports = (server, callback) => {
    let ready
    const onReady = new Promise(resolve => ready = resolve )

    // 监视 构建 -> 更新 renderer

    let template
    let serverBundle
    let clientManifest

    const update = () => {
        // console.log(template)
        // console.log(serverBundle)
        // console.log(clientManifest)
        if (template && serverBundle && clientManifest) {
            // console.log(onReady)
            
            // console.log(onReady)
            callback(template, serverBundle, clientManifest)
            // 更改 promise 状态
            ready()
            
        }
    }

    // 监视构建 template -> 调用 update -> 更新 renderer 渲染器
    const templatePath = path.resolve(__dirname, '../index.template.html')
    template = fs.readFileSync(templatePath, 'utf-8')
    // console.log("🚀 ~ file: setup-dev-server.js ~ line 26 ~ template", template)
    update()
    chokidar.watch(templatePath).on('change', () => {
        // console.log('template changed')
        template = fs.readFileSync(templatePath, 'utf-8')
        update()
    })
    
    // 监视构建 serverBundle -> 调用 update -> 更新 renderer 渲染器
    const serverConfig = require('./webpack.server.config')
    const serverCompiler = webpack(serverConfig)
    const serverDevMiddleware = devMiddleware(serverCompiler, {
        logLevel: 'silent' // 关闭日志输出，由 FriendlyErrorsWebpackPlugin 处理 在 webpack-dev-middleware 4.x版本中已废弃
    })
    serverCompiler.hooks.done.tap('server', () => {
        serverBundle = JSON.parse(
            serverDevMiddleware.fileSystem.readFileSync(resolve('../dist/vue-ssr-server-bundle.json')
            , 'utf-8')
        )
        // console.log(serverBundle)
        update()
    })
    // serverCompiler.watch({}, (err, stats) => {
    //     if (err) throw err
    //     // stats 构建出的方法模块
    //     if(stats.hasErrors()) return
    //     // console.log('success')
    //     serverBundle = JSON.parse(fs.readFileSync(resolve('../dist/vue-ssr-server-bundle.json'), 'utf-8'))
    //     // console.log("🚀 ~ file: setup-dev-server.js ~ line 47 ~ serverCompiler.watch ~ serverBundle", serverBundle)
    //     update()
    // })

    // 监视构建 clientManifest -> 调用 update -> 更新 renderer 渲染器
    const clientConfig = require('./webpack.client.config')
    const clientCompiler = webpack(clientConfig)
    const clientDevMiddleware = devMiddleware(clientCompiler, {
        publicPath: clientConfig.output.publicPath,
        logLevel: 'silent' // 关闭日志输出，由 FriendlyErrorsWebpackPlugin 处理 在 webpack-dev-middleware 4.x版本中已废弃
    })
    clientCompiler.hooks.done.tap('client', () => {
        clientManifest = JSON.parse(
            clientDevMiddleware.fileSystem.readFileSync(resolve('../dist/vue-ssr-client-manifest.json')
            , 'utf-8')
        )
        // console.log(clientManifest)
        update()

    })

    return onReady
}