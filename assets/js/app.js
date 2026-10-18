(function () {
  "use strict";

  const CATALOG = window.CATALOG;
  const main = document.getElementById("main");
  const sidebar = document.getElementById("sidebar");
  const searchInput = document.getElementById("search");
  const ALL = CATALOG.flatMap(s => s.items.map(it => ({ ...it, section: s })));
  const SITE = "System Design Ocean";
  const REPO = "https://github.com/Nuvyaro/system-design-solutions";

  // ---------- Small helpers ----------
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slug = s => s.toLowerCase().replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  const progress = () => store.get("sdo-progress", {});
  const isDone = p => !!progress()[p];
  function setDone(p, v) { const pr = progress(); if (v) pr[p] = true; else delete pr[p]; store.set("sdo-progress", pr); buildSidebar(); }

  // ---------- Theme ----------
  const savedTheme = store.get("sdo-theme", null);
  if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);
  const isDark = () => {
    const t = document.documentElement.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  };
  document.getElementById("themeBtn").addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    store.set("sdo-theme", next);
    route(); // re-render so diagrams pick up the new palette
  });

  // ---------- Mermaid ----------
  function initMermaid() {
    if (!window.mermaid) return;
    const dark = isDark();
    window.mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      fontFamily: "Inter, system-ui, sans-serif",
      flowchart: { curve: "basis", htmlLabels: true },
      themeVariables: dark ? {
        primaryColor: "#0f3a66", primaryTextColor: "#e6f1fb", primaryBorderColor: "#3fd0e0",
        lineColor: "#4aa8ff", secondaryColor: "#123f6e", tertiaryColor: "#0b2442",
        clusterBkg: "#0b2442", clusterBorder: "#1d3d63", edgeLabelBackground: "#0b2442", mainBkg: "#0f3a66"
      } : {
        primaryColor: "#e3f2fd", primaryTextColor: "#0d2238", primaryBorderColor: "#1a8cff",
        lineColor: "#0b5cad", secondaryColor: "#e0f7fa", tertiaryColor: "#f7fbfe",
        clusterBkg: "#f2f9fd", clusterBorder: "#bcdcf0", edgeLabelBackground: "#ffffff", mainBkg: "#e3f2fd"
      }
    });
  }

  // ---------- Markdown ----------
  if (window.marked) {
    window.marked.use({
      gfm: true,
      renderer: {
        heading(text, level) {
          return `<h${level} id="${slug(text)}">${text}</h${level}>\n`;
        }
      }
    });
  }

  // ---------- Sidebar ----------
  function buildSidebar() {
    const cur = currentPath();
    let html = `<a href="#/" class="${cur === null ? "active" : ""}">Home</a>`;
    for (const s of CATALOG) {
      html += `<h4>${esc(s.title)}</h4>`;
      for (const it of s.items) {
        html += `<a href="#/doc/${it.path}" class="${cur === it.path ? "active" : ""}">
          <span class="done-dot ${isDone(it.path) ? "done" : ""}" aria-hidden="true"></span>${esc(it.title)}</a>`;
      }
    }
    sidebar.innerHTML = html;
  }
  function currentPath() {
    const m = location.hash.match(/^#\/doc\/(.+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  // Mobile nav
  const menuBtn = document.getElementById("menuBtn");
  function closeNav() { document.body.classList.remove("nav-open"); menuBtn.setAttribute("aria-expanded", "false"); }
  menuBtn.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  document.getElementById("scrim").addEventListener("click", closeNav);
  sidebar.addEventListener("click", e => { if (e.target.closest("a")) closeNav(); });

  // ---------- Cards ----------
  function card(it, i) {
    const num = it.section.kind === "problem" ? `<span class="num">#${String(i + 1).padStart(2, "0")}</span>` : "";
    return `<a class="card" href="#/doc/${it.path}">
      ${num}<h3>${esc(it.title)}</h3><p>${esc(it.desc)}</p>
      <div class="meta"><span class="chip">${it.mins} min</span>
        ${it.sim ? '<span class="chip live-chip">● Interactive</span>' : ""}
        ${isDone(it.path) ? '<span class="chip done">✓ Done</span>' : ""}</div></a>`;
  }
  const sectionCards = s => s.items.map((it, i) => card({ ...it, section: s }, i)).join("");

  // ---------- Views ----------
  function viewHome() {
    document.title = `${SITE} — Animated System Design & AI System Design`;
    const lessons = ALL.filter(i => i.section.kind === "lesson").length;
    const problems = ALL.filter(i => i.section.kind === "problem").length;
    const sims = ALL.filter(i => i.sim).length;
    const done = Object.keys(progress()).length;
    let bubbles = "";
    for (let i = 0; i < 14; i++) {
      const size = 6 + Math.random() * 18;
      bubbles += `<span class="bubble" style="left:${Math.random() * 100}%;width:${size}px;height:${size}px;animation-duration:${7 + Math.random() * 9}s;animation-delay:${-Math.random() * 12}s"></span>`;
    }
    const wave = (cls, fill) => `<svg class="${cls}" viewBox="0 0 2880 140" preserveAspectRatio="none" aria-hidden="true">
      <path fill="${fill}" d="M0 70 C240 20 480 120 720 70 S1200 20 1440 70 S1920 120 2160 70 S2640 20 2880 70 V140 H0 Z"/></svg>`;

    main.innerHTML = `
      <section class="hero">
        <div class="hero-inner">
          <span class="eyebrow">Free · Animated · Interview-ready</span>
          <h1>Learn system design <span>the visual way</span></h1>
          <p>Short animated lessons explain each building block, ${problems} real interview problems walk you through complete solutions, and a hands-on DevOps track takes you from Docker to Kubernetes and CI/CD.</p>
          <div class="hero-cta">
            <a class="btn btn-primary" href="#/doc/fundamentals/systems/01-scalability-basics">Start the learning path →</a>
            <a class="btn btn-ghost" href="#/track/ai">Explore AI system design</a>
          </div>
          <div class="hero-stats">
            <div><b>${lessons}</b>animated lessons</div>
            <div><b>${problems}</b>interview problems</div>
            <div><b>${sims}</b>interactive simulations</div>
            <div><b>${done}</b>completed by you</div>
          </div>
        </div>
        ${bubbles}
        <div class="waves">${wave("wave1", "#18b6c9")}${wave("wave2", "#1a8cff")}${wave("wave3", "var(--bg)")}</div>
      </section>

      <section class="section reveal">
        <h2>Your learning path</h2>
        <p class="lead">Follow the steps in order, or jump to what your next interview needs.</p>
        <div class="path">
          <a href="#/track/fund-systems"><div class="step"><h3>Building blocks</h3><p>Caching, sharding, queues, consistency — each with a live simulation.</p></div></a>
          <a href="#/track/classic"><div class="step"><h3>Classic problems</h3><p>URL shortener to payments: full solutions with trade-offs.</p></div></a>
          <a href="#/track/fund-ai"><div class="step"><h3>AI building blocks</h3><p>Embeddings, LLM inference, RAG, agents, evaluation — visualized.</p></div></a>
          <a href="#/track/ai"><div class="step"><h3>AI system design</h3><p>RAG, LLM serving, recommenders, agents. Practice with the timer.</p></div></a>
          <a href="#/track/devops"><div class="step"><h3>Ship it: DevOps</h3><p>Docker, Kubernetes, YAML and CI/CD — from basics to production.</p></div></a>
        </div>
      </section>

      <section class="section reveal">
        <h2>A blue ocean for interview prep</h2>
        <p class="lead">Most guides compete on longer lists of problems and walls of text. This one goes where they don't, using the Blue Ocean <em>Eliminate · Reduce · Raise · Create</em> grid:</p>
        <div class="errc">
          <div class="e"><h3>Eliminate</h3><ul><li>Paywalls and sign-ups</li><li>Unexplained jargon</li><li>Diagrams you can't run</li></ul></div>
          <div class="r"><h3>Reduce</h3><ul><li>Wall-of-text explanations</li><li>Memorizing architectures</li><li>Time to first "aha"</li></ul></div>
          <div class="ra"><h3>Raise</h3><ul><li>Visual intuition with plain-language analogies</li><li>Trade-off reasoning on every choice</li><li>Depth on AI and LLM systems</li></ul></div>
          <div class="c"><h3>Create</h3><ul><li>Interactive simulations inside lessons</li><li>Practice mode with a 45-minute timer</li><li>Tap-to-reveal follow-up questions</li><li>Progress tracking in your browser</li></ul></div>
        </div>
      </section>

      ${CATALOG.map(s => `
        <section class="section reveal" id="sec-${s.id}">
          <h2>${esc(s.title)}</h2>
          <p class="lead">${esc(s.blurb)}</p>
          <div class="grid">${sectionCards(s)}</div>
        </section>`).join("")}
    `;
    setupReveal(main);
  }

  function viewTrack(id) {
    const s = CATALOG.find(x => x.id === id);
    if (!s) return viewNotFound();
    document.title = `${s.title} · ${SITE}`;
    const extra = id === "fund-systems" ? `<p class="lead">Next up: <a href="#/track/fund-ai">AI & ML fundamentals →</a></p>` : "";
    main.innerHTML = `<section class="section">
      <div class="crumbs"><a href="#/">Home</a> / ${esc(s.title)}</div>
      <h2>${esc(s.title)}</h2><p class="lead">${esc(s.blurb)}</p>${extra}
      <div class="grid">${sectionCards(s)}</div></section>`;
  }

  function viewSearch(q) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = ALL.filter(it => terms.every(t => (it.title + " " + it.desc + " " + it.section.title).toLowerCase().includes(t)));
    document.title = `Search · ${SITE}`;
    main.innerHTML = `<section class="section">
      <h2>Results for “${esc(q)}”</h2>
      <p class="lead">${hits.length} match${hits.length === 1 ? "" : "es"}</p>
      <div class="grid">${hits.map(it => card(it, it.section.items.indexOf(it.section.items.find(x => x.path === it.path)))).join("") || "<p>No tutorials match. Try “cache”, “RAG” or “queue”.</p>"}</div>
    </section>`;
  }

  function viewNotFound() {
    main.innerHTML = `<div class="error-box"><h2>Page not found</h2><p><a href="#/">Back to home</a></p></div>`;
  }

  async function viewDoc(path) {
    const item = ALL.find(i => i.path === path);
    main.innerHTML = `<div class="loading">Loading…</div>`;
    let md;
    try {
      const res = await fetch(`${path}.md`);
      if (!res.ok) throw new Error(res.status);
      md = await res.text();
    } catch (e) {
      main.innerHTML = `<div class="error-box"><h2>Couldn't load this tutorial</h2>
        <p>If you opened <code>index.html</code> directly from disk, browsers block loading the Markdown files. Run a local server instead:</p>
        <pre><code>python3 -m http.server 8000</code></pre><p>then open <a href="http://localhost:8000">http://localhost:8000</a>. On GitHub Pages this works automatically.</p></div>`;
      return;
    }
    if (currentPath() !== path) return; // user navigated away while loading

    const flatIdx = ALL.findIndex(i => i.path === path);
    const prev = ALL[flatIdx - 1], next = ALL[flatIdx + 1];
    const isProblem = path.startsWith("classic-system-design/") || path.startsWith("ai-system-design/");
    const sectionTitle = item ? item.section.title : "Tutorial";

    main.innerHTML = `<div class="doc-wrap">
      <article class="doc" id="doc">
        <div class="crumbs"><a href="#/">Home</a> / ${item ? `<a href="#/track/${item.section.id}">${esc(sectionTitle)}</a>` : esc(sectionTitle)}</div>
        <div class="doc-toolbar">
          ${item ? `<span class="chip">${item.mins} min read</span>` : ""}
          ${item && item.sim ? '<span class="chip live-chip">● Interactive</span>' : ""}
          ${isProblem ? '<button class="btn btn-small btn-outline" id="practiceBtn" aria-pressed="false">Practice mode</button>' : ""}
          <button class="btn btn-small ${isDone(path) ? "btn-solid" : "btn-outline"}" id="doneBtn">${isDone(path) ? "✓ Completed" : "Mark as complete"}</button>
          <a class="btn btn-small btn-outline" href="${REPO}/blob/HEAD/${path}.md" target="_blank" rel="noopener">View on GitHub</a>
        </div>
        <div id="docBody"></div>
        <nav class="doc-nav">
          ${prev ? `<a href="#/doc/${prev.path}"><small>← Previous</small>${esc(prev.title)}</a>` : "<span></span>"}
          ${next ? `<a class="next" href="#/doc/${next.path}"><small>Next →</small>${esc(next.title)}</a>` : ""}
        </nav>
      </article>
      <aside class="toc" id="toc" aria-label="On this page"></aside>
    </div>`;

    const body = document.getElementById("docBody");
    body.innerHTML = window.marked ? window.marked.parse(md) : `<pre>${esc(md)}</pre>`;
    const h1 = body.querySelector("h1");
    document.title = `${h1 ? h1.textContent : (item ? item.title : "Tutorial")} · ${SITE}`;

    rewriteLinks(body, path);
    convertQA(body);
    const mermaidNodes = convertMermaid(body);
    if (isProblem) setupPractice(body);
    if (window.SIMS) body.querySelectorAll(".sim[data-sim]").forEach(el => window.SIMS.mount(el));
    buildToc(body);
    setupReveal(body);

    if (window.mermaid && mermaidNodes.length) {
      initMermaid();
      try { await window.mermaid.run({ nodes: mermaidNodes }); } catch (e) { console.warn("Mermaid render failed", e); }
    }

    document.getElementById("doneBtn").addEventListener("click", e => {
      const v = !isDone(path);
      setDone(path, v);
      e.target.textContent = v ? "✓ Completed" : "Mark as complete";
      e.target.classList.toggle("btn-solid", v);
      e.target.classList.toggle("btn-outline", !v);
    });
    window.scrollTo(0, 0);
  }

  // ---------- Document post-processing ----------
  function rewriteLinks(root, path) {
    const baseDir = path.includes("/") ? path.slice(0, path.lastIndexOf("/") + 1) : "";
    root.querySelectorAll("a[href]").forEach(a => {
      const href = a.getAttribute("href");
      if (/^(https?:|mailto:|#)/.test(href)) {
        if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
        return;
      }
      const [file, anchor] = href.split("#");
      const parts = (baseDir + file).split("/");
      const out = [];
      for (const p of parts) { if (p === "..") out.pop(); else if (p && p !== ".") out.push(p); }
      if (!file.endsWith(".md")) { // example files (Dockerfile, YAML…) open on GitHub
        a.href = `${REPO}/blob/HEAD/${out.join("/")}`; a.target = "_blank"; a.rel = "noopener";
        return;
      }
      const target = out.join("/").replace(/\.md$/, "");
      a.setAttribute("href", target === "README" ? "#/" : `#/doc/${target}`);
      if (anchor) a.dataset.anchor = anchor;
    });
  }

  // "**Q: ...**" followed by "A: ..." (same paragraph or the next one) → tap-to-reveal card
  function convertQA(root) {
    root.querySelectorAll("p").forEach(p => {
      const strong = p.firstElementChild;
      if (!strong || strong.tagName !== "STRONG" || !/^Q:/.test(strong.textContent.trim()) || p.firstChild !== strong) return;
      let ans;
      const rest = p.innerHTML.slice(strong.outerHTML.length).replace(/^\s*(<br>)?\s*/, "");
      if (/^A:/.test(rest)) {
        ans = document.createElement("p");
        ans.innerHTML = rest;
      } else {
        ans = p.nextElementSibling;
        if (!ans || ans.tagName !== "P" || !/^A:/.test(ans.textContent.trim())) return;
      }
      const d = document.createElement("details");
      d.className = "qa";
      d.innerHTML = `<summary>${strong.innerHTML.replace(/^Q:\s*/, "")}</summary><div class="ans"></div>`;
      ans.innerHTML = ans.innerHTML.replace(/^A:\s*/, "<strong>Answer:</strong> ");
      d.querySelector(".ans").appendChild(ans);
      p.replaceWith(d);
    });
  }

  function convertMermaid(root) {
    const nodes = [];
    root.querySelectorAll("pre > code.language-mermaid").forEach(code => {
      const div = document.createElement("div");
      div.className = "mermaid";
      div.textContent = code.textContent;
      code.parentElement.replaceWith(div);
      nodes.push(div);
    });
    return nodes;
  }

  // Practice mode: show only the interview question, run a timer, hide the solution until revealed.
  function setupPractice(root) {
    const h2s = [...root.querySelectorAll("h2")];
    const q = h2s.find(h => /interview question/i.test(h.textContent));
    const after = q ? h2s[h2s.indexOf(q) + 1] : h2s[0];
    if (!after) return;
    const solution = document.createElement("div");
    solution.className = "solution";
    let n = after;
    while (n) { const nx = n.nextSibling; solution.appendChild(n); n = nx; }
    const panel = document.createElement("div");
    panel.className = "practice-panel";
    panel.innerHTML = `<h3 style="margin-top:0">Practice mode</h3>
      <div class="timer" id="timer">45:00</div>
      <ol><li>Clarify requirements (5 min)</li><li>Estimate scale (5 min)</li><li>API & data model (5 min)</li>
      <li>High-level design (10 min)</li><li>Deep dives (15 min)</li><li>Wrap-up: bottlenecks & trade-offs (5 min)</li></ol>
      <div class="sim-controls"><button class="primary" id="timerBtn">Start timer</button>
      <button id="timerReset">Reset</button><button id="revealBtn">Reveal solution</button></div>`;
    root.appendChild(panel);
    root.appendChild(solution);

    let remaining = 45 * 60, handle = null;
    const timerEl = panel.querySelector("#timer");
    const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    const stop = () => { clearInterval(handle); handle = null; panel.querySelector("#timerBtn").textContent = "Start timer"; };
    panel.querySelector("#timerBtn").addEventListener("click", e => {
      if (handle) return stop();
      e.target.textContent = "Pause";
      handle = setInterval(() => {
        remaining = Math.max(0, remaining - 1);
        timerEl.textContent = fmt(remaining);
        if (!remaining) stop();
      }, 1000);
    });
    panel.querySelector("#timerReset").addEventListener("click", () => { stop(); remaining = 45 * 60; timerEl.textContent = fmt(remaining); });
    panel.querySelector("#revealBtn").addEventListener("click", () => { document.body.classList.add("revealed"); stop(); });
    window.addEventListener("hashchange", stop, { once: true });

    const btn = document.getElementById("practiceBtn");
    btn.addEventListener("click", () => {
      const on = document.body.classList.toggle("practice");
      document.body.classList.remove("revealed");
      btn.setAttribute("aria-pressed", String(on));
      btn.textContent = on ? "Exit practice mode" : "Practice mode";
      if (on) panel.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function buildToc(root) {
    const toc = document.getElementById("toc");
    const hs = [...root.querySelectorAll("h2")];
    if (!toc || hs.length < 2) { if (toc) toc.remove(); return; }
    toc.innerHTML = "<h4>On this page</h4>" + hs.map(h => `<a href="#" data-target="${h.id}">${esc(h.textContent)}</a>`).join("");
    toc.addEventListener("click", e => {
      const a = e.target.closest("a[data-target]");
      if (!a) return;
      e.preventDefault();
      const t = document.getElementById(a.dataset.target);
      if (t) t.scrollIntoView({ behavior: "smooth" });
    });
    if (!("IntersectionObserver" in window)) return;
    const links = [...toc.querySelectorAll("a")];
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) links.forEach(l => l.classList.toggle("active", l.dataset.target === en.target.id));
      });
    }, { rootMargin: "-80px 0px -70% 0px" });
    hs.forEach(h => io.observe(h));
  }

  function setupReveal(root) {
    const els = root.matches && root.matches(".doc *, #docBody") ? [...root.children] : [...root.querySelectorAll(".reveal")];
    if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("visible")); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -40px 0px" });
    els.forEach(e => {
      if (e.tagName === "H1") return;
      e.classList.add("reveal");
      io.observe(e);
    });
  }

  // ---------- Router ----------
  function route() {
    document.body.classList.remove("practice", "revealed");
    const h = location.hash || "#/";
    document.querySelectorAll(".topnav a").forEach(a => a.classList.toggle("active", h.startsWith(a.getAttribute("href"))));
    buildSidebar();
    let m;
    if ((m = h.match(/^#\/doc\/(.+)$/))) return viewDoc(decodeURIComponent(m[1]));
    if ((m = h.match(/^#\/track\/(.+)$/))) { viewTrack(m[1]); return window.scrollTo(0, 0); }
    if ((m = h.match(/^#\/search\/(.*)$/))) return viewSearch(decodeURIComponent(m[1]));
    viewHome();
  }
  window.addEventListener("hashchange", route);

  // Search
  let searchTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const q = searchInput.value.trim();
      location.hash = q ? `#/search/${encodeURIComponent(q)}` : "#/";
    }, 200);
  });
  document.addEventListener("keydown", e => {
    if (e.key === "/" && document.activeElement !== searchInput && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      e.preventDefault(); searchInput.focus();
    }
  });

  // Reading progress bar
  const bar = document.getElementById("readProgress");
  window.addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : "0";
  }, { passive: true });

  route();
})();
