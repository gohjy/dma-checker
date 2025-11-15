import http from "node:http";
import fs from "node:fs/promises";

const pageHTML = await fs.readFile("./page.html", { encoding: "utf-8" });

const checkOnlineUrl = "https://upload.wikimedia.org/wikipedia/commons/f/f2/1px_trpt.png";
const checkDmaUrl = "https://gohjy.github.io/gohjy/misc/transparentpixel.png";

http.createServer(function (req, res) {
    if (req.url === "/") {
        res.writeHead(200, {"content-type": "text/html"});
        res.write(pageHTML);
        res.end();
    } else if (req.url === "/check/online") {
        fetch(checkOnlineUrl)
        .then(() => {res.writeHead(200)})
        .catch(() => {res.writeHead(418)})
        .finally(() => {res.end()})
    } else if (req.url === "/check/dma") {
        fetch(checkDmaUrl)
        .then(() => {res.writeHead(200)})
        .catch(() => {res.writeHead(418)})
        .finally(() => {res.end()})
    } else {
        res.writeHead(404);
        res.end();
    }
}).listen(8080);
