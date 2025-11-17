// ==UserScript==
// @name         spotdl-youtube-interact-web
// @namespace    http://tampermonkey.net/
// @version      2024-17-06
// @description  add spotdl/youtube interact
// @author       https://github.com/remigermain
// @match         https://www.youtube.com/*
// ==/UserScript==


(function () {
  "use strict";
  const output = "https://open.spotify.com/search/"

  const debounce = (func) => {
    let timer;
    return () => {
      clearTimeout(timer)
      timer = setTimeout(func, 200);
    }
  }

  const cleanMusicName = (t) => {
    // remove all () and []
    const rep = [/\[.*?\]/ig, /\(.*?\)/ig]
    rep.forEach((text) => {
      t = t.replaceAll(text, '')
    })
    // trim and remove non ascii char (emoji ..ect)
    return t.trim().split("").filter((c) => c.charCodeAt(0) <= 127).join("")
  }

  const createBtn = (musicLink) => {
    const btn = document.createElement('a')
    btn.classList.add("spotdl-userscript")
    btn.href = `${output}${encodeURIComponent(musicLink)}`
    btn.rel = "noopenner,noreferer"
    btn.target = "_blank"
    btn.style.borderRadius = "999px"
    btn.style.backgroundColor = "#30d772"
    btn.style.display = "flex"
    btn.style.cursor = "pointer"
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style="margin: auto" viewBox="0 0 24 24" fill="black" class="icon icon-tabler icons-tabler-filled icon-tabler-brand-spotify"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -15 8.66l.005 -.324a10 10 0 0 1 14.995 -8.336m-2.168 11.605c-1.285 -1.927 -4.354 -2.132 -6.387 -.777a1 1 0 0 0 1.11 1.664c1.195 -.797 3.014 -.675 3.613 .223a1 1 0 1 0 1.664 -1.11m1.268 -3.245c-2.469 -1.852 -5.895 -2.187 -8.608 -.589a1 1 0 0 0 1.016 1.724c1.986 -1.171 4.544 -.92 6.392 .465a1 1 0 0 0 1.2 -1.6m1.43 -3.048c-3.677 -2.298 -7.766 -2.152 -10.977 -.546a1 1 0 0 0 .894 1.788c2.635 -1.317 5.997 -1.437 9.023 .454a1 1 0 1 0 1.06 -1.696" /></svg>`

    return btn
  }

  const shorts = () => {
    document.querySelectorAll('ytd-reel-player-overlay-renderer').forEach((el) => {
      const actions = el.querySelector(".ytwReelActionBarViewModelHost")
      let music = el.querySelector("reel-sound-metadata-view-model")?.textContent
      if (!music) {
        return
      }
      const btn = createBtn(cleanMusicName(music))
      btn.style.width = btn.style.height = "48px"
      actions.insertBefore(btn, actions.firstChild)
    })
  }

  const classic = () => {
    document.querySelectorAll('ytd-watch-metadata').forEach((el) => {
      const actions = el.querySelector("ytd-menu-renderer")
      let music = ""

      if (el.querySelector('.yt-video-attribute-view-model__title')) {
        music = el.querySelector('.yt-video-attribute-view-model__title').textContent
        if (!music.includes(el.querySelector('.yt-video-attribute-view-model__subtitle').textContent)) {
          music = el.querySelector('.yt-video-attribute-view-model__subtitle').textContent + " - " + music
        }
      } else {
        music = el.querySelector("#title")?.textContent
      }
      if (!music) {
        return
      }

      const btn = createBtn(cleanMusicName(music))
      btn.style.width = btn.style.height = "36px"
      btn.style.marginRight = "1rem"
      actions.insertBefore(btn, actions.firstChild)
    })
  }

  const init = debounce(() => {
    document.querySelectorAll(".spotdl-userscript").forEach((el) => el.remove())
    if (window.location.pathname.startsWith("/shorts/")) {
      shorts()
    } else {
      classic()
    }
  });

  const observer = new MutationObserver(init)
  observer.observe(document.body, { subtree: true, childList: true });
})();
