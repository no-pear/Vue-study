import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _524582c3 = () => interopDefault(import('..\\pages\\about.vue' /* webpackChunkName: "pages/about" */))
const _d59f0238 = () => interopDefault(import('..\\pages\\parent.vue' /* webpackChunkName: "pages/parent" */))
const _e077e5c4 = () => interopDefault(import('..\\pages\\parent\\index.vue' /* webpackChunkName: "pages/parent/index" */))
const _749b17dc = () => interopDefault(import('..\\pages\\parent\\foo.vue' /* webpackChunkName: "pages/parent/foo" */))
const _a8296a46 = () => interopDefault(import('..\\pages\\user\\index.vue' /* webpackChunkName: "pages/user/index" */))
const _d0db319e = () => interopDefault(import('..\\pages\\user\\one.vue' /* webpackChunkName: "pages/user/one" */))
const _40986085 = () => interopDefault(import('..\\pages\\user\\_id.vue' /* webpackChunkName: "pages/user/_id" */))
const _71fd5d88 = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))

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
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/about",
    component: _524582c3,
    name: "about"
  }, {
    path: "/parent",
    component: _d59f0238,
    children: [{
      path: "",
      component: _e077e5c4,
      name: "parent"
    }, {
      path: "foo",
      component: _749b17dc,
      name: "parent-foo"
    }]
  }, {
    path: "/user",
    component: _a8296a46,
    name: "user"
  }, {
    path: "/user/one",
    component: _d0db319e,
    name: "user-one"
  }, {
    path: "/user/:id",
    component: _40986085,
    name: "user-id"
  }, {
    path: "/",
    component: _71fd5d88,
    name: "index"
  }],

  fallback: false
}

export function createRouter () {
  return new Router(routerOptions)
}
