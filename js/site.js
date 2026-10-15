(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- The Canopy: seedlings the user has planted ---------- */

  const SEED_KEY = "treeline-seedlings";
  const SEED_TOTAL = 6; // five steps + the survey
  function readSeeds() {
    try { return JSON.parse(localStorage.getItem(SEED_KEY)) || []; } catch (e) { return []; }
  }
  function writeSeeds(list) {
    try { localStorage.setItem(SEED_KEY, JSON.stringify(list)); } catch (e) { /* private mode */ }
    document.dispatchEvent(new CustomEvent("canopy"));
  }
  function plant(id, on) {
    const list = readSeeds().filter(function (s) { return s !== id; });
    if (on) list.push(id);
    writeSeeds(list);
  }

  /* ---------- Chrome: hamburger ---------- */

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    const readout = document.createElement("div");
    readout.className = "canopy-readout";
    nav.appendChild(readout);
    function drawReadout() {
      const n = Math.min(readSeeds().length, SEED_TOTAL);
      let cells = "";
      for (let i = 0; i < SEED_TOTAL; i++) cells += "<i class=\"" + (i < n ? "on" : "") + "\"></i>";
      readout.innerHTML = "The Canopy <b>" + n + "/" + SEED_TOTAL + "</b><div class=\"canopy-bar\" aria-hidden=\"true\">" + cells + "</div>";
    }
    drawReadout();
    document.addEventListener("canopy", drawReadout);

    function setOpen(open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("open"));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { setOpen(false); toggle.focus(); }
    });
  }

  /* ---------- The world: a pixel cross-section of a forest ---------- */

  const P = 4;              // css px per art pixel
  const SOIL = 0.72;        // matches --soil-line in styles.css
  const C = {
    leaf0: "#13261a", leaf1: "#1b3522", leaf2: "#24472c", leaf3: "#2f5c35", glint: "#7fd17a",
    bark0: "#120d09", bark1: "#1d150f", bark2: "#2a1f16", knot: "#0c0906",
    root0: "#3a2a1c", root1: "#4a3624", stone: "#3b342c", stoneHi: "#4d443a",
    grass: "#1f3a22", myc: "rgba(232, 214, 170, 0.16)", bare: "#2a2219"
  };

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  const stat = document.createElement("canvas");
  const canopy = document.createElement("canvas");
  stat.className = canopy.className = "world";
  stat.setAttribute("aria-hidden", "true");
  canopy.setAttribute("aria-hidden", "true");
  document.body.prepend(canopy);
  document.body.prepend(stat);

  let trees = [];
  let W = 0, H = 0;

  function layout() {
    W = Math.ceil(window.innerWidth / P);
    H = Math.ceil(document.documentElement.scrollHeight / P);
    const r = rng(7);
    const colArt = Math.min(700, window.innerWidth - 48) / P;
    const left = (W - colArt) / 2, right = left + colArt;
    trees = [];
    let x = 4 + r() * 10;
    while (x < W - 4) {
      const inCol = x > left - 4 && x < right + 4;
      trees.push({
        x: Math.round(x),
        w: inCol ? 2 + Math.round(r() * 2) : 3 + Math.round(r() * 4),
        crown: 14 + Math.round(r() * 12),
        top: 6 + Math.round(r() * 20),
        phase: r() * Math.PI * 2,
        faint: inCol,
        rank: r()
      });
      x += inCol ? 26 + r() * 22 : 12 + r() * 14;
    }
    // hopeful by default: a third of the forest already stands
    trees.sort(function (a, b) { return a.rank - b.rank; });
  }

  function grownCount() {
    const frac = Math.min(readSeeds().length, SEED_TOTAL) / SEED_TOTAL;
    return Math.round(trees.length * (0.35 + 0.65 * frac));
  }

  function px(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  function blob(ctx, cx, cy, rad, color, r) {
    for (let y = -rad; y <= rad; y++) {
      for (let x = -rad; x <= rad; x++) {
        if (x * x + y * y <= rad * rad + r() * rad) px(ctx, cx + x, cy + y, 1, 1, color);
      }
    }
  }

  function drawStatic() {
    stat.width = W; stat.height = H;
    stat.style.height = H * P + "px";
    const ctx = stat.getContext("2d");
    const r = rng(42);
    const soilY = Math.round(H * SOIL);

    trees.forEach(function (t) {
      ctx.globalAlpha = t.faint ? 0.28 : 0.9;
      const trunkTop = t.top + t.crown - 4;
      // trunk
      for (let y = trunkTop; y < soilY; y++) {
        px(ctx, t.x, y, t.w, 1, C.bark1);
        px(ctx, t.x, y, 1, 1, C.bark0);
        if (t.w > 2) px(ctx, t.x + t.w - 1, y, 1, 1, C.bark2);
        if (r() < 0.04) px(ctx, t.x + 1 + Math.floor(r() * (t.w - 1)), y, 1, 2, C.knot);
      }
      // a stray branch now and then
      for (let y = trunkTop + 30; y < soilY - 40; y += 60 + Math.floor(r() * 80)) {
        const dir = r() < 0.5 ? -1 : 1, len = 3 + Math.floor(r() * 5);
        for (let i = 0; i < len; i++) px(ctx, t.x + (dir > 0 ? t.w + i : -1 - i), y - Math.floor(i / 2), 1, 1, C.bark1);
      }
      // roots
      const rootN = 3 + Math.floor(r() * 3);
      for (let k = 0; k < rootN; k++) {
        let rx = t.x + r() * t.w, ry = soilY;
        let dx = (r() - 0.5) * 1.6;
        const len = 20 + r() * (H - soilY) * 0.6;
        for (let i = 0; i < len; i++) {
          px(ctx, rx, ry, 1, 1, i < 6 ? C.root1 : C.root0);
          rx += dx + (r() - 0.5) * 0.8; ry += 0.6 + r() * 0.6;
          dx *= 0.98;
          if (r() < 0.02) dx = (r() - 0.5) * 2;
        }
      }
    });
    ctx.globalAlpha = 1;

    // ground line
    for (let x = 0; x < W; x++) {
      if (r() < 0.5) px(ctx, x, soilY - 1 - Math.floor(r() * 2), 1, 1, C.grass);
    }
    // stones and mycelium in the soil
    for (let i = 0; i < W * (H - soilY) / 900; i++) {
      const sx = r() * W, sy = soilY + 8 + r() * (H - soilY - 8);
      if (r() < 0.5) { px(ctx, sx, sy, 3, 2, C.stone); px(ctx, sx + 1, sy, 1, 1, C.stoneHi); }
      else px(ctx, sx, sy, 1, 1, C.myc);
    }

    // centre fade so text stays quiet
    const fade = ctx.createLinearGradient(0, 0, W, 0);
    fade.addColorStop(0, "rgba(0,0,0,0)");
    fade.addColorStop(0.3, "rgba(0,0,0,0.55)");
    fade.addColorStop(0.5, "rgba(0,0,0,0.7)");
    fade.addColorStop(0.7, "rgba(0,0,0,0.55)");
    fade.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
  }

  const CANOPY_H = 70; // art px tall
  function drawCanopy(time) {
    if (canopy.width !== W) { canopy.width = W; canopy.height = CANOPY_H; canopy.style.height = CANOPY_H * P + "px"; }
    const ctx = canopy.getContext("2d");
    ctx.clearRect(0, 0, W, CANOPY_H);
    const grown = grownCount();
    trees.forEach(function (t, i) {
      const r = rng(1000 + i);
      const sway = reduceMotion ? 0 : Math.round(Math.sin(time / 1400 + t.phase));
      const cx = t.x + t.w / 2 + sway;
      const cy = t.top + t.crown / 2;
      ctx.globalAlpha = t.faint ? 0.3 : 1;
      if (i < grown) {
        const rad = Math.round(t.crown / 2);
        blob(ctx, cx, cy + 2, rad, C.leaf0, r);
        blob(ctx, cx - rad / 3, cy, rad - 3, C.leaf1, r);
        blob(ctx, cx + rad / 3, cy - 2, rad - 4, C.leaf2, r);
        blob(ctx, cx - 1, cy - rad / 2, Math.max(2, rad - 7), C.leaf3, r);
        for (let k = 0; k < 4; k++) px(ctx, cx - rad / 2 + r() * rad, cy - rad / 2 + r() * rad, 1, 1, C.glint);
      } else {
        // bare branches: waiting, not dead
        const base = t.top + t.crown - 4;
        for (let k = 0; k < 4; k++) {
          let bx = cx, by = base;
          const dx = (k - 1.5) * 0.6;
          for (let s = 0; s < t.crown * 0.7; s++) {
            px(ctx, bx, by, 1, 1, C.bare);
            bx += dx; by -= 1;
          }
          if (r() < 0.6) px(ctx, bx, by, 1, 1, C.leaf2); // a bud
        }
      }
    });
    ctx.globalAlpha = 1;
  }

  /* fireflies, falling leaves, and the occasional bird */
  const fx = document.createElement("canvas");
  fx.className = "world-fx";
  fx.setAttribute("aria-hidden", "true");
  document.body.prepend(fx);
  const fctx = fx.getContext("2d");
  let motes = [];
  let bird = null, nextBird = 0;

  function sizeFx() {
    fx.width = Math.ceil(window.innerWidth / P);
    fx.height = Math.ceil(window.innerHeight / P);
    const n = Math.round(fx.width * fx.height / 900) + readSeeds().length * 3;
    motes = [];
    for (let i = 0; i < n; i++) motes.push(newMote(true));
  }
  function newMote(anywhere) {
    return {
      x: Math.random() * fx.width,
      y: anywhere ? Math.random() * fx.height : -2,
      vx: (Math.random() - 0.5) * 0.08,
      vy: 0.02 + Math.random() * 0.06,
      p: Math.random() * Math.PI * 2
    };
  }
  const BIRD = [
    ["X...X", ".X.X.", "..X.."],
    [".....", "XX.XX", "..X.."]
  ];

  function tickFx(time) {
    const depth = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    fctx.clearRect(0, 0, fx.width, fx.height);
    const inCanopy = window.scrollY < 600;
    const inSoil = depth > 0.8;
    motes.forEach(function (m) {
      m.p += 0.03;
      m.x += m.vx + Math.sin(m.p) * 0.05;
      m.y += inCanopy ? m.vy : (inSoil ? -m.vy * 0.3 : Math.sin(m.p * 0.5) * 0.03);
      if (m.y > fx.height + 2 || m.y < -3 || m.x < -2 || m.x > fx.width + 2) Object.assign(m, newMote(!inCanopy));
      if (inCanopy) {
        fctx.fillStyle = "rgba(127, 209, 122, 0.55)";       // leaves
        fctx.fillRect(Math.round(m.x), Math.round(m.y), 1, 1);
      } else if (inSoil) {
        fctx.fillStyle = "rgba(232, 214, 170, 0.18)";       // spores
        fctx.fillRect(Math.round(m.x), Math.round(m.y), 1, 1);
      } else {
        const a = 0.25 + 0.6 * Math.max(0, Math.sin(m.p * 0.7)); // fireflies
        fctx.fillStyle = "rgba(240, 181, 74, " + a.toFixed(2) + ")";
        fctx.fillRect(Math.round(m.x), Math.round(m.y), 1, 1);
      }
    });
    if (!bird && time > nextBird && !inSoil) {
      const ltr = Math.random() < 0.5;
      bird = { x: ltr ? -6 : fx.width + 6, y: 6 + Math.random() * fx.height * 0.25, v: ltr ? 0.35 : -0.35 };
    }
    if (bird) {
      const frame = BIRD[Math.floor(time / 180) % 2];
      fctx.fillStyle = "rgba(223, 230, 216, 0.6)";
      frame.forEach(function (row, y) {
        for (let x = 0; x < row.length; x++) if (row[x] === "X") fctx.fillRect(Math.round(bird.x) + x, Math.round(bird.y) + y, 1, 1);
      });
      bird.x += bird.v; bird.y += Math.sin(time / 400) * 0.05;
      if (bird.x < -10 || bird.x > fx.width + 10) { bird = null; nextBird = time + 25000 + Math.random() * 30000; }
    }
  }

  let lastCanopy = 0;
  function loop(time) {
    if (!document.hidden) {
      if (time - lastCanopy > 250) { drawCanopy(time); lastCanopy = time; } // stepped, pixel-art sway
      tickFx(time);
    }
    requestAnimationFrame(loop);
  }

  function rebuild() {
    layout();
    drawStatic();
    drawCanopy(0);
    sizeFx();
  }
  rebuild();
  nextBird = 6000;
  if (!reduceMotion) requestAnimationFrame(loop);
  else fx.remove();

  let resizeTimer;
  function scheduleRebuild() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(rebuild, 150);
  }
  window.addEventListener("resize", scheduleRebuild);
  if ("ResizeObserver" in window) {
    let lastH = document.documentElement.scrollHeight;
    new ResizeObserver(function () {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastH) > 40) { lastH = h; scheduleRebuild(); }
    }).observe(document.body);
  }
  document.addEventListener("canopy", function () { drawCanopy(performance.now()); sizeFx(); });

  /* ---------- The issue: thin-line chart ---------- */

  const chart = document.querySelector("[data-chart]");
  if (chart) {
    const buttons = Array.from(chart.querySelectorAll(".bar-btn"));
    const detail = document.querySelector("[data-chart-detail]");
    const title = detail.querySelector("h3");
    const text = detail.querySelector("p");
    function show(button) {
      buttons.forEach(function (item) {
        item.setAttribute("aria-pressed", item === button ? "true" : "false");
      });
      title.textContent = button.dataset.title;
      text.textContent = button.dataset.detail;
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () { show(button); });
    });
    requestAnimationFrame(function () { chart.classList.add("ready"); });
    if (buttons[0]) show(buttons[0]);
  }

  /* ---------- Trips: map ---------- */

  const map = document.querySelector("[data-map]");
  if (map) {
    const regions = Array.from(map.querySelectorAll(".region"));
    const panel = document.querySelector("[data-map-panel]");
    function select(region) {
      regions.forEach(function (item) {
        item.setAttribute("aria-pressed", item === region ? "true" : "false");
      });
      panel.innerHTML = "<h3>" + region.dataset.title + "</h3><p>" + region.dataset.detail + "</p>";
    }
    regions.forEach(function (region) {
      region.addEventListener("click", function () { select(region); });
    });
    if (regions[0]) select(regions[0]);
  }

  /* ---------- Seedlings: the steps you commit to ---------- */

  const SEED_ICON = "<svg viewBox=\"0 0 8 8\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M3 7h2v1H3zM3 4h2v3H3zM1 2h2v1h1v1H2V3H1zM5 1h2v1H6v1H5v1H4V2h1z\"/></svg>";
  document.querySelectorAll(".steps .step").forEach(function (step, i) {
    const id = "step-" + (i + 1);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "seed";
    button.innerHTML = SEED_ICON;
    button.setAttribute("aria-label", "Plant seedling " + (i + 1));
    function sync() {
      const on = readSeeds().indexOf(id) !== -1;
      button.setAttribute("aria-pressed", on ? "true" : "false");
      step.classList.toggle("planted", on);
    }
    button.addEventListener("click", function () {
      plant(id, button.getAttribute("aria-pressed") !== "true");
    });
    document.addEventListener("canopy", sync);
    sync();
    step.appendChild(button);
  });

  /* ---------- The Canopy: one featured rung per week, the same for everyone ---------- */

  const timeline = document.querySelector("[data-timeline]");
  if (timeline) {
    const rungs = Array.from(timeline.querySelectorAll("button"));
    const now = new Date();
    const thursday = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 3 - ((now.getDay() + 6) % 7)));
    const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4));
    const week = 1 + Math.round(((thursday - yearStart) / 864e5 - 3 + ((yearStart.getUTCDay() + 6) % 7)) / 7);
    const featured = rungs[week % rungs.length];
    if (featured) {
      featured.classList.add("is-weekly");
      const tag = document.createElement("p");
      tag.className = "weekly-tag";
      tag.textContent = "This week’s seedling · Wk " + String(week).padStart(2, "0");
      timeline.insertBefore(tag, featured);
    }

    rungs.forEach(function (button) {
      button.addEventListener("click", function () {
        const open = button.getAttribute("aria-expanded") === "true";
        rungs.forEach(function (other) {
          other.setAttribute("aria-expanded", "false");
          const extra = other.nextElementSibling;
          if (extra) extra.hidden = true;
        });
        button.setAttribute("aria-expanded", open ? "false" : "true");
        const panel = button.nextElementSibling;
        if (panel) panel.hidden = open;
      });
    });
  }

  /* ---------- The Survey ---------- */

  const quiz = document.querySelector("[data-quiz]");
  if (!quiz) return;

  const questions = [
    {
      prompt: "How much time can you realistically give a trip?",
      options: [
        { label: "A few hours, and I want to be back the same day.", tags: ["short", "calm"] },
        { label: "A full Saturday is doable if I know the plan.", tags: ["day"] },
        { label: "I can do an overnight if gear and a ride are included.", tags: ["overnight"] },
        { label: "I want the calmest possible first step.", tags: ["calm", "short"] }
      ]
    },
    {
      prompt: "Which setting sounds most like you?",
      options: [
        { label: "A trail and a view. Keep the adrenaline optional.", tags: ["hike"] },
        { label: "Mud, headlamps, and a good story underground.", tags: ["cave"] },
        { label: "A bike and some dirt.", tags: ["bike"] },
        { label: "A boat. I can swim 25 to 50 yards and tread water.", tags: ["boat"] },
        { label: "Heights are fine. I want to try outdoor rock.", tags: ["climb"] }
      ]
    },
    {
      prompt: "What do you want this trip to do for you?",
      options: [
        { label: "Lower the volume of the week and meet a few people.", tags: ["reset"] },
        { label: "Move hard enough that my brain has to take a break.", tags: ["effort"] },
        { label: "Learn a skill I could repeat on my own later.", tags: ["skill"] },
        { label: "Prove to myself that outdoorsy does not have to mean expert.", tags: ["beginner"] }
      ]
    }
  ];

  const results = {
    calm: {
      title: "Start with Mindfulness Outdoors or a short hike",
      text: "You do not need a rapid or a rope. Mindfulness Outdoors pairs an easy time outside with things like a walk, meditation, or painting, and it is built for students without adventure experience. A backpacking day hike is the next step if you want a little more trail. Both are a practical way to bank time outside during a heavy week."
    },
    hike: {
      title: "Start with a beginner backpacking day hike",
      text: "Day hikes are one of the lowest-friction trips we run. Instruction, transportation, and any specialty gear are included, and most students do not need prior backpacking experience. If the day goes well, an overnight is the same sport with a tent and a longer reset."
    },
    cave: {
      title: "Start with a horizontal caving trip",
      text: "Horizontal caving is scrambling, crawling, and walking through passages in the Tennessee–Alabama–Georgia cave country. It is memorable without the rope work of a vertical trip. We provide helmets, lights, and the rest of the specialty kit. Vertical caving comes after you have done a horizontal trip."
    },
    bike: {
      title: "Start with a beginner mountain biking day trip",
      text: "Day rides are generally beginner friendly, with climbs and about ten miles as a typical range. Bikes and the rest of the trip support come with registration. If you already ride, ask the trip leader whether a given date is a better match for your fitness."
    },
    boat: {
      title: "Start on flat water, then decide about whitewater",
      text: "If you can pass the pool swim test — 25 to 50 yards and one minute of treading water, without a life jacket — paddling is open to you. Stand-up paddleboarding and sea kayaking are the calmer first boats. Whitewater kayaking begins in the pool and on class II water, with a required pre-trip class. Intermediate rivers require a beginner trip first."
    },
    climb: {
      title: "Start with a beginner top-rope climbing trip",
      text: "Outdoor climbing trips are small, often about five participants, so you get time on the rock and direct coaching. No gym background is required for beginner top-rope. Lead climbing is an intermediate step after that. You can also use the CRC climbing wall during the week to get comfortable with height before you leave campus."
    },
    overnight: {
      title: "Look at a beginner overnight",
      text: "Overnights cost more than day trips because they cover campsites, more staff time, and a longer window outside — which is exactly the point if your week never leaves you two quiet hours. Backpacking overnights are the usual first overnight. Food is still yours to bring. Registration opens about a month before departure and trips fill quickly."
    }
  };

  let step = 0;
  const scores = {};
  const prompt = quiz.querySelector("[data-prompt]");
  const choices = quiz.querySelector("[data-choices]");
  const progress = quiz.querySelector("[data-progress]");
  const result = quiz.querySelector("[data-result]");
  const head = quiz.querySelector(".survey-head");

  function addTags(tags) {
    tags.forEach(function (tag) {
      scores[tag] = (scores[tag] || 0) + 1;
    });
  }

  // one ring per answer, drawn from the pith outward
  function drawRings(done) {
    let svg = "<svg class=\"ring-progress\" viewBox=\"0 0 76 76\">";
    for (let i = questions.length - 1; i >= 0; i--) {
      const cls = i < done ? "r-done" : (i === done ? "r-now" : "r-empty");
      svg += "<circle class=\"" + cls + "\" cx=\"38\" cy=\"38\" r=\"" + (12 + i * 12) + "\"/>";
    }
    svg += "<rect class=\"pith\" x=\"35\" y=\"35\" width=\"6\" height=\"6\"/></svg>";
    const shown = Math.min(done + 1, questions.length);
    progress.innerHTML = svg + "<p class=\"ring-count\"><b>" + String(shown).padStart(2, "0") + "/" + String(questions.length).padStart(2, "0") + "</b>Ring</p>";
  }

  function render() {
    const question = questions[step];
    prompt.textContent = question.prompt;
    drawRings(step);
    choices.innerHTML = "";
    question.options.forEach(function (option) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option.label;
      button.addEventListener("click", function () {
        addTags(option.tags);
        step += 1;
        if (step < questions.length) {
          render();
          const first = choices.querySelector("button");
          if (first) first.focus({ preventScroll: true });
        }
        else finish();
      });
      choices.appendChild(button);
    });
  }

  /* ---------- The Rings ---------- */

  // Schematic shape of White et al. (2019): reported well-being rises with
  // weekly minutes in nature and levels off. Not the study's plotted values.
  function curveSvg() {
    const x0 = 44, x1 = 620, y0 = 176, y1 = 24, maxMin = 330;
    const sx = function (m) { return x0 + (m / maxMin) * (x1 - x0); };
    const sy = function (m) { return y0 - (1 - Math.exp(-m / 95)) * (y0 - y1); };
    let d = "", area = "";
    for (let m = 0; m <= maxMin; m += 6) {
      const pt = sx(m).toFixed(1) + " " + sy(m).toFixed(1);
      d += (m ? " L" : "M") + pt;
    }
    area = d + " L" + x1 + " " + y0 + " L" + x0 + " " + y0 + " Z";
    let grid = "", ticks = "";
    [0, 60, 120, 180, 240, 300].forEach(function (m) {
      grid += "<line x1=\"" + sx(m) + "\" y1=\"" + y1 + "\" x2=\"" + sx(m) + "\" y2=\"" + y0 + "\"/>";
      ticks += "<text x=\"" + sx(m) + "\" y=\"" + (y0 + 16) + "\" text-anchor=\"middle\">" + m + (m === 300 ? "+" : "") + "</text>";
    });
    const you = 140;
    return "<figure class=\"curve\"><svg viewBox=\"0 0 640 210\" role=\"img\" aria-label=\"Schematic curve: reported well-being rises with weekly minutes in nature and levels off. A threshold marks 120 minutes. You, after one day trip, sit past it.\">" +
      "<g class=\"grid\">" + grid + "<line x1=\"" + x0 + "\" y1=\"" + y0 + "\" x2=\"" + x1 + "\" y2=\"" + y0 + "\"/></g>" +
      "<path class=\"area\" d=\"" + area + "\"/>" +
      "<line class=\"threshold\" x1=\"" + sx(120) + "\" y1=\"" + (y1 - 10) + "\" x2=\"" + sx(120) + "\" y2=\"" + y0 + "\"/>" +
      "<path class=\"line\" d=\"" + d + "\"/>" +
      "<circle class=\"you-halo\" cx=\"" + sx(you) + "\" cy=\"" + sy(you) + "\" r=\"9\"/>" +
      "<rect class=\"you\" x=\"" + (sx(you) - 4) + "\" y=\"" + (sy(you) - 4) + "\" width=\"8\" height=\"8\"/>" +
      "<text class=\"tag tag-you\" x=\"" + (sx(you) + 14) + "\" y=\"" + (sy(you) + 18) + "\">You · 1 day trip</text>" +
      "<g class=\"axis\">" + ticks +
      "<text x=\"" + x1 + "\" y=\"" + (y0 + 32) + "\" text-anchor=\"end\">Min / week outside</text>" +
      "<text x=\"" + x0 + "\" y=\"" + (y1 - 10) + "\">Reported well-being</text></g>" +
      "</svg></figure>";
  }

  function finish() {
    const order = ["calm", "cave", "bike", "boat", "climb", "overnight", "hike"];
    let best = "hike";
    let bestScore = -1;
    order.forEach(function (key) {
      const value = scores[key] || 0;
      if (value > bestScore) {
        best = key;
        bestScore = value;
      }
    });
    if ((scores.calm || 0) >= 2) best = "calm";
    const pick = results[best];
    quiz.querySelector("[data-question]").hidden = true;
    if (head) head.hidden = true;
    result.hidden = false;
    result.innerHTML =
      "<p class=\"label\">The Rings</p>" +
      "<div class=\"rings-hero\">" +
        "<svg class=\"rings\" viewBox=\"0 0 200 200\" aria-hidden=\"true\">" +
          "<circle class=\"ring-dash\" cx=\"100\" cy=\"100\" r=\"98\"/>" +
          "<circle class=\"ring-3\" cx=\"100\" cy=\"100\" r=\"90\"/>" +
          "<circle class=\"ring-2\" cx=\"100\" cy=\"100\" r=\"80\"/>" +
          "<circle class=\"ring-1\" cx=\"100\" cy=\"100\" r=\"70\"/>" +
        "</svg>" +
        "<div class=\"rings-num\"><span class=\"big\">120</span><span class=\"unit\">Min / week</span></div>" +
      "</div>" +
      curveSvg() +
      "<div class=\"result-body\"><h3 tabindex=\"-1\">" + pick.title + "</h3><p>" + pick.text + "</p><p><a class=\"btn btn-primary\" href=\"https://crc.gatech.edu/adventure-trips/\">See current trips</a></p></div>" +
      "<p class=\"fn\"><span>Src</span><a href=\"sources.html#src-4\">[4] White et al. 2019</a><a href=\"sources.html#src-9\">[9]</a><a href=\"sources.html#src-10\">[10] Campus Recreation</a><span>Curve is schematic</span></p>";
    plant("survey", true);
    const h = result.querySelector("h3");
    if (h) h.focus({ preventScroll: true });
    quiz.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  const restart = quiz.querySelector("[data-restart]");
  if (restart) {
    restart.addEventListener("click", function () {
      step = 0;
      Object.keys(scores).forEach(function (key) { delete scores[key]; });
      result.hidden = true;
      if (head) head.hidden = false;
      quiz.querySelector("[data-question]").hidden = false;
      render();
    });
  }
  render();
})();
