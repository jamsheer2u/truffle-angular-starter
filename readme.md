Ethereum Truffle AngularJs Grunt Starter 
===================

Use this code repository as starter project for integrating Ethereum Truffle framework in to AngularJs projects. This project contains MetaCoin sample provided by truffle framework. It is modified to support AngularJs.

Grunt is added as a custom build process in to [Truffle](http://truffle.readthedocs.org/en/docs/getting_started/project/) build. 

This project uses files created using cg-angular yoeman generator. You can get more details [here](https://github.com/cgross/generator-cg-angular). 

----------


> **Note:**

> - `truffle build` works fine, but `truffle serve` is not working. You will have to use `grunt serve` instead
> - To use grunt commands, change the directory in to '**app**' directory.
> - supports JSHint, JSCS, ng-annotate, cssmin, SASS, Compass, uglify and Karma.
> - use truffle commands for compile, deploy and build. See [here](http://truffle.readthedocs.org/en/docs/getting_started/compile/)

How to use
-------------
> 1. Clone the repo
> 1. Change to 'app' directory
> - `npm install`
> - `bower install`
> 1. Change to base directory (where truffle.js is saved)
> - `truffle compile` - to compile your contracts
> - `truffle deploy` - to deploy your contracts
> - `truffle build` - to build your front end code - grunt will be invoked from here.
> 1. Start your rpc client (in my case, I am using testrpc client. You can get it from [Fast Ethereum RPC client ](https://github.com/ethereumjs/testrpc)