<template>
  <h1>{{ msg }}</h1>
  <button @click="count++">count is: {{ count }}</button>
  <button @click="handleClick">test</button>
  <p>Edit <code>components/HelloWorld.vue</code> to test hot module replacement.</p>
  <p>{{arr}}</p>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      count: 0,
      arr:[1,2,3,4,5]
    }
  },
  methods:{
    handleClick(){
      this.arr.length = 2
    }
  }
}
</script>
