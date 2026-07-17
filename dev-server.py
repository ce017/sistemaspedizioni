"""Local dev server with Vercel-style clean URLs.

Serves /chi-siamo as chi-siamo.html (mirroring vercel.json "cleanUrls")
so the site behaves locally exactly as it does in production.

Run: python dev-server.py  (port 8642)
"""
import http.server
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = 8642


class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def translate_path(self, path):
        p = super().translate_path(path)
        if not os.path.exists(p) and os.path.exists(p.rstrip("/\\") + ".html"):
            return p.rstrip("/\\") + ".html"
        return p

    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args), flush=True)


if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer(("", PORT), CleanURLHandler)
    print(f"Serving {ROOT} on http://localhost:{PORT} (clean URLs enabled)", flush=True)
    server.serve_forever()
