<template>
  <div class="layout-columns-aside">
    <el-scrollbar>
      <Logo />
      <ul>
        <li
          v-for="(v, k) in columnsAsideList"
          :key="k"
          ref="columnsAsideOffsetTopRefs"
          class="layout-columns"
          :class="{ 'layout-columns-active': v.k === liIndex }"
          :title="v.title"
          @click="onColumnsAsideMenuClick(v)"
        >
          <div :class="setColumnsAsidelayout">
            <i :class="'el-icon-' + v.icon"></i>
            <div class="font13">
              {{
                v.title && v.title.length >= 4
                  ? v.title.substr(0, setColumnsAsidelayout === 'columns-vertical' ? 4 : 3)
                  : v.title
              }}
            </div>
          </div>
        </li>
        <div ref="columnsAsideActiveRef" :class="setColumnsAsideStyle"></div>
      </ul>
    </el-scrollbar>
  </div>
</template>

<script>
import { getMenuSider, getHeaderName, findFirstNonNullChildren } from '@/utils/system.js';
import Logo from '@/layout/logo/index.vue';
import { mapState } from 'vuex';

export default {
  name: 'layoutColumnsAside',
  components: { Logo },
  data() {
    return {
      columnsAsideList: [],
      liIndex: 0,
      difference: 0,
      routeSplit: [],
    };
  },
  computed: {
    setColumnsAsideStyle() {
      return this.$store.state.themeConfig.themeConfig.columnsAsideStyle;
    },
    setColumnsAsidelayout() {
      return this.$store.state.themeConfig.themeConfig.columnsAsideLayout;
    },
    Layout() {
      return this.$store.state.themeConfig.themeConfig.Layout;
    },
    routesList() {
      return this.$store.state.user.menuList;
    },
    ...mapState('menu', ['activePath']),
  },
  beforeDestroy() {
    this.bus.$off('routesListChange');
  },
  mounted() {
    this.bus.$on('routesListChange', () => {
      this.setFilterRoutes();
    });
    this.setFilterRoutes();
  },
  methods: {
    setColumnsAsideMove(k) {
      if (k === undefined) return false;
      const els = this.$refs.columnsAsideOffsetTopRefs;
      this.liIndex = k;
      this.$refs.columnsAsideActiveRef.style.top = `${els[k].offsetTop + this.difference}px`;
    },
    /**
     * 一级菜单只进入真实页面。空目录、按钮权限或异常菜单数据均回退到一级路由自身，
     * 由该路由的 redirect 选择默认页面，不能再直接进入 /404。
     */
    onColumnsAsideMenuClick(v) {
      const children = Array.isArray(v.children) ? v.children : [];
      const firstPage = children.length ? findFirstNonNullChildren(children) : null;
      const targetPath = firstPage && firstPage.path ? firstPage.path : v.path;
      if (targetPath) {
        this.$router.push(targetPath);
      }
      this.$store.state.themeConfig.themeConfig.isCollapse = children.length <= 1;
    },
    onColumnsAsideDown(k) {
      this.$nextTick(() => {
        this.setColumnsAsideMove(k);
      });
    },
    setFilterRoutes() {
      if (this.$store.state.user.menuList.length <= 0) return false;
      this.columnsAsideList = this.filterRoutesFun(this.$store.state.user.menuList);
      const resData = this.setSendChildren(getHeaderName(this.$route, this.columnsAsideList));
      if (!resData.children) {
        this.bus.$emit('setSendColumnsChildren', []);
        this.$store.commit('user/childMenuList', []);
        this.$store.state.themeConfig.themeConfig.isCollapse = true;
        return false;
      }
      this.bus.$emit('oneCatName', resData.item[0].title);
      this.onColumnsAsideDown(resData.item[0].k);
      this.$store.state.themeConfig.themeConfig.isCollapse = resData.children.length === 0;
      this.bus.$emit('setSendColumnsChildren', resData.children || []);
      this.$store.commit('user/childMenuList', resData.children || []);
    },
    setSendChildren(path) {
      const currentData = {};
      this.columnsAsideList.forEach((v, k) => {
        v.k = k;
        if (v.path === path) {
          currentData.item = [{ ...v }];
          if (v.children) currentData.children = v.children;
        }
      });
      return currentData;
    },
    filterRoutesFun(arr) {
      return arr
        .filter((item) => item.path)
        .map((item) => {
          const copy = Object.assign({}, item);
          const children = Array.isArray(copy.children) ? copy.children : [];
          copy.children = children.length ? this.filterRoutesFun(children) : [];
          return copy;
        });
    },
    setColumnsMenuHighlight(path) {
      const currentSplitRoute = this.columnsAsideList.find((v) => v.path === path);
      if (!currentSplitRoute) return false;
      setTimeout(() => {
        this.onColumnsAsideDown(currentSplitRoute.k);
      }, 0);
    },
  },
  watch: {
    '$store.state': {
      handler(val) {
        this.difference = val.themeConfig.themeConfig.columnsAsideStyle === 'columnsRound' ? 3 : 0;
      },
      deep: true,
    },
    $route: {
      handler(to) {
        this.setColumnsMenuHighlight(to.path);
        const headName = getHeaderName(to, this.columnsAsideList);
        const sider = getMenuSider(this.columnsAsideList, headName);
        const asideList = sider.length && sider[0].children ? sider[0].children : [];
        const resData = this.setSendChildren(headName);
        if (resData.item) {
          this.onColumnsAsideDown(resData.item[0].k);
          this.bus.$emit('oneCatName', resData.item[0].title);
        } else {
          this.onColumnsAsideDown(0);
        }
        this.$store.commit('user/childMenuList', asideList);
      },
      deep: true,
    },
  },
};
</script>

<style scoped lang="scss">
.layout-columns-aside {
  width: 80px;
  height: 100%;
  background: var(--prev-bg-columnsMenuBar);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  border-right: 1px solid var(--prev-border-color-lighter);
  z-index: 20;
  ul {
    position: relative;
    li {
      color: var(--prev-bg-columnsMenuBarColor);
      width: 100%;
      height: 50px;
      text-align: center;
      display: flex;
      cursor: pointer;
      position: relative;
      z-index: 1;
      .columns-vertical {
        margin: auto;
        .columns-vertical-title {
          padding-top: 1px;
        }
      }
      .columns-horizontal {
        display: flex;
        height: 50px;
        width: 100%;
        align-items: center;
        justify-content: center;
        padding: 0 5px;
        i {
          margin-right: 3px;
        }
        a {
          display: flex;
          .columns-horizontal-title {
            padding-top: 1px;
          }
        }
      }
      a {
        text-decoration: none;
        color: var(--prev-bg-columnsMenuBarColor);
      }
    }
    .layout-columns {
      transition: 0.3s ease-in-out;
    }
    .layout-columns-active,
    .layout-columns-active a {
      color: var(--prev-bg-columnsMenuActiveColor);
      transition: 0.3s ease-in-out;
    }
    .columns-round {
      background: var(--prev-color-primary);
      position: absolute;
      left: 50%;
      top: 2px;
      height: 50px;
      width: 65px;
      transform: translateX(-50%);
      z-index: 0;
      transition: 0.3s ease-in-out;
      border-radius: 5px;
    }
    .columns-card {
      @extend .columns-round;
      top: 0;
      height: 50px;
      width: 100%;
      border-radius: 0;
    }
  }
}
</style>
