/**
 * 系统内置方法集，正常情况下您不应该修改或移除此文件
 */

import { cloneDeep } from 'lodash';

function getHeaderName(to, menuList) {
  const allMenus = [];
  menuList.forEach((menu) => {
    const headerName = menu.path || '';
    const menus = transferMenu(menu, headerName);
    allMenus.push({ path: menu.path, header: headerName });
    menus.forEach((item) => allMenus.push(item));
  });
  const currentMenu = allMenus.find((item) => {
    const path = to.meta && to.meta.activeMenu ? to.meta.activeMenu : to.path;
    return item.path === path || path === getPath(to, item.path);
  });
  return currentMenu ? currentMenu.header : null;
}

function getPath(to, path) {
  const params = [];
  const query = [];
  Object.keys(to.params).forEach((item) => {
    params.push(to.params[item]);
  });
  Object.keys(to.query).forEach((item) => {
    query.push(item + '=' + to.query[item]);
  });
  return path
    + (params.length ? '/' + params.join('/') : '')
    + (query.length ? '?' + query.join('&') : '');
}

function transferMenu(menu, headerName) {
  if (menu.children && menu.children.length) {
    return menu.children.reduce((all, item) => {
      all.push({ path: item.path, header: headerName });
      return all.concat(transferMenu(item, headerName));
    }, []);
  }
  return [menu];
}

export { getHeaderName };

function getHeaderSider(menuList) {
  return menuList.filter((item) => item.pid === 0);
}

export { getHeaderSider };

function getOneHeaderName(menuList, path) {
  return menuList.filter((item) => item.path === path);
}

export { getOneHeaderName };

function getMenuSider(menuList, headerName = '') {
  return headerName
    ? menuList.filter((item) => item.path === headerName)
    : menuList;
}

export { getMenuSider };

function getSiderSubmenu(to, menuList) {
  const allMenus = [];
  menuList.forEach((menu) => {
    const menus = transferSubMenu(menu, []);
    allMenus.push({ path: menu.path, openNames: [] });
    menus.forEach((item) => allMenus.push(item));
  });
  const currentMenu = allMenus.find((item) => {
    if (!item.openNames.length) return false;
    return item.path === to.path || to.path === getPath(to, item.path);
  });
  return currentMenu ? currentMenu.openNames : [];
}

function transferSubMenu(menu, openNames) {
  if (menu.children && menu.children.length) {
    const itemOpenNames = openNames.concat([menu.path]);
    return menu.children.reduce((all, item) => {
      all.push({ path: item.path, openNames: itemOpenNames });
      return all.concat(transferSubMenu(item, itemOpenNames));
    }, []);
  }
  return [{ path: menu.path, openNames }];
}

export { getSiderSubmenu };

function getAllSiderMenu(menuList) {
  let allMenus = [];
  menuList.forEach((menu) => {
    if (menu.children && menu.children.length) {
      getMenuChildren(menu).forEach((item) => allMenus.push(item));
    } else {
      allMenus.push(menu);
    }
  });
  return allMenus;
}

function getMenuChildren(menu) {
  if (menu.children && menu.children.length) {
    return menu.children.reduce((all, item) => {
      return all.concat(getMenuChildren(item));
    }, []);
  }
  return [menu];
}

export { getAllSiderMenu };

function flattenSiderMenu(menuList, newList) {
  menuList.forEach((menu) => {
    const newMenu = {};
    Object.keys(menu).forEach((key) => {
      if (key !== 'children') newMenu[key] = cloneDeep(menu[key]);
    });
    newList.push(newMenu);
    if (menu.children) flattenSiderMenu(menu.children, newList);
  });
  return newList;
}

export { flattenSiderMenu };

/**
 * 从菜单树中寻找第一个真正可跳转的页面。
 * M 为目录、A 为按钮，均不能作为最终跳转目标；空目录会继续检查后续兄弟节点。
 */
export const findFirstNonNullChildren = (menus) => {
  if (!Array.isArray(menus) || menus.length === 0) return null;

  for (const menu of menus) {
    if (!menu) continue;
    const children = Array.isArray(menu.children) ? menu.children : [];
    if (children.length) {
      const page = findFirstNonNullChildren(children);
      if (page) return page;
    }

    const menuType = String(menu.menuType || menu.menu_type || '').toUpperCase();
    const path = String(menu.path || '').trim();
    if (path && menuType !== 'M' && menuType !== 'A') {
      return menu;
    }
  }
  return null;
};

export const findFirstNonNullChildrenKeys = (obj, lastArr) => {
  const ids = Array.isArray(lastArr) ? lastArr : [];
  if (!obj) return ids;
  ids.push(obj.id);
  const children = Array.isArray(obj.children) ? obj.children : [];
  if (!children.length) return ids;
  return findFirstNonNullChildrenKeys(children[0], ids);
};

export const formatFlatteningRoutes = (arr) => {
  if (!Array.isArray(arr) || arr.length <= 0) return false;
  let result = arr.slice();
  for (let i = 0; i < result.length; i++) {
    if (result[i].children && result[i].children.length) {
      result = result.slice(0, i + 1)
        .concat(result[i].children, result.slice(i + 1));
    }
  }
  return result;
};

function includeArray(list1, list2) {
  if (list1 === true) return true;
  if (typeof list2 !== 'object' || !list1 || typeof list1.includes !== 'function') {
    return false;
  }
  return list2.some((item) => list1.includes(item));
}

export { includeArray };
