from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import mimetypes
import os
import time
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = Path(__file__).resolve().parent / "data"
EVENTS_FILE = DATA_DIR / "events.jsonl"
HOST = os.environ.get("LOVE_HOST", "127.0.0.1")
PORT = int(os.environ.get("LOVE_PORT", "8080"))


def ensure_data_dir():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    EVENTS_FILE.touch(exist_ok=True)


def count_opens():
    ensure_data_dir()
    count = 1
    with EVENTS_FILE.open("r", encoding="utf-8") as file:
      for line in file:
          if '"event": "open-secret"' in line:
              count += 1
    return count


def write_json(handler, status, payload):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type, Accept")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    handler.end_headers()
    handler.wfile.write(body)


class LoveHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store" if self.path.startswith("/api/") else "public, max-age=120")
        super().end_headers()

    def do_OPTIONS(self):
        write_json(self, 200, {"ok": True})

    def do_GET(self):
        route = urlparse(self.path).path

        if route == "/api/health":
            write_json(self, 200, {"ok": True, "opens": count_opens(), "service": "love-memory"})
            return

        if route == "/api/events":
            ensure_data_dir()
            events = []
            with EVENTS_FILE.open("r", encoding="utf-8") as file:
                for line in file.readlines()[-40:]:
                    try:
                        events.append(json.loads(line))
                    except json.JSONDecodeError:
                        continue
            write_json(self, 200, {"ok": True, "events": events, "opens": count_opens()})
            return

        if route == "/":
            self.path = "/index.html"

        return super().do_GET()

    def do_POST(self):
        route = urlparse(self.path).path

        if route != "/api/heartbeat":
            write_json(self, 404, {"ok": False, "error": "not found"})
            return

        length = min(int(self.headers.get("Content-Length", "0")), 8192)
        raw_body = self.rfile.read(length)

        try:
            payload = json.loads(raw_body.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            write_json(self, 400, {"ok": False, "error": "bad json"})
            return

        event = {
            "event": str(payload.get("event", "heartbeat"))[:80],
            "at": str(payload.get("at", ""))[:80],
            "viewport": str(payload.get("viewport", ""))[:40],
            "ip": self.client_address[0],
            "server_time": int(time.time()),
            "user_agent": self.headers.get("User-Agent", "")[:220],
        }

        ensure_data_dir()
        with EVENTS_FILE.open("a", encoding="utf-8") as file:
            file.write(json.dumps(event, ensure_ascii=False) + "\n")

        write_json(self, 201, {"ok": True, "opens": count_opens()})


if __name__ == "__main__":
    mimetypes.add_type("text/javascript; charset=utf-8", ".js")
    mimetypes.add_type("text/css; charset=utf-8", ".css")
    ensure_data_dir()
    server = ThreadingHTTPServer((HOST, PORT), LoveHandler)
    print(f"Love backend is running on http://{HOST}:{PORT}")
    print(f"Events file: {EVENTS_FILE}")
    server.serve_forever()
