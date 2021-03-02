---
title: 项目实战
---

## 微前端项目

> 我们的业务场景是一个主应用包含多个子应用，为了各个应用相对独立，使用 qiankun 框架来开发

### 相关资料

- [qiankun 在线文档](https://qiankun.umijs.org/zh)
- [ant design vue](https://www.antdv.com/docs/vue/introduce-cn/)

### 项目结构

> 这里截取一部分项目

- student-health-platform 主应用
  - stu-caries-application 龋齿应用
  - stu-eyescreen-application 视力筛查应用

### 主应用（student-health-platform）

在入口 permission.js 获取子应用的配置

```js
// 获取微服务
await store.dispatch("GetApps");
```

这里我们是放到 store 的 action 中完成

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

微服务注册这块封装成一个 js

```js
/**
 * @name 启用qiankun微前端应用
 * @param {Array} list 应用注册表信息
 */
const qianKunStart = (list) => {
  let apps = [];
  list.forEach((item) => {
    const { module, url, routerBase, appId, site } = item;
    apps.push({
      name: module,
      entry: prod ? url : site,
      container: appContainer,
      activeRule: routerBase,
      props: { store, emits, global, routerBase, appId },
    });
  });

  // 注册子应用
  registerMicroApps(apps, {
    beforeLoad: (app) =>
      console.log("[LifeCycle] before load %c%s", "color: green;", app.name),
    beforeMount: (app) =>
      console.log("[LifeCycle] before mount %c%s", "color: green;", app.name),
    afterUnmount: (app) =>
      console.log("[LifeCycle] after unmount %c%s", "color: green;", app.name),
  });

  // 启动微前端
  start();

  // 启动qiankun应用间通信机制
  appStore(initGlobalState);

  // 添加全局的未捕获异常处理器
  !prod &&
    addGlobalUncaughtErrorHandler((event) => {
      console.error(event);
    });
};

export default qianKunStart;
```

这里对 app 对象做一个详细说明

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

首先来看下子应用项目入口 js，重点关注 **bootstrap**、**mount**、**unmount** 三个生命周期钩子

1. 首先是子应用渲染函数
2. 三个生命周期函数
3. 兼容微应用项目独立运行情况
4. webpack 导出包的相关信息

这里 routerBase，来自主应用或独立运行为空
container，来自主应用或独立运行当前 html

```js
let router = null;
const __qiankun__ = window.__POWERED_BY_QIANKUN__;

/**
 * 渲染函数
 * 两种情况：主应用生命周期钩子中运行 / 微应用单独启动时运行
 */
function render({ routerBase, container } = {}) {
  // 在 render 中创建 VueRouter，可以保证在卸载微应用时，移除 location 事件监听，防止事件污染
  router = createRouter({ routerBase });

  // 挂载应用
  instance = new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount(container ? container.querySelector("#app") : "#app");
}
```

bootstrap 应用初始化函数，项目启动执行一次
mount 应用加载函数
unmount 应用卸载函数

```js
export async function bootstrap(props) {
  appStore(props);
}

export async function mount(props) {
  render(props);

  await store.dispatch("user/GetInfo");
  await store.dispatch("permission/GenerateRoutes");
  // 动态添加可访问 路由
  router.addRoutes(store.getters.addRouters);
}

export async function unmount() {
  instance.$destroy?.();
  instance.$el.innerHTML = "";
  instance = null;
  router = null;
}

export async function update(props) {
  console.log("update props", props);
}
```

```js
// 独立运行时，直接挂载应用
__qiankun__ || render();
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

## vue vben admin2 的学习借鉴

### 国际化处理

### 路由

- 权限控制三种方式
  - 全局路由动态生成：前台写死路由通过接口返回权限控制，直接后端判断权限返回
  - 细粒度控制，通过权限方法
  - 权限指令控制

### 请求对象的封装

- 通过类方法形式创建请求实例
- 通过配置方式，设置请求拦截，响应拦截

## 经典题分享

搜集平时做过觉得好的题目

1. 函数柯里化
   说明：是把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，并且返回接受余下的参数而且返回结果的新函数的技术

```js
a(1, 2) 3
a(1, 2, 3) 6
a(1, 2, 3, 4) 10

// 柯里化
a(1)(2)
a(1)(2)(3)
a(1)(2)(3)(4)

function a(x) {
  return function(y) {
    return x + y
  }
}
// 通用版
var currying = function(fn) {
  // 获取第一个方法参数
  var args = Array.prototype.slice.call(arguments, 1)
  return function() {
    var newArgs = args.concat(Array.prototype.slice.call(arguments))
    return fn.apply(this, newArgs)
  }
}

// 上面只能算两个参数，如果多个还需要调整

// 支持多参数传递
function progressCurrying(fn, args) {

    var _this = this
    var len = fn.length;
    var args = args || [];

    return function() {
        var _args = Array.prototype.slice.call(arguments);
        Array.prototype.push.apply(args, _args);

        // 如果参数个数小于最初的fn.length，则递归调用，继续收集参数
        if (args.length < len) {
            return progressCurrying.call(_this, fn, _args);
        }

        // 参数收集完毕，则执行fn
        return fn.apply(this, args);
    }
}
function test(a, b) {
  return a + b
}
console.log(progressCurrying(test)(1)(2)(3) )
t(1)(2)(3)
t(2)(3)
```

2. 对象键值，以下输出什么

```js
const a = {};
const b = { key: "b" };
const c = { key: "c" };

a[b] = 123;
a[c] = 456;

console.log(a[b]);
```

3. js 事件环机制，结合 setTimeout 说明

以下的打印顺序

```js
var a = () => {
  console.log("first");
};
var b = () =>
  setTimeout(() => {
    console.log("second");
  });
var c = () => {
  console.log("three");
};

a();
b();
c();
```

- 执行上述代码，依次放入执行栈中
- 开始执行，执行 a，打印 first
- 执行 b，WebAPI 不能随时向栈内添加内容。相反，它将回调函数推到名为 queue 的地方。
- 执行 c，打印 three
- 一个事件循环查看栈和任务队列。如果栈是空的，它接受队列上的第一个元素并将其推入栈
- 打印 second

4. 事件的响应顺序

- Capturing > Target > Bubbling
- 在捕获阶段，从父元素到目标元素
- 在冒泡阶段，从目标元素一直向上冒泡
- 默认事件在冒泡阶段执行，除非设置 useCapture 为 true

5. falsy（能转化为 false 的值）值有哪些

- null，undefined，''，NaN，0，false

6. 关于堆栈、运算符的问题

```js
var a = { n: 1 };
var b = a;
a.x = a = { n: 2 };

a.x;
b.x;
```

- 前面两句比较容易理解，堆中存放了{ n: 1 }，栈中存放这个对象地址，a, b 赋值为这个对象地址
- 首先计算左边表达式 a.x，堆中对象变成 { n: 1, x: undefined }，并生成一个引用
- 接着开始赋值操作，按照运算符优先级，从右到左。 a 这个变量指向了 { n: 2 } 这个地址
- 因为 a.x 先计算，实际上此刻它为 { n: 1, x: undefined } 这个对象引用，所以赋值为 { n: 1, x: { n: 2 } }
- 打印 a.x a: { n: 2 } 故 undefined
- 打印 b.x b: { n: 1, x: { n: 2 } } 故 { n: 2 }

7. 关于 this 指向

> 默认规则，隐式绑定

```js
var num = 1;
var myObject = {
  num: 2,
  add: function() {
    this.num = 3;
    (function() {
      console.log(this.num);
      this.num = 4;
    })();
    console.log(this.num);
  },
  sub: function() {
    console.log(this.num);
  },
};
myObject.add();
console.log(myObject.num);
console.log(num);
var sub = myObject.sub;
sub();
```

```js
var obj = {
  say: (function() {
    function _say() {
      console.log(this);
    }
    console.log(obj);
    return _say.bind(obj);
  })(),
};
obj.say();
```

8. 扁平化去重

已知如下数组，编写一个程序将数组扁平化去并除其中重复部分数据，最终得到一个升序且不重复的数组

```js
var arr = [ [1, 2, 2], [3, 4, 5, 5], [6, 7, 8, 9, [11, 12, [12, 13, [14] ] ] ], 10];

Array.from(new Set(arr.flat(Infinity))).sort((a, b) => a - b)
```
