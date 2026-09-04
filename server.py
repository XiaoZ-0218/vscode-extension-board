#!/usr/bin/env python3
"""VS Code 扩展看板本地服务器：静态文件 + 市场 API 代理。

代理的作用：
1. 为请求换上常规浏览器 UA —— 市场 WAF 会拦截含 Electron 等字样的 UA（403）；
2. 同源调用，浏览器端无需关心跨域。

用法：python3 server.py [端口]   （默认 8137；容器部署时设 HOST=0.0.0.0）
"""
import json
import os
import sys
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

UPSTREAM = "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery?api-version=7.1-preview.1"
USER_AGENT = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
              "AppleWebKit/537.36 (KHTML, like Gecko) "
              "Chrome/126.0.0.0 Safari/537.36")


class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/api/extensionquery":
            self.send_error(404)
            return
        try:
            body = self.rfile.read(int(self.headers.get("Content-Length") or 0))
            req = urllib.request.Request(UPSTREAM, data=body, headers={
                "Content-Type": "application/json",
                "Accept": "application/json;api-version=7.1-preview.1",
                "User-Agent": USER_AGENT,
            })
            with urllib.request.urlopen(req, timeout=20) as resp:
                payload = resp.read()
            status, ctype = 200, "application/json; charset=utf-8"
        except Exception as exc:
            payload, status, ctype = json.dumps({"error": str(exc)}).encode(), 502, "application/json"
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, *args):  # 保持终端安静
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8137
    host = os.environ.get("HOST", "127.0.0.1")
    print(f"看板已启动 → http://{host}:{port}  （Ctrl+C 停止）")
    ThreadingHTTPServer((host, port), Handler).serve_forever()
