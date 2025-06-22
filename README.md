# dma-checker
Simple NodeJS application that checks if the DMA is enabled. (If you don't know what a DMA is, this isn't for you!)

The default configuration fetches a [transparent pixel from Wikimedia Commons](https://upload.wikimedia.org/wikipedia/commons/f/f2/1px_trpt.png) to check if the device is online, then fetches a [transparent pixel from GitHub Pages](https://gohjy.github.io/gohjy/misc/transparentpixel.png) (which is assumed to be DMA-blocked) to check if the DMA is enabled. By default, this will run every 60 seconds.

## Setup
1. Download the `index.js` file and run it on Node
2. Go to [`localhost:8080`](http://localhost:8080) in your browser
3. Watch the screen update!
