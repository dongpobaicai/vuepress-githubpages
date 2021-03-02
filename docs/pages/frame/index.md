# 框架知识点

## vue 框架

### 使用 vue 目的

> 前端页面展示方式变迁
> JSP：后端接口返回 html 内容
> ajax：前后端分离，前端使用 html + js + css 完成页面内容，通过 ajax 技术异步刷新数据
> MVVM 是 Model-View-ViewModel 的缩写，模型-视图-视图模型。其中视图模型是 vue 核心，承担数据处理，视图渲染

### 双向数据绑定原理

- vue 2.0
- v-model 是⽤来在表单控件或者组件上创建双向绑定的，他的本质是 v-bind 和 v-on 的语法糖。
- 在⼀个组件上使⽤ v-model ，默认会为组件绑定名为 value 的 prop 和名为 input 的事件。
- 自定义组件可以通过这个特征完成 v-model 效果

- vue3.0
- 在 3.x 中，⾃定义组件上的 v-model 相当于传递了 modelValue prop 并接收抛出的 update:modelValue 事件

### computed 的原理

1. 调用 initComputed 方法
2. 对计算属性数据劫持，在 get 中收集依赖，set 中触发更新
3. dep 管理依赖

### vue2.0 响应式原理

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

- 我们可以编写一个 defineReactive 方法，完成数据属性变得可观测

```js
function defineReactive(data, key, val) {
  let childOb = observe(val); // 修改
  let dep = new Dep();
  Object.defineProperty(data, key, {
    configurable: true,
    enumerable: true,
    get: function() {
      // 添加依赖
      dep.depend();
      if (childOb) {
        childOb.dep.depend();
      }
      return val;
    },
    set: function(newVal) {
      // 触发通知，这里增加判断，缓存
      if (newVal == val) return;
      val = newVal;
      dep.notify(newVal);
    },
  });
}
```

- 我们在 get 中完成依赖收集，所有使用到这个属性的地方，都应该收集起来。我们用一个队列保存这些信息。
- set 中触发依赖，完成试图更新
- 我们编写一个 dep 类用来管理这些依赖

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

- 对于依赖对象，我们用一个 Watcher 类来表示，这里简单模拟。
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

### nextTick 的原理

### vue 的模板编译原理

### 父组件和子组件的生命周期执行顺序是什么样子的

1. 父组件和子组件的生命周期执行顺序是什么样子的
2. 初始化：父组件 beforeCreate => created => beforeMount => 子组件 beforeCreate => created => beforeMount => mounted => 父 mounted
3. 更新：父 beforeUpdate => 子 beforeUpdate => 子 updated => 父 updated
4. 销毁: 父 beforeDestroy => 子 beforeDestroy => 子 destroyed => 父 destroyed

### v-for 中 key 的作用

### 为什么 v-for 和 v-if 不建议⽤在⼀起

### vue-router 的 history 和 hash 模式区别，以及如何实现

### vue 中的 data 返回是函数，而不是对象原因

### vue 的性能优化

### 预渲染和 SSR 渲染会利于 SEO 优化

## js 相关内容

### 调用堆栈

#### 执行上下文

- 执行上下文，当前 js 代码运行的环境
- 全局上下文（只有一个），函数上下文（可以有多个），eval 创建的上下文（可以有多个）
- 执行上下文，分为**创建阶段**，**执行阶段**

##### 创建阶段做了三件事

1. 确定 this 指向
2. 生成词法环境
3. 生成变量环境

```js
ExecutionContext = {
  ThisBinding = <this value>,     // 确定this
  LexicalEnvironment = { ... },   // 词法环境
  VariableEnvironment = { ... },  // 变量环境
}
```

- thisBinding

  - 全局 this，在浏览器中指向 window，node 中指向当前文件 module
  - 函数执行上下文，分多种情况：函数调用，箭头函数，bind，call，apply

- LexicalEnvironment

  - 环境记录 // 存储变量和函数声明的实际位置
  - 对外部环境的引用 // 可以访问其外部词法环境

- VariableEnvironment 变量环境和词法环境大同小异
  - 变量环境只是存储 var
  - 词法环境，存放 let，const，函数声明等

```js
let a = 20;
const b = 30;
var c;

function multiply(e, f) {
 var g = 20;
 return e * f * g;
}

c = multiply(20, 30);

// 全局执行上下文
GlobalExectionContext = {
  ThisBinding: <Global Object>,
  LexicalEnvironment: {
    EnvironmentRecord: {
      Type: "Object",
      a: <uninitialized>,
      b: <uninitialized>,
      multiply: <func>
    },
    outer: <null>
  },
  VariableEnvironment: {
    EnvironmentRecord: {
      Type: "Object",
      c: undefined
    },
    outer: <null>
  }
}

// 函数执行上下文
FunctionExectionContext = {
  ThisBinding: <Global Object>,
  LexicalEnvironment: {
    EnvironmentRecord： {
      Type: "Declarative",
      // 标识符绑定在这里
      Arguments: {0: 20, 1: 30, length: 2},
    },
    outer: <Global Object>
  },
  VariableEnvironment: {
    EnvironmentRecord: {
      Type: "Declarative",
      // 标识符绑定在这里
      g: undefined
    },
    outer: <GlobalLexicalEnvironment>
  }
}

```

##### 执行阶段

- 全局上下文变量对象，是 global
- 函数上下文变量对象（VO），活动对象（AO）
  - 初始化，VO 进行形参赋值，函数赋值，变量赋值 undefined
  - 执行时，可以访问到 AO，变量完成赋值

##### 变量提升，函数提升

函数提升 > 变量提升

#### 执行栈

- 遵守先进后出原则

![执行栈流程](/run_stack.jpg)

### 垃圾回收算法

- 引用计数法
- 标记清除（常用） 标记清除算法将"不再使用的对象”定义为“无法到达的对象"

### 作用域闭包

### this 的绑定规则

1. 默认规则
2. 隐式绑定
3. 显示绑定
4. new 绑定 手写一个 new 的方法
   1. 创建一个对象，用于 new 返回
   2. 新对象继承原对象原型所有的属性和方法
   3. 新对象可以访问原对象的属性和方法
   4. 返回对象优先使用函数里返回的

```js
function create() {
  var obj = new Object();
  var fn = [].shift.apply(arguments);

  obj.__proto__ = fn.prototype;
  var ret = fn.apply(obj, arguments);
  return ret instanceof Object ? ret : obj;
}
```

5. 箭头函数绑定

```js
var name = "window";

var person1 = {
  name: "person1",
  show1: function() {
    console.log(this.name);
  },
  show2: () => console.log(this.name),
  show3: function() {
    return function() {
      console.log(this.name);
    };
  },
  show4: function() {
    return () => console.log(this.name);
  },
};
var person2 = { name: "person2" };

person1.show1(); // 隐式规则  person1
person1.show1.call(person2); // 显示规则 person2

person1.show2(); // 箭头函数  上级作用域this指向  window
person1.show2.call(person2); // call 无法改变     window

person1.show3()(); // 默认规则  window
person1.show3().call(person2); // 显示规则 person2
person1.show3.call(person2)(); // 默认绑定  window

person1.show4()(); // 箭头函数  上级作用域this指向  person1
person1.show4().call(person2); // 箭头函数  上级作用域this指向  person1
person1.show4.call(person2)(); // 箭头函数  改变this指向 person2
```

```js
/**
 * 非严格模式
 */

var name = "window";

function Person(name) {
  this.name = name;
  this.show1 = function() {
    console.log(this.name);
  };
  this.show2 = () => console.log(this.name);
  this.show3 = function() {
    return function() {
      console.log(this.name);
    };
  };
  this.show4 = function() {
    return () => console.log(this.name);
  };
}

var personA = new Person("personA");
var personB = new Person("personB");

personA.show1(); // 隐式规则  personA
personA.show1.call(personB); // 显示规则 personB

personA.show2(); // personA，首先personA是new绑定，产生了新的构造函数作用域，
// 然后是箭头函数绑定，this指向外层作用域，即personA函数作用域
personA.show2.call(personB); // 箭头函数  personA

personA.show3()(); // 默认规则  window
personA.show3().call(personB); // 显示规则  personB
personA.show3.call(personB)(); // 默认规则  window

personA.show4()(); // 箭头函数  personA
personA.show4().call(personB); // 箭头函数  personA
personA.show4.call(personB)(); // 箭头函数  personB
```

### call，apply，bind 的模拟实现

1. call()改变了 this 的指向
2. 执行传入的函数
3. this 参数可以传 null 或者 undefined，此时 this 指向 window
4. this 参数可以传基本类型数据，原生的 call 会自动用 Object() 转换
5. 函数是可以有返回值的

```js
function fnFactory(context) {
  var unique_fn = "fn";
  while (context.hasOwnProperty(unique_fn)) {
    unique_fn = "fn" + Math.random(); // 循环判断并重新赋值
  }

  return unique_fn;
}
// ES3
Function.prototype.call3 = function(context) {
  context = context ? Object(context) : window; // 实现细节 3 和 4
  var fn = fnFactory(context); // added
  context[fn] = this; // changed

  var args = [];
  for (var i = 1, len = arguments.length; i < len; i++) {
    args.push("arguments[" + i + "]");
  }
  var result = eval("context.fn(" + args + ")");
  delete context.fn;

  return result; // 实现细节 5
};

Function.prototype.apply3 = function(context, arr) {
  context = context ? Object(context) : window; // 实现细节 3 和 4
  context.fn = this;

  var result;
  if (!arr) {
    result = context.fn();
  } else {
    var args = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      args.push("arr[" + i + "]");
    }
    result = eval("context.fn(" + args + ")");
  }
  delete context.fn;

  return result; // 实现细节 5
};

// ES6
Function.prototype.call6 = function(context) {
  context = context ? Object(context) : window;

  var fn = Symbol(); // added
  context[fn] = this; // changed

  let args = [...arguments].slice(1);
  let result = context.fn(...args);
  delete context.fn;
  return result;
};

Function.prototype.apply6 = function(context, arr) {
  context = context ? Object(context) : window;
  context.fn = this;

  let result;
  if (!arr) {
    result = context.fn();
  } else {
    result = context.fn(...arr);
  }

  delete context.fn;
  return result;
};
```

bind 的特点

1. 改变 this 的指向
2. 返回一个函数
3. 可以传入参数
4. 柯里化

```js
Function.prototype.bind6 = function(context) {
  if (typeof this !== "function") {
    throw new Error(
      "Function.prototype.bind - what is trying to be bound is not callable"
    );
  }

  var fn = this;
  var args = Array.prototype.slice.call(arguments, 1);

  var fNOP = function() {};
  var fBound = function() {
    var bindArgs = Array.prototype.slice.call(arguments);

    // 注释1
    return self.apply(
      this instanceof fNOP ? this : context,
      args.concat(bindArgs)
    );
  };

  // 注释2
  fNOP.prototype = this.prototype;
  fBound.prototype = new fNOP();
  return fBound;
};
```

### new 的实现

1. 可以访问构造函数里的属性
2. 访问到原型里的属性

```js
function create() {
  var Con = [].shift.call(arguments);
  var obj = Object.create(Con.prototype);

  var ret = Con.apply(obj, arguments);

  // 返回对象
  return ret instanceof Object ? ret : obj;
}
```

### Object.assign 的实现

1. 判断原生 Object 是否支持该函数，如果不存在的话创建一个函数 assign，并使用 Object.defineProperty 将该函数绑定到 Object 上。
2. 判断参数是否正确（目标对象不能为空，我们可以直接设置{}传递进去,但必须设置值）。
3. 使用 Object() 转成对象，并保存为 to，最后返回这个对象 to。
4. 使用 for..in 循环遍历出所有可枚举的自有属性。并复制给新的目标对象（使用 hasOwnProperty 获取自有属性，即非原型链上的属性）。

```js
if (typeof Object.assign2 != "function") {
  // Attention 1
  Object.defineProperty(Object, "assign2", {
    value: function(target) {
      "use strict";
      if (target == null) {
        // Attention 2
        throw new TypeError("Cannot convert undefined or null to object");
      }

      // Attention 3
      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) {
          // Attention 2
          // Attention 4
          for (var nextKey in nextSource) {
            // 获取自有属性
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true,
  });
}
```

assign 注意点

- 不可枚举
- 目标对象不能为空

### 深拷贝

- 传入 null，需要返回 null
- 兼容数组
- 循环引用
  - 使用哈希表
- 拷贝 Symbol

```js
function isObject(obj) {
  return typeof obj === "object" && obj != null;
}

function cloneShallow(source, hash = new WeakMap()) {
  if (!isObject(source)) {
    return source;
  }

  if (hash.has(source)) return hash.get(source); // 新增代码，查哈希表

  var target = Array.isArray(source) ? [] : {};
  hash.set(source, target); // 新增代码，哈希表设值

  // ============= 新增代码，处理Symbol
  let symKeys = Object.getOwnPropertySymbols(source); // 查找
  if (symKeys.length) {
    // 查找成功
    symKeys.forEach((symKey) => {
      if (isObject(source[symKey])) {
        target[symKey] = cloneShallow(source[symKey], hash);
      } else {
        target[symKey] = source[symKey];
      }
    });
  }
  // =============

  for (var key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (isObject(source[key])) {
        target[key] = cloneShallow(source[key], hash); // 新增代码，传入哈希表
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}
```

JSON.stringify

- 排除掉 null，undefined，symbol
- 对数组进行处理
- 对字符串值进行处理

```js
function isObject(obj) {
  return typeof obj === "object" && obj != null;
}

function SelfStringify(source) {
  if (!isObject(source)) {
    throw new TypeError('can not parse of not Object')
  }

  if (Object.prototype.toString.call(source) === '[object Array]') {
    return "[" + source.join(",") + "]"
  }

  var arr = []

  // 开始递归
  for (var key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] != null && typeof source[key] !== 'symbol') {
      if (isObject(source[key])) {
        arr.push('"' + key + '":' + SelfStringfy(source[key]))
      } else if (typeof source[key] === 'string') {
        arr.push('"' + key + '":"' + source[key] + '"')
      } else {
        arr.push('"' + key + '":' + source[key])
      }
    }
  }
  return '{' + arr.join(",") + '}'
}


function sParse(source) {
  if (!source && ) {

  }

  var target = {}
  return target
}
```

### EventLoop

### 原型链，instanceof 的实现

- 原型链查找是通过**proto**属性连接的

```js
a instanceof B; // 判断B是否在a的原型链上

function instance_of(o, p) {
  var proto = o.__proto__;
  var struct = p.prototype;
  while (true) {
    if (proto == null) {
      return false;
    }
    if (proto === struct) {
      return true;
    }
    proto = proto.__proto__;
  }
}
```

### 高阶函数

满足以下至少一个条件就称为高阶函数

1. 将函数作为另一个函数的参数
2. 返回结果是函数

- 第一种情况常见高阶函数有, map, filter, reduce
- 第二种情况，如：类型判断函数，累加函数

函数柯里化是高阶函数一种实现，常见应用场景有

1. 延迟计算
   - 累加计算
   - bind 的实现
2. 动态创建函数
   - 事件添加判断
3. 参数复用
4. currying 函数实现

```js
function currying(fn, length) {
  length = length || fn.length;
  return function(...args) {
    return args.length >= length
      ? fn.apply(this, args)
      : currying(fn.bind(this, ...args), length - args.length);
  };
}
```

1. 函数参数 length
2. 原生数组方法源码实现
   - map  返回新的数组，改变原数组可能引起错误
   - filter 通过回调函数结果，判断是否添加到新数组，最后一步修改数组实际长度
   - reduce 有无初始值判断
   - forEach 没有返回值

### 节流防抖

1. 节流是指到达指定时间后才能执行
   - 每次执行记下当前时间戳，下次事件执行如果时间戳差大于等于设置，就执行
   - 定时器实现，执行完设置一个定时器，到点后清除定时器。每次事件执行，通过判断是否存在定时器来决定

### es6 ~ es12 新特性

- es6的主要特性
  - class
  - promise
  - 扩展符
  - 赋值解构
  - 模板字符串
  - 箭头函数
  - es module
  - let const
- es10
  - flat
  - 可选catch
- es11
  - ?? 空值处理
  - 可选链
  - allSettled  等所有promise执行完返回，不管通过或反对
  - import()
  - BigInt 新增的数据类型
  - globalThis
- es12
  - replaceAll
  - promise.any  只要有一个成功就返回，否则返回失败
  - WeakRefs 对对象的弱引用
  