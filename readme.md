# Chain Rest API Server

Demonstrate how to implement chain services using w3ajs and w3ajs-ws.

## Main Feature API

  - get block header information
  - get block information
  - get object information
  - get account information
  - get account balance information
  - get asset information
  - get chain properties
  - get global dynamic properties
  - get global immutable properties
  - register new account

## Advanced Examples

 - construct asset-transfer transaction
 - construct asset-create transaction
 - construct data-asset-create transaction
 - construct account-create transaction

### Installation

Requires [Node.js](https://nodejs.org/) v9+ to run.

Install the dependencies and devDependencies and start the server.

```sh
$ cd chain-server
$ npm install
$ npm run build
$ npm run start
```
Then server will run on localhost with default port 3306.

#### Reminder

> NodeJs最近的版本都开始支持ES6（ES2015）的新特性了，设置已经支持了async／await这样的更高级的特性。

> 只是在使用的时候需要在node后面加上参数：--harmony。

> 但是，即使如此node也还是没有支持全部的ES6特性。所以这个时候就需要用到Babel了。

> Babel的plugin和preset

> Babel本身不处理语言特性的转码。这些功能都是由plugin和preset实现的（preset也是一个plugin的集合）。

> 如上文所述，要使用es2015的内容就需要安装babel-preset-es2015这个preset。

> 要使用async/await那么就需要安装对应的preset或者插件。

> 为了简单我们安装preset：babel-preset-stage-0。

> preset stage-0包含了async/await相关的插件: babel-plugin-syntax-async-functions、babel-plugin-transform-regenerator。

