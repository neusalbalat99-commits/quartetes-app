let usuariActual = "NeusBM";

console.log("APP CARREGADA");

const API_URL =
    "https://script.google.com/macros/s/AKfycbwSPX3Q0x-IXjYj960yyHpSVpjOxxWNl9I0S1O0rsX2TSjjJ6JOGYUgR_pkOfx7L6QDwg/exec";

let datos = [];

let idEditant = null;


// =========================================================
// CARREGAR DADES
// =========================================================

async function cargarDatos() {

    try {

        console.log("▶️ carregant API...");

        const res = await fetch(API_URL);

        const data = await res.json();

        console.log("📦 RAW:", data);


        if (!Array.isArray(data)) {

            throw new Error(
                "API no retorna array"
            );

        }


        datos = data.map(r => ({

            id: r.id,

            quarteta:
                r.quarteta || "",

            tema:
                r.tema || "",

            subtema:
                r.subtema || ""

        }));


        console.log(
            "✅ OK:",
            datos.length
        );


        omplirTemes();

        actualitzarLlista();


    } catch (err) {

        console.error(
            "❌ ERROR:",
            err
        );

    }

}


// =========================================================
// OMPLIR TEMES
// =========================================================

function omplirTemes() {

    const temes = [
        ...new Set(
            datos
                .map(d =>
                    (d.tema || "")
                        .trim()
                )
                .filter(Boolean)
        )
    ].sort(
        (a, b) =>
            a.localeCompare(b)
    );


    // FILTRE DEL LLISTAT

    const filtroTema =
        document.getElementById(
            "filtroTema"
        );


    if (filtroTema) {

        const seleccionat =
            filtroTema.value;


        filtroTema.innerHTML =
            `<option value="">Tema</option>` +
            temes
                .map(tema =>
                    `<option value="${tema}">
                        ${tema}
                    </option>`
                )
                .join("");


        if (
            temes.includes(
                seleccionat
            )
        ) {

            filtroTema.value =
                seleccionat;

        }

    }


    // SELECTOR DEL FORMULARI

    const nouTema =
        document.getElementById(
            "nouTema"
        );


    if (nouTema) {

        const seleccionat =
            nouTema.value;


        nouTema.innerHTML =
            `<option value="">
                Tria un tema
            </option>` +

            temes
                .map(tema =>
                    `<option value="${tema}">
                        ${tema}
                    </option>`
                )
                .join("") +

            `<option value="__altre__">
                ➕ Altre tema
            </option>`;


        if (
            temes.includes(
                seleccionat
            ) ||
            seleccionat ===
            "__altre__"
        ) {

            nouTema.value =
                seleccionat;

        }

    }

}


// =========================================================
// QUARTETA ALEATÒRIA
// =========================================================

function mostrarAleatoria() {

    if (!datos.length) {
        return;
    }


    const r =
        datos[
            Math.floor(
                Math.random() *
                datos.length
            )
        ];


    const resultat =
        document.getElementById(
            "resultado"
        );


    if (!resultat) {
        return;
    }


    resultat.innerHTML = `

        <div class="tema">
            ${r.tema || ""}
        </div>

        <div class="subtema">
            ${r.subtema || ""}
        </div>

        <p>
            ${r.quarteta || ""}
        </p>

    `;

}


// =========================================================
// BUSCADOR + FILTRE
// =========================================================

function actualitzarLlista() {

    const lista =
        document.getElementById(
            "lista"
        );


    if (!lista) {
        return;
    }


    if (!datos.length) {

        lista.innerHTML = "";

        return;

    }


    const text = (
        document.getElementById(
            "busqueda"
        )?.value || ""
    )
        .trim()
        .toLowerCase();


    const tema = (
        document.getElementById(
            "filtroTema"
        )?.value || ""
    )
        .trim()
        .toLowerCase();


    const filtrats =
        datos.filter(d => {


            const matchText =

                (d.quarteta || "")
                    .toLowerCase()
                    .includes(text)

                ||

                (d.tema || "")
                    .toLowerCase()
                    .includes(text)

                ||

                (d.subtema || "")
                    .toLowerCase()
                    .includes(text);


            const matchTema =

                !tema

                ||

                (d.tema || "")
                    .trim()
                    .toLowerCase()
                    === tema;


            return (
                matchText &&
                matchTema
            );

        });


lista.innerHTML = filtrats
    .map(d => `
        <div class="item">

            <div class="tema">${d.tema || ""}</div>

            <div class="subtema">${d.subtema || ""}</div>

            <p>${d.quarteta || ""}</p>

            <div class="menu-quarteta">

                <button
                    type="button"
                    class="boto-menu-quarteta"
                    onclick="obrirMenuQuarteta(event, '${d.id}')"
                    aria-label="Opcions"
                >⋮</button>

                <div
                    id="menu-${d.id}"
                    class="opcions-quarteta"
                    onclick="event.stopPropagation()"
                >

                    <button
                        type="button"
                        onclick="editarQuarteta('${d.id}')"
                    >✏️ Editar</button>

                    <button
                        type="button"
                        class="opcio-borrar"
                        onclick="borrarQuarteta('${d.id}')"
                    >🗑️ Borrar</button>

                </div>

            </div>

        </div>
    `)
    .join("");

}


/* =========================================================
   VISTES
========================================================= */

function canviarVista(vista) {

    document
        .querySelectorAll(
            ".view"
        )
        .forEach(v => {

            v.classList.remove(
                "active"
            );

        });


    const el =
        document.getElementById(
            vista
        );


    if (el) {
        el.classList.add("active");
    }
    document.querySelectorAll(".bottom-nav button").forEach(b => {
        b.classList.toggle("seleccionat", b.getAttribute("onclick")?.includes("'" + vista + "'"));
    });
    if (vista === "materials") carregarMaterials();
    if (vista === "multimedia") carregarMultimedia();
    if (vista === "calendari") carregarCalendari();
    if (vista !== "materials") tancarLector();
}


// =========================================================
// FORMULARI NOVA QUARTETA
// =========================================================

function mostrarFormulari() {

    idEditant = null;


    netejarFormulari();


    const titol =
        document.querySelector(
            ".cap-formulari h2"
        );


    if (titol) {

        titol.textContent =
            "Nova quarteta";

    }


    obrirFormulari();

}


// =========================================================
// OBRIR FORMULARI
// =========================================================

function obrirFormulari() {

    const zonaLlistat =
        document.getElementById(
            "zonaLlistat"
        );


    const formulari =
        document.getElementById(
            "formulariQuarteta"
        );


    const botoAfegir =
        document.getElementById(
            "botoAfegirQuarteta"
        );


    if (zonaLlistat) {

        zonaLlistat.style.display =
            "none";

    }


    if (formulari) {

        formulari.style.display =
            "block";

    }


    if (botoAfegir) {

        botoAfegir.style.display =
            "none";

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// =========================================================
// TANCAR FORMULARI
// =========================================================

function tancarFormulari() {

    const zonaLlistat =
        document.getElementById(
            "zonaLlistat"
        );


    const formulari =
        document.getElementById(
            "formulariQuarteta"
        );


    const botoAfegir =
        document.getElementById(
            "botoAfegirQuarteta"
        );


    if (formulari) {

        formulari.style.display =
            "none";

    }


    if (zonaLlistat) {

        zonaLlistat.style.display =
            "block";

    }


    if (botoAfegir) {

        botoAfegir.style.display =
            "flex";

    }


    idEditant = null;


    netejarFormulari();


    const titol =
        document.querySelector(
            ".cap-formulari h2"
        );


    if (titol) {

        titol.textContent =
            "Nova quarteta";

    }

}


// =========================================================
// NETEJAR FORMULARI
// =========================================================

function netejarFormulari() {

    const novaQuarteta =
        document.getElementById(
            "novaQuarteta"
        );


    const nouTema =
        document.getElementById(
            "nouTema"
        );


    const altreTema =
        document.getElementById(
            "altreTema"
        );


    const nouSubtema =
        document.getElementById(
            "nouSubtema"
        );


    if (novaQuarteta) {

        novaQuarteta.value = "";

    }


    if (nouTema) {

        nouTema.value = "";

    }


    if (altreTema) {

        altreTema.value = "";

        altreTema.style.display =
            "none";

    }


    if (nouSubtema) {

        nouSubtema.value = "";

    }

}


// =========================================================
// CANVIAR TEMA NOU
// =========================================================

function canviarTemaNou() {

    const select =
        document.getElementById(
            "nouTema"
        );


    const altre =
        document.getElementById(
            "altreTema"
        );


    if (!select || !altre) {

        return;

    }


    if (
        select.value ===
        "__altre__"
    ) {

        altre.style.display =
            "block";

        altre.focus();

    } else {

        altre.style.display =
            "none";

        altre.value = "";

    }

}


// =========================================================
// MENÚ DE TRES PUNTS
// =========================================================

function obrirMenuQuarteta(event, id) {

    event.stopPropagation();


    const menu =
        document.getElementById(
            "menu-" + id
        );


    if (!menu) {
        return;
    }


    const jaEstavaObert =
        menu.classList.contains(
            "obert"
        );


    document
        .querySelectorAll(
            ".opcions-quarteta"
        )
        .forEach(m => {

            m.classList.remove(
                "obert"
            );

        });


    if (!jaEstavaObert) {

        menu.classList.add(
            "obert"
        );

    }

}
document.addEventListener(
    "click",
    () => {

        document
            .querySelectorAll(
                ".opcions-quarteta"
            )
            .forEach(menu => {

                menu.classList.remove(
                    "obert"
                );

            });

    }
);

// =========================================================
// TANCAR MENÚ TOCANT FORA
// =========================================================

document.addEventListener(
    "click",
    () => {

        document
            .querySelectorAll(
                ".opcions-quarteta"
            )
            .forEach(menu => {

                menu.classList.remove(
                    "obert"
                );

            });

    }
);


// =========================================================
// EDITAR QUARTETA
// =========================================================

function editarQuarteta(id) {

    const d =
        datos.find(
            q =>
                String(q.id) ===
                String(id)
        );


    if (!d) {

        return;

    }


    idEditant =
        d.id;


    const novaQuarteta =
        document.getElementById(
            "novaQuarteta"
        );


    const nouSubtema =
        document.getElementById(
            "nouSubtema"
        );


    const select =
        document.getElementById(
            "nouTema"
        );


    const altreTema =
        document.getElementById(
            "altreTema"
        );


    if (novaQuarteta) {

        novaQuarteta.value =
            d.quarteta || "";

    }


    if (nouSubtema) {

        nouSubtema.value =
            d.subtema || "";

    }


    const temaActual =
        d.tema || "";


    if (
        select &&
        altreTema
    ) {

        const existeix =
            [...select.options]
                .some(
                    opcio =>
                        opcio.value ===
                        temaActual
                );


        if (existeix) {

            select.value =
                temaActual;

            altreTema.style.display =
                "none";

            altreTema.value =
                "";

        } else {

            select.value =
                "__altre__";

            altreTema.style.display =
                "block";

            altreTema.value =
                temaActual;

        }

    }


    const titol =
        document.querySelector(
            ".cap-formulari h2"
        );


    if (titol) {

        titol.textContent =
            "Editar quarteta";

    }


    obrirFormulari();

}


// =========================================================
// GUARDAR NOVA O EDITAR
// =========================================================

async function guardarQuarteta() {

    const quarteta =
        document
            .getElementById(
                "novaQuarteta"
            )
            .value
            .trim();


    const selectorTema =
        document
            .getElementById(
                "nouTema"
            )
            .value;


    const altreTema =
        document
            .getElementById(
                "altreTema"
            )
            .value
            .trim();


    const subtema =
        document
            .getElementById(
                "nouSubtema"
            )
            .value
            .trim();


    let tema =
        selectorTema;


    if (
        selectorTema ===
        "__altre__"
    ) {

        tema =
            altreTema;

    }


    if (!quarteta) {

        alert(
            "Has d'escriure una quarteta."
        );

        return;

    }


    if (!tema) {

        alert(
            "Has de triar un tema."
        );

        return;

    }


    try {

        let url;


        // EDITAR

        if (
            idEditant !== null
        ) {

            url =
                API_URL +

                "?action=editar" +

                "&id=" +
                encodeURIComponent(
                    idEditant
                ) +

                "&quarteta=" +
                encodeURIComponent(
                    quarteta
                ) +

                "&tema=" +
                encodeURIComponent(
                    tema
                ) +

                "&subtema=" +
                encodeURIComponent(
                    subtema
                );

        }


        // AFEGIR NOVA

        else {

            url =
                API_URL +

                "?action=afegir" +

                "&quarteta=" +
                encodeURIComponent(
                    quarteta
                ) +

                "&tema=" +
                encodeURIComponent(
                    tema
                ) +

                "&subtema=" +
                encodeURIComponent(
                    subtema
                );

        }


        const res =
            await fetch(url);


        const resposta =
            await res.json();


        if (!resposta.ok) {

            throw new Error(
                resposta.error ||
                "No s'ha pogut guardar"
            );

        }


        if (
            idEditant !== null
        ) {

            alert(
                "✅ Quarteta editada correctament"
            );

        } else {

            alert(
                "✅ Quarteta guardada correctament"
            );

        }


        idEditant = null;


        tancarFormulari();


        await cargarDatos();


    } catch (err) {

        console.error(
            "❌ Error guardant:",
            err
        );


        alert(
            "❌ No s'ha pogut guardar la quarteta."
        );

    }

}


// =========================================================
// BORRAR QUARTETA
// =========================================================

async function borrarQuarteta(id) {

    const d =
        datos.find(
            q =>
                String(q.id) ===
                String(id)
        );


    if (!d) {

        return;

    }


    const confirmar =
        confirm(
            "Segur que vols borrar esta quarteta?\n\n" +
            d.quarteta
        );


    if (!confirmar) {

        return;

    }


    try {

        const url =
            API_URL +

            "?action=borrar" +

            "&id=" +
            encodeURIComponent(
                id
            );


        const res =
            await fetch(url);


        const resposta =
            await res.json();


        if (!resposta.ok) {

            throw new Error(
                resposta.error ||
                "No s'ha pogut borrar"
            );

        }


        await cargarDatos();


    } catch (err) {

        console.error(
            "❌ Error borrant:",
            err
        );


        alert(
            "❌ No s'ha pogut borrar la quarteta."
        );

    }

}


// =========================================================
// INICI
// =========================================================

window.addEventListener(
    "DOMContentLoaded",
    async () => {

        await cargarDatos();


        canviarVista(
            "home"
        );


        mostrarAleatoria();

    }
);

// =========================================================
// NOVA VERSIÓ: MATERIALS, MULTIMÈDIA I CALENDARI
// =========================================================

const contingutsCarregats = { materials: false, multimedia: false, calendari: false };
let materialsDades = [];
let multimediaDades = [];
let eventsDades = [];
let pdfActual = null;
let paginaActual = 1;
let tokenRender = 0;
let mesVisible = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let diaSeleccionat = new Date();

function element(tag, classe, text) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (text !== undefined) el.textContent = String(text);
    return el;
}

async function llegirSeccio(seccio) {
    const resposta = await fetch(API_URL + "?seccio=" + encodeURIComponent(seccio));
    if (!resposta.ok) throw new Error("Error HTTP " + resposta.status);
    const dades = await resposta.json();
    if (!Array.isArray(dades)) throw new Error(dades.error || "Resposta no vàlida");
    return dades;
}

function mostrarFiltres(id, dades, pintar) {
    const zona = document.getElementById(id);
    zona.replaceChildren();
    const categories = ["Tots", ...new Set(dades.map(d => String(d.categoria || "").trim()).filter(Boolean))];
    let activa = "Tots";
    categories.forEach(cat => {
        const boto = element("button", "filtre-xip" + (cat === activa ? " actiu" : ""), cat);
        boto.type = "button";
        boto.addEventListener("click", () => {
            activa = cat;
            zona.querySelectorAll("button").forEach(b => b.classList.toggle("actiu", b === boto));
            pintar(cat === "Tots" ? dades : dades.filter(d => String(d.categoria).trim() === cat));
        });
        zona.append(boto);
    });
    pintar(dades);
}

function idDrive(url) {
    const text = String(url || "");
    const match = text.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || text.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : "";
}

function urlSegura(url) {
    try {
        const u = new URL(String(url || ""));
        return ["https:", "http:"].includes(u.protocol) ? u.href : "";
    } catch { return ""; }
}

async function carregarMaterials() {
    if (contingutsCarregats.materials) return;
    const zona = document.getElementById("llistaMaterials");
    try {
        materialsDades = await llegirSeccio("materials");
        contingutsCarregats.materials = true;
        mostrarFiltres("filtresMaterials", materialsDades, pintarMaterials);
    } catch (err) { zona.textContent = "No s'han pogut carregar els materials. " + err.message; }
}

function pintarMaterials(dades) {
    const zona = document.getElementById("llistaMaterials");
    zona.replaceChildren();
    if (!dades.length) { zona.append(element("p", "estat-buit", "Encara no hi ha materials en esta categoria.")); return; }
    dades.forEach(d => {
        const card = element("button", "fitxa-contingut fitxa-material");
        card.type = "button";
        const portada = element("div", "portada-material");
        portada.append(element("span", "portada-icona", "▤"), element("span", "portada-tipus", d.tipus || "PDF"));
        const pdfUrl = urlPDFMaterial(d);
        if (pdfUrl && window.pdfjsLib) {
            crearPortadaPDF(portada, pdfUrl);
        }
        const cos = element("div", "cos-fitxa");
        cos.append(element("small", "etiqueta-fitxa", d.categoria || "Material"), element("h3", "", d.titol || "Sense títol"));
        if (d.descripcio) cos.append(element("p", "", d.descripcio));
        card.append(portada, cos);
        card.addEventListener("click", () => obrirMaterial(d));
        zona.append(card);
    });
}

function urlPDFMaterial(d) {
    // Fitxer de prova inclòs a GitHub; preval sobre l'enllaç antic de Drive.
    const nom = String(d.titol || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (nom.includes("guitarro")) return new URL("materials/1_Guitarro.pdf", document.baseURI).href;
    const url = urlSegura(d.url);
    // Els PDFs de Drive no es poden llegir directament per CORS.
    return idDrive(url) ? "" : url;
}

async function crearPortadaPDF(contenidor, url) {
    try {
        const doc = await window.pdfjsLib.getDocument({url}).promise;
        const page = await doc.getPage(1);
        const viewport = page.getViewport({scale: 1});
        const escala = 320 / viewport.width;
        const vista = page.getViewport({scale: escala});
        const canvas = document.createElement("canvas");
        canvas.className = "miniatura-pdf";
        canvas.width = Math.round(vista.width);
        canvas.height = Math.round(vista.height);
        await page.render({canvasContext: canvas.getContext("2d"), viewport: vista}).promise;
        contenidor.prepend(canvas);
        contenidor.classList.add("amb-portada");
        await doc.destroy();
    } catch (error) { console.warn("No s'ha pogut generar la portada", error); }
}

async function obrirMaterial(d) {
    const url = urlPDFMaterial(d) || urlSegura(d.url);
    if (!url) { alert("Este material encara no té un enllaç vàlid al Sheets."); return; }
    document.getElementById("bibliotecaMaterials").hidden = true;
    document.getElementById("lectorMaterials").hidden = false;
    document.getElementById("lectorTitol").textContent = d.titol || "Material";
    document.getElementById("lectorEnllac").href = url;
    const estat = document.getElementById("lectorEstat");
    estat.textContent = "Carregant PDF…";
    document.getElementById("lectorCanvas").style.display = "none";
    pdfActual = null;
    const token = ++tokenRender;
    if (!window.pdfjsLib) {
        estat.textContent = "No s'ha pogut carregar el lector. Pots obrir el PDF original amb el botó inferior.";
        actualitzarControlsLector(); return;
    }
    try {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        const drive = idDrive(url);
        if (drive) throw new Error("Drive no admet lectura directa; cal allotjar el PDF a GitHub.");
        const pdf = await window.pdfjsLib.getDocument({ url }).promise;
        if (token !== tokenRender) return;
        pdfActual = pdf;
        paginaActual = 1;
        await pintarPaginaPDF();
    } catch (err) {
        if (token !== tokenRender) return;
        console.warn("El servidor del PDF no permet el lector integrat:", err);
        estat.textContent = "No es pot llegir este PDF dins de l’app. Puja’l a GitHub i canvia l’enllaç del Sheets per l’adreça publicada, o obri el document original.";
        actualitzarControlsLector();
    }
}

async function pintarPaginaPDF() {
    if (!pdfActual) return;
    const token = ++tokenRender;
    const estat = document.getElementById("lectorEstat");
    estat.textContent = "Carregant pàgina…";
    try {
        const pagina = await pdfActual.getPage(paginaActual);
        const ample = Math.min(document.getElementById("lectorPagina").clientWidth || 400, 750);
        const escala = ample / pagina.getViewport({ scale: 1 }).width;
        const viewport = pagina.getViewport({ scale: escala });
        const canvas = document.getElementById("lectorCanvas");
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = viewport.width + "px";
        canvas.style.height = viewport.height + "px";
        const ctx = canvas.getContext("2d");
        await pagina.render({ canvasContext: ctx, viewport, transform: [pixelRatio, 0, 0, pixelRatio, 0, 0] }).promise;
        if (token !== tokenRender) return;
        canvas.style.display = "block";
        estat.textContent = "";
        actualitzarControlsLector();
    } catch (err) { if (token === tokenRender) estat.textContent = "No s'ha pogut mostrar esta pàgina."; }
}

function actualitzarControlsLector() {
    document.getElementById("lectorComptador").textContent = pdfActual ? paginaActual + " / " + pdfActual.numPages : "– / –";
    document.getElementById("lectorAnterior").disabled = !pdfActual || paginaActual <= 1;
    document.getElementById("lectorSeguent").disabled = !pdfActual || paginaActual >= pdfActual.numPages;
}

function passarPagina(delta) {
    if (!pdfActual) return;
    const nova = paginaActual + delta;
    if (nova < 1 || nova > pdfActual.numPages) return;
    paginaActual = nova;
    pintarPaginaPDF();
}

function tancarLector() {
    ++tokenRender;
    pdfActual = null;
    const biblioteca = document.getElementById("bibliotecaMaterials");
    const lector = document.getElementById("lectorMaterials");
    if (biblioteca) biblioteca.hidden = false;
    if (lector) lector.hidden = true;
}

async function carregarMultimedia() {
    if (contingutsCarregats.multimedia) return;
    const zona = document.getElementById("llistaMultimedia");
    try {
        multimediaDades = await llegirSeccio("multimedia");
        contingutsCarregats.multimedia = true;
        mostrarFiltres("filtresMultimedia", multimediaDades, pintarMultimedia);
    } catch (err) { zona.textContent = "No s'ha pogut carregar la multimèdia. " + err.message; }
}

function pintarMultimedia(dades) {
    const zona = document.getElementById("llistaMultimedia");
    zona.replaceChildren();
    if (!dades.length) { zona.append(element("p", "estat-buit", "Encara no hi ha continguts en esta categoria.")); return; }
    dades.forEach(d => {
        const url = urlSegura(d.url);
        const card = element("article", "fitxa-contingut fitxa-multimedia");
        const tipus = String(d.tipus || "").toLowerCase();
        const icona = tipus.includes("youtube") || tipus.includes("vídeo") || tipus.includes("video") ? "▶️" : tipus.includes("spotify") ? "🎵" : "🎧";
        const cos = element("div", "cos-fitxa");
        cos.append(element("small", "etiqueta-fitxa", d.categoria || d.tipus || "Multimèdia"), element("h3", "", d.titol || "Sense títol"));
        if (d.descripcio) cos.append(element("p", "", d.descripcio));
        const bot = element("a", "boto-contingut", "Escoltar / veure ↗");
        if (url) { bot.href = url; bot.target = "_blank"; bot.rel = "noopener noreferrer"; }
        else { bot.textContent = "Enllaç pendent"; bot.classList.add("desactivat"); }
        card.append(element("div", "multimedia-icona", icona), cos, bot);
        zona.append(card);
    });
}

function dataLocalISO(data) {
    return data.getFullYear() + "-" + String(data.getMonth() + 1).padStart(2, "0") + "-" + String(data.getDate()).padStart(2, "0");
}
function dataEvent(event) {
    // Els esdeveniments de dia complet conserven el dia de la data ISO.
    return event.totElDia ? String(event.inici).slice(0, 10) : dataLocalISO(new Date(event.inici));
}
async function carregarCalendari() {
    if (contingutsCarregats.calendari) { pintarCalendari(); return; }
    const zona = document.getElementById("eventsDia");
    zona.textContent = "Carregant agenda…";
    try {
        eventsDades = await llegirSeccio("calendari");
        contingutsCarregats.calendari = true;
        pintarCalendari();
    } catch (err) { zona.textContent = "No s'ha pogut carregar el calendari. " + err.message; }
}
function moureMes(delta) {
    mesVisible = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + delta, 1);
    diaSeleccionat = new Date(mesVisible);
    pintarCalendari();
}
function pintarCalendari() {
    const y = mesVisible.getFullYear(), m = mesVisible.getMonth();
    const capMes = document.getElementById("mesActual");
    const nomMes = new Intl.DateTimeFormat("ca-ES", { month: "long" }).format(mesVisible);
    const etiquetaMes = element("span", "calendari-nom-mes", nomMes);
    const etiquetaAny = element("small", "calendari-any", String(y));
    capMes.replaceChildren(etiquetaMes, etiquetaAny);
    const zona = document.getElementById("graellaCalendari");
    zona.replaceChildren();
    const primer = (new Date(y, m, 1).getDay() + 6) % 7;
    const total = new Date(y, m + 1, 0).getDate();
    for (let i = 0; i < primer; i++) zona.append(element("span", "dia-buit"));
    const datesEvents = new Set(eventsDades.map(dataEvent));
    for (let dia = 1; dia <= total; dia++) {
        const data = new Date(y, m, dia), clau = dataLocalISO(data);
        const bot = element("button", "dia-calendari", dia);
        bot.type = "button";
        if (datesEvents.has(clau)) bot.classList.add("amb-event");
        if (clau === dataLocalISO(new Date())) bot.classList.add("hui");
        if (clau === dataLocalISO(diaSeleccionat)) bot.classList.add("triat");
        bot.setAttribute("aria-label", dia + " de " + nomMes + " de " + y);
        bot.addEventListener("click", () => { diaSeleccionat = data; pintarCalendari(); });
        zona.append(bot);
    }
    pintarEventsDia();
}
function pintarEventsDia() {
    const clau = dataLocalISO(diaSeleccionat);
    document.getElementById("titolDia").textContent = new Intl.DateTimeFormat("ca-ES", { day: "numeric", month: "long", year: "numeric" }).format(diaSeleccionat);
    const zona = document.getElementById("eventsDia");
    zona.replaceChildren();
    const events = eventsDades.filter(ev => dataEvent(ev) === clau);
    if (!events.length) { zona.append(element("p", "estat-buit", "No hi ha activitats programades per a este dia.")); return; }
    events.forEach(ev => {
        const card = element("article", "event-targeta");
        card.append(element("h4", "", ev.titol || "Activitat"));
        if (!ev.totElDia) card.append(element("p", "", "🕒 " + new Intl.DateTimeFormat("ca-ES", { hour: "2-digit", minute: "2-digit" }).format(new Date(ev.inici))));
        if (ev.lloc) card.append(element("p", "", "📍 " + ev.lloc));
        if (ev.descripcio) card.append(element("p", "", ev.descripcio));
        zona.append(card);
    });
}

// Passar pàgina amb el dit dins del lector PDF.
let iniciGestPDF = null;
document.getElementById("lectorPagina")?.addEventListener("touchstart", e => {
    iniciGestPDF = e.touches[0]?.clientX ?? null;
}, {passive: true});
document.getElementById("lectorPagina")?.addEventListener("touchend", e => {
    if (iniciGestPDF === null) return;
    const final = e.changedTouches[0]?.clientX;
    if (final !== undefined && Math.abs(final - iniciGestPDF) > 65) passarPagina(final < iniciGestPDF ? 1 : -1);
    iniciGestPDF = null;
}, {passive: true});
