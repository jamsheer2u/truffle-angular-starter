(function () {
    angular.module('helloworld', ['ui.bootstrap', 'ui.utils', 'ui.router', 'ngAnimate', 'home']);

    angular.module('helloworld').config(function ($stateProvider, $urlRouterProvider, AppConfig) {

        /* Add New States Above */
        $urlRouterProvider.otherwise('/home');
        initPudding(AppConfig);
    });

    angular.module('helloworld').run(function ($rootScope) {

        $rootScope.safeApply = function (fn) {
            var phase = $rootScope.$$phase;
            if (phase === '$apply' || phase === '$digest') {
                if (fn && (typeof (fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

    });

    function initPudding(AppConfig) {
        /* jshint ignore:start */

        // Supports Mist, and other wallets that provide 'web3'.
        if (typeof web3 !== 'undefined') {
            // Use the Mist/wallet provider.
            window.web3 = new Web3(web3.currentProvider);
        } else {
            // Use the provider from the config.
            window.web3 = new Web3(new Web3.providers.HttpProvider(AppConfig.web3Provider));
        }

        Pudding.setWeb3(window.web3);
        Pudding.load(AppConfig.contracts, window);
        /* jshint ignore:end */
    }
})();
