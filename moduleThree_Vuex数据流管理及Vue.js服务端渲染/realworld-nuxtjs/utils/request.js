/**
 * 基于 axios 封装的请求模块
 */

import axios from 'axios'

const request = axios.create({
    baseURL: 'https://conduit.productionready.io'
})

// 请求拦截器
// 任何请求都要经过请求拦截器
// 我们可以再请求拦截器中做一些公共的业务处理，例如统一设置 token
// request.interceptors.request.use( config => {
//     // 每次请求就会经过这里
//     // console.log(123)
//     // console.log(config)
//     config.headers.Authorization = `Token `

//     // 返回 config 请求配置对象
//     return config
// }, error => {
//     // 如果请求还发出去就失败了
//     return Promise.reject(errror)
// })

export default request