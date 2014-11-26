// import theseus from 'theseus';
// ^ Not working, see https://github.com/jspm/project/issues/15
import {Client} from 'theseus/src/theseus';

import 'theseus/src/http/angular';
import 'theseus/src/promise/angular';

import angular from 'angular';

import 'lib/atom-creator';


var apiServices = angular.module('theseus', ['anyHttp', 'anyPromise']);

apiServices.factory('theseus.Client', ['http', 'promise', function(http, promise) {
    return new Client({http: http, promise: promise});
}]);


var atoms = angular.module('atoms', [
    'theseus',
    'atom.creator',
]);

atoms.factory('atomApi', ['theseus.Client', function(client) {
    return client.resource('/api');
}]);

atoms.controller('AtomCtrl', ['$scope', 'atomApi', function($scope, atomApi) {
    this.create = create;
    this.resetNewAtom = resetNewAtom;
    this.submitNewAtom = submitNewAtom;

    this.editAtom = editAtom;
    this.resetEditedAtom = resetEditedAtom;
    this.saveEditedAtom = saveEditedAtom;

    loadAtoms();

    function loadAtoms(params = {}) {
        atomApi.follow('atoms', params).getData().then(atoms => {
            $scope.atoms = atoms;
        });
    }

    function create(type) {
        var newAtom = {
            type: type
        };
        $scope.newAtom = newAtom;
    }

    function submitNewAtom(atomData) {
        atomApi.follow('atoms').
            post({data: atomData}).
            then(resetNewAtom).
            then(loadAtoms);
    }

    function resetNewAtom() {
        delete $scope.newAtom;
    }


    var ctrl = this;

    function editAtom(atomResource) {
        ctrl.editedAtom = {
            resource: atomResource,
            data: angular.copy(atomResource.data)
        };
    }

    function saveEditedAtom(resource, data) {
        resource.patch({data: data}).
            response. // <- FIXME: meh
            then(resetEditedAtom).
            then(loadAtoms);
    }

    function resetEditedAtom() {
        delete ctrl.editedAtom;
    }
}]);


angular.bootstrap(document, ['atoms']);
