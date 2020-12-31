<template>
  <div>
    <h1>About Page</h1>
    <p>{{ msg }}</p>
    <input type="text" name="" id="" v-model="msg">
  </div>
</template>

<script>
export default {
  name: 'AboutPage',
  metaInfo: {
    title: '关于'
  },
  data () {
    return {
      msg: 'helloworld'
    }
  }
}
</script>

<style>

</style>
