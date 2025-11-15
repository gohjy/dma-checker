# dma-checker
Simple Node application that checks if the DMA is enabled. (If you don't know what a DMA is, this isn't for you!)

## Usage
1. Download the `index.js` file and run it on Node
2. Go to [`localhost:8080`](http://localhost:8080) in your browser
3. Watch the screen update!

## How it works
The default configuration fetches a [transparent pixel from Wikimedia Commons](https://upload.wikimedia.org/wikipedia/commons/f/f2/1px_trpt.png) to check if the device is online, then fetches a [small image from an online game](https://bloxd.io/textures/miscImages/logo.png) (which is assumed to be DMA-blocked) to check if the DMA is enabled. 

Configuration options can be passed as CLI arguments, as shown below. URLs in the table have been placed in collapsible sections to prevent the table from being too wide. 
| Argument | Description | Default |
|-|-|-|
| `--check-online-url` | The URL to be fetched to check if the server is online. | <details><summary>(URL)</summary>`https://upload.wikimedia.org/wikipedia/commons/f/f2/1px_trpt.png`</details> |
| `--check-dma-url` | The URL to be fetched to check if the DMA is active. | <details><summary>(URL)</summary>`https://bloxd.io/textures/miscImages/logo.png`</details> |
| `--port` | The port to host the server on. | `8080` |

The client-side HTML will check whether the DMA is enabled every 60 seconds. This can be changed by providing a value in the `?interval=` query param of the page, e.g. `http://localhost:8080/?interval=30` will check every 30 seconds. (There are some sanity checks though, for example setting `interval` to `0` is very likely to be a mistake!)
