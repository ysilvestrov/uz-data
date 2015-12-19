/* jinqJs.com
 Basic DEMO With Using AngularJs ngGrid
 See API Documentation for all the advanced features using predicates */
(function() {
  "use strict";

  /* SAMPLE DATA */
/*
  var people = [{Name: 'Tom', Age: 15, Location: 'Port Jefferson'},
    {Name: 'Jen', Age: 30, Location: 'Huntington'},
    {Name: 'Diana', Age: 5, Location: 'Huntington'}];

  var population = [{Location: 'Port Jefferson', people: 123},
    {Location: 'Huntington', people: 350}];
*/
  /* WEB SERVICE TO QUERY */
/*
  var weatherSvc = 'http://api.openweathermap.org/data/2.5/weather?q=Huntington,NY';
*/

  var app = angular.module('app', ['ui.grid', 'ui.grid.selection', 'ui.grid.exporter'])
    .controller('demoCtrl', ['$scope', '$http', function ($scope, $http) {

      $scope.gridOptions = {
        //columnDefs: [
        //  { field: 'name' },
        //  { field: 'gender', visible: false},
        //  { field: 'company' }
        //],
        enableGridMenu: true,
        enableSelectAll: true,
        exporterCsvFilename: 'uz.csv',
        exporterOlderExcelCompatibility: true,
        exporterPdfDefaultStyle: {fontSize: 9},
        exporterPdfTableStyle: {margin: [30, 30, 30, 30]},
        exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
        exporterPdfHeader: { text: "My Header", style: 'headerStyle' },
        exporterPdfFooter: function ( currentPage, pageCount ) {
          return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function ( docDefinition ) {
          docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
          docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
          return docDefinition;
        },
        exporterPdfOrientation: 'portrait',
        exporterPdfPageSize: 'LETTER',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
        onRegisterApi: function(gridApi){
          $scope.gridApi = gridApi;
        }
      };

      $scope.gridOptions2 = {
        //columnDefs: [
        //  { field: 'name' },
        //  { field: 'gender', visible: false},
        //  { field: 'company' }
        //],
        enableGridMenu: true,
        enableSelectAll: true,
        exporterCsvFilename: 'uz.csv',
        exporterOlderExcelCompatibility: true,
        exporterPdfDefaultStyle: {fontSize: 9},
        exporterPdfTableStyle: {margin: [30, 30, 30, 30]},
        exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
        exporterPdfHeader: { text: "My Header", style: 'headerStyle' },
        exporterPdfFooter: function ( currentPage, pageCount ) {
          return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function ( docDefinition ) {
          docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
          docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
          return docDefinition;
        },
        exporterPdfOrientation: 'portrait',
        exporterPdfPageSize: 'LETTER',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
        onRegisterApi: function(gridApi){
          $scope.gridApi = gridApi;
        }
      };

      $scope.show = "";

      $http
        .get('/cities/' + $scope.show)
        .success(function (data, status, headers, config) {
          $scope.gridOptions.data = data;
        });

      $http
        .get('/cities/summary' + $scope.show)
        .success(function (data, status, headers, config) {
          $scope.gridOptions2.data = data;
        });

      $scope.$watch('show', function(oldVal, newVal)
      {
        $http
          .get('/cities/' + $scope.show)
          .success(function (data, status, headers, config) {
            $scope.gridOptions.data = data;
          });
      })

    }]);
}());

