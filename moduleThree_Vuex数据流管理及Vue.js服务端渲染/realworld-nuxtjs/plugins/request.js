/**
 * 基于 axios 封装的请求模块
 */

import axios from 'axios'

// 创建请求对象
export const request = axios.create({
    baseURL: 'https://conduit.productionready.io'
})

// 通过插件机制获取到上下文对象 (query、params、req、res、app、store)
// 插件导出函数必须作为 default 成员
export default (context) => {
    // console.log("context", context)


    // 请求拦截器
    // 任何请求都要经过请求拦截器
    // 我们可以再请求拦截器中做一些公共的业务处理，例如统一设置 token
    request.interceptors.request.use(config => {
        // 每次请求就会经过这里
        // console.log(123)
        // console.log(config)

        const { user } = context.store.state

        if (user && user.token) {
            config.headers.Authorization = `Token ${user.token}`
        }

        // 返回 config 请求配置对象
        return config
    }, error => {
        // 如果请求还发出去就失败了
        return Promise.reject(errror)
    })
}
