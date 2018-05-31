# 项目前置

## Vue与后端数据交互: Axios

本项目使用Axios插件来处理数据请求传输。

详情请见[官方文档](https://github.com/axios/axios)

**基本用法:**

引入插件后，axios是一个全局的对象，并没有挂载到Vue实例上，因此可以直接调用。

```
methods:{
  //GET请求
  get:function(){
    axios.get('a.html',{
      params:{
        userId:'123'
      },
      headers:{
        token:'abc'
      }
    }).then(res=>{
      this.msg = res.data;
    }).catch(err=>{
      console.log('error init.');
    });
  },
  //POST请求
  post:function(){
    axios.post('a.html',{
      userId:'123'
    },{
      headers:{
        token:'abcd'
      }
    }).then(res=>{
      this.msg = res.data;
    })
  },
  //HTTP请求
  http:function(){
    axios({
      url:'a.html',
      method:'get/post',
      data:{},//post请求的参数使用需要这个
      params:{},//get请求参数需要使用这个
      headers:{}
    }).then(res=>{})
  }
},

//axios中的全局拦截器
mounted:function(){
  axios.interceptors.request.use(function(config){
    console.log('request init.');
    return config;
  });
  axios.interceptors.response.use(function(response){
    console.log('response init.');
    return response;
  })
}
```


***


## ES6的使用


### 函数的rest参数和扩展

`...`的应用形式：rest参数及扩展运算符。

rest参数和一个变量名搭配使用，生成一个数组，用于获取函数多余的参数：

```
let sum = (a,b,...m)=>{
  let total = 0;
  for(var i of m){
    total += i;
  }
  console.log(`total:${total}`);
}

sum(1,2,3,4); // total:7
```

数组的扩展:
```
console.log(...[1,2,3]);
// 1 2 3

//用来实现concat的效果
let arr1=[1,2]; let arr2=[3,4];
console.log(...[...arr1, ...arr2]);
// 1 2 3 4
```

(字符串)数组的解构:
```
let [m, ...n] = [1,2,3,4];
console.log(n);//Array(3)

let [a,b,c] = 'ES6';
console.log(a,b,c); // E S 6

//字符串转化为数组
let arr = [...'ES6'];
console.log(arr);//Array(3)
```


***


### Promise使用

之前我们通过callback函数和事件来实现异步操作，层层嵌套，金字塔式，使代码非常臃肿。

ES6提供了Promise对象，里面保存着某个未来才会结束的事件，从它可以获取异步操作的消息。

详情请看[阮一峰ES6详解](http://es6.ruanyifeng.com/#docs/promise)

这里只介绍一下常见用法:

```
let loadImageAsync(url) {
  return new Promise(function(resolve, reject){
    const image = new Image();
    image.onload = function() {
      resolve(image);
      //resolve函数的作用是，将Promise对象的状态从“未完成”变为“成功”
      //在异步操作成功时调用，并将异步操作的结果，作为参数传递出去
    };
    image.onerror = function {
      reject(new Error('Could not load image at' + url));
      //reject函数的作用是，将Promise对象的状态从“未完成”变为“失败”
      //在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去
    };
    image.src = url;
  });
};

//这一步可以链式调用then
loadImageAsync(url).then((res) => {
  document.body.appendChild(res);
  //此处还可以return一个Promise，后面继续指定then
}).catch((err) => {
  console.log("rejected:", err);
});
//catch用来捕获rejected状态，也可以把该回调写入then(resolve回调, rejected回调)
```

如果使用`then`方法，依次指定了多个回调函数。第一个回调函数完成以后，会将返回结果作为参数，传入第二个回调函数。

前一个回调函数可能返回一个`Promise`对象，后一个回调函数就会等待该`Promise`对象状态发生变化，才会被调用。

```
loadImageAsync(url_1).then((res)=>{
  return loadInfo(url_2);
}).then(function funcA(resA) {
  console.log("resolved: ", resA);
}, function funcB(err){
  console.log("rejected: ", err);
});
```

第一个`then`方法指定的回调函数，返回的是另一个`Promise`对象。这时，第二个`then`方法指定的回调函数，就会等待这个新的`Promise`对象状态发生变化。如果变为`resolved`，就调用`funcA`，如果状态变为`rejected`，就调用`funcB`。

如果要同时调用多个Promise，可以用`Promise.all()`:
```
Promise.all([checkLogin(), getUserInfo()]).then(([res1, res2]) => {
  console.log(res1, res2);
});
```


***


### ES6的模块化

之前已经详细介绍过:[ES6的模块化](https://github.com/longyincug/Notebook/blob/master/JS%E6%A8%A1%E5%9D%97%E5%8C%96.md#4d)









