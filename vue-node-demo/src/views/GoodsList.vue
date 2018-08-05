<template>
  <div>

    <nav-header></nav-header>
    <nav-bread>
      <span>Goods</span>
    </nav-bread>
    <div class="accessory-result-page accessory-page">
      <div class="container">
        <div class="filter-nav">
          <span class="sortby">Sort by:</span>
          <a href="javascript:void(0)" @click="resetPrice()" :class="{default:true, cur:sort==0}">Default</a>
          <a href="javascript:void(0)" @click="priceSort()" :class="{price:true, cur:sort}" >Price {{sortFlag?'↑':'↓'}}</a>
          <a href="javascript:void(0)" class="filterby stopPop" @click="showFilter">Filter by</a>
        </div>
        <div class="accessory-result">
          <!-- filter -->
          <div class="filter stopPop" id="filter" :class="{'filterby-show':filterBy}">
            <dl class="filter-price">
              <dt>Price:</dt>
              <dd><a :class="{'cur':flag=='All'}" @click="setPriceFilter()" href="javascript:void(0)">All</a></dd>
              <dd v-for="(price, index) in priceFilter">
                <a :class="{'cur':flag==index}" @click="setPriceFilter(index)" href="javascript:void(0)">{{price.startPrice}} - {{price.endPrice}}</a>
              </dd>
            </dl>
          </div>

          <!-- search result accessories list -->
          <div class="accessory-list-wrap">
            <div class="accessory-list col-4">
              <ul>
                <li v-for="item in goodsList">
                  <div class="pic">
                    <a href="#"><img v-lazy="'/static/'+item.productImage" :key="'/static/'+item.productImage"></a>
                  </div>
                  <div class="main">
                    <div class="name">{{item.productName}}</div>
                    <div class="price">{{item.salePrice}}</div>
                    <div class="btn-area">
                      <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div class="load-more" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="30">
              <img v-show="loading" src="/static/loading-svg/loading-spinning-bubbles.svg" alt="">
            </div>

          </div>
        </div>
      </div>
    </div>
    <!--<div class="md-overlay" v-show="overLayFlag"></div>-->

    <!--全局模态框组件modal-->
    <!--加入失败-->
    <modal :mdShow="mdShow" @close="closeModal">
      <p slot="message">
        请先登录，否则无法加入到购物车中！
      </p>
      <div slot="btnGroup">
        <a class="btn btn--m" href="javascript:;" @click="mdShow=false">关闭</a>
      </div>
    </modal>

    <!--加入成功-->
    <modal :mdShow="mdShowCart" @close="closeModal">
      <p slot="message">
        <svg class="icon-status-ok">
          <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-cart"></use>
        </svg>
        <span>加入购物车成功！</span>
      </p>
      <div slot="btnGroup">
        <a class="btn btn--m" href="javascript:;" @click="mdShowCart=false">继续购物</a>
        <router-link class="btn btn--m" href="javascript:;" to="/cart">查看购物车</router-link>
      </div>
    </modal>

    <nav-footer></nav-footer>
  </div>
</template>

<script>
  import NavHeader from './../components/NavHeader'
  import NavFooter from './../components/NavFooter'
  import NavBread from './../components/NavBread'
  import Modal from './../components/Modal'
  import '@/assets/css/base.css'
  import '@/assets/css/product.css'
  import axios from 'axios'
  export default {
    name: "GoodsList",
    data(){
      return {
        flag: 'All',
        goodsList: [],
        priceFilter: [
          {
            startPrice: 0,
            endPrice: 500
          },
          {
            startPrice: 500,
            endPrice: 1000
          },
          {
            startPrice: 1000,
            endPrice: 2000
          },
          {
            startPrice: 2000,
            endPrice: 5000
          },
          {
            startPrice: 5000,
            endPrice: 20000
          }
        ],
        filterBy: false,
        mdShow: false,
        mdShowCart: false,
        sort: 0,
        sortFlag: true,
        page: 1,
        pageSize: 8,
        busy: true,
        loading: false,
        priceTop: true
      }
    },
    components: {
      Modal,
      NavHeader,
      NavFooter,
      NavBread
    },
    mounted: function () {
      this.getGoodsList();
    },
    methods: {
      closeModal(){
        this.mdShow = false;
        this.mdShowCart = false;
      },
      addCart(productId){
        axios.post("/goods/addCart",{productId:productId}).then((res)=>{
          if(res.data.status==0){
            this.mdShowCart = true;
          }else{
            // alert("msg:"+res.data.msg);
            this.mdShow = true;
          }
        });
      },
      resetPrice(){
        //默认排序
        this.sort = 0;
        this.page = 1;
        this.getGoodsList();
      },
      priceSort(){
        //价格有序
        this.sort = 1;
        this.page = 1;
        this.sortFlag = !this.sortFlag;
        this.getGoodsList();
      },
      loadMore(){
        this.busy = true;
        //此时不要再重复进行加载请求
        setTimeout(()=>{
          this.page++;
          this.getGoodsList(true);
        }, 500);
      },
      //如果传入loadFlag，说明是加载插件在调用，要把数据做加法
      getGoodsList(loadFlag){
        var param = {
          page: this.page,
          pageSize: this.pageSize,
          sort: this.sort == 0 ? this.sort : (this.sortFlag?1:-1),
          start: this.flag=='All' ? 0 : this.priceFilter[this.flag].startPrice,
          end: this.flag=='All' ? 20000 : this.priceFilter[this.flag].endPrice,
        };
        this.loading = true;
        axios.get("/goods/list",{params: param}).then((res)=>{
          // console.log(res);
          this.loading = false;
          if(res.data.status == '0') {
            if(loadFlag){
              this.goodsList = this.goodsList.concat(res.data.result);
              if(res.data.result.length == 0){
                //当数据加载完毕，禁用加载
                this.busy = true;
              }else{
                //可以继续加载
                this.busy = false;
              }
            }else{
              this.goodsList = res.data.result;
              //开启无限加载，可以开始滚动
              this.busy = false;
            }
          } else {
            this.goodsList = [];
          }
        });
      },
      showFilter(){
        this.mdShow = true;
        this.filterBy = true;
      },
      setPriceFilter(index){
        if(index == undefined) {
          this.flag = 'All';
        } else {
          this.flag = index;
        }
        this.page = 1;
        this.getGoodsList();
        this.closeFilter();
      },
      closeFilter(){
        this.filterBy = false;
        this.mdShow = false;
      }
    }
  }
</script>

