import { VNode } from './vnode'

// patch 函数开始的时候触发
export type PreHook = () => any
// createElm 函数开始之前的时候触发
// 再把 VNode 转换成真实 DOM 之前触发
export type InitHook = (vNode: VNode) => any
// createElm 函数末尾调用
// 创建完真实 DOM 后触发
export type CreateHook = (emptyVNode: VNode, vNode: VNode) => any
// patch 函数末尾执行
// 真实 DOM 添加到 DOM 树中触发
export type InsertHook = (vNode: VNode) => any
// patchVNode 函数开头调用
// 开始对比两个 VNode 的差异之前触发 
export type PrePatchHook = (oldVNode: VNode, vNode: VNode) => any
// patchVNode 函数开头调用
// 两个 VNode 对比过程中触发，比 prepatch 稍晚
export type UpdateHook = (oldVNode: VNode, vNode: VNode) => any
// patchVNode 的最末尾调用
// 两个 VNode 对比结束执行
export type PostPatchHook = (oldVNode: VNode, vNode: VNode) => any
// removeVnodes -> invokeDestroyHook 中调用
// 在删除元素之前触发，子节点的 destroy 也被触发
export type DestroyHook = (vNode: VNode) => any
// removeVNodes 中调用
// 元素被删除的时候触发
export type RemoveHook = (vNode: VNode, removeCallback: () => void) => any
// patch 函数的最后调用
export type PostHook = () => any

export interface Hooks {
  pre?: PreHook
  init?: InitHook
  create?: CreateHook
  insert?: InsertHook
  prepatch?: PrePatchHook
  update?: UpdateHook
  postpatch?: PostPatchHook
  destroy?: DestroyHook
  remove?: RemoveHook
  post?: PostHook
}
