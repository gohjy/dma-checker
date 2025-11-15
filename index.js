import http from "node:http";
import fs from "node:fs/promises";
import { setTimeout } from "node:timers/promises";

const pageHTML = await fs.readFile("./page.html", { encoding: "utf-8" });

const checkOnlineUrl = "https://upload.wikimedia.org/wikipedia/commons/f/f2/1px_trpt.png";
const checkDmaUrl = "https://bloxd.io/textures/miscImages/logo.png";

async function resilientFetch(url) {
    try {
        // await here so we can handle any
        // errors thrown by fetch() below
        return await fetch(url);
    } catch {
        await setTimeout(200);
        return await fetch(url);
    }
}

http.createServer(function (req, res) {
    if (req.url === "/") {
        res.writeHead(200, {"content-type": "text/html"});
        res.write(pageHTML);
        res.end();
    } else if (req.url === "/check/online") {
        resilientFetch(checkOnlineUrl)
        .then(() => {res.writeHead(200)})
        .catch(() => {res.writeHead(418)})
        .finally(() => {res.end()})
    } else if (req.url === "/check/dma") {
        resilientFetch(checkDmaUrl)
        .then(() => {res.writeHead(200)})
        .catch(() => {res.writeHead(418)})
        .finally(() => {res.end()})
    } else {
        res.writeHead(404);
        res.end();
    }
}).listen(8080);
