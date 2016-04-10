(function () {
    angular.module('home').controller('MetacoinController', MetacoinController);

    function MetacoinController($rootScope) {
        var $ctrl = this;
        $ctrl.sendCoin = sendCoin;

        init();

        /////////////
        var accounts;
        var account;
        var balance;

        function setStatus(message) {
            $ctrl.status = message;
            $rootScope.safeApply();
        }

        function refreshBalance() {
            var meta = window.MetaCoin.deployed();

            meta.getBalance.call(account, { from: account }).then(function (value) {
                $ctrl.balance = value.valueOf();
                $rootScope.safeApply();
                return null;
            }).catch(function (e) {
                console.log(e);
                setStatus("Error getting balance; see log.");
            });
        }

        function refreshBalance2() {
            var meta = window.MetaCoin.deployed();

            meta.getBalance.call(account, { from: account }).then(function (value) {
                console.log('Balance', value.valueOf());
                $rootScope.safeApply();
                return null;
            }).catch(function (e) {
                console.log(e);
                setStatus("Error getting balance; see log.");
            });
        }

        function sendCoin() {
            var meta = window.MetaCoin.deployed();

            var amount = $ctrl.amount;
            var receiver = $ctrl.receiver;

            setStatus("Initiating transaction... (please wait)");

            meta.sendCoin(receiver, amount, { from: account }).then(function () {
                setStatus("Transaction complete!");
                refreshBalance();
                refreshBalance2();
                return null;
            }).catch(function (e) {
                console.log(e);
                setStatus("Error sending coin; see log.");
            });
        }

        function init() {
            window.web3.eth.getAccounts(function (err, accs) {
                if (err !== null) {
                    window.alert("There was an error fetching your accounts.");
                    return;
                }

                if (accs.length === 0) {
                    window.alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                    return;
                }

                accounts = accs;
                account = accounts[0];

                refreshBalance();

            });
        }
    }

})();
