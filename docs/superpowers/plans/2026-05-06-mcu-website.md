# MCU Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive website for Misión Católica Universitaria (MCU) with a video hero landing page, informational sections, merch catalog, and contact form.

**Architecture:** Astro static site with hybrid rendering (SSR for the contact API endpoint). Single-page scroll for the main content (Hero, Quiénes Somos, REDIL) plus separate pages for Merch and Contáctanos. Deployed on Vercel.

**Tech Stack:** Astro 6.x, @astrojs/vercel, Resend, lite-youtube-embed, lucide-astro, Google Fonts (Bebas Neue + Montserrat)

**Spec:** `docs/superpowers/specs/2026-05-06-mcu-website-design.md`

---

## File Map

```
src/
  assets/
    images/
      logos/
        logo-full.png            — circular MCU logo for nav/favicon
        flame.png                — flame + 1979 for footer
      portada/
        hero-fallback.jpg        — fallback image for hero if video fails
        portada-1.jpg ... portada-6.jpg
      nosotros/
        nosotros-1.jpg ... nosotros-4.jpg
      redil/
        redil-1.jpg ... redil-7.jpg
      merch/
        (product photos added later)
  components/
    Nav.astro                    — sticky nav with scroll anchors + page links + mobile hamburger
    Hero.astro                   — 100vh video background hero with lema overlay
    SectionHeader.astro          — reusable section header (tag + title + red line)
    Historia.astro               — 50/50 history layout with quote block
    Objetivos.astro              — navy background, 3-column objectives
    PhotoStrip.astro             — horizontal photo strip
    Redil.astro                  — REDIL complete section (banner + pillars + grid + CTA)
    RedilBanner.astro            — description banner with overlay + floating photos
    RedilPilares.astro           — 3 pillars with dividers
    PhotoGrid.astro              — asymmetric photo grid
    ProductCard.astro            — single merch product card
    MerchFilter.astro            — filter tabs (client-side JS island)
    ContactForm.astro            — contact form with client-side validation
    ContactInfo.astro            — navy sidebar with contact details
    PageHero.astro               — short hero banner for sub-pages (merch, contacto)
    Footer.astro                 — global footer
  layouts/
    Layout.astro                 — base HTML shell (head, meta, fonts, global CSS)
  pages/
    index.astro                  — assembles Hero + Quiénes Somos + REDIL + Footer
    merch.astro                  — assembles PageHero + MerchFilter + ProductCard grid + Footer
    contacto.astro               — assembles PageHero + ContactForm + ContactInfo + Footer
    api/
      contact.ts                 — POST endpoint: validate + send email via Resend
  content/
    products.json                — merch product data array
  styles/
    global.css                   — CSS custom properties, reset, typography, utilities
public/
  favicon.png                    — MCU logo as favicon
astro.config.mjs                 — Astro config with Vercel adapter
package.json
tsconfig.json
.env.example                     — documents required env vars
.gitignore                       — updated with node_modules, dist, .env, .astro
```

---

## Task 1: Astro Project Scaffold + Global Styles

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.env.example`, `.gitignore` (update), `src/styles/global.css`, `src/layouts/Layout.astro`, `src/pages/index.astro` (placeholder)

- [ ] **Step 1: Initialize Astro project**

Run from project root (which already has a git repo):

```bash
cd "/Users/pablomadrigal/Repos/Superacion Juvenil/MCU-Central"
npm create astro@latest . -- --template minimal --no-install --typescript strict
```

If prompted about existing files, choose to overwrite — the repo only has `docs/` and `.gitignore`.

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install @astrojs/vercel resend lite-youtube-embed
npm install -D lucide-astro
```

- [ ] **Step 3: Configure Astro for Vercel hybrid mode**

Replace the contents of `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static',
  adapter: vercel(),
  image: {
    domains: ['img.youtube.com'],
  },
});
```

- [ ] **Step 4: Update .gitignore**

Append to `.gitignore`:

```
node_modules/
dist/
.astro/
.env
.vercel/
.superpowers/
```

- [ ] **Step 5: Create .env.example**

Create `.env.example`:

```
RESEND_API_KEY=re_xxxxxxxxxxxx
CONTACT_EMAIL=contacto@mcu.org
WHATSAPP_NUMBER=521XXXXXXXXXX
```

- [ ] **Step 6: Write global.css with brand tokens and typography**

Create `src/styles/global.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@300;400;600;700;900&display=swap');

:root {
  --navy: #0F1B33;
  --red: #E63462;
  --white: #FFFFFF;
  --cream: #F8F6F3;
  --gray: #555555;
  --gray-light: #E8E4DF;
  --gray-divider: #E0E0E0;

  --font-heading: 'Bebas Neue', sans-serif;
  --font-body: 'Montserrat', sans-serif;

  --bp-tablet: 768px;
  --bp-desktop: 1024px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  color: var(--navy);
  background: var(--white);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  color: inherit;
  text-decoration: none;
}

.section-padding {
  padding: 5rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .section-padding {
    padding: 3rem 1rem;
  }
}
```

- [ ] **Step 7: Write Layout.astro base layout**

Create `src/layouts/Layout.astro`:

```astro
---
interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Misión Católica Universitaria — Todo por amor a Cristo' } = Astro.props;
import '../styles/global.css';
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content="/og-image.jpg" />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 8: Write placeholder index.astro**

Create `src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="MCU — Misión Católica Universitaria">
  <main>
    <h1>MCU — Todo por amor a Cristo</h1>
  </main>
</Layout>
```

- [ ] **Step 9: Copy image assets into project**

```bash
ASSETS="/Users/pablomadrigal/Repos/Superacion Juvenil/MCU-Central/src/assets/images"
SOURCE="/Users/pablomadrigal/Library/CloudStorage/OneDrive-Personal/Desktop/MCU/Página web"

mkdir -p "$ASSETS/logos" "$ASSETS/portada" "$ASSETS/nosotros" "$ASSETS/redil" "$ASSETS/merch"

cp "$SOURCE/Logos MCU/Plain All colors.png" "$ASSETS/logos/logo-full.png"
cp "$SOURCE/Logos MCU/flame-02.png" "$ASSETS/logos/flame.png"

# Copy portada photos (rename for consistency)
i=1; for f in "$SOURCE/Portada/"*; do cp "$f" "$ASSETS/portada/portada-$i.jpg"; i=$((i+1)); done

# Copy nosotros photos
i=1; for f in "$SOURCE/Nosotros/"*; do cp "$f" "$ASSETS/nosotros/nosotros-$i.jpg"; i=$((i+1)); done

# Copy redil photos
i=1; for f in "$SOURCE/Redil/"*; do cp "$f" "$ASSETS/redil/redil-$i.jpg"; i=$((i+1)); done
```

Also copy the logo as favicon to public:

```bash
mkdir -p "/Users/pablomadrigal/Repos/Superacion Juvenil/MCU-Central/public"
cp "$SOURCE/Logos MCU/Plain All colors.png" "/Users/pablomadrigal/Repos/Superacion Juvenil/MCU-Central/public/favicon.png"
```

- [ ] **Step 10: Verify dev server starts**

```bash
npm run dev
```

Expected: Astro dev server at `http://localhost:4321` showing the placeholder page.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: scaffold Astro project with global styles, layout, and image assets"
```

---

## Task 2: Nav Component

**Files:**
- Create: `src/components/Nav.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create Nav.astro**

Create `src/components/Nav.astro`:

```astro
---
interface Props {
  currentPage?: string;
}

const { currentPage = 'home' } = Astro.props;
import { Image } from 'astro:assets';
import logoFull from '../assets/images/logos/logo-full.png';
---

<nav class="nav" id="main-nav">
  <div class="nav__inner">
    <a href="/" class="nav__logo">
      <Image src={logoFull} alt="MCU" width={40} height={40} />
      <span class="nav__logo-text">MCU</span>
    </a>

    <button class="nav__hamburger" id="nav-toggle" aria-label="Abrir menú" aria-expanded="false">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <ul class="nav__links" id="nav-links">
      <li><a href="/#inicio" class:list={[{ active: currentPage === 'home' }]}>Inicio</a></li>
      <li><a href="/#nosotros">Nosotros</a></li>
      <li><a href="/#redil">REDIL</a></li>
      <li><a href="/contacto" class:list={[{ active: currentPage === 'contacto' }]}>Contáctanos</a></li>
      <li><a href="/merch" class:list={['nav__merch-btn', { active: currentPage === 'merch' }]}>Merch</a></li>
    </ul>
  </div>
</nav>

<style>
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: var(--white);
    border-bottom: 2px solid var(--navy);
    transition: transform 0.3s ease;
  }

  .nav__inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0.75rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav__logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .nav__logo img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .nav__logo-text {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    color: var(--navy);
    letter-spacing: 2px;
  }

  .nav__links {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    list-style: none;
  }

  .nav__links a {
    font-family: var(--font-body);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--navy);
    opacity: 0.7;
    transition: opacity 0.2s;
    padding-bottom: 2px;
  }

  .nav__links a:hover,
  .nav__links a.active {
    opacity: 1;
    border-bottom: 2px solid var(--red);
  }

  .nav__merch-btn {
    background: var(--red) !important;
    color: var(--white) !important;
    padding: 0.4rem 1.2rem !important;
    border-radius: 20px;
    opacity: 1 !important;
    border: none !important;
  }

  .nav__merch-btn:hover {
    background: #c42a52 !important;
  }

  .nav__hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
  }

  .nav__hamburger span {
    display: block;
    width: 24px;
    height: 2px;
    background: var(--navy);
    transition: transform 0.3s, opacity 0.3s;
  }

  @media (max-width: 768px) {
    .nav__hamburger {
      display: flex;
    }

    .nav__links {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      flex-direction: column;
      background: var(--white);
      padding: 1rem;
      border-bottom: 2px solid var(--navy);
      gap: 1rem;
    }

    .nav__links.open {
      display: flex;
    }

    .nav__hamburger[aria-expanded="true"] span:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }
    .nav__hamburger[aria-expanded="true"] span:nth-child(2) {
      opacity: 0;
    }
    .nav__hamburger[aria-expanded="true"] span:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }
  }
</style>

<script>
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');

  toggle?.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    links?.classList.toggle('open');
  });

  // Close mobile menu on link click
  links?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle?.setAttribute('aria-expanded', 'false');
      links.classList.remove('open');
    });
  });
</script>
```

- [ ] **Step 2: Add Nav to index.astro**

Replace `src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
---

<Layout title="MCU — Misión Católica Universitaria">
  <Nav currentPage="home" />
  <main style="margin-top: 60px;">
    <h1>MCU — Todo por amor a Cristo</h1>
  </main>
</Layout>
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`, open `http://localhost:4321`. Check:
- Logo + "MCU" text on left
- Nav links on right with "Merch" as red pill button
- Resize to mobile: hamburger appears, click opens/closes menu

- [ ] **Step 4: Commit**

```bash
git add src/components/Nav.astro src/pages/index.astro
git commit -m "feat: add sticky Nav component with mobile hamburger"
```

---

## Task 3: Hero Component

**Files:**
- Create: `src/components/Hero.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create Hero.astro**

Create `src/components/Hero.astro`:

```astro
---
import { Image } from 'astro:assets';
import heroFallback from '../assets/images/portada/portada-1.jpg';
---

<section class="hero" id="inicio">
  <div class="hero__video-container">
    <iframe
      src="https://www.youtube.com/embed/JKtriWie5H4?autoplay=1&mute=1&loop=1&playlist=JKtriWie5H4&controls=0&showinfo=0&modestbranding=1&rel=0&disablekb=1&playsinline=1"
      title="MCU Video"
      allow="autoplay; encrypted-media"
      allowfullscreen
      loading="lazy"
      class="hero__video"
    ></iframe>
  </div>

  <Image
    src={heroFallback}
    alt=""
    class="hero__fallback"
    widths={[640, 1024, 1440]}
    sizes="100vw"
    loading="eager"
  />

  <div class="hero__overlay"></div>

  <div class="hero__content">
    <h1 class="hero__title">Todo por amor<br />a Cristo</h1>
    <div class="hero__line"></div>
    <p class="hero__subtitle">Misión Católica Universitaria</p>
  </div>

  <div class="hero__scroll" id="scroll-indicator">
    <span class="hero__scroll-text">Scroll</span>
    <span class="hero__scroll-arrow">&#8595;</span>
  </div>
</section>

<style>
  .hero {
    position: relative;
    height: 100vh;
    min-height: 600px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--navy);
  }

  .hero__video-container {
    position: absolute;
    inset: 0;
    overflow: hidden;
    z-index: 1;
  }

  .hero__video {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120%;
    height: 120%;
    transform: translate(-50%, -50%);
    border: none;
    pointer-events: none;
  }

  .hero__fallback {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  }

  .hero__overlay {
    position: absolute;
    inset: 0;
    background: rgba(15, 27, 51, 0.75);
    z-index: 2;
  }

  .hero__content {
    position: relative;
    z-index: 3;
    text-align: center;
    padding: 0 1.5rem;
  }

  .hero__title {
    font-family: var(--font-heading);
    font-size: clamp(3rem, 8vw, 5rem);
    color: var(--white);
    text-transform: uppercase;
    letter-spacing: 6px;
    line-height: 1.1;
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
  }

  .hero__line {
    width: 60px;
    height: 3px;
    background: var(--red);
    margin: 1rem auto;
    border-radius: 2px;
  }

  .hero__subtitle {
    font-family: var(--font-body);
    font-weight: 300;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 4px;
  }

  .hero__scroll {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    color: rgba(255, 255, 255, 0.4);
    transition: opacity 0.5s;
  }

  .hero__scroll-text {
    font-size: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .hero__scroll-arrow {
    font-size: 1.25rem;
    animation: bounce 2s infinite;
  }

  .hero__scroll.hidden {
    opacity: 0;
    pointer-events: none;
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-8px); }
    60% { transform: translateY(-4px); }
  }
</style>

<script>
  const scrollIndicator = document.getElementById('scroll-indicator');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      scrollIndicator?.classList.add('hidden');
    } else {
      scrollIndicator?.classList.remove('hidden');
    }
  }, { passive: true });
</script>
```

- [ ] **Step 2: Add Hero to index.astro**

Replace `src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
---

<Layout title="MCU — Misión Católica Universitaria">
  <Nav currentPage="home" />
  <Hero />
</Layout>
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:4321`. Check:
- Full-screen hero with navy overlay
- YouTube video playing in background (muted, looping)
- "Todo por amor a Cristo" centered with red line and subtitle
- Scroll indicator animates at bottom, disappears on scroll
- Fallback image visible under overlay if video is slow to load

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.astro src/pages/index.astro
git commit -m "feat: add Hero component with YouTube background video"
```

---

## Task 4: SectionHeader + Quiénes Somos (Historia + Objetivos + PhotoStrip)

**Files:**
- Create: `src/components/SectionHeader.astro`, `src/components/Historia.astro`, `src/components/Objetivos.astro`, `src/components/PhotoStrip.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create SectionHeader.astro**

Create `src/components/SectionHeader.astro`:

```astro
---
interface Props {
  tag: string;
  title: string;
  tagline?: string;
}

const { tag, title, tagline } = Astro.props;
---

<div class="section-header">
  <span class="section-header__tag">{tag}</span>
  <h2 class="section-header__title">{title}</h2>
  <div class="section-header__line"></div>
  {tagline && <p class="section-header__tagline">{tagline}</p>}
</div>

<style>
  .section-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .section-header__tag {
    font-family: var(--font-body);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 4px;
    color: var(--red);
  }

  .section-header__title {
    font-family: var(--font-heading);
    font-size: clamp(2rem, 5vw, 3rem);
    text-transform: uppercase;
    letter-spacing: 3px;
    color: var(--navy);
    margin-top: 0.5rem;
  }

  .section-header__line {
    width: 50px;
    height: 3px;
    background: var(--red);
    margin: 0.75rem auto 0;
    border-radius: 2px;
  }

  .section-header__tagline {
    font-style: italic;
    color: var(--gray);
    font-size: 0.875rem;
    margin-top: 0.75rem;
    letter-spacing: 0.5px;
  }

  /* White variant for dark backgrounds */
  :global(.dark-bg) .section-header__title {
    color: var(--white);
  }
</style>
```

- [ ] **Step 2: Create Historia.astro**

Create `src/components/Historia.astro`:

```astro
---
import { Image } from 'astro:assets';
import nosotros1 from '../assets/images/nosotros/nosotros-1.jpg';
---

<div class="historia">
  <div class="historia__image-wrap">
    <Image
      src={nosotros1}
      alt="Comunidad MCU"
      widths={[400, 600]}
      sizes="(max-width: 768px) 100vw, 50vw"
      class="historia__image"
    />
    <span class="historia__badge">Desde 1979</span>
  </div>

  <div class="historia__text">
    <h3 class="historia__title">Nuestra Historia</h3>
    <p class="historia__body">
      En 1978, unos estudiantes universitarios, Manuel De Urquidi, Arturo Valdés y Alejandro Vásquez,
      inician un grupo de hombres para hacer oración y evangelizar en la universidad. Paralelamente,
      Adriana González comienza un grupo de mujeres. Al conocerse, ambos grupos deciden unirse para
      formar un sólo grupo que viviera profunda y dedicadamente su catolicismo. El 16 de Agosto de 1979
      hacen el primer compromiso unos con otros comenzando el "grupo de los viernes" que, en 1981,
      recibió el nombre de Misión Católica Universitaria.
    </p>
    <blockquote class="historia__quote">
      <span class="historia__quote-label">Declaración de Identidad</span>
      <p>
        Misión Católica Universitaria es un movimiento católico de jóvenes auspiciado por la
        "Comunidad Jésed", que se dedica a evangelizar a jóvenes universitarios, llevarlos a un
        compromiso con Cristo y con otros cristianos y proveerles de formación en carácter cristiano.
      </p>
    </blockquote>
  </div>
</div>

<style>
  .historia {
    display: flex;
    gap: 2.5rem;
    align-items: flex-start;
  }

  .historia__image-wrap {
    flex: 1;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
  }

  .historia__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    min-height: 300px;
  }

  .historia__badge {
    position: absolute;
    bottom: 0.75rem;
    left: 0.75rem;
    background: rgba(15, 27, 51, 0.85);
    color: var(--white);
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 1px;
  }

  .historia__text {
    flex: 1;
  }

  .historia__title {
    font-family: var(--font-heading);
    font-size: 1.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--navy);
    margin-bottom: 1rem;
  }

  .historia__body {
    font-size: 0.9375rem;
    color: var(--gray);
    line-height: 1.8;
    margin-bottom: 1.5rem;
  }

  .historia__quote {
    padding: 1rem 1.25rem;
    background: var(--cream);
    border-left: 3px solid var(--red);
    border-radius: 0 4px 4px 0;
  }

  .historia__quote-label {
    display: block;
    font-size: 0.6875rem;
    color: var(--red);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
    margin-bottom: 0.375rem;
  }

  .historia__quote p {
    font-size: 0.875rem;
    color: var(--gray);
    line-height: 1.7;
  }

  @media (max-width: 768px) {
    .historia {
      flex-direction: column;
    }
  }
</style>
```

- [ ] **Step 3: Create Objetivos.astro**

Create `src/components/Objetivos.astro`:

```astro
---
import SectionHeader from './SectionHeader.astro';
import { Cross, Users, BookOpen } from 'lucide-astro';

const objetivos = [
  {
    icon: 'cross',
    title: 'Misionero',
    description: 'Evangelizar en las universidades y llevar a otros jóvenes a una relación personal con Jesucristo y a una vida dedicada como discípulo a través de la proclamación viva de su Palabra y del testimonio de vida.',
  },
  {
    icon: 'users',
    title: 'Comunitario',
    description: 'Ayudar a sus miembros a vivir comunitariamente su cristianismo y proveerles de ambientes adecuados y de oportunidades para establecer relaciones personales cristianas.',
  },
  {
    icon: 'book',
    title: 'Formativo',
    description: 'Proveer de formación en servicio, carácter y liderazgo cristiano a sus miembros.',
  },
];
---

<section class="objetivos dark-bg">
  <div class="objetivos__inner">
    <SectionHeader tag="Lo que nos mueve" title="Nuestros Objetivos" />
    <div class="objetivos__grid">
      {objetivos.map((obj) => (
        <div class="objetivos__card">
          <div class="objetivos__icon">
            {obj.icon === 'cross' && <Cross size={24} />}
            {obj.icon === 'users' && <Users size={24} />}
            {obj.icon === 'book' && <BookOpen size={24} />}
          </div>
          <h3 class="objetivos__title">{obj.title}</h3>
          <p class="objetivos__desc">{obj.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>

<style>
  .objetivos {
    background: var(--navy);
    padding: 5rem 1.5rem;
  }

  .objetivos__inner {
    max-width: 1200px;
    margin: 0 auto;
  }

  .objetivos :global(.section-header__title) {
    color: var(--white);
  }

  .objetivos__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  .objetivos__card {
    text-align: center;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }

  .objetivos__icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--red);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    color: var(--white);
  }

  .objetivos__title {
    font-family: var(--font-heading);
    font-size: 1.25rem;
    color: var(--white);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.75rem;
  }

  .objetivos__desc {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.7;
  }

  @media (max-width: 768px) {
    .objetivos__grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
</style>
```

- [ ] **Step 4: Create PhotoStrip.astro**

Create `src/components/PhotoStrip.astro`:

```astro
---
import { Image } from 'astro:assets';

interface Props {
  images: ImageMetadata[];
}

const { images } = Astro.props;
---

<div class="photo-strip">
  {images.map((img, i) => (
    <div class="photo-strip__item">
      <Image
        src={img}
        alt={`MCU foto ${i + 1}`}
        widths={[300, 400]}
        sizes="25vw"
        class="photo-strip__img"
      />
    </div>
  ))}
</div>

<style>
  .photo-strip {
    display: flex;
    gap: 4px;
    padding: 4px;
  }

  .photo-strip__item {
    flex: 1;
    overflow: hidden;
  }

  .photo-strip__img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 2px;
    transition: transform 0.3s;
  }

  .photo-strip__img:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    .photo-strip {
      flex-wrap: wrap;
    }
    .photo-strip__item {
      flex: 1 1 48%;
    }
    .photo-strip__img {
      height: 150px;
    }
  }
</style>
```

- [ ] **Step 5: Assemble Quiénes Somos in index.astro**

Replace `src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import SectionHeader from '../components/SectionHeader.astro';
import Historia from '../components/Historia.astro';
import Objetivos from '../components/Objetivos.astro';
import PhotoStrip from '../components/PhotoStrip.astro';

import nosotros1 from '../assets/images/nosotros/nosotros-1.jpg';
import nosotros2 from '../assets/images/nosotros/nosotros-2.jpg';
import nosotros3 from '../assets/images/nosotros/nosotros-3.jpg';
import nosotros4 from '../assets/images/nosotros/nosotros-4.jpg';
---

<Layout title="MCU — Misión Católica Universitaria">
  <Nav currentPage="home" />
  <Hero />

  <section id="nosotros" class="section-padding">
    <SectionHeader tag="Conócenos" title="Quiénes Somos" />
    <Historia />
  </section>

  <Objetivos />

  <PhotoStrip images={[nosotros1, nosotros2, nosotros3, nosotros4]} />
</Layout>
```

- [ ] **Step 6: Verify in browser**

Check: Hero → scroll → "Quiénes Somos" header with red tag + title + red line → History 50/50 layout with badge → Objetivos on navy background with 3 cards → Photo strip. Resize to mobile: all stacks vertically.

- [ ] **Step 7: Commit**

```bash
git add src/components/SectionHeader.astro src/components/Historia.astro src/components/Objetivos.astro src/components/PhotoStrip.astro src/pages/index.astro
git commit -m "feat: add Quiénes Somos section (Historia, Objetivos, PhotoStrip)"
```

---

## Task 5: REDIL Section

**Files:**
- Create: `src/components/Redil.astro`, `src/components/RedilBanner.astro`, `src/components/RedilPilares.astro`, `src/components/PhotoGrid.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create RedilBanner.astro**

Create `src/components/RedilBanner.astro`:

```astro
---
import { Image } from 'astro:assets';
import redilBg from '../assets/images/redil/redil-1.jpg';
import redilFloat1 from '../assets/images/redil/redil-2.jpg';
import redilFloat2 from '../assets/images/redil/redil-3.jpg';
---

<div class="redil-banner">
  <Image src={redilBg} alt="" class="redil-banner__bg" widths={[800, 1200]} sizes="100vw" />
  <div class="redil-banner__overlay"></div>

  <div class="redil-banner__content">
    <div class="redil-banner__text">
      <h3 class="redil-banner__title">¿Qué es REDIL?</h3>
      <p class="redil-banner__desc">
        REDIL (Retiro de Directores y Líderes de MCU) es un encuentro de fin de semana enfocado en
        equipar líderes misioneros para hacer crecer la misión. Está diseñado para capacitarte
        —como misionero universitario— y prepararte para vivir con mayor entrega tu llamado dentro de MCU.
      </p>
      <p class="redil-banner__desc">
        A lo largo de estos días, buscamos fortalecer tu identidad misionera, desarrollar tus habilidades
        de liderazgo y renovar tu corazón, para que no solo participes en tu MCU, sino que la hagas crecer.
      </p>
    </div>
    <div class="redil-banner__photos">
      <Image src={redilFloat1} alt="REDIL" widths={[200, 300]} class="redil-banner__float redil-banner__float--1" />
      <Image src={redilFloat2} alt="REDIL" widths={[200, 300]} class="redil-banner__float redil-banner__float--2" />
    </div>
  </div>
</div>

<style>
  .redil-banner {
    position: relative;
    min-height: 400px;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .redil-banner__bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .redil-banner__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(15, 27, 51, 0.9), rgba(15, 27, 51, 0.4));
  }

  .redil-banner__content {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 3rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    width: 100%;
  }

  .redil-banner__text {
    flex: 0 1 55%;
  }

  .redil-banner__title {
    font-family: var(--font-heading);
    font-size: 1.75rem;
    color: var(--white);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 1rem;
  }

  .redil-banner__desc {
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.8;
    margin-bottom: 0.75rem;
  }

  .redil-banner__photos {
    flex: 0 1 45%;
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  .redil-banner__float {
    width: 180px;
    height: 240px;
    object-fit: cover;
    border-radius: 6px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .redil-banner__float--2 {
    margin-top: 2rem;
  }

  @media (max-width: 768px) {
    .redil-banner__content {
      flex-direction: column;
    }
    .redil-banner__text {
      flex: 1;
    }
    .redil-banner__photos {
      flex: 1;
      justify-content: center;
    }
    .redil-banner__float {
      width: 140px;
      height: 180px;
    }
  }
</style>
```

- [ ] **Step 2: Create RedilPilares.astro**

Create `src/components/RedilPilares.astro`:

```astro
---
import { BookOpen, Flame, Cross } from 'lucide-astro';

const pilares = [
  { icon: 'book', title: 'Capacitarnos', desc: 'Desarrollar habilidades de liderazgo y fortalecer tu identidad misionera.' },
  { icon: 'flame', title: 'Fortalecer nuestra hermandad', desc: 'Vivir en comunidad, orar juntos y renovar nuestro corazón.' },
  { icon: 'cross', title: 'Encontrarnos con Dios', desc: 'Un encuentro profundo con Dios para salir enviados a transformar nuestras universidades.' },
];
---

<div class="pilares">
  <span class="pilares__tag">¿Qué haremos?</span>
  <div class="pilares__grid">
    {pilares.map((p, i) => (
      <>
        {i > 0 && <div class="pilares__divider" />}
        <div class="pilares__item">
          <div class="pilares__icon">
            {p.icon === 'book' && <BookOpen size={24} />}
            {p.icon === 'flame' && <Flame size={24} />}
            {p.icon === 'cross' && <Cross size={24} />}
          </div>
          <h3 class="pilares__title">{p.title}</h3>
          <p class="pilares__desc">{p.desc}</p>
        </div>
      </>
    ))}
  </div>
</div>

<style>
  .pilares {
    padding: 4rem 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
  }

  .pilares__tag {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 4px;
    color: var(--red);
  }

  .pilares__grid {
    display: flex;
    align-items: flex-start;
    gap: 0;
    margin-top: 2rem;
  }

  .pilares__divider {
    width: 1px;
    align-self: stretch;
    background: var(--gray-divider);
  }

  .pilares__item {
    flex: 1;
    padding: 1rem 1.5rem;
    text-align: center;
  }

  .pilares__icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 2px solid var(--navy);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    color: var(--navy);
  }

  .pilares__title {
    font-family: var(--font-heading);
    font-size: 1.125rem;
    color: var(--navy);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.5rem;
  }

  .pilares__desc {
    font-size: 0.875rem;
    color: var(--gray);
    line-height: 1.7;
  }

  @media (max-width: 768px) {
    .pilares__grid {
      flex-direction: column;
      gap: 1.5rem;
    }
    .pilares__divider {
      width: 60%;
      height: 1px;
      align-self: center;
    }
  }
</style>
```

- [ ] **Step 3: Create PhotoGrid.astro**

Create `src/components/PhotoGrid.astro`:

```astro
---
import { Image } from 'astro:assets';

interface Props {
  images: ImageMetadata[];
}

const { images } = Astro.props;
---

<div class="photo-grid">
  {images.map((img, i) => (
    <div class:list={['photo-grid__item', { 'photo-grid__item--tall': i === 0 }]}>
      <Image
        src={img}
        alt={`REDIL foto ${i + 1}`}
        widths={[300, 500]}
        sizes={i === 0 ? '(max-width: 768px) 100vw, 33vw' : '(max-width: 768px) 50vw, 33vw'}
        class="photo-grid__img"
      />
    </div>
  ))}
</div>

<style>
  .photo-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 180px;
    gap: 4px;
    padding: 0 4px;
  }

  .photo-grid__item--tall {
    grid-row: span 2;
  }

  .photo-grid__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
    transition: transform 0.3s;
  }

  .photo-grid__img:hover {
    transform: scale(1.03);
  }

  @media (max-width: 768px) {
    .photo-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-auto-rows: 150px;
    }
    .photo-grid__item--tall {
      grid-row: span 1;
    }
  }
</style>
```

- [ ] **Step 4: Create Redil.astro (assembles all sub-components)**

Create `src/components/Redil.astro`:

```astro
---
import SectionHeader from './SectionHeader.astro';
import RedilBanner from './RedilBanner.astro';
import RedilPilares from './RedilPilares.astro';
import PhotoGrid from './PhotoGrid.astro';

import redil3 from '../assets/images/redil/redil-3.jpg';
import redil4 from '../assets/images/redil/redil-4.jpg';
import redil5 from '../assets/images/redil/redil-5.jpg';
import redil6 from '../assets/images/redil/redil-6.jpg';
import redil7 from '../assets/images/redil/redil-7.jpg';
---

<section id="redil">
  <div class="section-padding">
    <SectionHeader
      tag="Retiro de Líderes"
      title="REDIL"
      tagline="Equipando líderes misioneros para hacer crecer la misión"
    />
  </div>

  <RedilBanner />
  <RedilPilares />
  <PhotoGrid images={[redil3, redil4, redil5, redil6, redil7]} />

  <div class="redil-cta">
    <a href="/contacto" class="redil-cta__btn">Quiero participar</a>
  </div>
</section>

<style>
  .redil-cta {
    text-align: center;
    padding: 2.5rem 1.5rem;
  }

  .redil-cta__btn {
    display: inline-block;
    background: var(--red);
    color: var(--white);
    padding: 0.75rem 2rem;
    border-radius: 24px;
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    transition: background 0.2s;
  }

  .redil-cta__btn:hover {
    background: #c42a52;
  }
</style>
```

- [ ] **Step 5: Add REDIL to index.astro**

Add after the PhotoStrip in `src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import SectionHeader from '../components/SectionHeader.astro';
import Historia from '../components/Historia.astro';
import Objetivos from '../components/Objetivos.astro';
import PhotoStrip from '../components/PhotoStrip.astro';
import Redil from '../components/Redil.astro';

import nosotros1 from '../assets/images/nosotros/nosotros-1.jpg';
import nosotros2 from '../assets/images/nosotros/nosotros-2.jpg';
import nosotros3 from '../assets/images/nosotros/nosotros-3.jpg';
import nosotros4 from '../assets/images/nosotros/nosotros-4.jpg';
---

<Layout title="MCU — Misión Católica Universitaria">
  <Nav currentPage="home" />
  <Hero />

  <section id="nosotros" class="section-padding">
    <SectionHeader tag="Conócenos" title="Quiénes Somos" />
    <Historia />
  </section>

  <Objetivos />
  <PhotoStrip images={[nosotros1, nosotros2, nosotros3, nosotros4]} />
  <Redil />
</Layout>
```

- [ ] **Step 6: Verify in browser**

Full scroll: Hero → Quiénes Somos → Objetivos → Photo Strip → REDIL header with tagline → Banner with floating photos → 3 Pilares → Photo grid → CTA button. Check mobile stacking.

- [ ] **Step 7: Commit**

```bash
git add src/components/Redil.astro src/components/RedilBanner.astro src/components/RedilPilares.astro src/components/PhotoGrid.astro src/pages/index.astro
git commit -m "feat: add REDIL section (banner, pilares, photo grid, CTA)"
```

---

## Task 6: Footer Component

**Files:**
- Create: `src/components/Footer.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create Footer.astro**

Create `src/components/Footer.astro`:

```astro
---
import { Image } from 'astro:assets';
import flame from '../assets/images/logos/flame.png';
import { Instagram, MessageCircle, Mail } from 'lucide-astro';
---

<footer class="footer">
  <div class="footer__inner">
    <div class="footer__brand">
      <Image src={flame} alt="MCU" width={60} height={75} class="footer__logo" />
      <p class="footer__motto">"Todo por amor a Cristo"</p>
    </div>

    <nav class="footer__nav">
      <a href="/#inicio">Inicio</a>
      <a href="/#nosotros">Nosotros</a>
      <a href="/#redil">REDIL</a>
      <a href="/contacto">Contáctanos</a>
      <a href="/merch">Merch</a>
    </nav>

    <div class="footer__social">
      <a href="#" aria-label="Instagram" class="footer__social-link"><Instagram size={20} /></a>
      <a href="#" aria-label="WhatsApp" class="footer__social-link"><MessageCircle size={20} /></a>
      <a href="#" aria-label="Email" class="footer__social-link"><Mail size={20} /></a>
    </div>

    <p class="footer__copy">&copy; {new Date().getFullYear()} Misión Católica Universitaria</p>
  </div>
</footer>

<style>
  .footer {
    background: var(--navy);
    padding: 3rem 1.5rem 1.5rem;
  }

  .footer__inner {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
  }

  .footer__logo {
    margin: 0 auto;
  }

  .footer__motto {
    font-family: var(--font-body);
    font-style: italic;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9375rem;
    margin-top: 0.75rem;
  }

  .footer__nav {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 2rem;
    flex-wrap: wrap;
  }

  .footer__nav a {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8125rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
    transition: color 0.2s;
  }

  .footer__nav a:hover {
    color: var(--white);
  }

  .footer__social {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .footer__social-link {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.7);
    transition: border-color 0.2s, color 0.2s;
  }

  .footer__social-link:hover {
    border-color: var(--red);
    color: var(--red);
  }

  .footer__copy {
    margin-top: 2rem;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
  }
</style>
```

- [ ] **Step 2: Add Footer to index.astro**

Add `import Footer from '../components/Footer.astro';` and `<Footer />` after `<Redil />`.

- [ ] **Step 3: Verify in browser**

Scroll to bottom: navy footer with flame logo, motto, nav links, social icons, copyright.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.astro src/pages/index.astro
git commit -m "feat: add Footer component"
```

---

## Task 7: Merch Page

**Files:**
- Create: `src/components/PageHero.astro`, `src/components/ProductCard.astro`, `src/components/MerchFilter.astro`, `src/content/products.json`, `src/pages/merch.astro`

- [ ] **Step 1: Create PageHero.astro**

Create `src/components/PageHero.astro`:

```astro
---
interface Props {
  title: string;
}

const { title } = Astro.props;
---

<section class="page-hero">
  <h1 class="page-hero__title">{title}</h1>
  <div class="page-hero__line"></div>
</section>

<style>
  .page-hero {
    background: linear-gradient(135deg, var(--navy), #1a2d52);
    padding: 8rem 1.5rem 4rem;
    text-align: center;
  }

  .page-hero__title {
    font-family: var(--font-heading);
    font-size: clamp(2.5rem, 6vw, 4rem);
    color: var(--white);
    text-transform: uppercase;
    letter-spacing: 4px;
  }

  .page-hero__line {
    width: 50px;
    height: 3px;
    background: var(--red);
    margin: 1rem auto 0;
    border-radius: 2px;
  }
</style>
```

- [ ] **Step 2: Create products.json**

Create `src/content/products.json`:

```json
[
  {
    "id": "playera-classic",
    "name": "Playera MCU Classic",
    "price": 350,
    "category": "playeras",
    "image": "/images/merch/playera-classic.jpg",
    "whatsappMessage": "Hola, me interesa la Playera MCU Classic ($350 MXN)"
  },
  {
    "id": "hoodie-redil",
    "name": "Hoodie REDIL 2025",
    "price": 650,
    "category": "hoodies",
    "image": "/images/merch/hoodie-redil.jpg",
    "whatsappMessage": "Hola, me interesa el Hoodie REDIL 2025 ($650 MXN)"
  },
  {
    "id": "sticker-pack",
    "name": "Sticker Pack",
    "price": 80,
    "category": "accesorios",
    "image": "/images/merch/sticker-pack.jpg",
    "whatsappMessage": "Hola, me interesa el Sticker Pack ($80 MXN)"
  }
]
```

- [ ] **Step 3: Create ProductCard.astro**

Create `src/components/ProductCard.astro`:

```astro
---
interface Props {
  name: string;
  price: number;
  image: string;
  whatsappMessage: string;
  category: string;
  whatsappNumber?: string;
}

const {
  name,
  price,
  image,
  whatsappMessage,
  category,
  whatsappNumber = import.meta.env.WHATSAPP_NUMBER || '521XXXXXXXXXX'
} = Astro.props;

const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
---

<div class="product-card" data-category={category}>
  <div class="product-card__image-wrap">
    <img src={image} alt={name} class="product-card__image" loading="lazy" />
  </div>
  <div class="product-card__body">
    <h3 class="product-card__name">{name}</h3>
    <p class="product-card__price">${price} MXN</p>
    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" class="product-card__btn">
      Pedir por WhatsApp
    </a>
  </div>
</div>

<style>
  .product-card {
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--gray-light);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .product-card__image-wrap {
    background: var(--cream);
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .product-card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .product-card__body {
    padding: 1rem;
  }

  .product-card__name {
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 900;
    color: var(--navy);
  }

  .product-card__price {
    font-size: 0.875rem;
    color: var(--gray);
    margin-top: 0.25rem;
  }

  .product-card__btn {
    display: block;
    margin-top: 0.75rem;
    background: var(--red);
    color: var(--white);
    text-align: center;
    padding: 0.5rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: background 0.2s;
  }

  .product-card__btn:hover {
    background: #c42a52;
  }
</style>
```

- [ ] **Step 4: Create MerchFilter.astro**

Create `src/components/MerchFilter.astro`:

```astro
---
const categories = [
  { id: 'todo', label: 'Todo' },
  { id: 'playeras', label: 'Playeras' },
  { id: 'hoodies', label: 'Hoodies' },
  { id: 'accesorios', label: 'Accesorios' },
];
---

<div class="merch-filter" id="merch-filter">
  {categories.map((cat) => (
    <button
      class:list={['merch-filter__btn', { 'merch-filter__btn--active': cat.id === 'todo' }]}
      data-filter={cat.id}
    >
      {cat.label}
    </button>
  ))}
</div>

<style>
  .merch-filter {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    padding: 2rem 1.5rem;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--gray-light);
  }

  .merch-filter__btn {
    font-family: var(--font-body);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--gray);
    background: none;
    border: none;
    padding: 0.375rem 1rem;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .merch-filter__btn:hover {
    color: var(--navy);
  }

  .merch-filter__btn--active {
    background: var(--navy);
    color: var(--white);
  }
</style>

<script>
  const filterBtns = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('[data-category]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => b.classList.remove('merch-filter__btn--active'));
      btn.classList.add('merch-filter__btn--active');

      cards.forEach(card => {
        if (filter === 'todo' || card.getAttribute('data-category') === filter) {
          (card as HTMLElement).style.display = '';
        } else {
          (card as HTMLElement).style.display = 'none';
        }
      });
    });
  });
</script>
```

- [ ] **Step 5: Create merch.astro page**

Create `src/pages/merch.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
import PageHero from '../components/PageHero.astro';
import MerchFilter from '../components/MerchFilter.astro';
import ProductCard from '../components/ProductCard.astro';
import Footer from '../components/Footer.astro';
import products from '../content/products.json';
---

<Layout title="Merch — MCU">
  <Nav currentPage="merch" />
  <PageHero title="Merch MCU" />
  <MerchFilter />

  <div class="merch-grid section-padding">
    {products.map((p) => (
      <ProductCard
        name={p.name}
        price={p.price}
        image={p.image}
        category={p.category}
        whatsappMessage={p.whatsappMessage}
      />
    ))}
  </div>

  <Footer />
</Layout>

<style>
  .merch-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  @media (max-width: 1023px) {
    .merch-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .merch-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

- [ ] **Step 6: Add placeholder merch images**

```bash
mkdir -p "/Users/pablomadrigal/Repos/Superacion Juvenil/MCU-Central/public/images/merch"
```

For now, create simple placeholder images or use portada photos as placeholders:

```bash
cp "/Users/pablomadrigal/Repos/Superacion Juvenil/MCU-Central/src/assets/images/portada/portada-1.jpg" "/Users/pablomadrigal/Repos/Superacion Juvenil/MCU-Central/public/images/merch/playera-classic.jpg"
cp "/Users/pablomadrigal/Repos/Superacion Juvenil/MCU-Central/src/assets/images/portada/portada-2.jpg" "/Users/pablomadrigal/Repos/Superacion Juvenil/MCU-Central/public/images/merch/hoodie-redil.jpg"
cp "/Users/pablomadrigal/Repos/Superacion Juvenil/MCU-Central/src/assets/images/portada/portada-3.jpg" "/Users/pablomadrigal/Repos/Superacion Juvenil/MCU-Central/public/images/merch/sticker-pack.jpg"
```

- [ ] **Step 7: Verify in browser**

Navigate to `http://localhost:4321/merch`. Check:
- Navy hero with "Merch MCU"
- Filter tabs (click each to filter products)
- Product cards with WhatsApp buttons
- Responsive: 3 → 2 → 1 columns

- [ ] **Step 8: Commit**

```bash
git add src/components/PageHero.astro src/components/ProductCard.astro src/components/MerchFilter.astro src/content/products.json src/pages/merch.astro public/images/merch/
git commit -m "feat: add Merch page with product grid and filtering"
```

---

## Task 8: Contact Page + API Endpoint

**Files:**
- Create: `src/components/ContactForm.astro`, `src/components/ContactInfo.astro`, `src/pages/contacto.astro`, `src/pages/api/contact.ts`
- Modify: `astro.config.mjs`

- [ ] **Step 1: Update astro.config.mjs for hybrid rendering**

The contact API endpoint needs server-side rendering. Update `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'hybrid',
  adapter: vercel(),
  image: {
    domains: ['img.youtube.com'],
  },
});
```

- [ ] **Step 2: Create ContactInfo.astro**

Create `src/components/ContactInfo.astro`:

```astro
---
import { Instagram, MessageCircle, Mail } from 'lucide-astro';
---

<aside class="contact-info">
  <h3 class="contact-info__title">Info</h3>

  <div class="contact-info__item">
    <span class="contact-info__label">Email</span>
    <span class="contact-info__value">contacto@mcu.org</span>
  </div>

  <div class="contact-info__item">
    <span class="contact-info__label">Instagram</span>
    <span class="contact-info__value">@mcu_oficial</span>
  </div>

  <div class="contact-info__item">
    <span class="contact-info__label">WhatsApp</span>
    <span class="contact-info__value">+52 xxx xxx xxxx</span>
  </div>

  <div class="contact-info__social">
    <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
    <a href="#" aria-label="WhatsApp"><MessageCircle size={18} /></a>
    <a href="#" aria-label="Email"><Mail size={18} /></a>
  </div>
</aside>

<style>
  .contact-info {
    background: var(--navy);
    border-radius: 8px;
    padding: 2rem;
    color: var(--white);
  }

  .contact-info__title {
    font-family: var(--font-heading);
    font-size: 1.25rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 1.5rem;
  }

  .contact-info__item {
    margin-bottom: 1.25rem;
  }

  .contact-info__label {
    display: block;
    font-size: 0.6875rem;
    color: var(--red);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  .contact-info__value {
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .contact-info__social {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .contact-info__social a {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.7);
    transition: border-color 0.2s, color 0.2s;
  }

  .contact-info__social a:hover {
    border-color: var(--red);
    color: var(--red);
  }
</style>
```

- [ ] **Step 3: Create ContactForm.astro**

Create `src/components/ContactForm.astro`:

```astro
<form class="contact-form" id="contact-form">
  <h3 class="contact-form__title">Envíanos un mensaje</h3>

  <div class="contact-form__field">
    <label for="name" class="contact-form__label">Nombre</label>
    <input type="text" id="name" name="name" required placeholder="Tu nombre" class="contact-form__input" />
  </div>

  <div class="contact-form__field">
    <label for="email" class="contact-form__label">Email</label>
    <input type="email" id="email" name="email" required placeholder="tu@email.com" class="contact-form__input" />
  </div>

  <div class="contact-form__field">
    <label for="university" class="contact-form__label">Universidad</label>
    <input type="text" id="university" name="university" placeholder="Tu universidad" class="contact-form__input" />
  </div>

  <div class="contact-form__field">
    <label for="message" class="contact-form__label">Mensaje</label>
    <textarea id="message" name="message" required placeholder="¿En qué podemos ayudarte?" rows="5" class="contact-form__input contact-form__textarea"></textarea>
  </div>

  <button type="submit" class="contact-form__submit" id="submit-btn">
    Enviar mensaje
  </button>

  <div class="contact-form__status" id="form-status" role="alert"></div>
</form>

<style>
  .contact-form__title {
    font-family: var(--font-heading);
    font-size: 1.25rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--navy);
    margin-bottom: 1.5rem;
  }

  .contact-form__field {
    margin-bottom: 1rem;
  }

  .contact-form__label {
    display: block;
    font-size: 0.6875rem;
    color: var(--gray);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
    margin-bottom: 0.375rem;
  }

  .contact-form__input {
    width: 100%;
    background: var(--cream);
    border: 1px solid var(--gray-light);
    border-radius: 4px;
    padding: 0.75rem 1rem;
    font-family: var(--font-body);
    font-size: 0.9375rem;
    color: var(--navy);
    transition: border-color 0.2s;
  }

  .contact-form__input:focus {
    outline: none;
    border-color: var(--red);
  }

  .contact-form__input::placeholder {
    color: #bbb;
  }

  .contact-form__textarea {
    resize: vertical;
    min-height: 120px;
  }

  .contact-form__submit {
    width: 100%;
    background: var(--red);
    color: var(--white);
    border: none;
    padding: 0.875rem;
    border-radius: 24px;
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    transition: background 0.2s;
    margin-top: 0.5rem;
  }

  .contact-form__submit:hover {
    background: #c42a52;
  }

  .contact-form__submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .contact-form__status {
    margin-top: 1rem;
    font-size: 0.875rem;
    text-align: center;
    min-height: 1.5rem;
  }

  .contact-form__status.success {
    color: #2e7d32;
  }

  .contact-form__status.error {
    color: var(--red);
  }
</style>

<script>
  const form = document.getElementById('contact-form') as HTMLFormElement;
  const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
  const status = document.getElementById('form-status')!;

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    status.textContent = '';
    status.className = 'contact-form__status';

    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        status.textContent = '¡Mensaje enviado! Te contactaremos pronto.';
        status.classList.add('success');
        form.reset();
      } else {
        throw new Error(result.error || 'Error al enviar');
      }
    } catch (err) {
      status.textContent = err instanceof Error ? err.message : 'Error al enviar el mensaje. Intenta de nuevo.';
      status.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar mensaje';
    }
  });
</script>
```

- [ ] **Step 4: Create contact API endpoint**

Create `src/pages/api/contact.ts`:

```typescript
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const rateLimit = new Map<string, number>();

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Rate limiting: 1 request per IP per 60 seconds
  const now = Date.now();
  const lastRequest = rateLimit.get(clientAddress) || 0;
  if (now - lastRequest < 60_000) {
    return new Response(
      JSON.stringify({ success: false, error: 'Por favor espera un momento antes de enviar otro mensaje.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }
  rateLimit.set(clientAddress, now);

  try {
    const body = await request.json();
    const { name, email, message, university } = body;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nombre, email y mensaje son requeridos.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email inválido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = import.meta.env.RESEND_API_KEY;
    const contactEmail = import.meta.env.CONTACT_EMAIL || 'contacto@mcu.org';

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'El servicio de correo no está configurado. Contáctanos por WhatsApp.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: 'MCU Website <noreply@mcu.org>',
      to: contactEmail,
      replyTo: email,
      subject: `Nuevo mensaje de ${name} — MCU Website`,
      html: `
        <h2>Nuevo mensaje desde el sitio web de MCU</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Universidad:</strong> ${university || 'No especificada'}</p>
        <hr />
        <p><strong>Mensaje:</strong></p>
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno. Intenta de nuevo más tarde.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

- [ ] **Step 5: Create contacto.astro page**

Create `src/pages/contacto.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
import PageHero from '../components/PageHero.astro';
import ContactForm from '../components/ContactForm.astro';
import ContactInfo from '../components/ContactInfo.astro';
import Footer from '../components/Footer.astro';
---

<Layout title="Contáctanos — MCU">
  <Nav currentPage="contacto" />
  <PageHero title="Contáctanos" />

  <div class="contact-layout section-padding">
    <div class="contact-layout__form">
      <ContactForm />
    </div>
    <div class="contact-layout__info">
      <ContactInfo />
    </div>
  </div>

  <Footer />
</Layout>

<style>
  .contact-layout {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
  }

  .contact-layout__form {
    flex: 1.2;
  }

  .contact-layout__info {
    flex: 0.8;
  }

  @media (max-width: 768px) {
    .contact-layout {
      flex-direction: column-reverse;
    }
  }
</style>
```

- [ ] **Step 6: Verify in browser**

Navigate to `http://localhost:4321/contacto`. Check:
- Navy hero with "Contáctanos"
- Form on left with 4 fields + submit button
- Navy info sidebar on right with contact details
- Submit form — should get "service not configured" error (expected, no API key in dev)
- Mobile: info moves above form

- [ ] **Step 7: Commit**

```bash
git add src/components/ContactForm.astro src/components/ContactInfo.astro src/components/PageHero.astro src/pages/contacto.astro src/pages/api/contact.ts astro.config.mjs
git commit -m "feat: add Contact page with form, info sidebar, and Resend API endpoint"
```

---

## Task 9: Final Polish + Build Verification

**Files:**
- Modify: Various (smooth scroll offset, Nav active state on scroll, transitions)

- [ ] **Step 1: Add scroll offset for fixed nav**

Add to `src/styles/global.css`:

```css
html {
  scroll-behavior: smooth;
  scroll-padding-top: 70px;
}
```

- [ ] **Step 2: Add page transition animations**

Add to `src/styles/global.css`:

```css
@media (prefers-reduced-motion: no-preference) {
  .section-padding,
  .objetivos,
  .redil-banner,
  .pilares,
  .photo-grid {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  .section-padding.visible,
  .objetivos.visible,
  .redil-banner.visible,
  .pilares.visible,
  .photo-grid.visible {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Add intersection observer script at the bottom of `src/layouts/Layout.astro` (inside the `<body>`, after `<slot />`):

```html
<script>
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.section-padding, .objetivos, .redil-banner, .pilares, .photo-grid').forEach((el) => {
    observer.observe(el);
  });
</script>
```

- [ ] **Step 3: Run production build**

```bash
npm run build
```

Expected: Build completes successfully with no errors. Static pages generated for `/`, `/merch`, `/contacto`. Server endpoint for `/api/contact`.

- [ ] **Step 4: Preview production build**

```bash
npm run preview
```

Navigate through all pages and verify everything renders correctly.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add scroll offset, entrance animations, and verify production build"
```

---

## Task 10: Vercel Deploy Configuration

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create vercel.json**

Create `vercel.json`:

```json
{
  "framework": "astro"
}
```

- [ ] **Step 2: Verify .env.example is documented**

Confirm `.env.example` exists with the three required variables: `RESEND_API_KEY`, `CONTACT_EMAIL`, `WHATSAPP_NUMBER`.

- [ ] **Step 3: Final commit**

```bash
git add vercel.json
git commit -m "feat: add Vercel deployment configuration"
```

- [ ] **Step 4: Ready for deploy**

The site is ready. To deploy:
1. Push to GitHub
2. Connect repo in Vercel dashboard
3. Set environment variables (RESEND_API_KEY, CONTACT_EMAIL, WHATSAPP_NUMBER)
4. Deploy

---

## Summary

| Task | What it builds | Commit message |
|------|---------------|----------------|
| 1 | Astro scaffold, global CSS, Layout, assets | `feat: scaffold Astro project with global styles, layout, and image assets` |
| 2 | Nav component (desktop + mobile) | `feat: add sticky Nav component with mobile hamburger` |
| 3 | Hero with YouTube video background | `feat: add Hero component with YouTube background video` |
| 4 | Quiénes Somos (SectionHeader, Historia, Objetivos, PhotoStrip) | `feat: add Quiénes Somos section` |
| 5 | REDIL (Banner, Pilares, PhotoGrid, CTA) | `feat: add REDIL section` |
| 6 | Footer | `feat: add Footer component` |
| 7 | Merch page (PageHero, ProductCard, MerchFilter) | `feat: add Merch page with product grid and filtering` |
| 8 | Contact page + Resend API endpoint | `feat: add Contact page with form and Resend API endpoint` |
| 9 | Polish (scroll offset, animations, build verify) | `feat: add scroll offset, entrance animations` |
| 10 | Vercel deploy config | `feat: add Vercel deployment configuration` |
