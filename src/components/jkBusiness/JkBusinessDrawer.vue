<template>
  <el-drawer
    :title="title"
    :visible.sync="innerVisible"
    :size="size"
    :append-to-body="true"
    :destroy-on-close="false"
    custom-class="jk-business-drawer"
    @closed="$emit('closed')"
  >
    <div class="jk-drawer-body">
      <div v-if="$slots.context" class="jk-drawer-context"><slot name="context" /></div>
      <slot />
    </div>
    <div v-if="$slots.footer" class="jk-drawer-footer"><slot name="footer" /></div>
  </el-drawer>
</template>

<script>
export default {
  name: 'JkBusinessDrawer',
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '业务详情' },
    size: { type: [String, Number], default: '720px' }
  },
  computed: {
    innerVisible: {
      get() { return this.visible },
      set(value) { this.$emit('update:visible', value) }
    }
  }
}
</script>

<style scoped>
.jk-drawer-body{height:calc(100vh - 132px);overflow:auto;padding:0 22px 24px;box-sizing:border-box}.jk-drawer-context{position:sticky;z-index:2;top:0;margin:0 -22px 20px;padding:16px 22px;border-bottom:1px solid #ebeef5;background:#fff}.jk-drawer-footer{position:absolute;right:0;bottom:0;left:0;padding:14px 22px;border-top:1px solid #ebeef5;background:#fff;text-align:right;box-sizing:border-box}
</style>
