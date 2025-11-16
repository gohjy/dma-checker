import http from "node:http";
import { setTimeout } from "node:timers/promises";
import process from "node:process";

const pageHTML = `\
<!DOCTYPE html>
<html>
    <head>
        <title>DMA Checker</title>

        <style>
            html, body {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;

                height: 100%;
                width: 100%;

                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif
            }

            * {
                box-sizing: border-box;
            }

            .view {
                height: 100%;
                width: 100%;
                text-align: center;

                display: flex;
                justify-content: center;
                align-items: center;
            }
            @keyframes flash {
                0%, 49% {
                    background-color: red;
                    color: white;
                }
                50%, 99% {
                    background-color: white;
                    color: red;
                }
            }
            #enabled {
                animation: flash infinite 1s;
            }
            .no { display: none;}
        </style>
    </head>
    <body>
        <div id="disabled" class="view no">
            <h1>DMA is disabled</h1>
        </div>

        <div id="enabled" class="view no">
            <h1>DMA is enabled</h1>
        </div>

        <div id="offline" class="view no">
            <h1>You are Offline</h1>
        </div>

        <script type="module">
            const checkInterval = (() => {
                const defaultValue = 60;

                const paramInterval = new URL(location.href).searchParams.get("interval")?.trim();
                if (!paramInterval) return defaultValue;

                const paramFloatInterval = Number.parseFloat(paramInterval);
                if (Number.isNaN(paramFloatInterval)) {
                    alert(\`You provided an invalid interval \${paramInterval}, defaulting to checking every \${defaultValue} seconds\`);
                    return defaultValue;
                } else if (paramFloatInterval < 2) {
                    alert(\`You provided an interval of \${paramFloatInterval}. To guard against stupid things happening, the default check interval of \${defaultValue} seconds will be applied.\`);
                    return defaultValue;
                }
                return paramFloatInterval;
            })();

            const isOnlineUrl = "./check/online";
            const isDmaUrl = "./check/dma";

            const offlineElem = document.querySelector("#offline");
            const disabledElem = document.querySelector("#disabled");
            const enabledElem = document.querySelector("#enabled");

            const select = (view) => {
                for (let i of [offlineElem, disabledElem, enabledElem]) {
                    i.classList.toggle("no", i !== view);
                }
            }
            
            const check = async () => {
                const isOnlineResp = await fetch(isOnlineUrl, {"cache": "reload"})
                .catch(() => null);

                if (!isOnlineResp) {
                    select(offlineElem);
                    return;
                }

                fetch(isDmaUrl, {"cache": "reload"})
                .then((resp) => {
                    if (!resp.ok) {
                        select(enabledElem);
                    } else {
                        select(disabledElem);
                    }
                });
            }

            check();

            setInterval(check, checkInterval * 1000);
        </script>
    </body>
</html>
`;

const config = (() => {
    const convertCasing = str => str
        .split("-")
        .map((x, i) => 
            (i === 0) 
            ? x // don't capitalise first char
            : x[0].toUpperCase() + x.slice(1).toLowerCase()
        ).join("");

    const args = new Map(
        process.argv
        .slice(2)
        .filter(x => 
            x.startsWith("--") 
            && !x.startsWith("---")
            && !x.startsWith("--=")
        ).map(x => x.split("="))
        .map(([name, ...val]) => [convertCasing(name.slice(2)), val.join("=")])
    );

    const defaultConfig = {
        checkOnlineUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f2/1px_trpt.png",
        checkDmaUrl: "https://bloxd.io/textures/miscImages/logo.png",
        port: 8080
    };

    const userConfig = {};
    for (const key of Object.keys(defaultConfig)) {
        if (!args.has(key)) {
            userConfig[key] = defaultConfig[key];
            continue;
        }

        if (
            (typeof key === "string")
            && key.match(/url/i) 
            && URL.canParse(defaultConfig[key]) 
            && !URL.canParse(args.get(key))
        ) {
            console.warn(`WARNING: Configuration key "${key}" with value ${JSON.stringify(args.get(key))} does not match URL syntax, defaulting to ${JSON.stringify(defaultConfig[key])}`);
            userConfig[key] = defaultConfig[key];
            continue;
        }

        userConfig[key] = args.get(key);
    }

    return userConfig;
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

const PORT = Number(config.port);
if (!Number.isInteger(PORT)) {
    console.error(`Invalid config port value "${config.port}", must be integer`);
    process.exit(1);
} else if ((PORT < 0) || (PORT >= 65536)) {
    console.error(`Invalid config port value ${PORT}, must be >= 0 and < 65536`);
    process.exit(1);
}

console.log(`Starting check server on http://localhost:${PORT}/ with configuration: %o`, config);

http.createServer(function (req, res) {
    const pathname = new URL(req.url, "http://fauxhost/").pathname;

    if (pathname === "/") {
        res.writeHead(200, {"content-type": "text/html"});
        res.write(pageHTML);
        res.end();
    } else if (pathname === "/check/online") {
        resilientFetch(config.checkOnlineUrl)
        .then(() => {res.writeHead(200)})
        .catch(() => {res.writeHead(418)})
        .finally(() => {res.end()})
    } else if (pathname === "/check/dma") {
        resilientFetch(config.checkDmaUrl)
        .then(() => {res.writeHead(200)})
        .catch(() => {res.writeHead(418)})
        .finally(() => {res.end()})
    } else {
        res.writeHead(404);
        res.end();
    }
}).listen(PORT);
