// ==UserScript==
// @name         spotdl-interact-web
// @namespace    http://tampermonkey.net/
// @version      2024-17-06
// @description  add spotdl interact
// @author       https://github.com/remigermain
// @match        https://open.spotify.com/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==


(function () {
  "use strict";

  const hostName = "localhost"
  const serverPort = 56938

  const _request = (url, {data={}, ...options}) => {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest ( {
        url: `http://${hostName}:${serverPort}/${url}`,
        headers: {
          "Content-Type": "applicaton/json"
        },
        data: JSON.stringify(data),
        ...options,
        onload: (rsp) => {
          rsp.json = () => JSON.parse(rsp.responseText);
          if (rsp.status.toString()[0] == "2") {
            resolve(rsp)
          } else {
            reject(rsp);
          }
        },
        onerror: reject
      });
    });
  }

  const request = {
    post: (url, options) => _request(url, {...options, method: "POST"}),
    get: (url, options) => _request(url, {...options, method: "GET"}),
  }

  
  const addToast = (msg) => {
    let toast = document.querySelector(".spotdl.spotdl-toast")
    if (!toast) {
      toast = document.createElement("div")
      toast.style.position = "fixed"
      toast.style.display = "flex"
      toast.style.gap = "0.5rem"
      toast.style.justifyContent = "center"
      toast.style.alignItems = "center"
      toast.style.flexDirection = "column"
      toast.style.top = "0.5rem"
      toast.style.right = "0.5rem"
      toast.classList.add("spotdl")
      toast.classList.add("spotdl-toast")
      document.body.appendChild(toast)
    }

    const t = document.createElement("div")
    t.classList.add("spotdl")
    t.style.padding = "1rem 2rem";
    t.style.borderRadius = "4px";
    t.style.color = "black"
    t.style.backgroundColor = "#1ed760"
    t.innerText = `Download ${msg}`
    toast.appendChild(t)

    setTimeout(() => {
      toast.removeChild(t)
    }, 5_000)
  }

  // download functions
  const download = (url) => {
    addToast(url)
    console.log(`download url ${url}`)
    request.post("/download", {data: {url}})
    .catch(console.error)
  }
  const downloadElement = (el) => el.querySelector("a").href;
  const downloadUrl = () => window.location.href;

  const stylEl = (el, {style = ""}) => {
    el.style = style;
    el.style.backgroundColor = "#1ed760";
    el.style.border = "0";
    el.style.cursor = "pointer";
    el.style.display = "flex"
    el.style.justifyContent = "center"
    el.style.alignItems = "center"
    el.onmouseenter = () => el.style.transform = 'scale(105%)'
    el.onmouseleave = () => el.style.transform = 'scale(100%)'
    el.style.transition = "0.2s all"
    el.classList.add("spotdl");
    return el
  }

  // create button
  const btnDownload = (el, action, options) => {
    const b = stylEl(document.createElement("button"), options)
    b.innerHTML = `<svg style="color: black;" xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-download"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" /></svg>`
    const url = action(el)
    b.onclick = () => download(url);
    b.title = url;
    return b
  }

  const btnListen = (el, actionListen, options) => {
    const b = stylEl(document.createElement("a"), options)
    const query = encodeURIComponent(actionListen(el))
    b.href = `https://www.youtube.com/results?search_query=${query}`,
    b.target = '_blank',
    b.rel = 'noopener noreferrer',
    b.innerHTML = `<svg style="color: black;" xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-headphones"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 13m0 2a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2z" /><path d="M15 13m0 2a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2z" /><path d="M4 15v-3a8 8 0 0 1 16 0v3" /></svg>`
    return b
  }

  const querys = {
    trackRow: {
      query:[`:not([aria-label="Recommended"]):not([aria-label="Recommended based on what’s in this playlist"])[data-testid="track-list"] [data-testid="tracklist-row"]`, `[aria-colindex="2"]`],
      download: downloadElement,
      listen: (el) => {
        const creator = document.querySelector(`[data-testid="creator-link"]`).textContent
        return [
          creator,
          " - ",
          el.childNodes[1].textContent.replaceAll(creator, "")
        ].join("")
      },
      style: "border-radius: 4px; height: 40px; width: 40px;"
    },
    trackPlaylist: {
      query:[`[data-testid="playlist-tracklist"] [data-testid="tracklist-row"]`, `[aria-colindex="2"]`],
      download: downloadElement,
      listen: (el) => el.childNodes[1].innerText.split("\n").reverse().join(" - "),
      style: "border-radius: 4px; height: 40px; width: 40px;"
    },
    trackRecommended: {
      query:[`[data-testid="recommended-track"] [data-testid="tracklist-row"]`, `[aria-colindex="1"]`],
      download: downloadElement,
      listen: (el) => el.firstChild.innerText.split("\n").reverse().join(" - "),
      style: "border-radius: 4px; height: 40px; width: 40px;"
    },
    trackRecommended2: {
      query:[`[aria-label="Recommended"][data-testid="track-list"] [data-testid="tracklist-row"]`, `[aria-colindex="1"]`],
      download: downloadElement,
      listen: (el) => el.firstChild.innerText.split("\n").reverse().join(" - "),
      style: "border-radius: 4px; height: 40px; width: 40px;"
    },


    track: {
      query: [`[data-testid="track-page"] [data-testid="action-bar-row"]`],
      download: downloadUrl,
      listen: (el) => {
        return [
          document.querySelector(`[data-testid="creator-link"]`).textContent,
          " - ",
          document.querySelector(`[data-testid="entityTitle"]`).textContent,
        ].join("")
      },
      style: "border-radius: 9999px; height: 56px; width: 56px; margin-right: 1rem;",
    },
    artist: {
      query: [`[data-testid="artist-page"] [data-testid="action-bar-row"]`],
      download: downloadUrl,
      style: "border-radius: 9999px; height: 56px; width: 56px; margin-right: 1rem;"
    },
    playlist: {
      query: [`[data-testid="playlist-page"] [data-testid="action-bar-row"]`],
      download: downloadUrl,
      style: "border-radius: 9999px; height: 56px; width: 56px; margin-right: 1rem;"
    }
  }

  const debounce = (func) => {
    let timer;
    return () => {
      clearTimeout(timer)
      timer = setTimeout(func, 200);
    }
  }

  const init = debounce(() => {
    console.log("init script")
    Object.entries(querys).forEach(([name, {query, style, download, listen}]) => {
      console.log(`find for ${name}`)
      document.querySelectorAll(query[0]).forEach((parent) => {
        let el = parent;
        query.slice(1).forEach((q) => {
          el = el ? el.querySelector(q) : null;
        });
        if (el == null) {
          console.error(`invalid element for ${name}`)
          return
        }
        if (!el.firstChild || !el.firstChild.classList.contains("spotdl")) {
          console.log(`add to ${name}`)
          el.insertBefore(btnDownload(parent, download, {style}), el.firstChild);
          if (listen) {
            el.insertBefore(btnListen(parent, listen, {style}), el.firstChild);
          }
        }
      })
    });
  });

  const observer = new MutationObserver(init)
  observer.observe(document.body, { subtree: true, childList: true });
})();