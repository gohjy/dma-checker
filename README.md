# dma-checker
Simple Node application that checks if the DMA is enabled. (If you don't know what a DMA is, this isn't for you!)

## Usage
1. If you know how to clone this repository, do that! Otherwise, download the [ZIP archive of this repo](https://github.com/gohjy/dma-checker/archive/refs/heads/main.zip), unzip it, find the `index.js` file and run that in Node.
2. Go to [`localhost:8080`](http://localhost:8080) in your browser
3. Watch the screen update!

## How it works
The default configuration fetches a [transparent pixel from Wikimedia Commons](https://upload.wikimedia.org/wikipedia/commons/f/f2/1px_trpt.png) to check if the device is online, then fetches a [small image from an online game](https://bloxd.io/textures/miscImages/logo.png) (which is assumed to be DMA-blocked) to check if the DMA is enabled. 

You can edit the configuration by renaming `config.example.json` to `config.json` and playing around with the URLs! 

The client-side HTML will check whether the DMA is enabled every 60 seconds. This can be changed by providing a value in the `?interval=` query param of the page, e.g. `http://localhost:8080/?interval=30` will check every 30 seconds. (There are some sanity checks though, for example setting `interval` to `0` is very likely to be a mistake!)
