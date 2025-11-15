import http from "node:http";
import fs from "node:fs/promises";
import { setTimeout } from "node:timers/promises";

const pageHTML = await fs.readFile(new URL("./page.html", import.meta.url), { encoding: "utf-8" });

const config = await (async () => {
    const userConfig = await fs.readFile(
        new URL("./config.json", import.meta.url)
    ).then(JSON.parse).catch(() => ({}));
    if (!userConfig || (typeof userConfig !== "object")) {
        throw new Error("Invalid configuration in config.json");
    }

    const defaultConfig = {
        checkOnlineUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f2/1px_trpt.png",
        checkDmaUrl: "https://bloxd.io/textures/miscImages/logo.png"
    };

    const combinedConfig = Object.assign({}, defaultConfig, userConfig);

    for (const key of Object.keys(defaultConfig)) {
        if (
            (typeof key === "string")
            && key.match(/url/i) 
            && URL.canParse(defaultConfig[key]) 
            && !URL.canParse(combinedConfig[key])
        ) {
            console.warn(`WARNING: Configuration key "${key}" with value ${JSON.stringify(combinedConfig[key])} does not match URL syntax, defaulting to ${JSON.stringify(defaultConfig[key])}`);
            combinedConfig[key] = defaultConfig[key];
            continue;
        }

        if (
            (typeof combinedConfig[key]) !== (typeof defaultConfig[key])
        ) {
            console.warn(`WARNING: Configuration key "${key}" with value ${JSON.stringify(combinedConfig[key])} does not match expected type "${typeof defaultConfig[key]}" (it is of type "${typeof combinedConfig[key]}"), defaulting to ${JSON.stringify(defaultConfig[key])}`);
            combinedConfig[key] = defaultConfig[key];
            continue;
        }
    }

    return combinedConfig;
})();

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

const PORT = 8080;

console.log(`Starting check server on http://localhost:${PORT}/ with configuration: %o`, config);

http.createServer(function (req, res) {
    if (req.url === "/") {
        res.writeHead(200, {"content-type": "text/html"});
        res.write(pageHTML);
        res.end();
    } else if (req.url === "/check/online") {
        resilientFetch(config.checkOnlineUrl)
        .then(() => {res.writeHead(200)})
        .catch(() => {res.writeHead(418)})
        .finally(() => {res.end()})
    } else if (req.url === "/check/dma") {
        resilientFetch(config.checkDmaUrl)
        .then(() => {res.writeHead(200)})
        .catch(() => {res.writeHead(418)})
        .finally(() => {res.end()})
    } else {
        res.writeHead(404);
        res.end();
    }
}).listen(PORT);
