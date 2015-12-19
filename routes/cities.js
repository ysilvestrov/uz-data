/**
 * Created by ysilvestrov on 12/17/15.
 * Part of bigger project.
 */

var express = require('express');
var router = express.Router();
var connectivity = require('../modules/connectivity');


router.get('/:conv', function (req, res, next) {
  if (req.params.conv == "summary")
  {
    res.json(connectivity.summarizeAllConnections());
  }
  else {
    res.json(
      req.params.conv == "from" ?
        connectivity.calculateConvenientConnectionsFrom() :
        connectivity.calculateConvenientConnectionsTo());
  }
});

router.get('/', function (req, res, next) {
  var connections = connectivity.calculateAllConnections();
  res.json(connections);
});

module.exports = router;