angular.module('home', ['ui.bootstrap', 'ui.utils', 'ui.router', 'ngAnimate']);

angular.module('home').config(function ($stateProvider) {

    $stateProvider.state('metacoin', {
        url: '/home',
        component: 'metacoin'
    });

    /* Add New States Above */

});

