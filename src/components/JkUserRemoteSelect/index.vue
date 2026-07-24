<template>
  <el-select
    :value="value"
    clearable
    filterable
    remote
    :remote-method="search"
    :loading="loading"
    :placeholder="placeholder"
    :style="selectStyle"
    @input="$emit('input', $event)"
    @clear="$emit('clear')"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="Number(item.value)"
    />
  </el-select>
</template>

<script>
import { getJkUserOptions } from '@/api/jkBusiness'

export default {
  name: 'JkUserRemoteSelect',
  props: {
    value: { type: [Number, String], default: null },
    placeholder: { type: String, default: '姓名 / 手机号' },
    width: { type: String, default: '220px' },
  },
  data() { return { loading: false, options: [] } },
  computed: { selectStyle() { return { width: this.width } } },
  created() { this.search('') },
  methods: {
    search(keyword) {
      this.loading = true
      getJkUserOptions({ keyword: keyword || '', limit: 30 }).then(res => {
        this.options = (res && res.data) || res || []
      }).finally(() => { this.loading = false })
    },
  },
}
</script>
