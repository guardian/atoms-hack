import angular from 'angular';

import template from 'lib/atom-creator.html!text';

export var module = angular.module('atom.creator', []);

module.factory('wikipedia', ['$http', function($http) {
    function search(query) {
        return $http({
            url: 'http://lookup.dbpedia.org/api/search.asmx/KeywordSearch',
            params: {
                // QueryClass: 'place',
                QueryString: query
            }
        }).then(resp => resp.data.results);
    }

    return {search: search};
}]);

module.controller('AtomCreatorCtrl', ['$scope', 'wikipedia', function($scope, wikipedia) {

    this.importWikiEntry = importWikiEntry;
    this.addEntity = addEntity;
    this.removeEntity = removeEntity;

    $scope.$watch('model.title', (title, oldTitle) => {
        // TODO: throttle
        loadWikiMatches(title);
    });

    function addEntity(name) {
        $scope.model.entities = $scope.model.entities || [];
        $scope.model.entities.push({name: name});
    }

    function removeEntity(entity) {
        $scope.model.entities = ($scope.model.entities || []).filter(e => e !== entity);
    }

    function importWikiEntry(entry) {
        $scope.model.description = entry.description;

        // import as entity
        var entryType;
        var personOntology = "http://dbpedia.org/ontology/Person";
        var placeOntology = "http://dbpedia.org/ontology/Place";
        if (entry.classes.some(klass => klass.uri === personOntology)) {
            entryType = 'person';
        } else if (entry.classes.some(klass => klass.uri === placeOntology)) {
            entryType = 'place';
        }
        $scope.model.entities = [{name: entry.label, type: entryType}];
    }

    function loadWikiMatches(title) {
        wikipedia.search(title).then(function(matches) {
            $scope.wikiEntries = matches;
        }, function() {
            // TODO: not found
        });
    }
}]);

module.directive('atomCreator', [function() {
    return {
        restrict: 'E',
        scope: {
            model: '=model',
            cancel: '&onCancel',
            submit: '&onSubmit'
        },
        controller: 'AtomCreatorCtrl as atomCreatorCtrl',
        template: template
    };
}]);
