var express = require('express');
var router = express.Router();
require('./../util/util');//日期格式化
var User = require('./../models/users');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


//登录接口
router.post("/login", function (req,res,next) {
  var param = {
    userName:req.body.userName,
    userPwd:req.body.userPwd
  };
  User.findOne(param, function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message
      });
    }else{
      if(doc){
        //设置cookie，参数分别为key、value、options
        res.cookie('userId',doc.userId,{path:'/',maxAge:1000*60*60});
        res.cookie('userName',doc.userName,{path:'/',maxAge:1000*60*60});
        //设置一个session，便于数据的存取
        // req.session.user = doc;
        res.json({
          status:'0',
          msg:'',
          result:{
            userName:doc.userName
          }
        })
      }
    }
  })
});

//登出接口
router.post("/logout",function (req,res,next) {
  //清除cookie
  res.cookie('userId',"",{
    path:'/',
    maxAge:-1
  });
  res.json({
    status:"0",
    msg:'',
    result:''
  })
});

//打开页面时检测是否存在cookie，存在则登录
router.get("/checkLogin", function (req,res,next) {
  if(req.cookies.userId){
    res.json({
      status:'0',
      msg:'',
      result:req.cookies.userName
    });
  }else{
    res.json({
      status:'1',
      msg:"未登录",
      result:''
    })
  }
});

//购物车数据加载
router.get("/cartList", function (req,res,next) {
  var userId = req.cookies.userId;
  User.findOne({userId:userId}, function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    } else {
      if(doc){
        res.json({
          status:'0',
          msg:"",
          result:doc.cartList
        });
      }
    }
  })
});

//购物车删除
router.post("/cartDel",function (req,res,next) {
  var userId = req.cookies.userId, productId = req.body.productId;
  User.update({userId:userId},{$pull:{cartList:{productId:productId}}},function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    } else {
      res.json({
        status:'0',
        msg:'',
        result:'success'
      })
    }
  });
});

//购物车增减
router.post("/cartEdit",function (req,res,next) {
  var userId = req.cookies.userId,
    productId = req.body.productId,
    productNum=req.body.productNum,
    checked = req.body.checked;
  User.update({"userId":userId,"cartList.productId":productId},{
    "cartList.$.productNum":productNum,
    "cartList.$.checked":checked
  },function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    } else {
      res.json({
        status:'0',
        msg:'',
        result:'success'
      })
    }
  });
});

//购物车全选
router.post("/editCheckAll",function (req,res,next) {
  userId = req.cookies.userId;
  checkAll = req.body.checkAll;
  User.findOne({"userId":userId},function (err,user) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    } else {
      if(user){
        user.cartList.forEach((item)=>{
          item.checked = checkAll ? "1" : "0";
        });
        user.save(function (err1,doc) {
          if (err1) {
            res.json({
              status: '1',
              msg: err1.message,
              result: ''
            });
          }else{
            res.json({
              status:'0',
              msg:'',
              result:'success'
            });
          }
        });
      }
    }
  })
});

//查询用户地址接口
router.get("/addressList", function (req,res,next) {
  var userId = req.cookies.userId;
  User.findOne({'userId':userId}, function (err,doc) {
    if (err) {
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    } else {
      res.json({
        status:'0',
        msg:'',
        result:doc.addressList
      });
    }
  })
});

//设置默认地址
router.post("/setDefault",function (req,res,next) {
  var userId = req.cookies.userId;
  var addressId = req.body.addressId;
  User.findOne({"userId":userId},function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    } else {
      var addressList = doc.addressList;
      addressList.forEach((item)=>{
        if(item.addressId == addressId){
          item.isDefault = true;
        } else {
          item.isDefault = false;
        }
      });

      doc.save(function (err1,doc1) {
        if (err1) {
          res.json({
            status:'1',
            msg:err.message,
            result:''
          });
        } else {
          res.json({
            status:'0',
            msg:'',
            result:'success'
          });
        }
      })
    }
  });
});

//地址删除
router.post("/delAddress",function (req,res,next) {
  var userId = req.cookies.userId;
  var addressId = req.body.addressId;
  User.update({"userId":userId},{
    $pull:{
      'addressList':{
        'addressId':addressId
      }
    }
  },function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    } else {
      res.json({
        status:'0',
        msg:'',
        result:'success'
      })
    }
  });
});

//生成订单，支付（略过）
router.post("/payment",function (req,res,next) {
  var userId = req.cookies.userId;
  var orderTotal = req.body.orderTotal;
  var addressId = req.body.addressId;
  User.findOne({'userId':userId},function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    } else {
      var address = {};
      var goodsList = [];
      //获取用户的地址信息
      doc.addressList.forEach((item)=>{
        if(addressId == item.addressId){
          address = item;
        }
      });
      //获取用户的订单商品
      doc.cartList.forEach((item)=>{
        if(item.checked == '1'){
          goodsList.push(item);
        }
      });

      var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
      var sysDate = new Date().Format('yyyyMMddhhmmss');
      var orderId = sysDate + Date.now().toString().slice(-3);

      var order = {
        orderId: orderId,
        orderTotal: orderTotal,
        addressInfo: address,
        goodsList: goodsList,
        orderStatus: '1',
        createDate:createDate
      };
      doc.orderList.push(order);
      doc.save(function (err1,doc1) {
        if(err){
          res.json({
            status:'1',
            msg:err.message,
            result:''
          })
        } else {
          res.json({
            status:'0',
            msg:'',
            result: {
              orderId:order.orderId,
              orderTotal: order.orderTotal
            }
          })
        }
      });
    }
  });
});

//展示订单，根据订单id查询商品信息
router.get("/orderDetail",function (req,res,next) {
  var userId = req.cookies.userId, orderId = req.param("orderId");
  User.findOne({userId:userId},function (err,userInfo) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      var orderList = userInfo.orderList;
      if(orderList.length > 0){
        orderList.forEach((item)=>{
          if(item.orderId == orderId){
            orderTotal = item.orderTotal;
          }
        });
        if(orderTotal > 0){
          //订单结算成功
          //清空购物车选中的
          User.update({userId:userId},{
            $pull:{
              'cartList':{
                checked:'1'
              }
            }
          },function (err,doc) {
            if (err) {
              res.json({
                status: '120003',
                msg: "购物车数据清除失败",
                result: ''
              })
            } else {
              res.json({
                status: '0',
                msg: '',
                result: {
                  orderId:orderId,
                  orderTotal:orderTotal
                }
              })
            }
          });
        } else {
          res.json({
            status:'120002',
            msg:'无此订单',
            result:''
          });
        }
      }else{
        res.json({
          status:'120001',
          msg:'用户没有创建订单',
          result:''
        });
      }
    }
  })
});


module.exports = router;
