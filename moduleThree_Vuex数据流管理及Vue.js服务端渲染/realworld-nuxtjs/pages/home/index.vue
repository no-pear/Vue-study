<template>
  <div class="home-page">
    <div class="banner">
      <div class="container">
        <h1 class="logo-font">conduit</h1>
        <p>A place to share your knowledge.</p>
      </div>
    </div>

    <div class="container page">
      <div class="row">
        <div class="col-md-9">
          <!-- 文章选择导航栏 -->
          <div class="feed-toggle">
            <ul class="nav nav-pills outline-active">
              <li v-if="user" class="nav-item">
                <nuxt-link 
                  class="nav-link" 
                  :class="{
                    active: tab === 'your_feed'
                  }"
                  exact
                  :to="{
                    name: 'home',
                    query: {
                      tab: 'your_feed'
                    }
                  }"
                >Your Feed</nuxt-link>
              </li>
              <li class="nav-item">
                <nuxt-link 
                  class="nav-link" 
                  :class="{
                    active: tab === 'global_feed'
                  }"
                  exact
                  :to="{
                    name: 'home',
                    query: {
                      tab: 'global_feed'
                    }
                  }"
                >Global Feed</nuxt-link>
              </li>
              <li v-if="tag" class="nav-item">
                <nuxt-link 
                  class="nav-link" 
                  :class="{
                    active: tab === 'tag'
                  }"
                  exact
                  :to="{
                    name: 'home',
                    query: {
                      tab: 'tag',
                      tag
                    }
                  }"
                >#{{ tag }}</nuxt-link>
              </li>
            </ul>
          </div>

          <!-- 文章列表 -->
          <div class="article-preview" 
            v-for="article in articles"
            :key='article.slug'
          >
            <div class="article-meta">
              <!-- <a href="profile.html"
                ><img src="http://i.imgur.com/Qr71crq.jpg"
              /></a> -->
              <nuxt-link :to="{
                name: 'profile',
                params: {
                  username: article.author.username
                }
              }">
                  <img :src="article.author.image"/>
              </nuxt-link>
              <div class="info">
                <!-- <a href="" class="author">Eric Simons</a> -->
                <nuxt-link class="author" :to="{
                name: 'profile',
                params: {
                  username: article.author.username
                }
              }">
                  {{ article.author.username }}
                </nuxt-link>
                <span class="date">{{ article.createdAt | date('MMM DD, YYYY') }}</span>
              </div>
              <button class="btn btn-outline-primary btn-sm pull-xs-right"
                :class="{
                  active: article.favorited
                }"
                @click="onFavorite(article)"
                :disabled='article.favoriteDisabled'
              >
                <i class="ion-heart"></i> {{ article.favoritesCount }}
              </button>
            </div>
            <nuxt-link 
              :to="{
                name: 'article',
                params: {
                  slug: article.slug
                }
              }" 
              class="preview-link"
            >
              <h1>{{ article.title }}</h1>
              <p>{{ article.description }}</p>
              <span>Read more...</span>
            </nuxt-link>
          </div>

          <!-- 分页列表 -->
          <nav>
            <ul class="pagination">
              <li 
                class="page-item" 
                :class="{
                  active: item === page
                }"
                v-for="item in totalPage"
                :key="item"
              >
                <nuxt-link 
                  class="page-link" 
                  :to="{
                    name: 'home',
                    query: {
                      page: item,
                      tag: $route.query.tag,
                      tab: $route.query.tab
                    }
                  }"
                >{{ item }}</nuxt-link>
              </li>

            </ul>
          </nav>

        </div>

        <!-- 标签列表 -->
        <div class="col-md-3">
          <div class="sidebar">
            <p>Popular Tags</p>

            <div class="tag-list">
              <nuxt-link 
                :to="{
                  name: 'home',
                  query: {
                    tag,
                    tab: 'tag'
                  }
                }" 
                class="tag-pill tag-default"
                v-for="tag in tags"
                :key="tag"
              >{{ tag }}</nuxt-link>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  getArticles, 
  getFeedArticles,
  addFavorite,
  deleteFavorite 
} from '@/api/article'
import { getTags } from '@/api/tag'
import { mapState } from 'vuex'

export default {
  name: "HomeIndex",
  watchQuery: ['page', 'tag', 'tab'], // 监听 query 参数改变
  async asyncData ({ query, store }) {
    const page = Number.parseInt(query.page || 1) // 表示第几页
    const limit = 20 // 每页显示条数
    let { tag, tab } = query // 从 url 中解构出 tag 参数
    tab = tab || 'global_feed'
    const loadArticles = store.state.user && tab === 'your_feed'
                        ? getFeedArticles
                        : getArticles

    // 获取公共文章列表
    // const { data } = await getArticles({
    //   limit,
    //   offset: (page - 1) * limit // 数据偏移量，表示跳过前 * 条，如为 offset 和 limit 都为2 则第一页显示第 3.4 条
    // })
    // // console.log(data)

    // // 获取文章标签列表
    // const { data : tagData } = await getTags()
    // return {
    //   articles: data.articles, // 文章列表
    //   articlesCount: data.articlesCount, // 文章数量
    //   tags: tagData.tags.splice(10), // 文章标签列表
    //   limit,
    //   page,
    // }

    // 优化并行异步任务
    const [articleRes, tagRes] = await Promise.all([
      loadArticles({
        limit,
        offset: (page - 1) * limit,
        tag: tag
      }),
      getTags()
    ])

    const { articles, articlesCount } = articleRes.data
    // console.log("articlesCount", articlesCount)
    // console.log("articleRes.data", articleRes.data)
    const { tags } = tagRes.data

    // 为文章增添属性，用于后期点赞避免多次重复点击按钮
    articles.forEach(article => article.favoriteDisabled = false)

    return {
      articles: articles, // 文章列表
      articlesCount: articlesCount, // 文章数量
      tags: tags.splice(10), // 文章标签列表
      limit,
      page,
      tag,
      tab 
    }
  },
  computed: {
    ...mapState(['user']),
    // 总页码数量
    totalPage () {
      return Math.ceil(this.articlesCount / this.limit)
    }
  },
  methods: {
    async onFavorite (article) {
      // console.log("onFavorite -> article", article)
      article.favoriteDisabled = true

      if (article.favorited) {
        // 取消点赞
        await deleteFavorite(article.slug)
        article.favorited = false
        article.favoritesCount --

      } else {
        // 添加点赞
        await addFavorite(article.slug)
        article.favorited = true
        article.favoritesCount ++
      }
      article.favoriteDisabled = false
    }
  }
};
</script>

<style>
</style>