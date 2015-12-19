/**
 * Created by Yuriy on 19.12.2015.
 */
// buz.js
var Connectivity = function () {
  var trains = getTrains();
  this.cities = getCities();
  var stations = getStations(trains);
  fillCitiesStations(stations, this.cities);
};

var jinqJs = require('jinq');
var path = require('path');
var moment = require('moment');
var fs = require('fs');

var uzUrl = path.join(__dirname, '/../public/data') + '/uz.json';
var citiesUrl = path.join(__dirname, '/../public/data') + '/cities.json';


function getTrains() {
  var uzData = JSON.parse(fs.readFileSync(uzUrl, 'utf8'));

  return new jinqJs()
    .from(uzData)
    //.distinct(['id'])
    .select(function (train) {
      return {id: train.id, name: train.name, route: train.route, timeTable: train.timeTable};
    });
}
function getCities() {

  var citiesData = JSON.parse(fs.readFileSync(citiesUrl, 'utf8'));

  return new jinqJs()
    .from(citiesData)
    .select(function (city) {
      return {name: city.name, stations: city.stations};
    });
}

function getStations(trains) {
  var stations = [];

  trains.forEach(function (train) {
    var timeTable = train.timeTable;
    if (timeTable != null)
      timeTable.forEach(function (entry) {
        if (typeof(stations[entry.station.id]) != "undefined") {
          stations[entry.station.id].trains.push({
            id: train.id,
            name: train.name,
            route: train.route,
            arrive: entry.arrive
          });
          stations[entry.station.id].trainsCount++;
        } else {
          stations[entry.station.id] = {
            id: entry.station.id,
            name: entry.station.name,
            trains: [{
              id: train.id,
              name: train.name,
              route: train.route,
              arrive: entry.arrive,
              depart: entry.depart
            }],
            trainsCount: 1,
            timetable: {}
          };
        }
        stations[entry.station.id].timetable[train.id] =
          entry.arrive == "" ?
            moment(entry.arrive, "HH:mm") :
            moment(entry.depart, "HH:mm");
      });
  });

  return new jinqJs()
    .from(stations)
    .where(function (station) {
      return typeof(station) != "undefined"
    })
    .select(function (station) {
      return {
        id: station.id, name: station.name,
        trainsCount: station.trainsCount, timetable: station.timetable
      }
    });
}

function fillCitiesStations(stations, cities) {
  stations.forEach(function (s) {
    cities.forEach(function (city) {
      city.stations.forEach(function (station) {
        if (station.id == s.id) {
          station.timetable = s.timetable;
        }
      })
    })
  });
}
function calculateConnections(cities, convenientRoutesOnly) {
  var connections = [];

  cities.forEach(function (cityFrom) {
    var connection = {name: cityFrom.name};
    cities.forEach(function (cityTo) {
      if (cityTo == cityFrom) {
        connection[cityTo.name] = "+";
      } else {
        connection[cityTo.name] = "-";
        if (typeof(cityFrom.stations) != "undefined" && typeof(cityTo.stations) != "undefined") {
          cityFrom.stations.forEach(function (stationFrom) {
            if (typeof (stationFrom.timetable) != "undefined") {
              cityTo.stations.forEach(function (stationTo) {
                if (typeof (stationTo.timetable) != "undefined") {
                  Object.keys(stationFrom.timetable).forEach(function (id) {
                    if (typeof(stationTo.timetable[id]) != "undefined") {
                      switch (convenientRoutesOnly) {
                        case "to":
                          var timeTo = stationTo.timetable[id].hours();
                          var timeFrom = stationFrom.timetable[id].hours();
                          if (
                            (timeFrom >= 17 && timeTo >= 6 && timeTo <= 14) ||
                            (timeFrom <= 12 && timeTo >= 6 && timeTo <= 14)
                          ) {
                            connection[cityTo.name] = "+";
                          }
                          break;
                        case "from":
                          var timeTo = stationTo.timetable[id].hours();
                          var timeFrom = stationFrom.timetable[id].hours();
                          if (
                            (timeFrom >= 15) ||
                            (timeFrom <= 12 && timeTo >= 6 && timeTo <= 12)
                          ) {
                            connection[cityTo.name] = "+";
                          }
                          break;
                        default:
                          connection[cityTo.name] = "+";
                      }
                    }
                  })
                }
              })
            }
          })
        }
      }
    });
    connections.push(connection);
  });
  return connections;
}

Connectivity.prototype.calculateAllConnections = function () {
  return calculateConnections(this.cities, false);
};

Connectivity.prototype.calculateConvenientConnectionsTo = function () {
  return calculateConnections(this.cities, "to");
};

Connectivity.prototype.calculateConvenientConnectionsFrom = function () {
  return calculateConnections(this.cities, "from");
};


Connectivity.prototype.summarizeAllConnections = function () {
  var connections = calculateConnections(this.cities, false);
  var summary = [];
  connections.forEach(function (connection) {
    var count = 0;
    Object.keys(connection).forEach(function (id) {
      if (connection[id] == "+") {
        count++;
      }
    });
    summary.push({city: connection.name, all: count, from: 0, to: 0});
  });

  connections = calculateConnections(this.cities, "from");
  connections.forEach(function (connection) {
    var count = 0;
    Object.keys(connection).forEach(function (id) {
      if (connection[id] == "+") {
        count++;
      }
    });
    summary.forEach(function (s) {
      if (s.city == connection.name) {
        s.from = count;
      }
    });
  });

  connections = calculateConnections(this.cities, "to");
  connections.forEach(function (connection) {
    Object.keys(connection).forEach(function (id) {
      if (connection[id] == "+") {
        summary.forEach(function (s) {
          if (s.city == id) {
            s.to++;
          }
        });
      }
    });
  });

  return summary;
};


module.exports = new Connectivity();