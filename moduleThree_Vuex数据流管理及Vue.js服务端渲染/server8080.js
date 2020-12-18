const http = require('http')

const app = http.createServer((req, res)=>{
    console.log('request')
    res.end('test')
})

app.listen(8080, ()=>{
    console.log('port on 8080')
})