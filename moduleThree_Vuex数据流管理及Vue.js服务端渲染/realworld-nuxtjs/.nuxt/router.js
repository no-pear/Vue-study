import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _2a1595dc = () => interopDefault(import('..\\pages\\layout' /* webpackChunkName: "" */))
const _c152d7de = () => interopDefault(import('..\\pages\\home' /* webpackChunkName: "" */))
const _4bb43677 = () => interopDefault(import('..\\pages\\login' /* webpackChunkName: "" */))
const _08a74537 = () => interopDefault(import('..\\pages\\profile' /* webpackChunkName: "" */))
const _c4fd1b56 = () => interopDefault(import('..\\pages\\settings' /* webpackChunkName: "" */))
const _1e46bc1f = () => interopDefault(import('..\\pages\\editor' /* webpackChunkName: "" */))
const _211ceef8 = () => interopDefault(import('..\\pages\\article' /* webpackChunkName: "" */))

// TODO: remove in Nuxt 3
const emptyFn = () => {}
const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onComplete = emptyFn, onAbort) {
  return originalPush.call(this, location, onComplete, onAbort)
}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: decodeURI('/'),
  linkActiveClass: 'active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/",
    component: _2a1595dc,
    children: [{
      path: "",
      component: _c152d7de,
      name: "home"
    }, {
      path: "/login",
      component: _4bb43677,
      name: "login"
    }, {
      path: "/register",
      component: _4bb43677,
      name: "register"
    }, {
      path: "/profile/:username",
      component: _08a74537,
      name: "profile"
    }, {
      path: "/settings",
      component: _c4fd1b56,
      name: "settings"
    }, {
      path: "/editor",
      component: _1e46bc1f,
      name: "editor"
    }, {
      path: "/article/:slug",
      component: _211ceef8,
      name: "article"
    }]
  }],

  fallback: false
}

export function createRouter () {
  return new Router(routerOptions)
}
