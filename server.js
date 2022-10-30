const http = require("http");
const fs = require('fs');
const path = require('path');
const port = 8080;
const server = http.createServer(server_request);

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

server.listen(port);
console.log(`The server has started and is listening on port number: ${port}`);