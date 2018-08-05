var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');

//连接数据库
mongoose.connect('mongodb://127.0.0.1:27017/vue');

mongoose.connection.on("connected", function () {
  console.log("mongodb connected success.");
});

mongoose.connection.on("error", function () {
  console.log("mongodb connected fail.");
});

mongoose.connection.on("disconnected", function () {
  console.log("mongodb connected disconnected.");
});

router.get("/list", function (req, res, next) {
  let page = parseInt(req.param("page"));
  let pageSize = parseInt(req.param("pageSize"));
  let sort = parseInt(req.param("sort"));
  let skip = (page-1)*pageSize;
  let startPrice = parseInt(req.param("start"));
  let endPrice = parseInt(req.param("end"));

  /*let priceLevels = [
    {$gte: 0, $lt: 500},
    {$gte: 500, $lt: 1000},
    {$gte: 1000, $lt: 2000},
    {$gte: 2000, $lt: 5000},
    {$gte: 5000, $lt: 20000},
  ]*/

  let params = {salePrice:{$gte: startPrice, $lt: endPrice}};
  let goodsModel = Goods.find(params);

  sort?goodsModel.sort({'salePrice':sort}).skip(skip).limit(pageSize):goodsModel.skip(skip).limit(pageSize);
  console.log(sort);
  goodsModel.exec(function (err, docs) {
    if(err){
      res.json({
        status: 1,
        result: [],
        msg: err.message
      });
    } else {
      res.json({
        status: 0,
        result: docs,
        msg: ""
      })
    }

  });
});

router.post("/addCart", function (req, res, next) {
  //关于userId，涉及到vuex
  var userId = "100000077", productId = req.body.productId;
  var User = require("../models/users");

  User.findOne({userId:userId}, function (err, userDoc) {
    if(err){
      res.json({
        status:"1",
        msg: err.message,
      })
    }else{
      if(userDoc){
        //获取用户的商品数据后，看购物车内有没有该商品
        let goodsItem = '';
        userDoc.cartList.forEach(function (item) {
          if(item.productId == productId){
            goodsItem = item;
            item.productNum++;
          }
        });
        if(goodsItem){
          //如果购物车内已有所添加商品，直接加数量并保存
          userDoc.save(function (err2, doc2) {
            if(err2){
              res.json({
                status:"1",
                msg: err2.message
              })
            }else{
              res.json({
                status: "0",
                msg:'',
                result:"success"
              })
            }
          })
        }else{
          //如果购物车内没有所添加商品，去goods里面获取并保存
          Goods.findOne({productId:productId},function (err1,doc) {
            if(err1){
              res.json({
                status:"1",
                msg: err1.message,
              })
            }else{
              if(doc){
                // 这里获取到的是JSON对象
                //添加一些额外的属性，再插入到cartList
                // console.log(doc);
                //转换成JS对象，才能成功添加进去属性
                doc = doc.toObject();
                doc.productNum = 1;
                doc.checked = 1;
                // console.log(doc);
                //注意这里是userDoc，不是User，因为是往一个指定的用户数据里添加
                userDoc.cartList.push(doc);
                userDoc.save(function (err2, doc2) {
                  if(err2){
                    res.json({
                      status:"1",
                      msg: err2.message
                    })
                  }else{
                    res.json({
                      status: "0",
                      msg:'',
                      result:"success"
                    })
                  }
                })
              }
            }
          })
        }
      }
    }
  })
});


module.exports = router;

