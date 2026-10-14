// =====================================================================
// Casa Suspiro — tienda de demostración (Nova Sites Studio)
// Catálogo, favoritos, carrito, cupón, checkout, seguimiento y eventos.
// En una tienda real, los productos y pedidos vendrían de una base de datos.
// =====================================================================
(() => {
  "use strict";
  document.documentElement.classList.add("js");

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const dinero = (n) => `RD$ ${Math.round(n).toLocaleString("en-US")}`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const sinTildes = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const telOk = (v) => /^\D*1?\D*(809|829|849)(\D*\d){7}\D*$/.test(v);
  const hoyRD = (dias = 0) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santo_Domingo" }).format(new Date(Date.now() + dias * 864e5));
  const PAGINA = document.body.dataset.pagina;
  const URLP = new URLSearchParams(location.search);

  // ---------------------------------------------------------------
  // CONFIGURACIÓN DE LA TIENDA
  // ---------------------------------------------------------------
  const ENVIO_GRATIS = 5000;
  const CUPONES = { SUSPIRO10: 0.1 };
  const ZONAS = { dn: { t: "Distrito Nacional", p: 250 }, sde: { t: "Santo Domingo Este", p: 350 }, sdo: { t: "Santo Domingo Oeste", p: 350 }, sdn: { t: "Santo Domingo Norte", p: 350 } };
  const CATS = { bizcochos: "Bizcochos", postres: "Postres", picaderas: "Picaderas" };
  const CORAZON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>';

  // ---------------------------------------------------------------
  // PRODUCTOS
  // ---------------------------------------------------------------
  const TAMANO = { n: "Tamaño", v: [{ t: "1 libra" }, { t: "2 libras", p: 1000 }, { t: "3 libras", p: 2000 }] };
  const COLOR = { n: "Color del suspiro", v: [{ t: "Blanco" }, { t: "Rosado" }, { t: "Azul" }, { t: "Lila" }] };
  const BIZ = {
    cat: "bizcochos", mensaje: true, anticipacion: true,
    porciones: "1 libra ≈ 8 porciones · 2 libras ≈ 16 · 3 libras ≈ 24",
    contiene: "Trigo, huevo y leche.",
    conservar: "Refrigerado hasta 3 días. Sácalo 30 minutos antes de servir para que el suspiro esté en su punto.",
  };
  const FRIO = "Refrigerado hasta 4 días, bien tapado.";
  const FRITO = "Se disfrutan mejor el mismo día. Para recalentar: 5 minutos en horno o air fryer a 180 °C.";
  const PRODUCTOS = [
    { id: "biz-vainilla", nombre: "Bizcocho dominicano de vainilla", precio: 1200, etiqueta: "Más vendido", ...BIZ,
      desc: "El clásico de los cumpleaños: húmedo, de vainilla y cubierto de suspiro.",
      largo: "La receta de siempre: bizcocho dominicano bien húmedo, con vainilla y ralladura de limón, relleno a tu gusto y cubierto de suspiro hecho al momento.",
      ingredientes: "Harina de trigo, mantequilla, huevos, azúcar, leche, vainilla y ralladura de limón. Suspiro de claras de huevo y azúcar.",
      opciones: [TAMANO, { n: "Relleno", v: [{ t: "Piña" }, { t: "Guayaba" }, { t: "Dulce de leche" }] }, COLOR] },
    { id: "biz-chocolate", nombre: "Bizcocho de chocolate", precio: 1350, ...BIZ,
      desc: "Chocolate intenso con suspiro de chocolate.",
      largo: "Bizcocho de cacao, esponjoso y húmedo, relleno de dulce de leche o ganache y cubierto con suspiro de chocolate.",
      ingredientes: "Harina de trigo, cacao, mantequilla, huevos, azúcar y leche. Suspiro de claras, azúcar y cacao.",
      opciones: [TAMANO, { n: "Relleno", v: [{ t: "Dulce de leche" }, { t: "Ganache de chocolate" }] }] },
    { id: "biz-redvelvet", nombre: "Bizcocho red velvet", precio: 1500, etiqueta: "Nuevo", ...BIZ,
      desc: "Rojo terciopelo con crema de queso.",
      largo: "Bizcocho red velvet suave, con un toque de cacao, relleno y cubierto con crema de queso. Ideal para aniversarios.",
      ingredientes: "Harina de trigo, cacao, mantequilla, huevos, azúcar, buttermilk y queso crema.",
      opciones: [TAMANO] },
    { id: "biz-zanahoria", nombre: "Bizcocho de zanahoria", precio: 1400, ...BIZ, contiene: "Trigo, huevo, leche y nueces (puedes pedirlo sin nueces).",
      desc: "Con nueces, canela y crema de queso.",
      largo: "Bizcocho de zanahoria con nueces y canela, relleno y cubierto con crema de queso. Menos dulce y muy aromático.",
      ingredientes: "Harina de trigo, zanahoria, nueces, canela, huevos, azúcar, aceite y queso crema.",
      opciones: [TAMANO, { n: "Nueces", v: [{ t: "Con nueces" }, { t: "Sin nueces" }] }] },
    { id: "bento", nombre: "Mini bizcocho (bento)", precio: 850, etiqueta: "Para regalar", ...BIZ, porciones: "2 a 3 porciones · 4 pulgadas",
      desc: "Bizcochito en su cajita, con tu mensaje encima.",
      largo: "Un bizcochito de 4 pulgadas en su cajita, perfecto para sorprender a alguien. Escribimos encima el mensaje que quieras.",
      ingredientes: "Harina de trigo, mantequilla, huevos, azúcar, leche y vainilla. Suspiro de claras y azúcar.",
      opciones: [{ n: "Sabor", v: [{ t: "Vainilla" }, { t: "Chocolate" }] }, COLOR] },
    { id: "cupcakes", nombre: "Cupcakes con suspiro", precio: 750, cat: "bizcochos", porciones: "Caja de 6 o de 12",
      desc: "Decorados con suspiro y chispitas, en caja de regalo.",
      largo: "Cupcakes de bizcocho dominicano con suspiro y chispitas de colores, en caja con ventana lista para regalar.",
      ingredientes: "Harina de trigo, mantequilla, huevos, azúcar, leche y vainilla o cacao. Suspiro de claras y azúcar.",
      contiene: "Trigo, huevo y leche.", conservar: "Mejor el mismo día. Refrigerados hasta 2 días.",
      opciones: [{ n: "Sabor", v: [{ t: "Vainilla" }, { t: "Chocolate" }, { t: "Mixto" }] }, { n: "Caja", v: [{ t: "6 unidades" }, { t: "12 unidades", p: 700 }] }] },
    { id: "flan", nombre: "Flan de coco", precio: 650, cat: "postres", etiqueta: "Favorito", porciones: "Entero · 8 porciones",
      desc: "Cremoso, con coco rallado y caramelo.",
      largo: "Flan cremoso de leche y coco rallado, con su caramelo dorado. Viene entero en su molde, listo para desmoldar.",
      ingredientes: "Leche evaporada, leche condensada, huevos, coco rallado, azúcar y vainilla.", contiene: "Huevo y leche.", conservar: FRIO },
    { id: "tres-leches", nombre: "Tres leches", precio: 250, cat: "postres", porciones: "Porción o bandeja de 12",
      desc: "Bien mojadito, con canela.",
      largo: "Bizcocho esponjoso bañado en tres leches, cubierto con suspiro y un toque de canela.",
      ingredientes: "Harina de trigo, huevos, azúcar, leche evaporada, leche condensada, crema de leche y canela.", contiene: "Trigo, huevo y leche.", conservar: FRIO,
      opciones: [{ n: "Tamaño", v: [{ t: "Porción" }, { t: "Bandeja (12 porciones)", p: 2350 }] }] },
    { id: "dulce-leche", nombre: "Dulce de leche cortada", precio: 350, cat: "postres", porciones: "Frasco de 16 onzas",
      desc: "Receta de la abuela, con canela y limón.",
      largo: "El dulce de leche cortada de toda la vida, con su textura granulada, canela y un toque de limón.",
      ingredientes: "Leche, azúcar, limón, canela y clavo dulce.", contiene: "Leche.", conservar: FRIO },
    { id: "majarete", nombre: "Majarete de maíz", precio: 300, cat: "postres", porciones: "Frasco de 12 onzas",
      desc: "Cremoso, de maíz tierno y canela.",
      largo: "Majarete hecho con maíz tierno, leche y canela por encima. Suave y no muy dulce.",
      ingredientes: "Maíz tierno, leche, leche de coco, azúcar, canela y vainilla.", contiene: "Leche.", conservar: FRIO },
    { id: "arroz-leche", nombre: "Arroz con leche", precio: 250, cat: "postres", porciones: "Vaso de 12 onzas",
      desc: "Con pasas y canela, como en casa.",
      largo: "Arroz con leche cremoso, con pasas, canela y cáscara de limón.",
      ingredientes: "Arroz, leche, leche evaporada, azúcar, pasas, canela y limón.", contiene: "Leche.", conservar: FRIO },
    { id: "habichuelas", nombre: "Habichuelas con dulce", precio: 450, cat: "postres", etiqueta: "Temporada", porciones: "1 litro",
      desc: "Con galletitas y pasas. Solo en Cuaresma.",
      largo: "Habichuelas con dulce tradicionales, con batata, pasas y galletitas de leche aparte para que no se ablanden.",
      ingredientes: "Habichuelas rojas, leche de coco, leche evaporada, batata, azúcar, pasas, canela y clavo dulce.", contiene: "Leche y trigo (galletitas).", conservar: FRIO },
    { id: "picaderas", nombre: "Bandeja de picaderas", precio: 1800, cat: "picaderas", anticipacion: true, porciones: "30, 50 o 100 piezas",
      desc: "Pastelitos, quipes y croquetas para tu fiesta.",
      largo: "Bandeja surtida de pastelitos, quipes, croquetas y bolitas de queso, recién fritas y listas para servir.",
      ingredientes: "Harina de trigo, trigo bulgur, carne de res, pollo, queso, cebolla y especias. Fritos en aceite vegetal.", contiene: "Trigo, leche y huevo.", conservar: FRITO,
      opciones: [{ n: "Tamaño", v: [{ t: "30 piezas" }, { t: "50 piezas", p: 1200 }, { t: "100 piezas", p: 3600 }] }] },
    { id: "pastelitos", nombre: "Pastelitos", precio: 600, cat: "picaderas", porciones: "Docena",
      desc: "Docena crujiente, recién frita.",
      largo: "Doce pastelitos de masa crujiente con el relleno que prefieras.",
      ingredientes: "Harina de trigo, mantequilla, relleno de pollo, res o queso y especias.", contiene: "Trigo y leche.", conservar: FRITO,
      opciones: [{ n: "Relleno", v: [{ t: "Pollo" }, { t: "Res" }, { t: "Queso" }] }] },
    { id: "quipes", nombre: "Quipes", precio: 650, cat: "picaderas", porciones: "Docena",
      desc: "De res, dorados por fuera y jugosos por dentro.",
      largo: "Doce quipes de trigo bulgur rellenos de carne de res sazonada, fritos al momento.",
      ingredientes: "Trigo bulgur, carne de res, cebolla, hierbabuena y especias.", contiene: "Trigo.", conservar: FRITO },
    { id: "croquetas", nombre: "Croquetas de pollo", precio: 550, cat: "picaderas", porciones: "Docena",
      desc: "Cremosas por dentro, crujientes por fuera.",
      largo: "Doce croquetas de pollo con bechamel, empanizadas y fritas al momento.",
      ingredientes: "Pollo, leche, harina de trigo, mantequilla, pan rallado, huevo y especias.", contiene: "Trigo, huevo y leche.", conservar: FRITO },
  ];
  const porId = Object.fromEntries(PRODUCTOS.map((p) => [p.id, p]));

  // ---------------------------------------------------------------
  // DATOS GUARDADOS EN ESTE NAVEGADOR
  // ---------------------------------------------------------------
  const leer = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };
  let carrito = leer("cs-carrito", []).filter((l) => l && porId[l.id]);
  let favs = leer("cs-favs", []).filter((id) => porId[id]);
  let cupon = leer("cs-cupon", "");
  const pedidos = () => leer("cs-pedidos", []);

  const extra = (p, op) => (p.opciones || []).reduce((s, o) => s + ((o.v.find((v) => v.t === op?.[o.n]) || {}).p || 0), 0);
  const precioLinea = (l) => (porId[l.id].precio + extra(porId[l.id], l.op)) * l.cant;
  const subtotal = () => carrito.reduce((s, l) => s + precioLinea(l), 0);
  const unidades = () => carrito.reduce((s, l) => s + l.cant, 0);
  function totales(envioZona = null) {
    const sub = subtotal();
    const desc = Math.round(sub * (CUPONES[cupon] || 0));
    const base = sub - desc;
    const envio = envioZona === null ? null : base >= ENVIO_GRATIS ? 0 : envioZona;
    return { sub, desc, base, envio, total: base + (envio || 0) };
  }
  function agregar(id, op, cant, mensaje = "") {
    const clave = id + JSON.stringify(op) + mensaje;
    const ya = carrito.find((l) => l.clave === clave);
    if (ya) ya.cant = Math.min(50, ya.cant + cant); else carrito.push({ clave, id, op, cant, mensaje });
    guardar("cs-carrito", carrito);
    pintar(true);
  }

  // ---------------------------------------------------------------
  // PIEZAS DE INTERFAZ
  // ---------------------------------------------------------------
  const foto = (p, clase = "") => `<figure class="foto ${clase}" data-label="${p.nombre}"><img src="images/${p.id}.jpg" alt="${p.nombre}" loading="lazy"></figure>`;
  function activarFotos(raiz = document) {
    $$(".foto img", raiz).forEach((img) => {
      const marcar = () => img.closest(".foto").classList.add("vacia");
      if (img.complete && img.naturalWidth === 0) marcar();
      img.addEventListener("error", marcar, { once: true });
    });
  }
  const conOpciones = (p) => !!(p.opciones || p.mensaje);
  const desde = (p) => ((p.opciones || []).some((o) => o.v.some((v) => v.p)) ? "<small>desde </small>" : "");
  const enlace = (p) => `producto.html?id=${p.id}`;
  function tarjeta(p, i = 0) {
    return `<article class="prod" style="animation-delay:${(i % 8) * 50}ms">
      <div class="prod-media">
        <a class="prod-link" href="${enlace(p)}" tabindex="-1" aria-hidden="true">${p.etiqueta ? `<span class="etiqueta">${p.etiqueta}</span>` : ""}${foto(p)}</a>
        <button class="fav" type="button" data-fav="${p.id}" aria-pressed="${favs.includes(p.id)}" aria-label="Guardar ${p.nombre} en favoritos">${CORAZON}</button>
      </div>
      <div class="prod-info">
        <p class="prod-cat">${CATS[p.cat]}</p>
        <h3><a href="${enlace(p)}">${p.nombre}</a></h3>
        <p class="prod-desc">${p.desc}</p>
        <div class="prod-pie"><span class="precio">${desde(p)}${dinero(p.precio)}</span>
          ${conOpciones(p) ? `<a class="mini" href="${enlace(p)}">Elegir</a>` : `<button class="mini" type="button" data-rapido="${p.id}">Agregar</button>`}</div>
      </div>
    </article>`;
  }
  const detalle = (l) => [...Object.values(l.op || {}), l.mensaje ? `“${esc(l.mensaje)}”` : ""].filter(Boolean).join(" · ");
  function lineasHTML(editable) {
    if (!carrito.length) return `<div class="vacio"><div class="icono" aria-hidden="true">🧁</div><p>Tu carrito está vacío.</p>${editable ? '<a class="btn btn-cereza" href="tienda.html">Ir a la tienda</a>' : ""}</div>`;
    return carrito.map((l, i) => {
      const p = porId[l.id];
      return `<div class="linea">${foto(p)}
        <div><h3><a href="${enlace(p)}">${p.nombre}</a></h3>${detalle(l) ? `<p class="detalle">${detalle(l)}</p>` : ""}
          ${editable ? `<div class="cantidad"><button type="button" data-menos="${i}" aria-label="Quitar uno">−</button><output>${l.cant}</output><button type="button" data-mas="${i}" aria-label="Agregar uno">+</button></div>` : `<p class="detalle">Cantidad: ${l.cant}</p>`}
        </div>
        <div class="linea-der"><span class="precio"><b>${dinero(precioLinea(l))}</b></span>${editable ? `<button class="quitar" type="button" data-quitar="${i}">Quitar</button>` : ""}</div>
      </div>`;
    }).join("");
  }
  function barraEnvio() {
    const { base } = totales();
    const falta = ENVIO_GRATIS - base;
    const p = Math.min(100, (base / ENVIO_GRATIS) * 100);
    return `<div class="envio-barra"><p>${falta > 0 ? `Te faltan <b>${dinero(falta)}</b> para el <b>delivery gratis</b>.` : "¡Tu pedido tiene <b>delivery gratis</b>! 🎉"}</p><div class="barra"><i style="--p:${p}%"></i></div></div>`;
  }

  const toast = $("#toast");
  let tt;
  function aviso(m) { toast.textContent = m; toast.classList.add("ver"); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("ver"), 3400); }

  // Aparición al hacer scroll
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visto"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" })
    : null;
  const revelar = (r = document) => $$(".revela:not(.visto)", r).forEach((el) => (io ? io.observe(el) : el.classList.add("visto")));

  // Validación de formularios
  function validar(form) {
    let primero = null;
    $$("[required]", form).forEach((c) => {
      if (c.closest("[hidden]")) { c.removeAttribute("aria-invalid"); return; }
      const v = c.value.trim();
      let ok = v !== "";
      if (ok && c.type === "tel") ok = telOk(v);
      if (ok && c.type === "email") ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && c.type === "date" && c.min) ok = v >= c.min;
      if (ok && c.type === "number" && c.min) ok = Number(v) >= Number(c.min);
      c.setAttribute("aria-invalid", String(!ok));
      if (!ok && !primero) primero = c;
    });
    const m = $(".msg[role=alert]", form);
    if (m) m.textContent = primero ? "Revisa los campos marcados en rojo." : "";
    primero?.focus();
    return !primero;
  }

  // ---------------------------------------------------------------
  // ENCABEZADO: menú móvil, buscador y carrito lateral
  // ---------------------------------------------------------------
  const burger = $(".burger"), menuM = $("#menu-movil");
  function menu(abrir) { if (!burger) return; menuM.hidden = !abrir; burger.setAttribute("aria-expanded", String(abrir)); burger.classList.toggle("x", abrir); }
  burger?.addEventListener("click", () => menu(menuM.hidden));

  const busc = $("#buscador");
  function buscador(abrir) { if (!busc) return; busc.hidden = !abrir; document.body.classList.toggle("bloqueado", abrir); if (abrir) $("input", busc).focus(); }
  busc?.addEventListener("click", (e) => { if (e.target === busc) buscador(false); });

  const panel = $("#panel"), velo = $("#panel-velo");
  function carritoLateral(abrir) {
    if (!panel) { if (abrir) location.href = "carrito.html"; return; }
    panel.classList.toggle("abierto", abrir); velo.classList.toggle("ver", abrir);
    panel.setAttribute("aria-hidden", String(!abrir)); panel.inert = !abrir;
    document.body.classList.toggle("bloqueado", abrir);
    if (abrir) setTimeout(() => $(".cerrar", panel).focus(), 60);
  }
  if (panel) panel.inert = true;

  const alPintar = [];
  let alCambiarFavs = null;
  function pintar(salto = false) {
    $$('[data-contador="carrito"]').forEach((c) => {
      const n = unidades(); c.textContent = n; c.hidden = !n;
      if (salto) { c.classList.remove("salta"); void c.offsetWidth; c.classList.add("salta"); }
    });
    $$('[data-contador="favs"]').forEach((c) => { c.textContent = favs.length; c.hidden = !favs.length; });
    const l = $("#lineas");
    if (l) { l.innerHTML = lineasHTML(true); activarFotos(l); }
    $$("[data-subtotal]").forEach((e) => (e.textContent = dinero(subtotal())));
    $$("[data-envio]").forEach((e) => (e.innerHTML = carrito.length ? barraEnvio() : ""));
    $$(".panel-pie").forEach((e) => (e.hidden = !carrito.length));
    alPintar.forEach((f) => f());
  }

  document.addEventListener("click", (e) => {
    const t = e.target;
    const ln = t.closest("[data-mas],[data-menos],[data-quitar]");
    if (ln) {
      const i = Number(ln.dataset.mas ?? ln.dataset.menos ?? ln.dataset.quitar);
      if (!carrito[i]) return;
      if (ln.dataset.mas !== undefined) carrito[i].cant = Math.min(50, carrito[i].cant + 1);
      if (ln.dataset.menos !== undefined) carrito[i].cant--;
      if (ln.dataset.quitar !== undefined || carrito[i].cant < 1) carrito.splice(i, 1);
      guardar("cs-carrito", carrito); pintar(false);
      return;
    }
    const rap = t.closest("[data-rapido]");
    if (rap) {
      agregar(rap.dataset.rapido, {}, 1);
      rap.textContent = "✓ Listo"; setTimeout(() => (rap.textContent = "Agregar"), 1300);
      aviso(`${porId[rap.dataset.rapido].nombre} se agregó al carrito.`);
      return;
    }
    const fav = t.closest("[data-fav]");
    if (fav) {
      const id = fav.dataset.fav, on = !favs.includes(id);
      favs = on ? [...favs, id] : favs.filter((x) => x !== id);
      guardar("cs-favs", favs);
      $$(`[data-fav="${id}"]`).forEach((b) => b.setAttribute("aria-pressed", String(on)));
      aviso(on ? "Guardado en tus favoritos ♥" : "Quitado de tus favoritos");
      pintar(false); alCambiarFavs?.();
      return;
    }
    const demo = t.closest("[data-demo]");
    if (demo) { e.preventDefault(); aviso(demo.dataset.demo); return; }
    if (t.closest("[data-buscar]")) { buscador(true); return; }
    if (t.closest("[data-abrir-carrito]")) { carritoLateral(true); return; }
    if (t.closest("[data-cerrar-carrito]")) { carritoLateral(false); return; }
    if (t.closest("[data-ir-pagar]") && !carrito.length) { e.preventDefault(); aviso("Agrega al menos un producto para continuar."); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (busc && !busc.hidden) buscador(false);
    else if (panel?.classList.contains("abierto")) carritoLateral(false);
    else if (menuM && !menuM.hidden) menu(false);
  });

  // ---------------------------------------------------------------
  // INICIO
  // ---------------------------------------------------------------
  if (PAGINA === "inicio") {
    const d = $("#destacados");
    d.innerHTML = ["biz-vainilla", "cupcakes", "flan", "picaderas"].map((id, i) => tarjeta(porId[id], i)).join("");
    activarFotos(d);
    $$("[data-cuenta]").forEach((e) => { e.textContent = `${PRODUCTOS.filter((p) => p.cat === e.dataset.cuenta).length} productos`; });
    const f = $("#boletin");
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validar(f)) { $("#boletin-msg").textContent = "Escribe un correo válido."; return; }
      f.hidden = true;
      $("#boletin-msg").className = "msg ok";
      $("#boletin-msg").innerHTML = `¡Bienvenido al Club Suspiro! Tu código es:<br><span class="codigo">SUSPIRO10</span>`;
    });
  }

  // ---------------------------------------------------------------
  // TIENDA
  // ---------------------------------------------------------------
  if (PAGINA === "tienda") {
    let filtro = URLP.get("fav") ? "favs" : CATS[URLP.get("cat")] ? URLP.get("cat") : "todo";
    let q = URLP.get("q") || "";
    let orden = "destacados";
    const grid = $("#grid"), qIn = $("#q");
    qIn.value = q;
    function catalogo() {
      const nq = sinTildes(q.trim());
      let lista = PRODUCTOS.filter((p) =>
        (filtro === "todo" || (filtro === "favs" ? favs.includes(p.id) : p.cat === filtro)) &&
        (!nq || sinTildes(`${p.nombre} ${p.desc} ${CATS[p.cat]}`).includes(nq)));
      if (orden === "menor") lista = [...lista].sort((a, b) => a.precio - b.precio);
      if (orden === "mayor") lista = [...lista].sort((a, b) => b.precio - a.precio);
      grid.innerHTML = lista.map(tarjeta).join("");
      activarFotos(grid);
      $("#conteo").textContent = `${lista.length} ${lista.length === 1 ? "producto" : "productos"}${nq ? ` para “${q.trim()}”` : ""}`;
      $("#sin-resultados").hidden = lista.length > 0;
      $("#sin-resultados p").textContent = filtro === "favs" && !nq ? "Todavía no tienes favoritos. Toca el ♥ en cualquier producto para guardarlo." : "No encontramos productos con esa búsqueda.";
      $$(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.cat === filtro)));
    }
    alCambiarFavs = () => { if (filtro === "favs") catalogo(); };
    $$(".chip").forEach((c) => c.addEventListener("click", () => { filtro = c.dataset.cat; catalogo(); }));
    qIn.addEventListener("input", () => { q = qIn.value; catalogo(); });
    $("#orden").addEventListener("change", (e) => { orden = e.target.value; catalogo(); });
    $("#limpiar").addEventListener("click", () => { filtro = "todo"; q = ""; qIn.value = ""; catalogo(); });
    catalogo();
  }

  // ---------------------------------------------------------------
  // PÁGINA DE PRODUCTO
  // ---------------------------------------------------------------
  if (PAGINA === "producto") {
    const p = porId[URLP.get("id")] || PRODUCTOS[0];
    document.title = `${p.nombre} · Casa Suspiro`;
    $("#migas").innerHTML = `<a href="index.html">Inicio</a><span>/</span><a href="tienda.html">Tienda</a><span>/</span><a href="tienda.html?cat=${p.cat}">${CATS[p.cat]}</a><span>/</span><span aria-current="page">${p.nombre}</span>`;
    const ops = (p.opciones || []).map((o, oi) => `
      <fieldset class="opcion"><legend>${o.n}</legend><div class="valores">
        ${o.v.map((v, vi) => `<label><input type="radio" name="op${oi}" value="${v.t}" ${vi === 0 ? "checked" : ""}><span>${v.t}${v.p ? `<small>+${dinero(v.p)}</small>` : ""}</span></label>`).join("")}
      </div></fieldset>`).join("");
    $("#producto").innerHTML = `
      <div class="pp-media">${p.etiqueta ? `<span class="etiqueta">${p.etiqueta}</span>` : ""}${foto(p, "zoomable")}
        <button class="fav fav-grande" type="button" data-fav="${p.id}" aria-pressed="${favs.includes(p.id)}" aria-label="Guardar en favoritos">${CORAZON}</button>
      </div>
      <form class="pp-info" id="pp-form" novalidate>
        <p class="prod-cat">${CATS[p.cat]}</p>
        <h1>${p.nombre}</h1>
        <p class="pp-precio precio" id="pp-precio">${dinero(p.precio)}</p>
        <p class="pp-desc">${p.largo}</p>
        ${p.porciones ? `<p class="pp-meta"><span>${p.porciones}</span></p>` : ""}
        ${ops}
        ${p.mensaje ? `<div class="campo"><label for="pp-msg">Mensaje en el bizcocho (opcional)</label><input id="pp-msg" maxlength="30" placeholder="Feliz cumpleaños, Ana" autocomplete="off"><span class="ayuda"><span id="pp-cuenta">0</span>/30 letras</span></div>` : ""}
        <div class="pp-botones">
          <div class="cantidad"><button type="button" data-q="-1" aria-label="Menos">−</button><output id="pp-cant">1</output><button type="button" data-q="1" aria-label="Más">+</button></div>
          <button class="btn btn-cereza" type="submit" id="pp-agregar">Agregar al carrito</button>
          <button class="btn btn-borde ancho" type="button" id="pp-comprar">Comprar ahora</button>
        </div>
        <ul class="pp-garantias">
          <li><b>${p.anticipacion ? "Pídelo con 24 h" : "Disponible hoy"}</b>${p.anticipacion ? "Lo hacemos para tu fecha" : "Pidiendo antes de las 3:00 pm"}</li>
          <li><b>Delivery</b>Gratis desde ${dinero(ENVIO_GRATIS)}</li>
          <li><b>Pagas al confirmar</b>Transferencia, efectivo o tarjeta</li>
        </ul>
        <div class="acordeon">
          <details open><summary>Ingredientes</summary><p>${p.ingredientes}<br><b>Contiene:</b> ${p.contiene}</p></details>
          <details><summary>Conservación</summary><p>${p.conservar}</p></details>
          <details><summary>Entrega</summary><p>Recógelo gratis en la tienda o recíbelo en el Gran Santo Domingo desde RD$ 250 (gratis desde ${dinero(ENVIO_GRATIS)}). Eliges el día y la hora al pagar.</p></details>
        </div>
      </form>`;
    const form = $("#pp-form");
    activarFotos($("#producto"));
    let cant = 1;
    const leerOp = () => Object.fromEntries((p.opciones || []).map((o, oi) => [o.n, $(`input[name="op${oi}"]:checked`, form).value]));
    const actualizar = () => {
      const total = dinero(precioLinea({ id: p.id, op: leerOp(), cant }));
      $("#pp-cant").textContent = cant; $("#pp-precio").textContent = total; $("#pb-precio").textContent = total;
    };
    form.addEventListener("change", actualizar);
    $$("[data-q]", form).forEach((b) => b.addEventListener("click", () => { cant = Math.max(1, Math.min(20, cant + Number(b.dataset.q))); actualizar(); }));
    $("#pp-msg")?.addEventListener("input", (e) => ($("#pp-cuenta").textContent = e.target.value.length));
    const meter = () => agregar(p.id, leerOp(), cant, ($("#pp-msg")?.value || "").trim());
    form.addEventListener("submit", (e) => {
      e.preventDefault(); meter();
      const b = $("#pp-agregar"); b.classList.add("hecho"); b.textContent = "Agregado ✓";
      setTimeout(() => { b.classList.remove("hecho"); b.textContent = "Agregar al carrito"; carritoLateral(true); }, 700);
    });
    $("#pp-comprar").addEventListener("click", () => { meter(); location.href = "checkout.html"; });

    const z = $(".zoomable");
    z.addEventListener("mousemove", (e) => {
      const r = z.getBoundingClientRect();
      z.style.setProperty("--zx", `${((e.clientX - r.left) / r.width) * 100}%`);
      z.style.setProperty("--zy", `${((e.clientY - r.top) / r.height) * 100}%`);
      z.classList.add("zoom");
    });
    z.addEventListener("mouseleave", () => z.classList.remove("zoom"));

    $("#pb-nombre").textContent = p.nombre;
    const barra = $("#pp-barra");
    if (io) new IntersectionObserver(([en]) => barra.classList.toggle("ver", !en.isIntersecting && en.boundingClientRect.top < 0)).observe($("#pp-agregar"));
    $("#pb-agregar").addEventListener("click", () => form.requestSubmit());
    actualizar();

    const rel = [...PRODUCTOS.filter((x) => x.cat === p.cat && x.id !== p.id), ...PRODUCTOS.filter((x) => x.cat !== p.cat)].slice(0, 4);
    $("#relacionados").innerHTML = rel.map(tarjeta).join("");
    activarFotos($("#relacionados"));
  }

  // ---------------------------------------------------------------
  // CARRITO
  // ---------------------------------------------------------------
  if (PAGINA === "carrito") {
    alPintar.push(() => {
      const vacio = !carrito.length;
      $("#carrito-pag").hidden = vacio; $("#carrito-vacio").hidden = !vacio;
      const l = $("#c-lineas"); l.innerHTML = lineasHTML(true); activarFotos(l);
      const t = totales();
      $("#c-sub").textContent = dinero(t.sub);
      $("#c-desc-fila").hidden = !t.desc;
      $("#c-desc-nombre").textContent = cupon;
      $("#c-desc").textContent = `− ${dinero(t.desc)}`;
      $("#c-total").textContent = dinero(t.base);
      $("#c-envio").innerHTML = barraEnvio();
      $("#cupon").hidden = !!CUPONES[cupon];
      $("#cupon-activo").hidden = !CUPONES[cupon];
    });
    $("#cupon").addEventListener("submit", (e) => {
      e.preventDefault();
      const v = $("#cupon-in").value.trim().toUpperCase(), m = $("#cupon-msg");
      if (CUPONES[v]) { cupon = v; guardar("cs-cupon", cupon); m.className = "msg ok"; m.textContent = `¡Listo! ${v} te da ${CUPONES[v] * 100}% de descuento.`; }
      else { m.className = "msg"; m.textContent = v ? "Ese código no es válido. Prueba con SUSPIRO10." : "Escribe un código."; }
      pintar(false);
    });
    $("#quitar-cupon").addEventListener("click", () => { cupon = ""; guardar("cs-cupon", ""); $("#cupon-msg").textContent = ""; $("#cupon-in").value = ""; pintar(false); });
  }

  // ---------------------------------------------------------------
  // CHECKOUT
  // ---------------------------------------------------------------
  if (PAGINA === "checkout") {
    const form = $("#form-pago");
    const conEnvio = () => $('input[name="entrega"]:checked', form).value === "delivery";
    const precioZona = () => (conEnvio() ? ZONAS[$("#zona").value]?.p ?? 250 : 0);
    alPintar.push(() => {
      const r = $("#resumen-lineas"); r.innerHTML = lineasHTML(false); activarFotos(r);
      const t = totales(precioZona());
      $("#r-sub").textContent = dinero(t.sub);
      $("#r-desc-fila").hidden = !t.desc;
      $("#r-desc").textContent = `− ${dinero(t.desc)}`;
      $("#r-envio").textContent = !conEnvio() ? "Recoges en tienda" : t.envio ? dinero(t.envio) : "Gratis";
      $("#r-total").textContent = dinero(t.total);
      $("#vacio-aviso").hidden = carrito.length > 0;
      form.hidden = !carrito.length;
    });
    const anticip = carrito.some((l) => porId[l.id].anticipacion);
    $("#fecha").min = hoyRD(anticip ? 1 : 0);
    $("#fecha-ayuda").textContent = anticip ? "Tu pedido lleva bizcocho o bandeja: a partir de mañana." : "Puede ser para hoy mismo.";
    form.addEventListener("change", () => { $("#bloque-dir").hidden = !conEnvio(); pintar(false); });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validar(form)) return;
      const t = totales(precioZona());
      const num = `CS-${Math.floor(1000 + Math.random() * 9000)}`;
      const pedido = {
        num, creado: Date.now(),
        entrega: conEnvio() ? "delivery" : "recoger", zona: conEnvio() ? ZONAS[$("#zona").value].t : "",
        fecha: $("#fecha").value, hora: $("#hora").value,
        lineas: carrito.map((l) => ({ nombre: porId[l.id].nombre, detalle: detalle(l), cant: l.cant, total: precioLinea(l) })),
        total: t.total,
      };
      guardar("cs-pedidos", [pedido, ...pedidos()].slice(0, 20));
      carrito = []; cupon = ""; guardar("cs-carrito", carrito); guardar("cs-cupon", "");
      $("#num-pedido").textContent = num;
      $("#total-final").textContent = dinero(t.total);
      $("#ir-rastreo").href = `seguimiento.html?n=${num}`;
      $("#paso-pago").hidden = true; $("#confirmado").hidden = false;
      pintar(false);
      scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ---------------------------------------------------------------
  // SEGUIMIENTO DEL PEDIDO
  // ---------------------------------------------------------------
  if (PAGINA === "seguimiento") {
    const EJEMPLO = {
      num: "CS-1234", creado: Date.now() - 5 * 60000, entrega: "delivery", zona: "Distrito Nacional", fecha: hoyRD(0), hora: "3:00 – 5:00 pm",
      lineas: [{ nombre: "Bizcocho dominicano de vainilla", detalle: "2 libras · Piña · Rosado · “Feliz cumple, Ana”", cant: 1, total: 2200 }, { nombre: "Cupcakes con suspiro", detalle: "Vainilla · 6 unidades", cant: 1, total: 750 }],
      total: 3200,
    };
    const fechaBonita = (v) => new Intl.DateTimeFormat("es-DO", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${v}T12:00:00Z`));
    function mostrar(texto) {
      const solo = texto.replace(/\D/g, ""), num = `CS-${solo}`;
      const ped = num === EJEMPLO.num ? EJEMPLO : pedidos().find((x) => x.num === num);
      const msg = $("#rastreo-msg"), res = $("#rastreo-res");
      if (!ped) { msg.textContent = solo ? `No encontramos el pedido ${num}. Revisa el número.` : "Escribe tu número de pedido."; res.innerHTML = ""; return; }
      msg.textContent = "";
      const pasos = [
        ["Pedido recibido", "Te llegó la confirmación"], ["Confirmado", "La repostera revisó tu pedido"],
        ["En el horno", "Lo estamos preparando"], ["Decorando", "Los últimos detalles"],
        ped.entrega === "delivery" ? ["En camino", "El mensajero va hacia ti"] : ["Listo para recoger", "Te esperamos en la tienda"],
        ["Entregado", "¡Buen provecho!"],
      ];
      const idx = Math.min(1 + Math.floor((Date.now() - ped.creado) / 120000), pasos.length - 2);
      res.innerHTML = `<article class="pedido-card">
        <div class="pedido-head"><div><p class="prod-cat">Pedido</p><h2>${ped.num}</h2></div><span class="pedido-estado">${pasos[idx][0]}</span></div>
        <p class="ayuda">${ped.entrega === "delivery" ? `Delivery · ${esc(ped.zona)}` : "Recoger en tienda"} · ${fechaBonita(ped.fecha)}, ${esc(ped.hora)}</p>
        <ol class="linea-tiempo">${pasos.map((s, i) => `<li class="${i < idx ? "hecho" : i === idx ? "actual" : ""}"><span class="punto">${i < idx ? "✓" : i + 1}</span><div><strong>${s[0]}</strong><small>${s[1]}</small></div></li>`).join("")}</ol>
        <div class="pedido-lineas">${ped.lineas.map((l) => `<div class="fila"><span>${l.cant} × ${esc(l.nombre)}${l.detalle ? `<small>${l.detalle}</small>` : ""}</span><span>${dinero(l.total)}</span></div>`).join("")}
          <div class="fila total"><span>Total</span><span>${dinero(ped.total)}</span></div></div>
        <p class="aviso-pago">Demostración: el estado avanza solo cada 2 minutos para que veas cómo funciona. En la tienda real lo actualiza la repostera.</p>
      </article>`;
    }
    const inp = $("#n");
    $("#rastreo").addEventListener("submit", (e) => { e.preventDefault(); mostrar(inp.value); });
    $("[data-ejemplo]").addEventListener("click", () => { inp.value = "CS-1234"; mostrar(inp.value); });
    if (URLP.get("n")) { inp.value = URLP.get("n"); mostrar(inp.value); }
  }

  // ---------------------------------------------------------------
  // EVENTOS
  // ---------------------------------------------------------------
  if (PAGINA === "eventos") {
    const f = $("#form-evento");
    $("#ev-fecha").min = hoyRD(7);
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validar(f)) return;
      f.hidden = true; $("#evento-ok").hidden = false;
      $("#evento-ok").scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  pintar(false);
  activarFotos();
  revelar();
})();
