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

app.use(auth, express.static(path.join(__dirname,'..','..','dist')));
app.use('/api', router);

const hostFilePath = path.join(__dirname, '..','..','data','host.json');
const devicesFilePath = path.join(__dirname, '..','..','data','devices.json');
const devices = require(devicesFilePath);

router.get('/host', function(req, res) {
    var readable = fs.createReadStream(hostFilePath);
    readable.pipe(res);
});

router.get('/devices', function(req, res) {
    var readable = fs.createReadStream(devicesFilePath);
    readable.pipe(res);
});

router.get('/devices/:keyword', function (req, res) {
    var device = _.find(devices,
                        'keyword', req.params.keyword);
    res.json(device);
});

const server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
