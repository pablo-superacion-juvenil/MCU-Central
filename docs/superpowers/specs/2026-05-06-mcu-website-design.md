# MCU Website — Design Spec

## Overview

Sitio web para Misión Católica Universitaria (MCU). Movimiento católico juvenil universitario fundado en 1979, auspiciado por la Comunidad Jésed. Lema: "Todo por amor a Cristo".

**Referencia visual:** spo.org — enfoque "Clean & Bold".

## Tech Stack

- **Framework:** Astro (static site generator)
- **Hosting:** Vercel
- **Formulario:** Astro API route + Resend (fallback: WhatsApp directo)
- **Tipografía:** Bebas Neue (títulos), Montserrat (cuerpo) — Google Fonts
- **Íconos:** Lucide icons o similar (lightweight)

## Architecture

**Híbrido:** Single-page scroll para contenido principal + páginas separadas.

```
/                → Portada (Hero + Quiénes Somos + REDIL)
/merch           → Catálogo de merch
/contacto        → Formulario de contacto
/api/contact     → Endpoint para envío de emails (Resend)
```

**Navegación:** Nav sticky blanco. Links: Inicio, Nosotros, REDIL (scroll anchors), Contáctanos (página), Merch (página, botón pill rojo). Hamburger menu en mobile.

## Brand

- **Navy oscuro:** #0F1B33 — fondos, texto principal, nav
- **Rojo MCU:** #E63462 — acentos, CTAs, líneas decorativas, llama del logo
- **Blanco:** #FFFFFF — fondo principal
- **Crema:** #F8F6F3 — fondos de inputs, fondos alternos
- **Gris texto:** #555555 — cuerpo de texto

## Assets

Carpeta fuente: `~/OneDrive/Desktop/MCU/Página web/`

- `Logos MCU/Plain All colors.png` — Logo circular completo (nav, favicon)
- `Logos MCU/flame-02.png` — Llama + 1979 (footer, watermarks)
- `Portada/` — 6 fotos para hero fallback y secciones
- `Nosotros/` — 4 fotos para sección Quiénes Somos
- `Redil/` — 7 fotos para sección REDIL
- Video hero: YouTube embed `JKtriWie5H4` (Conferencia Kairós)

## Secciones

### 1. Hero (Portada)

- **Altura:** 100vh
- **Fondo:** Video de YouTube (muted, autoplay, loop) con overlay navy semitransparente `rgba(15,27,51,0.75)`
- **Contenido centrado:**
  - Lema "Todo por amor a Cristo" — Bebas Neue ~80px, uppercase, letter-spacing 6px, blanco
  - Línea roja decorativa (60px × 3px, #E63462)
  - Subtítulo "Misión Católica Universitaria" — Montserrat light, 14px, uppercase, letter-spacing 4px, blanco 70% opacity
- **Scroll indicator:** Flecha animada inferior, desaparece al scroll
- **Fallback:** Si video no carga, mostrar foto de `Portada/` con mismo overlay

### 2. Quiénes Somos

**Header de sección (patrón reutilizable):**
- Etiqueta roja: "Conócenos" — Montserrat 12px, uppercase, letter-spacing 4px, #E63462
- Título: "Quiénes Somos" — Bebas Neue ~48px, uppercase, #0F1B33
- Línea roja: 50px × 3px, centrada

**Historia (layout 50/50):**
- Izquierda: Foto de `Nosotros/` con badge overlay "Desde 1979" (navy, esquina inferior izquierda)
- Derecha: Texto de historia (fundación 1978-1981). Bloque de cita con borde izquierdo rojo para Declaración de Identidad.

**Objetivos (fondo navy):**
- Fondo: #0F1B33
- Subtítulo rojo: "Lo que nos mueve"
- Título blanco: "Nuestros Objetivos"
- 3 columnas: Misionero, Comunitario, Formativo
  - Ícono en círculo rojo (#E63462)
  - Título blanco bold uppercase
  - Descripción blanco 60% opacity
  - En mobile: se apilan verticalmente

**Photo strip:** Tira horizontal de 4 fotos de `Nosotros/`, transición visual.

### 3. REDIL

**Header de sección:** Mismo patrón + tagline itálica: "Equipando líderes misioneros para hacer crecer la misión"

**Banner descriptivo:**
- Fondo: Foto de `Redil/` con overlay navy degradado (izquierda oscuro → derecha claro)
- Izquierda (55%): Título "¿Qué es REDIL?" + texto descriptivo
- Derecha: 2 fotos flotantes con sombra y offset vertical

**3 Pilares (fondo blanco):**
- Subtítulo rojo: "¿Qué haremos?"
- 3 columnas separadas por líneas verticales (#E0E0E0):
  - Capacitarnos (ícono 📚 en círculo con borde navy)
  - Fortalecer nuestra hermandad (ícono 🔥)
  - Encontrarnos con Dios (ícono ✝)
- En mobile: se apilan

**Photo grid:** Grid asimétrico 3 columnas × 2 rows. Primera foto ocupa 2 rows (span). Fotos de `Redil/`.

**CTA:** Botón pill rojo "Quiero participar" → lleva a /contacto

### 4. Merch (página separada: /merch)

**Hero:** Banner navy corto (~30vh) con título "Merch MCU" + línea roja.

**Filtros:** Tabs horizontales — Todo, Playeras, Hoodies, Accesorios. Tab activo: pill navy. Filtrado client-side con JS.

**Product grid:**
- 3 columnas desktop, 2 tablet, 1 mobile
- Componente `ProductCard`:
  - Props: `image`, `name`, `price`, `category`, `whatsappLink`
  - Foto sobre fondo crema, nombre bold, precio gris, botón "Pedir por WhatsApp" rojo
- Datos de productos en archivo `.json` o colección Astro content (escalable a CMS después)

**Escalabilidad:** Componente preparado para agregar `externalLink` prop cuando migren a tienda real.

### 5. Contáctanos (página separada: /contacto)

**Hero:** Banner navy corto con título "Contáctanos" + línea roja.

**Layout 60/40:**

**Formulario (60%):**
- Campos: Nombre, Email, Universidad, Mensaje
- Inputs con fondo crema (#F8F6F3), borde #E8E4DF
- Labels uppercase, gris, Montserrat
- Submit: Botón pill rojo "Enviar mensaje"
- Acción: POST a `/api/contact`

**Info sidebar (40%):**
- Fondo navy (#0F1B33), border-radius 8px
- Datos: Email, Instagram, WhatsApp
- Labels en rojo, valores en blanco 80% opacity
- Íconos de redes sociales al fondo (círculos con borde blanco)

**En mobile:** Sidebar de info se mueve arriba del formulario.

### 6. Footer (global)

- Fondo: #0F1B33
- Logo llama MCU + "1979"
- Links de navegación en blanco
- Redes sociales
- Texto: "Todo por amor a Cristo" + © 2026 MCU

## API: Contact Endpoint

```
POST /api/contact
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "university": "string",
  "message": "string"
}
```

- Validación server-side de campos requeridos
- Envío via Resend a email configurado en env var `CONTACT_EMAIL`
- Rate limiting básico (1 envío por IP cada 60 segundos)
- Response: `{ success: boolean, error?: string }`
- Fallback: Si Resend no está configurado, mostrar botón WhatsApp con mensaje pre-llenado

## Responsive Breakpoints

- **Desktop:** ≥1024px — layouts completos
- **Tablet:** 768px–1023px — grids de 2 columnas, nav compacto
- **Mobile:** <768px — 1 columna, hamburger menu, secciones apiladas

## Performance

- Imágenes optimizadas vía `astro:assets` (WebP, lazy loading)
- Video de YouTube cargado con `lite-youtube-embed` (no carga iframe hasta click/autoplay)
- Fonts: `font-display: swap`, preload de Bebas Neue
- Target: Lighthouse 90+ en todas las categorías

## Astro Project Structure

```
src/
  components/
    Nav.astro
    Hero.astro
    SectionHeader.astro      — componente reutilizable de header
    Historia.astro
    Objetivos.astro
    Redil.astro
    RedilPilares.astro
    PhotoGrid.astro
    ProductCard.astro
    ContactForm.astro
    ContactInfo.astro
    Footer.astro
  layouts/
    Layout.astro              — layout base (head, meta, fonts)
  pages/
    index.astro               — Portada (Hero + Quiénes Somos + REDIL)
    merch.astro               — Catálogo de merch
    contacto.astro            — Formulario de contacto
    api/
      contact.ts              — Endpoint de email
  content/
    products.json             — Datos de productos merch
  assets/
    images/
      logos/                  — Logos MCU
      portada/                — Fotos de portada
      nosotros/               — Fotos de Quiénes Somos
      redil/                  — Fotos de REDIL
      merch/                  — Fotos de productos
  styles/
    global.css                — Variables CSS, reset, tipografía
public/
  favicon.ico
  og-image.jpg                — Open Graph image para social sharing
```
