import http.client
import json
import subprocess
import sys
import time
import unittest
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class ServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.port = 18137
        cls.process = subprocess.Popen(
            [sys.executable, str(ROOT / "server.py"), str(cls.port)],
            cwd=ROOT,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        for _ in range(20):
            try:
                cls.request("/healthz")
                return
            except OSError:
                time.sleep(0.05)
        raise RuntimeError("server did not start")

    @classmethod
    def tearDownClass(cls):
        cls.process.terminate()
        cls.process.wait(timeout=3)

    @classmethod
    def request(cls, path, data=None, headers=None):
        request = urllib.request.Request(
            f"http://127.0.0.1:{cls.port}{path}",
            data=data,
            headers=headers or {},
            method="POST" if data is not None else "GET",
        )
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        return opener.open(request, timeout=3)

    def test_health_check(self):
        with self.request("/healthz") as response:
            self.assertEqual(response.status, 200)
            self.assertEqual(json.loads(response.read()), {"status": "ok"})

    def test_sensitive_paths_are_not_served(self):
        for path in ("/.git/config", "/.env", "/server.py", "/README.md"):
            with self.assertRaises(urllib.error.HTTPError) as context:
                self.request(path)
            self.assertEqual(context.exception.code, 404)

    def test_unknown_post_path_is_not_proxied(self):
        with self.assertRaises(urllib.error.HTTPError) as context:
            self.request("/api/other", b"{}")
        self.assertEqual(context.exception.code, 404)

    def test_invalid_request_is_rejected_before_upstream(self):
        data = json.dumps({"wrong": []}).encode()
        with self.assertRaises(urllib.error.HTTPError) as context:
            self.request("/api/extensionquery", data, {"Content-Type": "application/json"})
        self.assertEqual(context.exception.code, 400)
        self.assertEqual(json.loads(context.exception.read()), {"error": "invalid request"})

    def test_oversized_request_is_rejected(self):
        connection = http.client.HTTPConnection("127.0.0.1", self.port, timeout=3)
        try:
            connection.request("POST", "/api/extensionquery", body=None, headers={
                "Content-Length": str(1024 * 1024 + 1),
                "Content-Type": "application/json",
            })
            response = connection.getresponse()
            self.assertEqual(response.status, 413)
        finally:
            connection.close()


if __name__ == "__main__":
    unittest.main()
