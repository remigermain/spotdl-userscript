from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import subprocess
import multiprocessing
from pathlib import Path
import argparse

def download(url, output):
    print(f"Start download {url=}")
    res = subprocess.run(["spotdl", "download", url, "--output", flags.output], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    print(f"[{'OK' if res else 'KO'}] {url=}")
    if res.stderr:
        print(res.stderr)


class SpotdlServer(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/download":
            self.send_response(404)
            self.end_headers()
            return
            
        self.send_response(200)
        self.end_headers()

        content_len = int(self.headers['content-length'])
        data = json.loads(self.rfile.read(content_len).decode())

        multiprocessing.Process(target=download, args=(data['url'], flags.output), daemon=True).start()

if __name__ == "__main__":
    parser = argparse.ArgumentParser("spodl-web")
    parser.add_argument("--output", default="~/Music/spotdl-web")
    flags = parser.parse_args()

    flags.output = str(Path(flags.output).expanduser())

    webServer = HTTPServer(("localhost", 56938), SpotdlServer)
    host, port = webServer.server_address
    header = f"""Spotdl server started
    -> http://{host}:{port}
    -> https://open.spotify.com
    -> output {flags.output!r}"""
    print(header)

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")