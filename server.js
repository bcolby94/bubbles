const express = require('express');
const app = express().enable('trust proxy');
const http = require('http');
const webServer = http.createServer(app);
const cors = require('cors');
const WebSocketServer = require('ws').Server;
const clients = new Map();
const throttledUsers = new Set();
const ws = new WebSocketServer({
  server: webServer,
});

process.on('uncaughtException', function (err) { // I don't like killing the process when one of my libraries messes up.
  console.log('UNCAUGHT EXCEPTION\n' + err)
});

ws.on('connection', function connection(ws, req) {
  const clientIP = req.connection.remoteAddress;
  const iden = Math.floor(Math.random() * 999999);
  clients.set(iden, {
    socket: ws,
    IP: clientIP,
  });
  ws.on('message', function incoming(message) {
  // spam prevention
  if (throttledUsers.has(iden)) {
    return;
  }
  throttledUsers.add(iden);
  clearThrottles(iden);

    message = message.toString();
    if(message.slice(0, 4) == "http"){
      wsHtml(message);
    } else {
      wsAlert(message);
    }   
  });
});

const wsBroadcast = (data) => {
  clients.forEach(function (client) {
    if (client.socket.readyState == 1) {
      client.socket.send(data);
    }
  });
};

const wsAlert = (alertStr) => {
  const newAlert = JSON.stringify({
    alert: alertStr
  });
  wsBroadcast(newAlert);
};

const wsHtml = (link) => {
  console.log(link);
  let html = link;
  const videoId = html.slice(html.length - 11, html.length);
  html = `https://www.youtube.com/watch?v=${videoId}`;
      const newData = JSON.stringify({
        html: videoId,
      });
      wsBroadcast(newData);
  }

const clearThrottles = (iden) => {
  setTimeout(function () {
      throttledUsers.delete(iden);
      console.log(throttledUsers);
  }, 1000);
}

app.use(cors());
app.use('/', express.static(__dirname + '/public/'));
webServer.listen(80, function listening() {
  console.log('Listening on %d', webServer.address().port);
});