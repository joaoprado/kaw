var rp = require('request-promise');
var app = require('express')();
var http = require('http').Server(app);
var CronJob = require('cron').CronJob;

var clients = {};

app.get('/allies', function(req, res){
    var allies = require('./socket/allies.js').get();
    res.send(allies);
});

app.get('/proxies', function(req, res) {
    res.send(require('./socket/proxies.js').get());
});

//SocketIO vem aqui
require('./socket/connection.js');

http.listen(3000, function(){
console.log('listening on port 3000');
});
