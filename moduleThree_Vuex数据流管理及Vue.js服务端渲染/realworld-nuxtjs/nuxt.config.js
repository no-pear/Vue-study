/**
 * Nuxt.js 配置文件
 */

module.exports = {
    router: {
        linkActiveClass: 'active',
        extendRoutes(routes, resolve) {
            //  console.log("extendRoutes -> routes", routes)
            // 清除 Nuxt.js 基于 pages 目录默认生成对的路由表规则
            routes.splice(0)

            routes.push(...[{
                path: '/',
                component: resolve(__dirname, 'pages/layout'),
                children: [{
                        path: '', // 默认子路由
                        name: 'home',
                        component: resolve(__dirname, 'pages/home')
                    },
                    {
                        path: '/login',
                        name: 'login',
                        component: resolve(__dirname, 'pages/login')
                    }, {
                        path: '/register',
                        name: 'register',
                        component: resolve(__dirname, 'pages/login')
                    }, {
                        path: '/profile/:username',
                        name: 'profile',
                        component: resolve(__dirname, 'pages/profile')
                    }, {
                        path: '/settings',
                        name: 'settings',
                        component: resolve(__dirname, 'pages/settings')
                    }, {
                        path: '/editor',
                        name: 'editor',
                        component: resolve(__dirname, 'pages/editor')
                    }, {
                        path: '/article/:slug',
                        name: 'article',
                        component: resolve(__dirname, 'pages/article')
                    }
                ]
            }])
        }
    },

    server: {
        host: '0.0.0.0',
        port: 9000
    },

    // 注册插件
    plugins: [
        '~/plugins/request.js',
        '~/plugins/dayjs.js'
    ]
}