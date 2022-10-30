const port = 8080;
const http = require("http");
const fs = require('fs');
const path = require('path');
const server = http.createServer(server_request);
server.listen(port);
const socket = require('socket.io')(server);
console.log(`The server has started and is listening on port number: ${port}`);

function server_request(req, res) {
    let head = {
        "Content-Type": "text/html",
    }
    let rescode = 200;

    console.log(req.url);
    if (req.url.split(".")[0]=="/index") { // redirect
        head["Location"] = "/";rescode = 302;
        res.writeHead(rescode, head);
        res.end("");
        console.log("redirected to the top");
        return;
    }

    let resd = "";
    switch (req.url) {
      case "/": // title page
        resd += "<h1>Neknaj Virtual World</h1>";
        resd += "<a href=\"/world\">open!</a>";
      break;
      case "/world": // main page
        resd += "comming soon";
        resd += "<a href=\"/\">top</a>";
        resd += "<script src=\"/socket.io/socket.io.js\"></script>";
        resd += "<script>const socket = io();</script>";
      break;
      case "/3d.js": // 3d library
        try {
            var text = fs.readFileSync("data/3d.js", 'utf8');
            head["Content-Type"] = "application/javascript";
            resd += text;
        } catch (e) {
            resd += "<h1>Not found</h1>";
            resd += "<p>";
            resd += "url: ";
            resd += req.url;
            resd += "</p>";
        }
      break;
      case "/getworld": // get world data
        resd += "comming soon";
        resd += "<a href=\"/\">top</a>";
      break;
      default: // not found
        resd += "<h1>Not found</h1>";
        resd += "<p>";
        resd += "url: ";
        resd += req.url;
        resd += "</p>";
      break;
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