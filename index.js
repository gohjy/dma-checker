const http = require('http');

const pageCode = `
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
                select(0);
                return await fetch(isOnlineUrl, {"cache": "reload"})
                .catch(() => {select(offlineElem); throw 1;})
                .then(() => fetch(isDmaUrl, {"cache": "reload"}))
                .then((r) => {if (!r.ok) {select(enabledElem);throw 2;} else select(disabledElem);})
                .catch((r)=>{if (r!==1) select(enabledElem)})
            }

            check()

            setInterval(check, 60000)

        </script>
    </body>
</html>
`;

const checkOnlineUrl = "https://upload.wikimedia.org/wikipedia/commons/f/f2/1px_trpt.png";
const checkDmaUrl = "https://gohjy.github.io/gohjy/misc/transparentpixel.png";

http.createServer(function (req, res) {
    if (req.url === "/") {
        res.writeHead(200, {"content-type": "text/html"});
        res.write(pageCode);
        res.end();
    } else if (req.url === "/check/online") {
        fetch(checkOnlineUrl, {"cache": "reload"})
        .then(() => {res.writeHead(200)})
        .catch(() => {res.writeHead(418)})
        .finally(() => {res.end()})
    } else if (req.url === "/check/dma") {
        fetch(checkDmaUrl, {"cache": "reload"})
        .then(() => {res.writeHead(200)})
        .catch(() => {res.writeHead(418)})
        .finally(() => {res.end()})
    } else {
        res.writeHead(404);
        res.end();
    }
}).listen(8080);
