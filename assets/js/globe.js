/* Sistema Spedizioni — hero globe (three.js)
   Stylized dotted earth with animated shipping routes radiating
   from the Venice/Pordenone hub. Degrades gracefully: if WebGL or
   the land dataset is unavailable, the hero photo simply remains. */
(function () {
  "use strict";

  var mount = document.getElementById("globe");
  if (!mount || typeof THREE === "undefined") return;

  // If the tab is hidden or narrow at load time, wait for a usable viewport
  // instead of giving up (e.g. page opened in a background tab).
  if (window.innerWidth < 768) {
    var retry = function () {
      if (window.innerWidth >= 768) {
        window.removeEventListener("resize", retry);
        document.removeEventListener("visibilitychange", retry);
        init();
      }
    };
    window.addEventListener("resize", retry);
    document.addEventListener("visibilitychange", retry);
    return;
  }
  init();

  function init() {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var R = 1;
  var ACCENT = 0xff9420;

  /* ---------- ports (lat, lon) ---------- */
  var HUB = { lat: 45.6, lon: 12.6 }; // Venice / Pordenone
  var PORTS = [
    { lat: 51.9, lon: 4.5 },    // Rotterdam
    { lat: 40.7, lon: -74.0 },  // New York
    { lat: 33.7, lon: -118.3 }, // Los Angeles
    { lat: -23.9, lon: -46.3 }, // Santos
    { lat: 31.2, lon: 121.5 },  // Shanghai
    { lat: 1.3, lon: 103.8 },   // Singapore
    { lat: 25.3, lon: 55.3 },   // Dubai
    { lat: 35.6, lon: 139.8 },  // Tokyo
    { lat: 19.1, lon: 72.9 },   // Mumbai
    { lat: -33.9, lon: 151.2 }, // Sydney
    { lat: 30.0, lon: 31.2 },   // Port Said
    { lat: -33.9, lon: 18.4 }   // Cape Town
  ];

  function toVec(lat, lon, r) {
    var phi = (90 - lat) * Math.PI / 180;
    var theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }

  /* ---------- scene ---------- */
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.35, 3.15);

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  mount.appendChild(renderer.domElement);

  var globe = new THREE.Group();
  globe.rotation.z = 0.16; // subtle tilt
  scene.add(globe);

  /* ---------- occluder sphere ---------- */
  var occluder = new THREE.Mesh(
    new THREE.SphereGeometry(R * 0.992, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x05050a, transparent: true, opacity: 0.97 })
  );
  globe.add(occluder);

  /* ---------- atmosphere rim ---------- */
  var rim = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.02, 48, 48),
    new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: { c: { value: new THREE.Color(ACCENT) } },
      vertexShader:
        "varying float vI; void main(){ vec3 n = normalize(normalMatrix * normal);" +
        "vec4 mv = modelViewMatrix * vec4(position,1.0);" +
        "vI = pow(0.72 - dot(n, normalize(-mv.xyz)), 3.0);" +
        "gl_Position = projectionMatrix * mv; }",
      fragmentShader:
        "uniform vec3 c; varying float vI;" +
        "void main(){ gl_FragColor = vec4(c, 1.0) * vI * 0.85; }"
    })
  );
  globe.add(rim);

  /* ---------- graticule ---------- */
  var grat = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.SphereGeometry(R, 28, 18)),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.055 })
  );
  globe.add(grat);

  /* ---------- land dots (fetched; optional) ---------- */
  fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json")
    .then(function (r) { return r.json(); })
    .then(function (topo) {
      if (typeof topojson === "undefined") return;
      var land = topojson.feature(topo, topo.objects.land);
      var polys = [];
      (land.features || [land]).forEach(function (f) {
        var g = f.geometry;
        if (g.type === "Polygon") polys.push(g.coordinates);
        else if (g.type === "MultiPolygon") g.coordinates.forEach(function (p) { polys.push(p); });
      });
      function inside(lon, lat, ring) {
        var x = lon, y = lat, ok = false;
        for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
          var xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
          if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ok = !ok;
        }
        return ok;
      }
      function onLand(lon, lat) {
        for (var p = 0; p < polys.length; p++) {
          if (inside(lon, lat, polys[p][0])) {
            var hole = false;
            for (var h = 1; h < polys[p].length; h++) {
              if (inside(lon, lat, polys[p][h])) { hole = true; break; }
            }
            if (!hole) return true;
          }
        }
        return false;
      }
      var pts = [];
      for (var lat = -58; lat <= 84; lat += 1.6) {
        var step = 1.6 / Math.max(Math.cos(lat * Math.PI / 180), 0.25);
        for (var lon = -180; lon < 180; lon += step) {
          if (onLand(lon, lat)) {
            var v = toVec(lat, lon, R * 1.001);
            pts.push(v.x, v.y, v.z);
          }
        }
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
      globe.add(new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xb8c0cf, size: 0.011, transparent: true, opacity: 0.95, sizeAttenuation: true
      })));
    })
    .catch(function () { /* no land data — globe still renders */ });

  /* ---------- routes ---------- */
  var pulses = [];
  var hubV = toVec(HUB.lat, HUB.lon, R);

  PORTS.forEach(function (p, idx) {
    var endV = toVec(p.lat, p.lon, R);
    var dist = hubV.distanceTo(endV);
    var mid = hubV.clone().add(endV).multiplyScalar(0.5).normalize()
      .multiplyScalar(R * (1.12 + dist * 0.32));
    var curve = new THREE.QuadraticBezierCurve3(hubV, mid, endV);

    var line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)),
      new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.55 })
    );
    globe.add(line);

    // traveling pulse
    var pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.014, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffc37a })
    );
    globe.add(pulse);
    pulses.push({ curve: curve, mesh: pulse, t: (idx * 0.83) % 1, speed: 0.09 + (idx % 4) * 0.02 });

    // port dot
    var dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.014, 8, 8),
      new THREE.MeshBasicMaterial({ color: ACCENT })
    );
    dot.position.copy(endV);
    globe.add(dot);
  });

  // hub marker
  var hubDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  hubDot.position.copy(hubV);
  globe.add(hubDot);

  /* ---------- sizing ---------- */
  function resize() {
    var w = mount.clientWidth, h = mount.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  /* ---------- mouse parallax ---------- */
  var targetX = 0, targetY = 0;
  if (!reduced) {
    window.addEventListener("pointermove", function (e) {
      targetX = (e.clientX / window.innerWidth - 0.5) * 0.28;
      targetY = (e.clientY / window.innerHeight - 0.5) * 0.18;
    }, { passive: true });
  }

  /* ---------- loop ---------- */
  // start rotated so Europe faces the camera
  var baseRot = -1.95;
  globe.rotation.y = baseRot;
  var clock = new THREE.Clock();

  function tick() {
    var dt = Math.min(clock.getDelta(), 0.05);
    if (!reduced) baseRot += dt * 0.055;
    globe.rotation.y += (baseRot + targetX - globe.rotation.y) * 0.06;
    globe.rotation.x += (targetY - globe.rotation.x) * 0.06;

    pulses.forEach(function (p) {
      if (!reduced) p.t = (p.t + dt * p.speed) % 1;
      p.mesh.position.copy(p.curve.getPoint(p.t));
      var s = 0.7 + Math.sin(p.t * Math.PI) * 0.9;
      p.mesh.scale.setScalar(s);
    });

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
  mount.classList.add("is-ready");
  }
})();
