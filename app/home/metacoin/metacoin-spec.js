describe('MetacoinCtrl', function () {

    beforeEach(module('home'));

    var scope;
    var ctrl;

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        ctrl = $controller('MetacoinCtrl', { $scope: scope });
    }));

    it('should ...', inject(function () {

        expect(1).toEqual(1);

    }));

});
