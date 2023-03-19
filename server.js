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
<<<<<<< HEAD
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
        resd += fs.readFileSync("data/world.html", 'utf8')
        .replace(/ClientUniqueID/g,0)
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
=======
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
>>>>>>> 712fe771a6dc943687ecd67c8fd7d3d12e86a51c
    }
    
    res.writeHead(rescode, head);
    res.end(resd);
}



let clients = {}
socket.on('connection', function (req) {

<<<<<<< HEAD
    console.log("a connection");
=======
  console.log("started connection");
>>>>>>> 712fe771a6dc943687ecd67c8fd7d3d12e86a51c

    socket.emit("sendMessageToClient", {value:"a connection"});    

    req.on("sendMessageToServer", function (data) {
        socket.emit("sendMessageToClient", {value:data.value});
    });

    req.on("disconnect", function () {
        console.log("a disconnection");
        socket.emit("sendMessageToClient", {value:"a disconnection"});
    });

    req.on("camera", function (data) {
        //console.log("camera",req.id,data);
        socket.emit("sharecamera", {id:req.id,value:data});
        clients[req.id] = data;
    });
});