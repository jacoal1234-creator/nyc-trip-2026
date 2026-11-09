/* Maqueta 3D de Nueva York (Three.js r128).
   Edificios icónicos modelados con formas simples + ciudad genérica alrededor.
   Expone window.initCity(contenedor, hero) -> {rise()} o null si no hay WebGL. */
(function () {
  function initCity(el, hero, opts) {
    opts = opts || {};
    if (!window.THREE || !el) return null;
    var R;
    try { R = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); }
    catch (e) { return null; }
    if (!R.getContext()) return null;

    var MOB = innerWidth < 700;
    R.setPixelRatio(Math.min(devicePixelRatio || 1, MOB ? 1.5 : 2));
    R.setClearColor(0x000000, 0);
    el.appendChild(R.domElement);

    var S = new THREE.Scene();
    S.fog = new THREE.Fog(0x0b0e1f, MOB ? 200 : 120, MOB ? 360 : 260);
    var cam = new THREE.PerspectiveCamera(30, 1, 0.1, 700);
    var W = new THREE.Group();
    S.add(W);

    // ---- luces ----
    S.add(new THREE.HemisphereLight(0x8a93ff, 0x0b0e1f, 0.6));
    var moon = new THREE.DirectionalLight(0xc8d0ff, 0.85); moon.position.set(-60, 90, 40); S.add(moon);
    var warm = new THREE.PointLight(0xffc21a, 1.4, 70); warm.position.set(0, 34, -6); W.add(warm);

    // ---- utilidades ----
    var sd = 11; function rnd() { sd = (sd * 9301 + 49297) % 233280; return sd / 233280; }
    function winTex(p, base, lit) {
      var c = document.createElement("canvas"); c.width = 64; c.height = 128;
      var x = c.getContext("2d"); x.fillStyle = base; x.fillRect(0, 0, 64, 128);
      for (var r = 0; r < 16; r++) for (var k = 0; k < 8; k++) {
        x.fillStyle = rnd() < p ? lit : "rgba(120,130,200,.16)"; x.fillRect(k * 8 + 2, r * 8 + 2, 4, 5);
      }
      var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t;
    }
    var T1 = winTex(.30, "#151a44", "#ffd36b"), T2 = winTex(.16, "#121638", "#ffe7a8"), T3 = winTex(.42, "#1b2150", "#ffc94a");
    function M(t, col, ei, extra) {
      var o = { color: col, map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: ei == null ? .9 : ei, roughness: .75, metalness: .15 };
      for (var k in (extra || {})) o[k] = extra[k];
      return new THREE.MeshStandardMaterial(o);
    }
    var mGen = [M(T1, 0x9aa3e0), M(T2, 0x8890d0), M(T3, 0xa0a8e8)];
    var mESB = M(T3, 0xe3d3ad, .85);
    var mGlow = new THREE.MeshStandardMaterial({ color: 0xffc21a, emissive: 0xffb000, emissiveIntensity: 1.1, roughness: .4 });
    var mSilver = new THREE.MeshStandardMaterial({ color: 0xe4e8f4, metalness: .9, roughness: .22, emissive: 0x8ea0ff, emissiveIntensity: .3 });
    var mGlass = M(T2, 0x86a2ff, .75, { metalness: .55, roughness: .28 });
    var mStone = new THREE.MeshStandardMaterial({ color: 0xa39582, roughness: .9, emissive: 0x2a2418, emissiveIntensity: .4 });
    var mGreen = new THREE.MeshStandardMaterial({ color: 0x74c2a5, roughness: .6, emissive: 0x1d4d3d, emissiveIntensity: .5 });
    var mRed = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
    var mLand = new THREE.MeshStandardMaterial({ color: 0x151a3a, roughness: .95 });

    function uvScale(g, w, h) {
      var uv = g.attributes.uv;
      for (var i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * Math.max(1, w / 3), uv.getY(i) * Math.max(1, h / 3));
      uv.needsUpdate = true;
    }
    function box(w, h, d, m, x, y, z) {
      var g = new THREE.BoxGeometry(w, h, d); uvScale(g, w, h); g.translate(0, h / 2, 0);
      var o = new THREE.Mesh(g, m); o.position.set(x || 0, y || 0, z || 0); return o;
    }
    function cyl(rt, rb, h, seg, m, x, y, z) {
      var g = new THREE.CylinderGeometry(rt, rb, h, seg); uvScale(g, (rt + rb) * 2, h); g.translate(0, h / 2, 0);
      var o = new THREE.Mesh(g, m); o.position.set(x || 0, y || 0, z || 0); return o;
    }
    function sph(r, m, x, y, z) { var o = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), m); o.position.set(x || 0, y || 0, z || 0); return o; }

    var B = [], LANDMARKS = [], blink = [];
    function bld(x, z, label, parts) {
      var g = new THREE.Group(); g.position.set(x, 0, z);
      parts.forEach(function (p) { g.add(p); });
      if (label) { g.userData.label = label; LANDMARKS.push(g); }
      W.add(g); B.push(g); return g;
    }
    function beacon(g, y) { var s = sph(.35, mRed, 0, y, 0); g.add(s); blink.push(s); }

    // ---- agua, cuadrícula y tierra ----
    var water = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial({ color: 0x0a1030, roughness: .35, metalness: .45 }));
    water.rotation.x = -Math.PI / 2; water.position.y = -.05; W.add(water);
    var grid = new THREE.GridHelper(500, 125, 0x2a3170, 0x1a1f4a); grid.material.transparent = true; grid.material.opacity = .55; W.add(grid);
    function land(w, d, x, z) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, .6, d), mLand); m.position.set(x, 0, z); W.add(m); }
    land(34, 98, 0, 6);    // Manhattan
    land(30, 64, 42, 30);  // Brooklyn
    land(6, 6, -27, 58);   // Liberty Island

    // ---- ÍCONOS ----
    // Empire State: base + torre + retranqueos escalonados + corona iluminada + mástil
    var esb = bld(0, -6, "Empire State Building", [
      box(10, 3, 9, mESB), box(7, 19, 6.4, mESB, 0, 3), box(5.6, 3, 5.2, mESB, 0, 22),
      box(4.4, 1.6, 4.1, mGlow, 0, 25), box(3.2, 1.6, 3, mGlow, 0, 26.6),
      cyl(1, 1.3, 3, 8, mGlow, 0, 28.2), cyl(.12, .45, 5.5, 6, mSilver, 0, 31.2)
    ]); beacon(esb, 36.9);

    // Chrysler: torre + corona de anillos plateados + aguja
    var chParts = [box(5, 15, 5, mGen[0])], r = 2.5, y = 15;
    for (var i = 0; i < 6; i++) { chParts.push(cyl(r - .35, r, 1.25, 8, mSilver, 0, y)); y += 1.25; r -= .36; }
    chParts.push(cyl(.02, .35, 4.5, 8, mSilver, 0, y));
    bld(10, -11, "Chrysler Building", chParts);

    // 432 Park Avenue: torre delgada
    bld(4, -22, "432 Park Avenue", [box(2.2, 31, 2.2, mGen[2])]);

    // One Vanderbilt: prisma que se angosta
    var ov = cyl(1.6, 3, 25, 4, mGlass); ov.rotation.y = Math.PI / 4;
    bld(13, -2, "One Vanderbilt (Summit)", [ov, cyl(.08, .2, 4, 6, mSilver, 0, 25)]);

    // Rockefeller / Top of the Rock: bloque delgado y ancho
    bld(-7, -16, "Rockefeller Center (Top of the Rock)", [box(7, 20, 3.2, mGen[1]), box(5.4, 1.4, 2.6, mGen[1], 0, 20)]);

    // One World Trade Center: base + frustum de 4 caras + aguja
    var w1 = cyl(2.2, 4.4, 33, 4, mGlass, 0, 3); w1.rotation.y = Math.PI / 4;
    var wtc = bld(-6, 42, "One World Trade Center", [box(6.4, 3, 6.4, mGlass), w1, cyl(.1, .3, 9, 6, mSilver, 0, 36)]);
    beacon(wtc, 45.4);

    // Flatiron: prisma triangular
    var fl = cyl(3.3, 3.3, 9, 3, M(T1, 0xd2ab8b, .8)); fl.rotation.y = Math.PI / 2;
    bld(-2, 15, "Flatiron Building", [fl]);

    // Edge / Hudson Yards: torre con plataforma en punta
    var hy = cyl(1.8, 2.8, 24, 4, mGlass); hy.rotation.y = Math.PI / 4;
    bld(-13, -2, "Edge (Hudson Yards)", [hy, box(3.2, .35, 3.4, mSilver, 0, 23.2, 1.6)]);

    // Brooklyn Bridge: dos torres de piedra, tablero y cables
    var bb = new THREE.Group();
    bb.add(box(20, .45, 1.8, mStone, 22, 1.4, 44));
    bb.add(box(1.6, 8.5, 2.6, mStone, 19, 0, 44)); bb.add(box(1.6, 8.5, 2.6, mStone, 25, 0, 44));
    var cableMat = new THREE.LineBasicMaterial({ color: 0xffd36b, transparent: true, opacity: .9 });
    [-1, 1].forEach(function (s) {
      var z = 44 + s * .9, pts = [];
      var segs = [[12, 1.9, 19, 8.4, 15.5, 3.6], [19, 8.4, 25, 8.4, 22, 3.2], [25, 8.4, 32, 1.9, 28.5, 3.6]];
      segs.forEach(function (a) {
        var c = new THREE.QuadraticBezierCurve3(new THREE.Vector3(a[0], a[1], z), new THREE.Vector3(a[4], a[5], z), new THREE.Vector3(a[2], a[3], z));
        pts = pts.concat(c.getPoints(14));
      });
      bb.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), cableMat));
    });
    bb.userData.label = "Brooklyn Bridge"; W.add(bb); B.push(bb); LANDMARKS.push(bb);

    // Estatua de la Libertad
    var lib = bld(-27, 58, "Estatua de la Libertad", [
      box(2.8, 2.4, 2.8, mStone), cyl(.55, .95, 3.3, 10, mGreen, 0, 2.4), sph(.48, mGreen, 0, 6.1, 0),
      cyl(.14, .18, 1.8, 6, mGreen, .5, 5.4, 0), sph(.28, mGlow, .5, 7.4, 0)
    ]);
    var torch = new THREE.PointLight(0xffc21a, 1.5, 14); torch.position.set(.5, 7.6, 0); lib.add(torch);

    // ---- ciudad genérica ----
    var keep = [[0, -6, 7], [10, -11, 5], [4, -22, 3], [13, -2, 4.5], [-7, -16, 5], [-6, 42, 6], [-2, 15, 5], [-13, -2, 4.5]];
    function free(x, z) { for (var i = 0; i < keep.length; i++) { var k = keep[i]; if (Math.hypot(x - k[0], z - k[1]) < k[2]) return false; } return true; }
    var dens = MOB ? .5 : .78;
    for (var gx = -15; gx <= 15; gx += 3.6) for (var gz = -40; gz <= 53; gz += 3.6) {
      if (rnd() > dens || !free(gx, gz)) continue;
      var h = 2.5 + 15 * Math.exp(-Math.pow((gz + 8) / 15, 2)) + 12 * Math.exp(-Math.pow((gz - 40) / 7, 2));
      h *= .45 + rnd() * .85; h = Math.max(2, h);
      var w = 2.2 + rnd() * 1.1, d = 2.2 + rnd() * 1.1, m = mGen[(rnd() * 3) | 0];
      var parts = [box(w, h, d, m)];
      if (h > 9 && rnd() < .45) parts.push(box(w * .65, h * .18, d * .65, m, 0, h));
      if (h > 13 && rnd() < .3) parts.push(cyl(.05, .12, 3, 5, mSilver, 0, h + (parts.length > 1 ? h * .18 : 0)));
      bld(gx + (rnd() - .5), gz + (rnd() - .5), null, parts);
    }
    for (var bx = 29; bx <= 55; bx += 3.8) for (var bz = 2; bz <= 60; bz += 3.8) {
      if (rnd() > (MOB ? .35 : .5)) continue;
      var bh = 1.2 + rnd() * 4 + (bx < 33 && bz > 34 && bz < 52 ? 4 : 0);
      bld(bx, bz, null, [box(2.6, bh, 2.6, mGen[(rnd() * 3) | 0])]);
    }

    // ---- estrellas ----
    var sg = new THREE.BufferGeometry(), sp = [];
    for (var s = 0; s < 500; s++) { var th = rnd() * Math.PI * 2, ph = rnd() * .45, rr = 320; sp.push(Math.cos(th) * Math.sin(ph + .9) * rr, 60 + Math.cos(ph) * 160, Math.sin(th) * Math.sin(ph + .9) * rr); }
    sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    S.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.1, transparent: true, opacity: .7, fog: false })));

    // ---- subida de edificios ----
    var animate = !opts.reduced && !!window.gsap, risen = false;
    var cx0 = 0, cz0 = 6;
    B.sort(function (a, b) { return Math.hypot(a.position.x - cx0, a.position.z - cz0) - Math.hypot(b.position.x - cx0, b.position.z - cz0); });
    if (animate) B.forEach(function (g) { g.scale.y = .001; });
    function rise() {
      if (risen) return; risen = true;
      if (!animate) { B.forEach(function (g) { g.scale.y = 1; }); return; }
      B.forEach(function (g, i) {
        gsap.to(g.scale, { y: 1, duration: g.userData.label ? 2 : 1.4, ease: g.userData.label ? "elastic.out(1,.6)" : "power3.out", delay: .2 + i * .004 + (g.userData.label ? .5 : 0) });
      });
    }

    // ---- cámara, tamaño y mouse ----
    var target = new THREE.Vector3(), YAX = new THREE.Vector3(0, 1, 0), mx = 0, my = 0, tx = 0, ty = 0;
    function size() {
      var w = el.clientWidth || 1, h = el.clientHeight || 1;
      R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    }
    size();
    if (window.ResizeObserver) new ResizeObserver(size).observe(el); else addEventListener("resize", size);
    addEventListener("pointermove", function (e) { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; });

    // tooltip al pasar sobre un ícono
    var tip = opts.tip, ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), lastRay = 0;
    if (hero && tip && !MOB) hero.addEventListener("pointermove", function (e) {
      var now = performance.now(); if (now - lastRay < 60) return; lastRay = now;
      var rc = R.domElement.getBoundingClientRect();
      if (e.clientX < rc.left || e.clientX > rc.right || e.clientY < rc.top || e.clientY > rc.bottom) { tip.classList.remove("show"); return; }
      ndc.set(((e.clientX - rc.left) / rc.width) * 2 - 1, -((e.clientY - rc.top) / rc.height) * 2 + 1);
      ray.setFromCamera(ndc, cam);
      var hit = ray.intersectObjects(LANDMARKS, true)[0], label = null, o = hit && hit.object;
      while (o && !label) { label = o.userData && o.userData.label; o = o.parent; }
      if (label) { tip.textContent = label; tip.style.left = e.clientX + "px"; tip.style.top = e.clientY + "px"; tip.classList.add("show"); }
      else tip.classList.remove("show");
    });

    var visible = true;
    if (window.IntersectionObserver && hero) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(hero);
    var t0 = performance.now(), first = true;
    function loop(now) {
      requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      var t = now - t0;
      mx += (tx - mx) * .05; my += (ty - my) * .05;
      // giro base: Downtown adelante-derecha, Midtown (Empire State) al fondo-centro
      W.rotation.y = 1.25 + Math.sin(t * 0.00011) * 0.12 + mx * 0.3;
      var dist = MOB ? 235 : 150;
      cam.position.set(Math.sin(.95) * dist, (MOB ? 120 : 72) - my * 14, Math.cos(.95) * dist);
      target.set(0, 9, 14).applyAxisAngle(YAX, W.rotation.y);
      cam.lookAt(target);
      for (var i = 0; i < blink.length; i++) blink[i].visible = Math.floor(t / 650) % 2 === 0;
      warm.intensity = 1.3 + Math.sin(t * .002) * .15;
      R.render(S, cam);
      if (first) { first = false; el.classList.add("ready"); }
    }
    requestAnimationFrame(loop);
    return { rise: rise };
  }
  window.initCity = initCity;
})();
