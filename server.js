const port = 8080;
const http = require("http");
const fs = require('fs');
const server = http.createServer(server_request);
server.listen(port);
const socket = require('socket.io')(server);
console.log(`The server has started and is listening on port number: ${port}`);

function server_request(req, res) {
    let head = {
        "Content-Type": "text/html",
    }
    let rescode = 200;

    let resd = "";
    let nfflag = false;
    switch (req.url.split(".")[0]) {
      case "/index": // title page
      head["Location"] = "/";rescode = 302;
      break;
      case "/": // title page
      try {
          resd += fs.readFileSync("data/top.html", 'utf8');
      } catch (e) {nfflag=true;}
      break;
      case "/world": // main page
      try {
          resd += fs.readFileSync("data/world.html", 'utf8');
      } catch (e) {nfflag=true;}
      break;
      case "/3d": // 3d library
        try {
            resd += fs.readFileSync("data/3d.js", 'utf8');
            head["Content-Type"] = "application/javascript";
        } catch (e) {nfflag=true;}
      break;
      case "/style": // style
        try {
            resd += fs.readFileSync("data/style.css", 'utf8');
            head["Content-Type"] = "text/css";
        } catch (e) {nfflag=true;}
      break;
      case "/getworld": // get world data
        resd += "comming soon";
        resd += "<a href=\"/\">top</a>";
      break;
      default: // not found
        nfflag = true;
      break;
    }
    if (nfflag) {
      rescode = 404;
      resd += "<h1>Not found</h1>";
      resd += "<p>";
      resd += "url: ";
      resd += req.url;
      resd += "</p>";
    }
    res.writeHead(rescode, head);
    res.end(resd);
}

socket.on('connection', function (req) {

  console.log("a connection");

  socket.emit("sendMessageToClient", {value:"a connection"});

  req.on("sendMessageToServer", function (data) {
    socket.emit("sendMessageToClient", {value:data.value});
  });     

  req.on("disconnect", function () {
      console.log("a disconnection");
      socket.emit("sendMessageToClient", {value:"a disconnection"});
  });
});