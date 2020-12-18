<template>
  <Layout>
    <div>
      <h1>{{ $page.post.title }}</h1>
      <div>{{ $page.post.content }}</div>
    </div>
  </Layout>
</template>

<page-query>
query ($id: ID!) {
  post (id: $id) {
    id
    title
    content
  }
}
</page-query>

<script>
export default {
  name: 'PostPage',
  // metaInfo () {
  //   return {
  //     title: this.$page.post.title
  //   }
  // },
  mounted () {
    console.log(this.$page.post)
  }
}

</script>

<style>

</style>
