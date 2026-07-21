<template><div class="mobile-config"><Form v-if="Object.keys(configObj).length"><FormItem v-for="key in fields" :key="key" :label="configObj[key].title"><Input v-model="configObj[key].val" /></FormItem><rightBtn :activeIndex="activeIndex" :configObj="configObj" /></Form></div></template><script>
import rightBtn from '../rightBtn/index.vue';
export default {
  name:'c_health_data_card',
  componentsName:'health_data_card',
  cname:'健康数据卡',
  components:{rightBtn},
  props:{activeIndex:{type:null},num:{type:null},index:{type:null}},
  
  watch:{num(n){this.configObj=JSON.parse(JSON.stringify(this.$store.state.mobildConfig.defaultArray[n]))},configObj:{handler(n){this.$store.commit('mobildConfig/UPDATEARR',{num:this.num,val:n})},deep:true}},
  mounted(){this.configObj=JSON.parse(JSON.stringify(this.$store.state.mobildConfig.defaultArray[this.num]))},
  data(){return {configObj:{},fields:['titleConfig','subTitleConfig','metricLabelConfig','glucoseConfig','unitConfig','timeConfig','statusConfig','adviceTitleConfig','adviceLabelConfig','adviceConfig','moreConfig']}}
}
</script>



