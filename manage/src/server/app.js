'use strict';

const basicAuth = require('basic-auth');
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const router = express.Router();

const auth = function (req, res, next) {
  let user = basicAuth(req);
  if (!user || !user.name || !user.pass) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  }

  if (user.name === 'idcf' && user.pass === 'mythings') {
    next();
  } else {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  }
}

app.use('/api', router);
app.use(express.static(path.join(__dirname,'..','..','dist')));
const devicesFilePath = path.join(__dirname, '..','..','data','devices.json');

router.get('/devices', function(req, res) {
    var readable = fs.createReadStream(devicesFilePath);
    readable.pipe(res);
});

app.get('/devices', auth, function (req, res) {
/*
    var devices = _.result(_.find(countryCodes,
                                   'ISO3166-1-Alpha-2', req.params.country),
                                   'currency_alphabetic_code');
*/
    var readable = fs.createReadStream(devicesFilePath);
    readable.pipe(res);
});

const server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
