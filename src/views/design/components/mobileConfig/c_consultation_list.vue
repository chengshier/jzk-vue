<template><div class="mobile-config"><Form v-if="Object.keys(configObj).length"><FormItem label="标题"><Input v-model="configObj.titleConfig.val" /></FormItem><FormItem label="副标题"><Input v-model="configObj.subTitleConfig.val" /></FormItem><FormItem label="更多文案"><Input v-model="configObj.moreConfig.val" /></FormItem><FormItem v-for="(item,index) in configObj.noticeConfig.list" :key="index" :label="'公告'+(index+1)"><Input v-model="item.title" /><Input v-model="item.date" /></FormItem><rightBtn :activeIndex="activeIndex" :configObj="configObj" /></Form></div></template><script>
import rightBtn from '../rightBtn/index.vue';
export default {
  name:'c_consultation_list',
  componentsName:'consultation_list',
  cname:'公告咨询',
  components:{rightBtn},
  props:{activeIndex:{type:null},num:{type:null},index:{type:null}},
  data(){return {configObj:{}}},
  watch:{num(n){this.configObj=JSON.parse(JSON.stringify(this.$store.state.mobildConfig.defaultArray[n]))},configObj:{handler(n){this.$store.commit('mobildConfig/UPDATEARR',{num:this.num,val:n})},deep:true}},
  mounted(){this.configObj=JSON.parse(JSON.stringify(this.$store.state.mobildConfig.defaultArray[this.num]))}
}
</script>


