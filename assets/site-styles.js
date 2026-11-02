/* The visual language of a personal web. Kept in JS so it can be embedded
   into a standalone HTML export as well as injected into the app. */
window.ANBIAO_WEB_CSS = String.raw`
.web-site {
  --w-bg: #f7f2e7;
  --w-bg-deep: #ede4d3;
  --w-card: #fffdf8;
  --w-ink: #202b24;
  --w-ink-soft: #465247;
  --w-muted: #71796f;
  --w-line: rgba(32, 43, 36, .16);
  --w-line-strong: rgba(32, 43, 36, .3);
  --w-accent: #bd5033;
  --w-accent-soft: #ead7c7;
  --w-nav: rgba(247, 242, 231, .88);
  --w-shadow: rgba(51, 42, 28, .12);
  background: var(--w-bg);
  color: var(--w-ink);
  font-family: "Avenir Next", "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  font-size: 16px;
  line-height: 1.75;
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
.web-site.theme-moss {
  --w-bg: #e9ede3;
  --w-bg-deep: #dce3d4;
  --w-card: #f7f9f2;
  --w-ink: #1f3023;
  --w-ink-soft: #415746;
  --w-muted: #6a786b;
  --w-line: rgba(31, 48, 35, .17);
  --w-line-strong: rgba(31, 48, 35, .32);
  --w-accent: #98602f;
  --w-accent-soft: #ddcfb2;
  --w-nav: rgba(233, 237, 227, .9);
  --w-shadow: rgba(32, 48, 35, .13);
}
.web-site.theme-dusk {
  --w-bg: #f2e6d8;
  --w-bg-deep: #e8d7c4;
  --w-card: #fbf3e9;
  --w-ink: #36251e;
  --w-ink-soft: #5d463a;
  --w-muted: #806b5d;
  --w-line: rgba(54, 37, 30, .17);
  --w-line-strong: rgba(54, 37, 30, .32);
  --w-accent: #a8472e;
  --w-accent-soft: #e5c9b5;
  --w-nav: rgba(242, 230, 216, .9);
  --w-shadow: rgba(78, 48, 30, .14);
}
.web-site.theme-ink {
  --w-bg: #18221d;
  --w-bg-deep: #111a15;
  --w-card: #202c25;
  --w-ink: #f1ebde;
  --w-ink-soft: #c9c4b7;
  --w-muted: #9fa79c;
  --w-line: rgba(241, 235, 222, .16);
  --w-line-strong: rgba(241, 235, 222, .3);
  --w-accent: #df7a54;
  --w-accent-soft: #422f26;
  --w-nav: rgba(24, 34, 29, .9);
  --w-shadow: rgba(0, 0, 0, .3);
  color-scheme: dark;
}
.web-site *,
.web-site *::before,
.web-site *::after { box-sizing: border-box; }
.web-site h1,
.web-site h2,
.web-site h3,
.web-site p,
.web-site figure,
.web-site blockquote,
.web-site ol,
.web-site ul { margin: 0; }
.web-site h1,
.web-site h2,
.web-site h3 {
  font-family: "Iowan Old Style", "Palatino Linotype", "Noto Serif SC", "Songti SC", "STSong", "SimSun", serif;
  font-weight: 600;
  letter-spacing: -.02em;
}
.web-site a { color: inherit; }
.web-site img { max-width: 100%; display: block; }

.web-shell {
  width: min(1120px, calc(100% - 64px));
  margin-inline: auto;
}
.web-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding-block: 24px;
  border-bottom: 1px solid var(--w-line);
  font-size: 12px;
  letter-spacing: .08em;
}
.web-identity {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}
.web-identity-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--w-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--w-accent) 18%, transparent);
}
.web-topmeta {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--w-muted);
}
.web-topmeta span + span::before {
  content: "·";
  margin-right: 16px;
  opacity: .6;
}

.web-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(300px, .8fr);
  align-items: center;
  gap: clamp(32px, 5vw, 72px);
  padding-block: clamp(54px, 8vw, 104px);
}
.web-hero::before {
  content: "";
  position: absolute;
  z-index: 0;
  top: -16%;
  left: -18%;
  width: 54%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, var(--w-accent-soft) 0%, transparent 68%);
  opacity: .5;
  pointer-events: none;
}
.web-hero-copy,
.web-cover-frame { position: relative; z-index: 1; }
.web-kicker {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 26px;
  color: var(--w-muted);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: .2em;
  text-transform: uppercase;
}
.web-kicker::before {
  content: "";
  width: 32px;
  height: 1px;
  background: var(--w-accent);
}
.web-title {
  max-width: 13ch;
  font-size: clamp(3.1rem, 6.2vw, 5.8rem);
  line-height: .98;
  letter-spacing: -.045em;
  text-wrap: balance;
  overflow-wrap: anywhere;
}
.web-tagline {
  max-width: 34em;
  margin-top: 24px;
  font-family: "Iowan Old Style", "Palatino Linotype", "Noto Serif SC", "Songti SC", "STSong", "SimSun", serif;
  font-size: clamp(17px, 1.8vw, 21px);
  line-height: 1.65;
  color: var(--w-ink-soft);
}
.web-intro {
  max-width: 37em;
  margin-top: 18px;
  color: var(--w-muted);
  font-size: 14.5px;
  line-height: 1.9;
  white-space: pre-line;
}
.web-hero-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 18px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--w-line);
  color: var(--w-muted);
  font-size: 11px;
  letter-spacing: .06em;
}
.web-hero-meta .web-owner {
  color: var(--w-ink);
  font-weight: 600;
}
.web-hero-meta .web-tag {
  padding: 2px 7px;
  border: 1px solid var(--w-line);
  border-radius: 999px;
  color: var(--w-accent);
  font-size: 8.5px;
}
.web-cover-frame {
  justify-self: end;
  width: 100%;
  max-width: 430px;
  padding: 12px;
  border: 1px solid var(--w-line-strong);
  background: var(--w-bg);
}
.web-cover-frame::before {
  content: "";
  position: absolute;
  inset: 24px -18px -18px 24px;
  z-index: -1;
  border: 1px solid var(--w-line);
  background: var(--w-bg-deep);
}
.web-cover {
  width: 100%;
  aspect-ratio: 5 / 4;
  object-fit: cover;
  filter: saturate(.92);
}
.web-cover-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 3px 0;
  color: var(--w-muted);
  font-size: 9.5px;
  letter-spacing: .12em;
  text-transform: uppercase;
}
.web-cover-fallback {
  display: grid;
  place-items: center;
  aspect-ratio: 5 / 4;
  background:
    radial-gradient(circle at 72% 28%, var(--w-accent) 0 14%, transparent 14.5%),
    linear-gradient(145deg, var(--w-bg-deep), var(--w-card));
  border-bottom: 1px solid var(--w-line);
}
.web-cover-fallback svg { width: 42%; opacity: .8; }

.web-zone-nav {
  position: sticky;
  z-index: 20;
  top: 0;
  border-block: 1px solid var(--w-line);
  background: var(--w-nav);
  backdrop-filter: blur(14px);
}
.web-zone-nav-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 58px;
  overflow-x: auto;
  scrollbar-width: none;
}
.web-zone-nav-inner::-webkit-scrollbar { display: none; }
.web-zone-nav-label {
  flex: 0 0 auto;
  margin-right: 10px;
  color: var(--w-muted);
  font-size: 9.5px;
  letter-spacing: .16em;
  text-transform: uppercase;
}
.web-zone-link {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border: 1px solid transparent;
  border-radius: 999px;
  color: var(--w-ink-soft);
  font-size: 12px;
  text-decoration: none;
  transition: border-color .2s ease, color .2s ease, background .2s ease;
}
.web-zone-link i {
  font-style: normal;
  color: var(--w-muted);
  font-size: 9px;
}
.web-zone-link:hover {
  border-color: var(--w-line);
  background: var(--w-card);
  color: var(--w-ink);
}
.web-zone-link:focus-visible {
  outline: 2px solid var(--w-accent);
  outline-offset: 2px;
}

.web-body {
  padding-block: clamp(44px, 7vw, 88px) 32px;
}
.web-zone-section {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  gap: clamp(22px, 4vw, 54px);
  padding-block: clamp(32px, 4.5vw, 54px);
  border-top: 1px solid var(--w-line);
  scroll-margin-top: 82px;
}
.web-zone-section:first-child { border-top: 0; padding-top: 0; }
.web-zone-head { align-self: start; }
.web-zone-index {
  display: block;
  margin-bottom: 18px;
  color: var(--w-accent);
  font-size: 10px;
  letter-spacing: .16em;
}
.web-zone-title {
  font-size: clamp(26px, 3vw, 34px);
  line-height: 1.2;
}
.web-zone-desc {
  margin-top: 12px;
  color: var(--w-muted);
  font-size: 12.5px;
  line-height: 1.8;
}
.web-zone-count {
  display: inline-block;
  margin-top: 18px;
  color: var(--w-muted);
  font-size: 10px;
  letter-spacing: .08em;
}
.web-zone-content {
  display: grid;
  gap: 24px;
  min-width: 0;
}
.web-entry { min-width: 0; }
.web-entry + .web-entry {
  padding-top: 26px;
  border-top: 1px solid var(--w-line);
}
.web-entry-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 14px;
  color: var(--w-muted);
  font-size: 9.5px;
  letter-spacing: .12em;
  text-transform: uppercase;
}
.web-entry-type {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--w-accent);
  font-weight: 600;
}
.web-entry-type::before {
  content: "";
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}
.web-entry h3 {
  font-size: clamp(21px, 2.4vw, 27px);
  line-height: 1.28;
  text-wrap: balance;
}
.web-entry-lead {
  margin-top: 9px;
  color: var(--w-ink-soft);
  font-size: 13.5px;
  line-height: 1.8;
}
.web-prose {
  max-width: 38em;
  margin-top: 14px;
  color: var(--w-ink-soft);
  font-size: 14px;
  line-height: 1.9;
}
.web-prose p + p { margin-top: 1.1em; }

.web-figure {
  margin: 0;
  border: 1px solid var(--w-line);
  background: var(--w-card);
  padding: 7px;
}
.web-figure img {
  width: 100%;
  max-height: 420px;
  object-fit: cover;
  background: var(--w-bg-deep);
}
.web-figure figcaption {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px 24px;
  padding: 12px 4px 2px;
  color: var(--w-muted);
  font-size: 11px;
  line-height: 1.6;
}
.web-figure figcaption strong {
  color: var(--w-ink-soft);
  font-weight: 600;
}

.web-collection {
  padding: clamp(22px, 3vw, 34px);
  border: 1px solid var(--w-line);
  background: var(--w-card);
}
.web-collection-desc {
  max-width: 38em;
  margin-top: 12px;
  color: var(--w-muted);
  font-size: 13px;
  line-height: 1.85;
}
.web-collection ol {
  margin-top: 24px;
  padding: 0;
  list-style: none;
}
.web-collection li {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: baseline;
  padding-block: 17px;
  border-top: 1px solid var(--w-line);
}
.web-collection li:last-child { padding-bottom: 2px; }
.web-collection .coll-no {
  color: var(--w-accent);
  font-family: "Iowan Old Style", Georgia, serif;
  font-size: 12px;
}
.web-collection .coll-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.6;
}
.web-collection .coll-title a {
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
}
.web-collection .coll-note {
  margin-top: 3px;
  color: var(--w-muted);
  font-size: 12px;
  line-height: 1.75;
}
.web-collection .coll-arrow {
  color: var(--w-muted);
  font-size: 13px;
  text-decoration: none;
}
.web-collection .coll-arrow:hover { color: var(--w-accent); }

.web-video {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px solid var(--w-line);
  background: #0d1511;
}
.web-video iframe,
.web-video video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  object-fit: contain;
}
.web-video-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  aspect-ratio: 16 / 9;
  padding: 24px;
  border: 1px solid var(--w-line);
  background:
    radial-gradient(circle at 50% 50%, var(--w-accent-soft), transparent 62%),
    var(--w-card);
  text-align: center;
}
.web-video-fallback .play {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border: 1px solid var(--w-line-strong);
  border-radius: 999px;
  color: var(--w-accent);
}
.web-video-fallback a {
  color: var(--w-ink-soft);
  font-size: 12px;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.web-video-desc {
  margin-top: 12px;
  color: var(--w-muted);
  font-size: 12.5px;
}

.web-link-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: center;
  padding: clamp(22px, 3vw, 32px);
  border: 1px solid var(--w-line);
  background: var(--w-card);
  text-decoration: none;
  transition: transform .22s ease, border-color .22s ease;
}
.web-link-card:hover {
  transform: translateY(-3px);
  border-color: var(--w-line-strong);
}
.web-link-card:focus-visible {
  outline: 2px solid var(--w-accent);
  outline-offset: 3px;
}
.web-link-domain {
  display: inline-block;
  margin-bottom: 12px;
  color: var(--w-accent);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
}
.web-link-card h3 { font-size: clamp(21px, 2.4vw, 27px); }
.web-link-card p {
  max-width: 38em;
  margin-top: 8px;
  color: var(--w-muted);
  font-size: 13px;
  line-height: 1.8;
}
.web-link-arrow {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border: 1px solid var(--w-line);
  border-radius: 50%;
  color: var(--w-accent);
  font-size: 18px;
  transition: background .2s ease, color .2s ease;
}
.web-link-card:hover .web-link-arrow {
  background: var(--w-accent);
  color: var(--w-bg);
}

.web-note {
  max-width: 42em;
  padding: 8px 0 8px clamp(20px, 3vw, 32px);
  border-left: 2px solid var(--w-accent);
}
.web-note p {
  font-family: "Iowan Old Style", "Palatino Linotype", "Noto Serif SC", "Songti SC", "STSong", "SimSun", serif;
  font-size: clamp(21px, 2.6vw, 29px);
  line-height: 1.7;
  text-wrap: balance;
}
.web-note footer {
  margin-top: 16px;
  color: var(--w-muted);
  font-size: 11px;
  letter-spacing: .08em;
}

.web-collection-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
.web-site[data-view-columns="2"] .web-collection-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.web-collection-card {
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 16px;
  padding: 12px;
  border: 1px solid var(--w-line);
  background: var(--w-card);
  color: inherit;
  text-decoration: none;
  transition: transform .18s ease, border-color .18s ease;
}
.web-collection-card:hover { transform: translateY(-2px); border-color: var(--w-line-strong); }
.web-collection-cover { position: relative; min-height: 125px; overflow: hidden; background: var(--w-bg-deep); }
.web-collection-cover img { width: 100%; height: 100%; min-height: 125px; object-fit: cover; }
.web-collection-cover span { position: absolute; right: 7px; bottom: 6px; color: #fff; font-family: var(--mono, monospace); font-size: 9px; text-shadow: 0 1px 4px rgba(0,0,0,.5); }
.web-collection-copy { display: flex; flex-direction: column; min-width: 0; justify-content: center; }
.web-collection-kicker { color: var(--w-accent); font-family: var(--mono, monospace); font-size: 7.5px; letter-spacing: .1em; }
.web-collection-copy h2 { margin-top: 5px; font-family: var(--serif, Georgia, serif); font-size: 24px; font-weight: 400; line-height: 1.2; }
.web-collection-copy p { margin-top: 5px; color: var(--w-muted); font-size: 10px; line-height: 1.6; }
.web-collection-copy p.web-collection-empty { opacity: .6; }
.web-collection-count { margin-top: 9px; color: var(--w-accent); font-size: 9px; }
.web-site[data-view-density="compact"] .web-collection-card { grid-template-columns: 105px minmax(0, 1fr); gap: 11px; }
.web-site[data-view-density="compact"] .web-collection-cover,
.web-site[data-view-density="compact"] .web-collection-cover img { min-height: 92px; }
.web-site[data-view-density="large"] .web-collection-card { grid-template-columns: 170px minmax(0, 1fr); }
@media (max-width: 720px) {
  .web-collection-grid { grid-template-columns: 1fr; }
  .web-collection-card { grid-template-columns: 105px minmax(0, 1fr); }
}
.collection-shell { width: min(980px, calc(100% - 48px)); margin: 0 auto; padding: clamp(32px, 6vw, 68px) 0; }
.collection-head { max-width: 620px; }
.collection-head h1 { margin-top: 9px; font-family: var(--serif, Georgia, serif); font-size: clamp(36px, 6vw, 64px); font-weight: 400; line-height: 1.1; }
.collection-head p { margin-top: 12px; color: var(--w-ink-soft); font-size: 14px; line-height: 1.9; }
.collection-head-count { display: inline-block; margin-top: 12px; color: var(--w-muted); font-family: var(--mono, monospace); font-size: 9px; letter-spacing: .06em; }
.collection-switcher { display: flex; gap: 5px; overflow-x: auto; margin: 25px 0 28px; padding-bottom: 8px; border-bottom: 1px solid var(--w-line); }
.collection-switcher a { display: inline-flex; flex: 0 0 auto; align-items: baseline; gap: 6px; padding: 7px 10px; border: 1px solid var(--w-line); border-radius: 999px; color: var(--w-muted); font-size: 10px; text-decoration: none; }
.collection-switcher a small { font-family: var(--mono, monospace); font-size: 8px; }
.collection-switcher a:hover, .collection-switcher a.is-current { border-color: var(--w-accent); color: var(--w-accent); background: var(--w-card); }
.collection-items { display: grid; gap: 28px; }
@media (max-width: 640px) { .collection-shell { width: calc(100% - 32px); } }
.web-empty {
  margin: 24px 0;
  padding: 40px;
  border: 1px dashed var(--w-line-strong);
  color: var(--w-muted);
  text-align: center;
  font-size: 13px;
}
.web-site-footer {
  margin-top: 40px;
  border-top: 1px solid var(--w-line);
}
.web-site-footer-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 22px;
  padding-block: 34px 40px;
  color: var(--w-muted);
  font-size: 11px;
  line-height: 1.8;
}
.web-site-footer strong {
  display: block;
  margin-bottom: 4px;
  color: var(--w-ink-soft);
  font-weight: 600;
}
.web-site-footer .web-made-by {
  text-align: right;
}
.web-site-footer .web-made-by span {
  display: block;
  color: var(--w-accent);
  font-family: "Iowan Old Style", Georgia, serif;
  font-size: 15px;
  letter-spacing: .03em;
}

@media (max-width: 860px) {
  .web-shell { width: min(1120px, calc(100% - 40px)); }
  .web-hero { grid-template-columns: 1fr; gap: 40px; padding-block: 48px 58px; }
  .web-cover-frame { justify-self: start; max-width: 100%; }
  .web-zone-section { grid-template-columns: 1fr; gap: 26px; }
  .web-zone-head {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 14px;
    align-items: baseline;
  }
  .web-zone-index { margin: 0; }
  .web-zone-title { grid-column: 2; }
  .web-zone-desc { grid-column: 2; margin-top: 4px; }
  .web-zone-count { grid-column: 2; margin-top: 6px; }
}
@media (max-width: 560px) {
  .web-shell { width: calc(100% - 32px); }
  .web-topbar { padding-block: 18px; font-size: 10px; }
  .web-topmeta span:first-child { display: none; }
  .web-title { font-size: clamp(2.6rem, 15vw, 4rem); }
  .web-cover-frame { padding: 8px; }
  .web-cover-frame::before { inset: 16px -10px -10px 16px; }
  .web-zone-nav-inner { min-height: 52px; }
  .web-zone-nav-label { display: none; }
  .web-body { padding-top: 18px; }
  .web-zone-section { padding-block: 38px; }
  .web-zone-content { gap: 32px; }
  .web-entry + .web-entry { padding-top: 32px; }
  .web-collection { padding: 20px 16px; }
  .web-collection li { grid-template-columns: 28px minmax(0, 1fr) auto; gap: 8px; }
  .web-link-card { grid-template-columns: 1fr; gap: 16px; }
  .web-link-arrow { display: none; }
  .web-figure { padding: 7px; }
  .web-site-footer-inner { padding-block: 26px 32px; }
  .web-site-footer .web-made-by { text-align: left; }
}
@media (prefers-reduced-motion: reduce) {
  .web-site *,
  .web-site *::before,
  .web-site *::after {
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
    animation-duration: .01ms !important;
  }
}

/* Custom backgrounds and auto text contrast */
.web-site [hidden] { display: none !important; }
.web-site [data-preview-hidden="true"]:not(.is-search-visible) { display: none !important; }
.web-entry-detail { display: none; }
.web-detail-panel .web-entry-detail { display: block; }

.web-zone-head { position: relative; padding-right: 34px; }
.web-zone-head[data-zone-expand-area],
.web-subzone-head[data-zone-expand-area] { cursor: pointer; }
.web-zone-expand-hint {
  display: inline-block;
  margin-top: 7px;
  color: var(--w-accent);
  font-size: 8.5px;
  letter-spacing: .05em;
}
.web-zone-toggle {
  position: absolute;
  top: 13px;
  right: 0;
  display: grid;
  place-items: center;
  width: 27px;
  height: 27px;
  padding: 0;
  border: 1px solid var(--w-line);
  border-radius: 50%;
  background: var(--w-card);
  color: var(--w-muted);
  font: inherit;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
}
.web-zone-toggle:hover { border-color: var(--w-line-strong); color: var(--w-accent); }
.web-subzone-titleline .web-zone-toggle {
  position: static;
  flex: 0 0 auto;
  width: 23px;
  height: 23px;
  margin-left: 2px;
  font-size: 14px;
}
.web-zone-more {
  grid-column: 1 / -1;
  justify-self: start;
  padding: 11px 16px;
  border: 1px dashed var(--w-line-strong);
  border-radius: 6px;
  background: transparent;
  color: var(--w-accent);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.web-zone-more:hover { border-style: solid; background: var(--w-card); }
.web-entry-open {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
  padding: 7px 12px;
  border: 1px solid var(--w-line);
  border-radius: 999px;
  background: var(--w-card);
  color: var(--w-accent);
  font: inherit;
  font-size: 10.5px;
  cursor: pointer;
}
.web-entry-open:hover { border-color: var(--w-line-strong); }
.web-entry-title-link { color: inherit; text-decoration: none; }
.web-entry-title-link:hover { color: var(--w-accent); }
.web-chapter-line {
  margin-top: 12px;
  color: var(--w-muted);
  font-size: 9.5px;
  letter-spacing: .04em;
}
.web-image-openable { cursor: zoom-in; }
.web-image-openable:focus-visible { outline: 2px solid var(--w-accent); outline-offset: 4px; }
.web-image-openable figcaption::after {
  content: "点击查看大图";
  margin-left: 10px;
  color: var(--w-accent);
  font-size: 8.5px;
  letter-spacing: .04em;
}

.web-detail-overlay {
  position: fixed;
  z-index: 2000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(10, 16, 12, .8);
  backdrop-filter: blur(10px);
}
body.web-detail-open { overflow: hidden; }
.web-detail-panel {
  position: relative;
  width: min(900px, 100%);
  max-height: 88vh;
  overflow-y: auto;
  border: 1px solid var(--w-line-strong);
  border-radius: 10px;
  background: var(--w-bg);
  color: var(--w-ink);
  box-shadow: 0 30px 90px rgba(0, 0, 0, .35);
}
.web-detail-close {
  position: sticky;
  z-index: 2;
  top: 12px;
  float: right;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  margin: 12px 12px 0 0;
  padding: 0;
  border: 1px solid var(--w-line);
  border-radius: 50%;
  background: var(--w-card);
  color: var(--w-ink);
  font: inherit;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}
.web-detail-close:hover { border-color: var(--w-line-strong); color: var(--w-accent); }
.web-detail-body { padding: clamp(22px, 4vw, 46px); }
.web-detail-body .web-entry {
  padding: 0 !important;
  border: 0 !important;
  background: transparent !important;
}
.web-detail-body .web-entry h3 { font-size: clamp(27px, 4vw, 42px); }
.web-detail-body .web-entry-lead { font-size: 16px; }
.web-detail-body .web-prose { max-width: 42em; margin-top: 22px; font-size: 16px; line-height: 2.05; }
.web-detail-body .web-entry-detail { display: block; }
.web-detail-figure img { max-height: 74vh; margin: 0 auto; object-fit: contain; }
.web-detail-figure figcaption { display: flex; justify-content: space-between; gap: 14px; margin-top: 12px; color: var(--w-muted); font-size: 11px; }
.web-detail-overlay .web-video { max-height: 65vh; }
.web-detail-overlay .web-file-card { color: var(--w-ink); }
.web-site .sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
.web-site.bg-dark {
  --w-ink: #fbf6ea;
  --w-ink-soft: #e3dccd;
  --w-muted: #cbc4b6;
  --w-card: rgba(12, 19, 15, .94);
  --w-line: rgba(255, 255, 255, .24);
  --w-line-strong: rgba(255, 255, 255, .42);
  --w-nav: rgba(12, 19, 15, .96);
  --w-accent: #ffb18a;
  --w-accent-soft: rgba(255, 177, 138, .18);
  color-scheme: dark;
}
.web-site.bg-light {
  --w-ink: #17211b;
  --w-ink-soft: #354238;
  --w-muted: #536156;
  --w-card: rgba(255, 253, 248, .96);
  --w-line: rgba(23, 33, 27, .2);
  --w-line-strong: rgba(23, 33, 27, .4);
  --w-nav: rgba(255, 253, 248, .97);
  --w-accent: #9d3e24;
  --w-accent-soft: rgba(157, 62, 36, .14);
  color-scheme: light;
}
.web-site.bg-image { background-attachment: scroll; }
.web-layout-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-auto-rows: minmax(96px, auto);
  gap: 18px;
  width: 100%;
  padding-top: 8px;
}
.web-layout-block { min-width: 0; align-self: stretch; }
.web-layout-block > .web-hero,
.web-layout-block > .web-browse,
.web-layout-block > .web-body { margin-top: 0; }
.web-layout-block > .web-hero { padding-block: 24px; }
.web-layout-block > .web-body { margin-top: 0; }
.web-layout-block--hero .web-hero { height: 100%; }
.web-layout-block--body .web-body { min-height: 100%; }
.web-site[data-hero-style="stacked"] .web-hero { grid-template-columns: minmax(0, 1fr); gap: 26px; }
.web-site[data-hero-style="stacked"] .web-cover-frame { width: min(760px, 100%); }
.web-site[data-hero-style="text"] .web-hero { grid-template-columns: minmax(0, 1fr); }
.web-site[data-hero-style="text"] .web-cover-frame { display: none; }
.web-site[data-hero-style="text"] .web-hero-copy { max-width: 760px; }
.web-site.bg-dark .web-figure,
.web-site.bg-dark .web-collection,
.web-site.bg-dark .web-link-card,
.web-site.bg-dark .web-audio-card,
.web-site.bg-dark .web-file-card {
  backdrop-filter: blur(8px);
}
.web-site.bg-custom .web-topbar,
.web-site.bg-custom .web-browse-inner,
.web-site.bg-custom .web-site-footer-inner {
  padding-inline: 18px;
  border: 1px solid var(--w-line);
  border-radius: 8px;
  background: var(--w-card);
  backdrop-filter: blur(12px);
}
.web-site.bg-custom .web-topbar { margin-top: 18px; }
.web-site.bg-custom .web-hero-copy {
  padding: clamp(20px, 3vw, 34px);
  border: 1px solid var(--w-line);
  border-radius: 9px;
  background: var(--w-card);
  backdrop-filter: blur(12px);
}
.web-site.bg-custom .web-cover-frame { background: var(--w-card); }
.web-site.bg-custom .web-cover-caption {
  padding: 10px 8px 4px;
  background: var(--w-card);
}
.web-site.bg-custom .web-body {
  margin-top: 28px;
  padding: clamp(18px, 3vw, 34px);
  border: 1px solid var(--w-line);
  border-radius: 10px;
  background: var(--w-card);
  backdrop-filter: blur(12px);
}
.web-site.bg-custom .web-zone-nav-inner {
  padding-inline: 14px;
  border: 1px solid var(--w-line);
  border-radius: 8px;
  background: var(--w-nav);
}
.web-site.bg-custom .web-body .web-zone-section:first-child { padding-top: 0; }
.web-site.bg-custom .web-site-footer { margin-top: 28px; }
.web-site.bg-custom .web-detail-panel { background: var(--w-card); }

/* Homepage browser controls */
.web-browse { width: 100%; }
.web-browse-inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px 20px;
  padding-block: 18px;
  border-top: 1px solid var(--w-line);
  border-bottom: 1px solid var(--w-line);
}
.web-search-field {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
}
.web-search-field > svg {
  position: absolute;
  left: 13px;
  width: 16px;
  height: 16px;
  fill: none;
  stroke: var(--w-muted);
  stroke-width: 1.5;
  pointer-events: none;
}
.web-search-input {
  width: 100%;
  height: 42px;
  padding: 0 58px 0 39px;
  border: 1px solid var(--w-line);
  border-radius: 7px;
  background: var(--w-card);
  color: var(--w-ink);
  font: inherit;
  font-size: 12.5px;
  outline: none;
}
.web-search-input::placeholder { color: var(--w-muted); }
.web-search-input:focus { border-color: var(--w-line-strong); box-shadow: 0 0 0 3px var(--w-accent-soft); }
.web-search-clear {
  position: absolute;
  right: 9px;
  padding: 4px 7px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--w-accent);
  font: inherit;
  font-size: 9px;
  cursor: pointer;
}
.web-search-clear:hover { background: var(--w-accent-soft); }
.web-view-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; }
.web-seg {
  display: flex;
  overflow: hidden;
  border: 1px solid var(--w-line);
  border-radius: 6px;
  background: var(--w-card);
}
.web-seg button {
  min-height: 30px;
  padding: 4px 9px;
  border: 0;
  border-left: 1px solid var(--w-line);
  background: transparent;
  color: var(--w-muted);
  font: inherit;
  font-size: 9.5px;
  line-height: 1;
  cursor: pointer;
}
.web-seg button:first-child { border-left: 0; }
.web-seg button:hover { color: var(--w-ink); }
.web-seg button.is-active { background: var(--w-ink); color: var(--w-bg); }
.web-search-status {
  grid-column: 1 / -1;
  min-height: 1.4em;
  color: var(--w-muted);
  font-size: 9.5px;
  line-height: 1.4;
}
.web-search-status:empty { display: none; }
.web-zone-nav-count {
  margin-left: 1px;
  padding: 1px 5px;
  border-radius: 999px;
  background: var(--w-line);
  color: var(--w-muted);
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 7px;
}
.web-zone-link:hover .web-zone-nav-count,
.web-zone-link.is-active .web-zone-nav-count { background: var(--w-accent-soft); color: var(--w-accent); }

/* Nested folders */
.web-subzone {
  padding-top: 28px;
  border-top: 1px solid var(--w-line);
  scroll-margin-top: 82px;
}
.web-subzone-head {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  margin-bottom: 20px;
}
.web-folder-mark {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--w-line);
  border-radius: 6px;
  color: var(--zone-color, var(--w-accent));
  background: var(--w-card);
}
.web-folder-mark svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.4; }
.web-subzone-copy { min-width: 0; }
.web-subzone-titleline {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 12px;
}
.web-subzone-titleline h3 {
  font-size: clamp(20px, 2.4vw, 25px);
  line-height: 1.35;
  letter-spacing: -.02em;
}
.web-subzone-copy > p {
  max-width: 42em;
  margin-top: 3px;
  color: var(--w-muted);
  font-size: 11.5px;
  line-height: 1.7;
}
.web-subzone-content {
  display: grid;
  gap: 30px;
  min-width: 0;
  padding-left: clamp(0px, 2.5vw, 26px);
  border-left: 1px solid var(--w-line);
}
.web-subzone .web-subzone { margin-top: 2px; }
.web-subzone .web-subzone-content { padding-left: clamp(0px, 2vw, 20px); }
.web-site[data-view-columns="2"] .web-subzone { grid-column: 1 / -1; }
.web-zone-head { border-top: 2px solid var(--zone-color, var(--w-accent)); padding-top: 18px; }
.web-zone-index { color: var(--zone-color, var(--w-accent)); }

/* Two-column homepage */
.web-site[data-view-columns="2"] .web-zone-content,
.web-site[data-view-columns="2"] .web-subzone-content {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  align-items: start;
}
.web-site[data-view-columns="2"] .web-zone-content > .web-entry,
.web-site[data-view-columns="2"] .web-subzone-content > .web-entry {
  padding: 18px;
  border: 1px solid var(--w-line);
  background: var(--w-card);
}
.web-site[data-view-columns="2"] .web-zone-content > .web-entry + .web-entry,
.web-site[data-view-columns="2"] .web-subzone-content > .web-entry + .web-entry {
  padding-top: 18px;
  border-top: 1px solid var(--w-line);
}
.web-site[data-view-columns="2"] .web-collection { padding: 14px 0 0; border: 0; background: transparent; }
.web-site[data-view-columns="2"] .web-figure { padding: 6px; }
.web-site[data-view-columns="2"] .web-link-card { grid-template-columns: 1fr; gap: 12px; padding: 16px; }
.web-site[data-view-columns="2"] .web-link-arrow { display: none; }
.web-site[data-view-columns="2"] .web-entry h3 { font-size: clamp(20px, 2vw, 25px); }
.web-site[data-view-columns="2"] .web-prose { font-size: 14px; line-height: 1.9; }
.web-site[data-view-columns="2"] .web-collection li { grid-template-columns: 25px minmax(0, 1fr) auto; gap: 7px; }

/* Content size */
.web-site[data-view-density="compact"] .web-zone-section { padding-block: 34px; }
.web-site[data-view-density="compact"] .web-zone-content,
.web-site[data-view-density="compact"] .web-subzone-content { gap: 25px; }
.web-site[data-view-density="compact"] .web-entry + .web-entry { padding-top: 25px; }
.web-site[data-view-density="compact"] .web-entry h3 { font-size: clamp(20px, 2.4vw, 26px); }
.web-site[data-view-density="compact"] .web-prose,
.web-site[data-view-density="compact"] .web-entry-lead { font-size: 14px; line-height: 1.85; }
.web-site[data-view-density="compact"] .web-figure img,
.web-site[data-view-density="compact"] .web-video { max-height: 420px; }
.web-site[data-view-density="compact"] .web-zone-section { padding-block: 30px; }
.web-site[data-view-density="large"] .web-zone-section { padding-block: clamp(56px, 8vw, 96px); }
.web-site[data-view-density="large"] .web-zone-content,
.web-site[data-view-density="large"] .web-subzone-content { gap: 52px; }
.web-site[data-view-density="large"] .web-entry + .web-entry { padding-top: 52px; }
.web-site[data-view-density="large"] .web-entry h3 { font-size: clamp(29px, 3.4vw, 40px); }
.web-site[data-view-density="large"] .web-prose,
.web-site[data-view-density="large"] .web-entry-lead { font-size: 17px; line-height: 2.05; }
.web-site[data-view-density="large"] .web-figure img { max-height: 840px; }

/* Audio, files and media metadata */
.web-audio-card {
  display: grid;
  gap: 14px;
  padding: clamp(16px, 2.6vw, 24px);
  border: 1px solid var(--w-line);
  background: var(--w-card);
}
.web-audio-head { display: flex; align-items: center; gap: 11px; }
.web-audio-head strong { display: block; font-size: 14px; font-weight: 600; }
.web-audio-head span:not(.web-file-icon) { display: block; margin-top: 2px; color: var(--w-muted); font-size: 10px; }
.web-file-icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--w-line);
  border-radius: 6px;
  color: var(--w-accent);
  background: var(--w-bg);
}
.web-file-icon svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.4; }
.web-audio-card audio { width: 100%; height: 36px; accent-color: var(--w-accent); }
.web-media-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px 12px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--w-line);
  color: var(--w-muted);
  font-size: 9.5px;
  line-height: 1.6;
}
.web-media-meta .web-file-name { max-width: 100%; color: var(--w-ink-soft); }
.web-media-meta a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--w-accent);
  text-decoration: none;
}
.web-media-meta a svg { width: 11px; height: 11px; fill: none; stroke: currentColor; stroke-width: 1.5; }
.web-download-gate {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 14px;
  padding: 12px 14px;
  border: 1px dashed var(--w-line-strong);
  border-radius: 6px;
  background: var(--w-card);
}
.web-download-copy { min-width: 0; }
.web-download-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--w-accent);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: .06em;
}
.web-download-label svg { width: 11px; height: 11px; fill: none; stroke: currentColor; stroke-width: 1.5; }
.web-download-copy p { margin-top: 3px; color: var(--w-muted); font-size: 9.5px; line-height: 1.6; }
.web-download-btn {
  flex: 0 0 auto;
  padding: 7px 12px;
  border: 1px solid var(--w-line-strong);
  border-radius: 999px;
  background: transparent;
  color: var(--w-accent);
  font: inherit;
  font-size: 10px;
  cursor: pointer;
}
.web-download-btn:hover { border-color: var(--w-accent); background: var(--w-accent-soft); }
.web-download-wait { flex: 0 0 auto; color: var(--w-muted); font-size: 9.5px; }
.web-download-note { margin-top: 10px; padding: 8px 10px; border: 1px dashed var(--w-line); border-radius: 5px; color: var(--w-muted); font-size: 9.5px; }
@media (max-width: 560px) {
  .web-download-gate { align-items: flex-start; flex-direction: column; gap: 9px; }
}
.web-file-entry { margin-top: 14px; }
.web-file-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: clamp(16px, 2.6vw, 24px);
  border: 1px solid var(--w-line);
  background: var(--w-card);
  color: var(--w-ink);
  text-decoration: none;
  transition: transform .2s ease, border-color .2s ease;
}
a.web-file-card:hover { transform: translateY(-2px); border-color: var(--w-line-strong); }
.web-file-card strong {
  display: block;
  overflow-wrap: anywhere;
  font-family: "Iowan Old Style", "Palatino Linotype", "Noto Serif SC", "Songti SC", "STSong", "SimSun", serif;
  font-size: clamp(19px, 2.2vw, 25px);
  font-weight: 600;
  line-height: 1.35;
}
.web-file-card p { margin-top: 4px; color: var(--w-muted); font-size: 11.5px; line-height: 1.7; }
.web-file-card .web-link-domain { display: block; margin-bottom: 4px; }
.web-file-card--missing { border-style: dashed; }
.web-file-card--missing strong { font-size: 14px; }
.web-file-card--missing span { color: var(--w-muted); font-size: 10px; }
.web-file-card--missing .web-file-icon { color: var(--w-muted); }
.web-search-empty {
  margin-top: 24px;
  padding: 34px 20px;
  border: 1px dashed var(--w-line-strong);
  color: var(--w-muted);
  text-align: center;
  font-size: 12px;
}

@media (max-width: 860px) {
  .web-site[data-view-columns="2"] .web-zone-content,
  .web-site[data-view-columns="2"] .web-subzone-content { grid-template-columns: 1fr; }
  .web-site[data-view-columns="2"] .web-zone-content > .web-entry,
  .web-site[data-view-columns="2"] .web-subzone-content > .web-entry { padding: 0; border: 0; background: transparent; }
  .web-site[data-view-columns="2"] .web-zone-content > .web-entry + .web-entry,
  .web-site[data-view-columns="2"] .web-subzone-content > .web-entry + .web-entry { padding-top: 30px; border-top: 1px solid var(--w-line); }
  .web-browse-inner { grid-template-columns: 1fr; gap: 9px; }
  .web-view-controls { justify-content: flex-start; }
  .web-search-status { grid-column: 1; }
}
@media (max-width: 560px) {
  .web-browse-inner { padding-block: 14px; }
  .web-search-input { height: 40px; font-size: 11.5px; }
  .web-view-controls { gap: 5px; }
  .web-seg button { min-height: 28px; padding-inline: 8px; }
  .web-subzone-content { padding-left: 12px; }
  .web-subzone-head { gap: 8px; }
  .web-folder-mark { width: 26px; height: 26px; }
  .web-file-card { grid-template-columns: auto minmax(0, 1fr); }
  .web-file-card .web-link-arrow { display: none; }
}

/* ---------- Article reader ---------- */
.read-page { min-height: 100vh; padding-bottom: 60px; }
.read-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 0;
  border-bottom: 1px solid var(--w-line);
  color: var(--w-muted);
  font-size: 10px;
  letter-spacing: .04em;
}
.read-back { color: var(--w-ink); text-decoration: none; }
.read-back:hover { color: var(--w-accent); }
.read-shell {
  display: grid;
  grid-template-columns: 230px minmax(0, 760px);
  gap: clamp(28px, 6vw, 78px);
  justify-content: center;
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  padding: clamp(38px, 7vw, 84px) 0;
}
.read-aside { position: sticky; top: 28px; align-self: start; }
.read-kicker { color: var(--w-accent); font-family: var(--mono, monospace); font-size: 9px; letter-spacing: .12em; }
.read-aside h2 { margin-top: 12px; font-family: var(--serif, Georgia, serif); font-size: clamp(22px, 3vw, 32px); font-weight: 400; line-height: 1.25; }
.read-aside > p { margin-top: 8px; color: var(--w-muted); font-size: 10.5px; line-height: 1.7; }
.read-chapters { display: grid; gap: 2px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--w-line); }
.read-chapters-label { margin-bottom: 7px; color: var(--w-muted); font-size: 8.5px; letter-spacing: .08em; }
.read-chapters a { display: flex; align-items: baseline; gap: 8px; padding: 7px 8px; border-radius: 4px; color: var(--w-ink-soft); font-size: 10.5px; text-decoration: none; line-height: 1.5; }
.read-chapters a span { color: var(--w-muted); font-family: var(--mono, monospace); font-size: 8px; }
.read-chapters a:hover { background: var(--w-card); color: var(--w-accent); }
.read-chapters a.is-current { background: var(--w-card); color: var(--w-accent); box-shadow: inset 2px 0 0 var(--w-accent); }
.read-aside-foot { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 22px; color: var(--w-muted); font-size: 9px; }
.read-aside-foot a { color: var(--w-accent); text-decoration: none; }
.read-article { min-width: 0; }
.read-meta { display: flex; justify-content: space-between; gap: 18px; color: var(--w-muted); font-family: var(--mono, monospace); font-size: 9px; letter-spacing: .06em; }
.read-head h1 { margin-top: 18px; font-family: var(--serif, Georgia, serif); font-size: clamp(34px, 6vw, 64px); font-weight: 400; line-height: 1.15; letter-spacing: -.03em; }
.read-lead { margin-top: 16px; color: var(--w-ink-soft); font-size: clamp(15px, 2vw, 18px); line-height: 1.9; }
.read-cover { margin-top: 30px; }
.read-cover img { width: 100%; max-height: 480px; object-fit: cover; border-radius: 6px; }
.read-chapter-title { margin-top: 38px; padding-top: 22px; border-top: 1px solid var(--w-line); font-family: var(--serif, Georgia, serif); font-size: clamp(21px, 3vw, 28px); font-weight: 400; }
.read-prose { max-width: 43em; margin-top: 24px; color: var(--w-ink-soft); font-size: clamp(15px, 1.6vw, 17px); line-height: 2.1; }
.read-page.bg-custom .read-topbar,
.read-page.bg-custom .read-article,
.read-page.bg-custom .read-aside,
.read-page.bg-custom .item-detail-shell {
  padding-inline: clamp(18px, 3vw, 30px);
  border: 1px solid var(--w-line);
  border-radius: 10px;
  background: var(--w-card);
  backdrop-filter: blur(12px);
}
.read-page.bg-custom .read-topbar {
  margin-top: 16px;
  padding-block: 14px;
}
.read-page.bg-custom .read-article,
.read-page.bg-custom .read-aside { padding-block: clamp(20px, 3vw, 32px); }
.read-page.bg-custom .read-prose { color: var(--w-ink); }
.read-page.bg-custom .read-lead { color: var(--w-ink-soft); }
.read-page.bg-custom .item-detail-shell { margin-top: 20px; margin-bottom: 20px; }
.read-page { -webkit-user-select: none; user-select: none; }
.read-page input, .read-page textarea, .read-page .comment-block, .read-page .comment-block * { -webkit-user-select: text; user-select: text; }
.read-head, .read-prose, .read-chapter-title, .web-entry.entry-article .web-prose {
  -webkit-user-select: none;
  user-select: none;
}
.web-detail-panel .web-entry.entry-article .web-prose { user-select: none; }
.read-prose p + p { margin-top: 1.1em; }
.read-prose img { display: block; max-width: 100%; height: auto; margin: 18px auto; border-radius: 4px; }
.read-prose h1, .read-prose h2, .read-prose h3, .read-prose h4 { margin: 1.2em 0 .5em; font-family: var(--serif, Georgia, serif); font-weight: 500; line-height: 1.35; }
.read-prose blockquote { margin: 1.2em 0; padding: 8px 16px; border-left: 2px solid var(--w-accent); color: var(--w-ink-soft); }
.read-prose ul, .read-prose ol { margin: 1em 0; padding-left: 1.5em; }
.read-pager { display: flex; justify-content: space-between; gap: 20px; margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--w-line); }
.read-pager a { color: var(--w-accent); font-size: 11px; text-decoration: none; }
.read-foot { display: flex; justify-content: space-between; gap: 20px; margin-top: 46px; padding-top: 16px; border-top: 1px solid var(--w-line); color: var(--w-muted); font-size: 9px; }
.read-foot a { color: var(--w-accent); text-decoration: none; }
@media (max-width: 780px) {
  .read-shell { grid-template-columns: 1fr; width: calc(100% - 32px); padding-top: 30px; gap: 26px; }
  .read-aside { position: static; }
  .read-chapters { display: flex; overflow-x: auto; gap: 5px; padding-bottom: 4px; }
  .read-chapters-label { display: none; }
  .read-chapters a { flex: 0 0 auto; white-space: nowrap; border: 1px solid var(--w-line); }
  .read-topbar { width: calc(100% - 32px); }
}

/* ---------- Comments ---------- */
.comment-block { margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--w-line); }
.comment-head { display: flex; justify-content: space-between; gap: 14px; align-items: flex-start; }
.comment-kicker { color: var(--w-accent); font-family: var(--mono, monospace); font-size: 8px; letter-spacing: .1em; }
.comment-head h2 { margin-top: 5px; font-family: var(--serif, Georgia, serif); font-size: 22px; font-weight: 400; }
.comment-note { color: var(--w-muted); font-size: 8.5px; }
.comment-list { margin-top: 18px; display: grid; gap: 10px; }
.comment { padding: 12px 14px; border: 1px solid var(--w-line); border-radius: 6px; background: var(--w-card); }
.comment header { display: flex; justify-content: space-between; gap: 10px; color: var(--w-muted); font-size: 8.5px; }
.comment header strong { color: var(--w-ink); font-size: 10px; }
.comment p { margin-top: 5px; color: var(--w-ink-soft); font-size: 12px; line-height: 1.8; white-space: pre-wrap; }
.comment-reply { margin-top: 5px; padding: 0; border: 0; background: none; color: var(--w-accent); font: inherit; font-size: 9px; cursor: pointer; }
.comment--reply { margin-left: 22px; background: transparent; border-left: 2px solid var(--w-line-strong); border-top: 0; border-right: 0; border-bottom: 0; border-radius: 0; }
.comment-form { margin-top: 18px; padding: 14px; border: 1px dashed var(--w-line-strong); border-radius: 6px; background: var(--w-card); }
.comment-fields { display: grid; gap: 8px; }
.comment-fields input, .comment-fields textarea { width: 100%; padding: 9px 10px; border: 1px solid var(--w-line); border-radius: 5px; background: var(--w-bg); color: var(--w-ink); font: inherit; font-size: 11px; }
.comment-fields textarea { min-height: 82px; resize: vertical; line-height: 1.8; }
.comment-submit { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 8px; color: var(--w-muted); font-size: 8.5px; }
.comment-submit .btn { padding: 7px 12px; border: 1px solid var(--w-accent); border-radius: 999px; background: var(--w-accent); color: #fff; font: inherit; font-size: 10px; cursor: pointer; }
.comment-reply-target { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; color: var(--w-accent); font-size: 9.5px; }
.comment-reply-target button { padding: 0; border: 0; background: none; color: var(--w-muted); font: inherit; font-size: 9px; cursor: pointer; }
.comment-empty, .comment-loading { color: var(--w-muted); font-size: 10px; }
.episode-public { margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--w-line); }
.episode-public h2 { font-family: var(--serif, Georgia, serif); font-size: 21px; font-weight: 400; }
.episode-public-list { margin-top: 10px; display: grid; gap: 4px; }
.episode-public-row { display: flex; align-items: baseline; gap: 10px; padding: 8px; border-bottom: 1px solid var(--w-line); }
.episode-public-row > span:first-child { color: var(--w-muted); font-family: var(--mono, monospace); font-size: 8px; }
.episode-public-row > div { flex: 1; min-width: 0; }
.episode-public-row strong { font-size: 11px; font-weight: 500; }
.episode-public-row p { margin-top: 2px; color: var(--w-muted); font-size: 9.5px; }
.episode-public-row a { color: var(--w-accent); font-size: 9px; text-decoration: none; }
.episode-public-row video, .episode-public-row audio { width: min(280px, 100%); max-height: 150px; }
.episode-file-link { white-space: nowrap; }
.item-detail-shell { width: min(900px, calc(100% - 48px)); margin: 0 auto; padding: clamp(34px, 6vw, 70px) 0; }
.item-detail-layout { display: grid; grid-template-columns: 220px minmax(0, 760px); gap: clamp(20px, 4vw, 48px); align-items: start; width: min(1120px, calc(100% - 24px)); margin: 0 auto; }
.item-detail-layout .item-detail-article { min-width: 0; }
.media-sidebar { position: sticky; top: 24px; align-self: start; padding: 16px; border: 1px solid var(--w-line); border-radius: 8px; background: var(--w-card); color: var(--w-ink); backdrop-filter: blur(12px); }
.media-sidebar-kicker { color: var(--w-accent); font-family: var(--mono, monospace); font-size: 8px; letter-spacing: .08em; }
.media-sidebar h2 { margin-top: 8px; font-family: var(--serif, Georgia, serif); font-size: 20px; font-weight: 400; line-height: 1.25; }
.media-sidebar > p { margin-top: 5px; color: var(--w-muted); font-size: 9px; line-height: 1.7; }
.media-sidebar-nav { display: grid; gap: 2px; margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--w-line); }
.media-sidebar-nav a { display: flex; align-items: baseline; gap: 7px; padding: 7px 7px; border-radius: 4px; color: var(--w-ink-soft); text-decoration: none; font-size: 9.5px; line-height: 1.5; }
.media-sidebar-nav a span { color: var(--w-muted); font-family: var(--mono, monospace); font-size: 7.5px; }
.media-sidebar-nav a strong { font-weight: 400; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.media-sidebar-nav a:hover { background: var(--w-accent-soft); color: var(--w-accent); }
.media-sidebar-nav a.is-current { background: var(--w-accent-soft); color: var(--w-accent); box-shadow: inset 2px 0 0 var(--w-accent); }
.media-sidebar-group { margin-top: 8px; padding-left: calc(var(--depth, 0) * 8px); }
.media-sidebar-group-name { display: block; padding: 4px 7px; color: var(--w-muted); font-family: var(--mono, monospace); font-size: 8px; letter-spacing: .05em; }
.media-sidebar-group .media-sidebar-group { border-left: 1px solid var(--w-line); margin-left: 7px; }
.media-stage-head { display: flex; align-items: baseline; gap: 9px; margin-bottom: 9px; color: var(--w-muted); font-family: var(--mono, monospace); font-size: 8px; }
.media-stage-head strong { color: var(--w-ink); font-family: var(--serif, Georgia, serif); font-size: 15px; font-weight: 400; }
.media-stage-note { margin-top: 10px; color: var(--w-muted); font-size: 10px; line-height: 1.8; }
.media-stage-image { margin-top: 0; }
@media (max-width: 900px) {
  .item-detail-layout { grid-template-columns: 1fr; width: calc(100% - 24px); }
  .media-sidebar { position: static; }
  .media-sidebar-nav { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .media-sidebar-nav { grid-template-columns: 1fr; }
}
.item-detail-media { margin-top: 24px; }
.image-gallery { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.image-gallery-item { margin: 0; }
.image-gallery-item img { width: 100%; aspect-ratio: 1 / .78; object-fit: cover; }
.image-gallery-item figcaption { flex-wrap: wrap; }
.image-gallery-item figcaption a { color: var(--w-accent); font-size: 9px; text-decoration: none; }
@media (max-width: 640px) { .image-gallery { grid-template-columns: 1fr; } }
.item-detail-article h1 { font-family: var(--serif, Georgia, serif); font-size: clamp(32px, 5vw, 52px); font-weight: 400; line-height: 1.2; margin-top: 14px; }
@media (max-width: 640px) {
  .comment-head { flex-direction: column; }
  .comment-submit { align-items: flex-start; flex-direction: column; }
  .item-detail-shell { width: calc(100% - 32px); }
}

/* Phone reading: generous line length, full-width media, and a readable detail sheet. */
@media (max-width: 720px) {
  .web-site { font-size: 15px; line-height: 1.68; }
  .web-shell { width: calc(100% - 28px); }
  .web-layout-grid { display: block; padding-top: 0; }
  .web-layout-block { margin-bottom: 16px; }
  .web-layout-block:last-child { margin-bottom: 0; }
  .web-layout-block > .web-hero,
  .web-layout-block > .web-browse,
  .web-layout-block > .web-body { width: calc(100% - 28px); margin-inline: auto; }
  .web-site.bg-custom .web-topbar,
  .web-site.bg-custom .web-browse-inner,
  .web-site.bg-custom .web-site-footer-inner { padding-inline: 14px; }
  .web-site.bg-custom .web-hero-copy,
  .web-site.bg-custom .web-body { padding: 16px; }
  .web-site.bg-custom .web-zone-nav-inner { padding-inline: 10px; overflow-x: auto; }
  .web-hero { gap: 20px; }
  .web-cover-frame { margin-top: 0; }
  .web-cover-caption { font-size: 8px; gap: 6px; }
  .web-browse-inner { grid-template-columns: 1fr; gap: 10px; }
  .web-search-row { width: 100%; }
  .web-search-input { width: 100%; }
  .web-collection-grid,
  .image-gallery { grid-template-columns: 1fr; }
  .image-gallery-item img { max-height: none; width: 100%; }
  .web-figure img { max-width: 100%; }
  .web-detail-overlay { padding: 8px; align-items: start; }
  .web-detail-panel { width: 100%; max-height: 94vh; border-radius: 6px; }
  .web-detail-body { padding: 16px; }
  .web-detail-figure img { max-width: 100%; height: auto; }
  .item-detail-shell { width: calc(100% - 28px); padding: 26px 0 44px; }
  .episode-public-row { flex-wrap: wrap; }
  .episode-public-row video,
  .episode-public-row audio { width: 100%; }
  .comment-reply-target { flex-wrap: wrap; }
}
`;
