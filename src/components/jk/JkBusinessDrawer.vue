<template>
  <el-drawer
    :title="title"
    :visible.sync="innerVisible"
    :size="size"
    :wrapper-closable="!loading"
    :before-close="beforeClose"
    custom-class="jk-business-drawer"
    @closed="$emit('closed')">
    <div class="jk-business-drawer__layout">
      <div v-if="context" class="jk-business-drawer__header">
        <div>
          <div class="jk-business-drawer__title">{{ context.title || title }}</div>
          <div class="jk-business-drawer__sub">{{ context.businessNo || context.businessId || '--' }}</div>
        </div>
        <div class="jk-business-drawer__tags"><el-tag v-if="context.statusText" size="small" :type="context.statusTag || ''">{{ context.statusText }}</el-tag><slot name="header-actions" /></div>
      </div>
      <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon class="jk-business-drawer__alert" />
      <div v-loading="loading" class="jk-business-drawer__body">
        <el-breadcrumb v-if="viewStack.length > 1" separator="/" class="jk-business-drawer__breadcrumb">
          <el-breadcrumb-item v-for="(view,index) in viewStack" :key="view.key || index">
            <a v-if="index < viewStack.length - 1" @click.prevent="popTo(index)">{{ view.title }}</a>
            <span v-else>{{ view.title }}</span>
          </el-breadcrumb-item>
        </el-breadcrumb>
        <slot />
      </div>
      <div v-if="$slots.footer" class="jk-business-drawer__footer"><slot name="footer" /></div>
    </div>
  </el-drawer>
</template>

<script>
export default {
  name: 'JkBusinessDrawer',
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '业务详情' },
    size: { type: String, default: '880px' },
    loading: { type: Boolean, default: false },
    error: { type: String, default: '' },
    context: { type: Object, default: null },
    viewStack: { type: Array, default: () => [] }
  },
  computed: {
    innerVisible: {
      get() { return this.visible },
      set(value) { this.$emit('update:visible', value) }
    }
  },
  methods: {
    beforeClose(done) { if (this.loading) return; done() },
    popTo(index) { this.$emit('pop-view', index) }
  }
}
</script>

<style scoped>
.jk-business-drawer__layout{height:100%;display:flex;flex-direction:column}.jk-business-drawer__header{display:flex;align-items:center;justify-content:space-between;padding:0 24px 16px;border-bottom:1px solid #ebeef5}.jk-business-drawer__title{font-size:17px;font-weight:600;color:#303133}.jk-business-drawer__sub{margin-top:5px;color:#909399;font-size:12px}.jk-business-drawer__tags{display:flex;align-items:center;gap:8px}.jk-business-drawer__alert{margin:14px 24px 0}.jk-business-drawer__body{flex:1;min-height:0;padding:18px 24px 82px;overflow:auto}.jk-business-drawer__breadcrumb{margin-bottom:16px}.jk-business-drawer__footer{position:absolute;right:0;bottom:0;left:0;padding:12px 24px;border-top:1px solid #ebeef5;background:#fff;text-align:right;box-shadow:0 -2px 10px rgba(0,0,0,.04)}
</style>
