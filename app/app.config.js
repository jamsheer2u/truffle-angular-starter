(function() {
    // @@message
    // Created at @@date
    var AppConfig = {
        environment: '@@env', //automatically filled by Gruntfile
        web3Provider : '@@web3',
        version: '@@version',
        created_date: '@@date',
        contracts: [@@contracts]
    };

    angular.module('helloworld').constant('AppConfig', AppConfig);

})();
