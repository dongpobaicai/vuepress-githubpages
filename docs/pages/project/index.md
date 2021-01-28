---
title: 项目实战
---

## 微前端项目

> 我们的业务场景是一个主应用包含多个子应用，为了各个应用相对独立，使用qiankun框架来开发

### 相关资料

+ [qiankun在线文档](https://qiankun.umijs.org/zh)
+ [ant design vue](https://www.antdv.com/docs/vue/introduce-cn/)

### 项目结构

> 这里截取一部分项目

+ student-health-platform  主应用
  + stu-caries-application  龋齿应用
  + stu-eyescreen-application 视力筛查应用

### 主应用（student-health-platform）

在入口permission.js获取子应用的配置

```js
// 获取微服务
await store.dispatch('GetApps')
```

这里我们是放到store的action中完成

```js
// 获取微服务
GetApps({ commit }) {
  return new Promise((resolve, reject) => {
    getMicroApps()
      .then(({ data }) => {
        commit('SET_APPS', data)
        resolve(data)
      })
      .catch(error => {
        reject(error)
      })
  })
}
```

微服务注册这块封装成一个js

```js
/**
 * @name 启用qiankun微前端应用
 * @param {Array} list 应用注册表信息
 */
const qianKunStart = list => {
  let apps = []
  list.forEach(item => {
    const { module, url, routerBase, appId, site } = item
    apps.push({
      name: module,
      entry: prod ? url : site,
      container: appContainer,
      activeRule: routerBase,
      props: { store, emits, global, routerBase, appId }
    })
  })

  // 注册子应用
  registerMicroApps(apps, {
    beforeLoad: app => console.log('[LifeCycle] before load %c%s', 'color: green;', app.name),
    beforeMount: app => console.log('[LifeCycle] before mount %c%s', 'color: green;', app.name),
    afterUnmount: app => console.log('[LifeCycle] after unmount %c%s', 'color: green;', app.name)
  })

  // 启动微前端
  start()

  // 启动qiankun应用间通信机制
  appStore(initGlobalState)

  // 添加全局的未捕获异常处理器
  !prod &&
    addGlobalUncaughtErrorHandler(event => {
      console.error(event)
    })
}

export default qianKunStart

```

这里对app对象做一个详细说明

```js
{
  name 微应用名称，必须唯一
  entry 必选，微应用的入口
  container 微应用的容器节点的选择器或者 Element 实例
  activeRule 路由匹配规则
  props 传给微应用的属性
}
```

接下来看看子应用的配置

### 子应用（stu-eyescreen-application）

首先来看下子应用项目入口js，重点关注 **bootstrap**、**mount**、**unmount** 三个生命周期钩子

1. 首先是子应用渲染函数
2. 三个生命周期函数
3. 兼容微应用项目独立运行情况
4. webpack导出包的相关信息

这里routerBase，来自主应用或独立运行为空
container，来自主应用或独立运行当前html

```js
let router = null
const __qiankun__ = window.__POWERED_BY_QIANKUN__

/**
 * 渲染函数
 * 两种情况：主应用生命周期钩子中运行 / 微应用单独启动时运行
 */
function render({ routerBase, container } = {}) {
  // 在 render 中创建 VueRouter，可以保证在卸载微应用时，移除 location 事件监听，防止事件污染
  router = createRouter({ routerBase })

  // 挂载应用
  instance = new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount(container ? container.querySelector('#app') : '#app')
}
```

bootstrap 应用初始化函数，项目启动执行一次
mount 应用加载函数
unmount 应用卸载函数

```js
export async function bootstrap(props) {
  appStore(props)
}

export async function mount(props) {
  render(props)

  await store.dispatch('user/GetInfo')
  await store.dispatch('permission/GenerateRoutes')
  // 动态添加可访问 路由
  router.addRoutes(store.getters.addRouters)
}

export async function unmount() {
  instance.$destroy?.()
  instance.$el.innerHTML = ''
  instance = null
  router = null
}

export async function update(props) {
  console.log('update props', props)
}
```

```js
// 独立运行时，直接挂载应用
__qiankun__ || render()
```

```js
{
  configureWebpack: {
    output: {
      // 微应用的包名，这里与主应用中注册的微应用名称一致
      library: `${name}-[name]`,
      libraryTarget: 'umd',
      jsonpFunction: `webpackJsonp_${name}`
    }
  }
}
```
