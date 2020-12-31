// Server API makes it possible to hook into various parts of Gridsome
// on server-side and add custom data to the GraphQL data layer.
// Learn more: https://gridsome.org/docs/server-api/

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

const axios = require('axios')

module.exports = function (api) {
  api.loadSource(async ({
    addCollection
  }) => {
    // Use the Data Store API here: https://gridsome.org/docs/data-store-api/

    api.loadSource(async actions => {
      const collection = actions.addCollection('Post')

      const {
        data
      } = await axios.get('http://jsonplaceholder.typicode.com/posts')

      for (const item of data) {
        collection.addNode({
          id: item.id,
          title: item.title,
          content: item.body
        })
      }

      // follow
      const collection2 = actions.addCollection('follow')
      const {
        data: res
      } = await axios.get('https://api.github.com/users/jiaxuan-dev/following')
      // console.log(res)
      res.forEach(item => {
        collection2.addNode(item)
      })

      // 
      let users = []
      const collection3 = actions.addCollection('detail')

      // const {data:user1} = await axios.get('https://api.github.com/users/zce')
      // collection3.addNode(user1)
      // const {data:user2} = await axios.get('https://api.github.com/users/GitHub-Laziji')
      // collection3.addNode(user2)


      // res.forEach(async (item) => {
      //   console.log(item.url)
      //   let {data: user} = await axios.get(item.url)
      //   console.log(user)
      //   collection3.addNode(user)
      // })


      // res.forEach( (item) => {
      //   console.log(item.url)
      //   axios.get(item.url).then(({data: user}) => {
      //     console.log(user)
      //     collection3.addNode(user)
      //   })
      // })

      // res.forEach(async (item) => {
      //   let {data: user} = await axios.get(item.url)
      //   users.push(user)
      // })

      for (const item of res) {
        let {data: user} = await axios.get(item.url)
        console.log(user)
        collection3.addNode(user)
      }


    })
  })

  api.createPages(({
    createPage
  }) => {
    // Use the Pages API here: https://gridsome.org/docs/pages-api/
  })
}