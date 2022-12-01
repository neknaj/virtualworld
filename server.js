const http = require("http");
const fs = require('fs');

const port = 8080;

const server = http.createServer(server_request);
server.listen(port);
const socket = require('socket.io')(server);
console.log(`The server has started and is listening on port number: ${port}`);

function server_request(req, res) {
    const head = { "Content-Type": "text/html" };
    let rescode = 200;

    let resd = "";
    console.log(req.url)
    if(req.url.startsWith("/index")){ // title page head["Location"] = "/";
      rescode = 302;
    } else if(req.url.startsWith("/getworld")){ // get world data 
        resd += "comming soon";
        resd += "<a href=\"/\">top</a>";
    } else {
      try {
        const path = {
          "/": "/top.html",
          "/world": "/world.html"
        }[req.url] || req.url;
        resd += fs.readFileSync(`data${path}`, 'utf8');
        head["Content-Type"] = { // Content-Typeを設定
          js:  "application/javascript",
          css: "text/css"
        }[req.url.split(".").reverse()[0]] || "text/html";
      } catch (e) {
        // 404 not found
        rescode = 404;
        resd += `<h1> Not found</h1>
                <p>url: ${req.url}</p>`
      }
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