<template>
  <div id="app">
    <h1>{{ msg }}</h1>
    <h2>客户端交互</h2>
    <div>
      <input v-model="msg" />
    </div>
    <div>
      <button @click="onClick">点击测试</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      msg: "你好，世界",
    };
  },
  methods: {
    onClick() {
      console.log("hello world~~");
    },
  },
};
</script>

<style>
</style>