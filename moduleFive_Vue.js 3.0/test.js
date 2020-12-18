var a = {
    value: 1,
},
b = {
    value: 2,        
}    

function foo (x, y) {
    x.value = 3
    y = 10
    console.log(x.value)
    console.log(y.value)
}

foo(a, b) // 3 undefined
console.log(a.value) // 3
console.log(b.value) // 2
