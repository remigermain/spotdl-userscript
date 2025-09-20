<div align="center">
<h1>Spotdl Web script</h1>
 
![preview](./_images/preview.png)

</div>

______________________________________________________________________

This script add buttons in web spotify to easier download/lisent music through [spotdl](https://github.com/spotDL/spotify-downloader)

### Instalation
 - You need `python3`
 - You need [spotdl](https://github.com/spotDL/spotify-downloader?tab=readme-ov-file#installation)
 - Add [tampermonkey](https://www.tampermonkey.net/) in your web browser
 - Add the [client.user.js](https://github.com/remigermain/spotdl-userscript/raw/refs/heads/main/spodtl.user.js) script in `tampermonkey` 

### Usage
run the spotdl interaction server
```sh
python3 server.py

# you can add any spotdl arguements ( no need to add "download" command)
python3 server.py --help
python3 server.py --sponsor-block --output ~/My/Music --auth-token 4454 ...
```

go to your web browser https://open.spotify.com, and have fun !
