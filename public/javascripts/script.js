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

  var dataUrl = '/data/uz.json';
  var citiesUrl = '/data/cities.json';
  var app = angular.module('app', ['ui.grid', 'ui.grid.selection', 'ui.grid.exporter'])
    .controller('demoCtrl', ['$scope', function ($scope) {

      /* Sample use of a .select() predicate to flatten result */
      /* Calling a web service to query the response           */
//    var weather = new jinqJs()
//                   .from(weatherSvc)
//                   .select( function(row){
//                      return { Location: row.name, Condition: row.weather[0].description };
//                   });

      var trains = new jinqJs()
        .from(dataUrl)
        //.distinct(['id'])
        .select(function(train) {
        return {id:train.id, name: train.name, route: train.route, timeTable: train.timeTable};
      });

      var cities = new jinqJs()
        .from(citiesUrl)
        .select(function(city) {
        return {name: city.name, stations: city.stations};
      });

      var stations = [];

      trains.forEach(function(train){
        var timeTable = train.timeTable;
        if (timeTable != null)
        timeTable.forEach(function(entry){
          if (typeof(stations[entry.station.id]) != "undefined")
          {
            stations[entry.station.id].trains.push({id:train.id, name: train.name, route: train.route, arrive: entry.arrive});
            stations[entry.station.id].trainsCount++;
          } else {
            stations[entry.station.id] = {
              id: entry.station.id,
              name: entry.station.name,
              trains: [{id:train.id, name: train.name, route: train.route, arrive: entry.arrive}],
              trainsCount: 1,
              timetable: {}
            };
          }
          stations[entry.station.id].timetable[train.id] = entry.arrive;
        });
      });


      /* UNCOMMENT SECTIONS of the expression to see the results */
      /* Performs a join on the web service response and local collections */
/*      $scope.data = new jinqJs()
        .from(people).on('Location')
        .where( function(row) { return (row.Age > 3 && row.Location == 'Huntington'); } )
        //                    .leftJoin(weather).on('Location')
        //                    .where('people < 200')
        .groupBy('Location', 'Condition').avg('Age')
        //                    .orderBy('Location')
        //                    .identity()
        .select([{field: 'Location'}, {field: 'Age', text: 'Average Age'}, {field: 'Condition'}]);*/

      var allStations = new jinqJs()
        .from(stations)
        .where(function(station) {return typeof(station) != "undefined"})
        .select(function(station){return {id: station.id, name: station.name,
          trainsCount:station.trainsCount, timetable:station.timetable}});

      $scope.minTrains = 1;

      allStations.forEach(function(s){
      cities.forEach(function(city){
        city.stations.forEach(function(station){
          if (station.id == s.id) {
            station.timetable = s.timetable;
          }
        })
      })});

      var connections = [];

      cities.forEach(function(cityFrom){
        var connection = {name: cityFrom.name};
        cities.forEach(function(cityTo){
          connection[cityTo.name] = "-";
          if (typeof(cityFrom.stations) != "undefined" && typeof(cityTo.stations) != "undefined") {
            cityFrom.stations.forEach(function (stationFrom) {
              if (typeof (stationFrom.timetable) != "undefined") {
                cityTo.stations.forEach(function (stationTo) {
                  if (typeof (stationTo.timetable) != "undefined") {
                    angular.forEach(stationFrom.timetable, function (entry, id) {
                      if (typeof(stationTo.timetable[id]) != "undefined") {
                        connection[cityTo.name] = "+";
                      }
                    })
                  }
                })
              }
            })
          }
        });
        connections.push(connection);
      });

      $scope.trainsFilter = function (station) {
        return typeof(station) != "undefined" && station.trainsCount >= $scope.minTrains;
      };

      $scope.data = connections;

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

      $scope.gridOptions.data = connections;

      $scope.citiesData = JSON.stringify(connections);
    }]);
}());

