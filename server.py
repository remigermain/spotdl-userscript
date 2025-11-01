import json
import multiprocessing
import subprocess
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer


def download(url):
    print(f"Start download {url!r}")
    res = subprocess.run(
        ["spotdl", sys.argv[1], url, *sys.argv[2:]],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    print(f"[{'OK' if res else 'KO'}] {url!r}")
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

        content_len = int(self.headers["content-length"])
        data = json.loads(self.rfile.read(content_len).decode())

        multiprocessing.Process(
            target=download, args=(data["url"],), daemon=True
        ).start()


if __name__ == "__main__":
    try:
        from spotdl.utils.arguments import parse_arguments
    except ImportError:
        from spotdl.parsers import parse_arguments

    import os

    # auto add spotdl download arguements
    sys.argv = [sys.argv[0], "download", *sys.argv[1:]]

    # try parse spotdl arguements
    flags = parse_arguments()
    if not flags.output:
        flags.output = os.path.dirname(os.path.abspath(__file__))

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
