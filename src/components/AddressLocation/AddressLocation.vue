<template>
    <div class="address-location">
      <el-button id="addbutton"
                 icon="el-icon-add-location"
                 circle
                 :disabled="disabled"
                 :size="size"
                 :type="type"
                 @click="getLocation">
      </el-button>
      <span>{{ location }}</span>
  
    </div>
  </template>
  
<script>
import AMapLoader from '@amap/amap-jsapi-loader'
  
window._AMapSecurityConfig = {
  securityJsCode: '8fcfab078ad46a996251a42ce436a66c'
}
let AMap = null
export default {
  name: 'AddressLocator',
  data () {
    return {
      location: this.value
    }
  },
  props: {
    value: {
      type: String
    },
    placement: {
      type: String,
      default: 'right'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String
    },
    size: {
      type: String
    }
  },
  methods: {
    initAMap () {
      AMapLoader.load({
        key: '54b5a6b3244b6a6ffed6b25eecd60229', // 申请好的Web端开发者Key，首次调用 load 时必填
        version: '2.0',
        plugins: []
      })
        .then(Amap => {
          AMap = Amap;
        })
        .catch(e => {
          console.log('高德地图加载错误', e);
        });
    },
  
    // 获取位置
    getLocation () {
      let that = this;
      AMap.plugin(['AMap.Geolocation', 'AMap.Geocoder'], function () {
        let geolocation = new AMap.Geolocation({
          enableHighAccuracy: true, // 是否使用高精度定位，默认:true
          GeoLocationFirst: true,
          timeout: 10000, // 超过10秒后停止定位，默认：无穷大
          maximumAge: 0, // 定位结果缓存0毫秒，默认：0
          convert: true, // 自动偏移坐标，偏移后的坐标为高德坐标，默认：true
          showButton: true, // 显示定位按钮，默认：true
          buttonPosition: 'LB', // 定位按钮停靠位置，默认：'LB'，左下角
          buttonOffset: new AMap.Pixel(10, 20), // 定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
          showMarker: true, // 定位成功后在定位到的位置显示点标记，默认：true
          showCircle: true, // 定位成功后用圆圈表示定位精度范围，默认：true
          panToLocation: true, // 定位成功后将定位到的位置作为地图中心点，默认：true
          zoomToAccuracy: true, // 定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
          extensions: true
        });
        let geocoder = new AMap.Geocoder({
          radius: 1000, // 以已知坐标为中心点，radius为半径，返回范围内兴趣点和道路信息
          extensions: 'all' // 返回地址描述以及附近兴趣点和道路信息，默认“base”
        });
        console.log(geolocation);
        // 获取当前坐标信息
        geolocation.getCurrentPosition(function (status, result) {
          if (status === 'complete') {
            onComplete(result);
          } else {
            console.log(status);
            console.log(result);
            // 获取失败使用ip定位
            that.ipLocation()
          }
        });
  
        function onComplete (data) {
          geocoder.getAddress(data.position, function (status, result) {
            if (status === 'complete') {
              // 坐标获取成功，将
              console.log(result)
              that.location = result.regeocode.formattedAddress
            } else if (status === 'error') {
              console.log('error')
              that.ipLocation()
            } else {
              console.log('no value')
            }
          });
          // console.log(data)
        }
      });
    },
    // 通过ip定位
    ipLocation: async function () {
      const key = '2bf2e8bf3299ec6501cb9ce5e5e42e38'
      this.$axios.get(`https://restapi.amap.com/v3/ip?key=${key}`).then(res => {
        console.log(res);
        this.location = res.data.province + res.data.city
        console.log(this.location)
      })
    },
    emitInput (values) {
      this.$emit('input', values);
      this.$emit('change', values);
    }
  
  },
  mounted () {
    this.initAMap()
  },
  watch: {
    location (val) {
      this.emitInput(val);
    },
    value (val) {
      this.location = val;
    }
  }
}
</script>
  <style scoped>
  #addbutton {
    margin: auto 4px;
  }
</style>
