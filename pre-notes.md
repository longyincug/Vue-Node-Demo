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

注意：

`axios`插件不支持`jsonp`请求，但官方推荐了`jsonp`模块来达到目的，见[官方文档](https://github.com/mzabriskie/axios/blob/master/COOKBOOK.md#jsonp)。

***


## ES6语法

[ES6常用语法](https://blog.csdn.net/longyin0528/article/details/80580922)








