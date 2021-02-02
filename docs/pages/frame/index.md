# vue 框架

## 使用 vue 目的

> 前端页面展示方式变迁
> JSP：后端接口返回 html 内容
> ajax：前后端分离，前端使用 html + js + css 完成页面内容，通过 ajax 技术异步刷新数据
> MVVM 是 Model-View-ViewModel 的缩写，模型-视图-视图模型。其中视图模型是 vue 核心，承担数据处理，视图渲染

## 双向数据原理

> 所谓的双向，数据驱动视图，视图界面操作影响数据

### vue2.0 数据驱动原理

- vue2.0 利用 Object.defineProperty(obj, key, desc)
- obj 为定义对象
- key 为新增，编辑的属性
- 具体的配置项

```js
var obj = { a: 1 };

Object.defineProperty(obj, "a", {
  configurable: true, // 当且仅当该属性的 configurable 键值为 true 时，该属性的描述符才能够被改变，也能删除
  enumerable: true, // 是否可以枚举
  get: function() {},
  set: function() {},
});
```

- 我们可以编写一个defineReactive方法，完成数据属性变得可观测

```js
function defineReactive(data, key, val) {
  let childOb = observe(val); // 修改
  let dep = new Dep();
  Object.defineProperty(data, key, {
    configurable: true,
    enumerable: true,
    get: function () {
      // 添加依赖
      dep.depend();
      if (childOb) {
        childOb.dep.depend();
      }
      return val;
    },
    set: function (newVal) {
      // 触发通知，这里增加判断，缓存
      if (newVal == val) return;
      val = newVal;
      dep.notify(newVal);
    },
  });
}
```

- 我们在get中完成依赖收集，所有使用到这个属性的地方，都应该收集起来。我们用一个队列保存这些信息。
- set中触发依赖，完成试图更新
- 我们编写一个dep类用来管理这些依赖

```js
// 这里使用一个全局变量用来存放当前依赖
class Dep {
  constructor() {
    this.subs = [];
  }
  push(target) {
    this.subs.push(target);
  },
  // 新增方法
  depend() {
    if (window.target) {
      this.push(window.target);
    }
  },
  // 通知依赖
  notify(val) {
    // 遍历所有依赖，进行通知
    for (let i = 0; i < this.subs.length; i++) {
      this.subs[i].update(newVal);
    }
  }
}
```

- 对于依赖对象，我们用一个Watcher类来表示，这里简单模拟。
- 它有个特点是可以自动收集依赖

```js
class Watcher() {
  // vm vue实例
  // 属性路径
  // 属性更新，触发的回调函数
  constructor(vm, path, cb) {
    this.vm = vm
    // 这里利用柯里化函数技巧
    this.getter = parsePath(path)
    this.cb = cb
    this.value = this.get();
  }
  get() {
    // 等于当前watcher
    window.target = this
    // 获取当前属性值，触发收集依赖
    var value = this.getter(this.vm)
    window.target = undefined
    return value
  },
  // 更新函数，触发回调
  update(newVal) {
    this.cb && this.cb.call(this.vm, newVal, this.value)
  }
}

// 解析路径的方法
function parsePath(path) {
  var bailRE = /[^\w.$]/;
  if (bailRE.test(path)) {
    return;
  }
  var segments = path.split(".");
  return function (obj) {
    for (var i = 0; i < segments.length; i++) {
      if (!obj) return;
      obj = obj[segments[i]];
    }
    return obj;
  };
}
```

- 关于这个path，除了为字符串，实际环境它也支持函数，computed实现，watch可以观测computed
