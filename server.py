#!/usr/bin/env python3
"""VS Code 扩展看板：静态文件 + Marketplace API 代理。"""

import json
import logging
import os
import sys
import threading
import time
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

UPSTREAM = "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery?api-version=7.1-preview.1"
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/126.0.0.0 Safari/537.36"
)
MAX_BODY = 1 * 1024 * 1024
CACHE_TTL = 300
CACHE_MAX_ENTRIES = 16
PUBLIC_FILES = {"/", "/index.html", "/app.js", "/data.js", "/styles.css"}

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("vscode-board")
_cache = {}
_cache_lock = threading.Lock()
_inflight = {}


def _cache_get(key):
    now = time.monotonic()
    with _cache_lock:
        entry = _cache.get(key)
        if entry and entry[0] > now:
            return entry[1]
        if entry:
            _cache.pop(key, None)
    return None


def _cache_put(key, payload):
    with _cache_lock:
        if len(_cache) >= CACHE_MAX_ENTRIES:
            _cache.pop(next(iter(_cache)))
        _cache[key] = (time.monotonic() + CACHE_TTL, payload)


def _fetch_upstream(body):
    req = urllib.request.Request(UPSTREAM, data=body, headers={
        "Content-Type": "application/json",
        "Accept": "application/json;api-version=7.1-preview.1",
        "User-Agent": USER_AGENT,
    })
    last_error = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                return resp.read()
        except Exception as exc:
            last_error = exc
            if attempt < 2:
                time.sleep(0.4 * (attempt + 1))
    raise last_error


def _get_upstream(body):
    key = body
    cached = _cache_get(key)
    if cached is not None:
        return cached
    with _cache_lock:
        event = _inflight.get(key)
        if event is None:
            event = threading.Event()
            _inflight[key] = event
            owner = True
        else:
            owner = False
    if not owner:
        event.wait(timeout=65)
        cached = _cache_get(key)
        if cached is not None:
            return cached
        raise RuntimeError("upstream request did not complete")
    try:
        payload = _fetch_upstream(body)
        _cache_put(key, payload)
        return payload
    finally:
        with _cache_lock:
            _inflight.pop(key, None)
            event.set()


class Handler(SimpleHTTPRequestHandler):
    def _json(self, status, value):
        payload = json.dumps(value, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def _is_public_path(self):
        return self.path.split("?", 1)[0] in PUBLIC_FILES

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/healthz":
            self._json(200, {"status": "ok"})
            return
        if not self._is_public_path():
            self.send_error(404)
            return
        super().do_GET()

    def do_HEAD(self):
        if not self._is_public_path():
            self.send_error(404)
            return
        super().do_HEAD()

    def do_POST(self):
        if self.path.split("?", 1)[0] != "/api/extensionquery":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", "-1"))
        except ValueError:
            self._json(400, {"error": "invalid request"})
            return
        if length < 0 or length > MAX_BODY:
            self._json(413, {"error": "request too large"})
            return
        body = self.rfile.read(length)
        try:
            request = json.loads(body)
            if not isinstance(request, dict) or not isinstance(request.get("filters"), list):
                raise ValueError("invalid request shape")
            payload = _get_upstream(body)
            json.loads(payload)
        except (ValueError, json.JSONDecodeError):
            self._json(400, {"error": "invalid request"})
            return
        except Exception:
            logger.exception("Marketplace request failed")
            self._json(502, {"error": "upstream unavailable"})
            return
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def end_headers(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/extensionquery" or path == "/healthz":
            self.send_header("Cache-Control", "no-store")
        else:
            self.send_header("Cache-Control", "public, max-age=300, must-revalidate")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def log_message(self, fmt, *args):
        logger.info("%s - %s", self.address_string(), fmt % args)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8137
    host = os.environ.get("HOST", "127.0.0.1")
    os.chdir(Path(__file__).resolve().parent)
    print(f"看板已启动 → http://{host}:{port}  （Ctrl+C 停止）")
    ThreadingHTTPServer((host, port), Handler).serve_forever()
