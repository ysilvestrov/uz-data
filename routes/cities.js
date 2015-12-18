/**
 * Created by ysilvestrov on 12/17/15.
 * Part of bigger project.
 */

var express = require('express');
var router = express.Router();
var jinqJs = require('jinq');
var path = require('path');
var moment = require('moment');

var uzUrl = path.join(__dirname, '/../public/data') + '/uz.json';
var citiesUrl = path.join(__dirname, '/../public/data') + '/cities.json';

var fs = require('fs');

/* GET users listing. */
function CalculateConnections(showConvenientRoutesOnly) {
  var citiesData = JSON.parse(fs.readFileSync(citiesUrl, 'utf8'));
  var uzData = JSON.parse(fs.readFileSync(uzUrl, 'utf8'));

  var trains = new jinqJs()
    .from(uzData)
    //.distinct(['id'])
    .select(function (train) {
      return {id: train.id, name: train.name, route: train.route, timeTable: train.timeTable};
    });

  var cities = new jinqJs()
    .from(citiesData)
    .select(function (city) {
      return {name: city.name, stations: city.stations};
    });

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
            trains: [{id: train.id, name: train.name, route: train.route, arrive: entry.arrive, depart: entry.depart}],
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

  var allStations = new jinqJs()
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

  allStations.forEach(function (s) {
    cities.forEach(function (city) {
      city.stations.forEach(function (station) {
        if (station.id == s.id) {
          station.timetable = s.timetable;
        }
      })
    })
  });

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
                      if (showConvenientRoutesOnly) {
                        var timeTo = stationTo.timetable[id].hours();
                        var timeFrom = stationFrom.timetable[id].hours();
                        if (
                          (timeFrom >= 17 && timeTo >= 6 && timeTo <= 15) ||
                          (timeFrom <= 12 && timeTo >= 6 && timeTo <= 15)
                        ) {
                          connection[cityTo.name] = "+";
                        }
                      } else {
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

router.get('/:conv', function (req, res, next) {
  var showConvenientRoutesOnly = typeof(req.params.conv) != "undefined" && req.params.conv.toLowerCase() == "true";
  var connections = CalculateConnections(showConvenientRoutesOnly);
  res.json(connections);
});

router.get('/', function (req, res, next) {
  var connections = CalculateConnections(false);
  res.json(connections);
});

module.exports = router;