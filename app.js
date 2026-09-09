let usuariActual = "NeusBM";

console.log("APP CARREGADA");

const API_URL =
    "https://script.google.com/macros/s/AKfycbwSPX3Q0x-IXjYj960yyHpSVpjOxxWNl9I0S1O0rsX2TSjjJ6JOGYUgR_pkOfx7L6QDwg/exec";

let datos = [];

// ----------------------
// CARREGAR DADES (JSON)
// ----------------------
async function cargarDatos() {
    try {
        console.log("▶️ carregant API...");

        const res = await fetch(API_URL);
        const data = await res.json();

        console.log("📦 RAW:", data);

        if (!Array.isArray(data)) {
            throw new Error("API no retorna array");
        }

        datos = data.map(r => ({
            id: r.id,
            quarteta: r.quarteta || "",
            tema: r.tema || "",
            subtema: r.subtema || ""
        }));

        console.log("✅ OK:", datos.length);

       function omplirTemes() {

    const temes = [...new Set(
        datos
            .map(d => (d.tema || "").trim())
            .filter(t => t !== "")
    )].sort((a, b) => a.localeCompare(b));


    // FILTRE DEL LLISTAT
    const filtroTema = document.getElementById("filtroTema");

    if (filtroTema) {

        const temaSeleccionat = filtroTema.value;

        filtroTema.innerHTML =
            `<option value="">Tema</option>` +
            temes.map(tema =>
                `<option value="${tema}">${tema}</option>`
            ).join("");

        if (temes.includes(temaSeleccionat)) {
            filtroTema.value = temaSeleccionat;
        }
    }


    // SELECTOR DEL FORMULARI
    const nouTema = document.getElementById("nouTema");

    if (nouTema) {

        nouTema.innerHTML =
            `<option value="">Tria un tema</option>` +
            temes.map(tema =>
                `<option value="${tema}">${tema}</option>`
            ).join("") +
            `<option value="__altre__">➕ Altre tema</option>`;
    }
}

    // TEMA DEL FORMULARI
    const nouTema = document.getElementById("nouTema");

    if (nouTema) {

        nouTema.innerHTML =
            `<option value="">Tria un tema</option>` +
            temes
                .map(t => `<option value="${t}">${t}</option>`)
                .join("") +
            `<option value="__altre__">➕ Altre tema</option>`;
    }
}
        actualitzarLlista();

    } catch (err) {
        console.error("❌ ERROR:", err);
    }
}

// ----------------------
// OMPLIR FILTRE TEMES
// ----------------------
function omplirTemes() {

    const select = document.getElementById("filtroTema");
    if (!select) return;

    const temes = [...new Set(datos.map(d => d.tema).filter(Boolean))];

    select.innerHTML =
        `<option value="">Tots els temes</option>` +
        temes.map(t => `<option value="${t}">${t}</option>`).join("");
}

// ----------------------
// ALEATORI
// ----------------------
function mostrarAleatoria() {

    if (!datos.length) return;

    const r = datos[Math.floor(Math.random() * datos.length)];

    document.getElementById("resultado").innerHTML = `
        <div class="card">
            <div class="tema">${r.tema || ""}</div>
            <div class="subtema">${r.subtema || ""}</div>
            <p>${r.quarteta || ""}</p>
        </div>
    `;
}

// ----------------------
// BUSCAR + FILTRE
// ----------------------
function actualitzarLlista() {

    if (!datos.length) return;

    const text = (document.getElementById("busqueda").value || "")
        .trim()
        .toLowerCase();

    const tema = (document.getElementById("filtroTema").value || "")
        .trim()
        .toLowerCase();

    const filtrats = datos.filter(d => {

        const matchText =
            (d.quarteta || "").toLowerCase().includes(text) ||
            (d.tema || "").toLowerCase().includes(text) ||
            (d.subtema || "").toLowerCase().includes(text);

        const matchTema =
            !tema || (d.tema || "").trim().toLowerCase() === tema;

        return matchText && matchTema;
    });

    document.getElementById("lista").innerHTML = filtrats.map(d => `
        <div class="item">
            <div class="tema">${d.tema || ""}</div>
            <div class="subtema">${d.subtema || ""}</div>
            <p>${d.quarteta || ""}</p>
        </div>
    `).join("");
}

// ----------------------
// VISTES
// ----------------------
function canviarVista(vista) {

    document.querySelectorAll(".view").forEach(v => {
        v.classList.remove("active");
    });

    const el = document.getElementById(vista);
    if (el) el.classList.add("active");
}

// ----------------------
// INICI
// ----------------------
window.addEventListener("DOMContentLoaded", async () => {

    await cargarDatos();

    canviarVista("home");
    mostrarAleatoria();
});

// ----------------------
// FORMULARI NOVA QUARTETA
// ----------------------

function mostrarFormulari() {

    document.getElementById("zonaLlistat").style.display = "none";

    document.getElementById("formulariQuarteta").style.display = "block";

    document.getElementById("botoAfegirQuarteta").style.display = "none";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function tancarFormulari() {

    document.getElementById("formulariQuarteta").style.display = "none";

    document.getElementById("zonaLlistat").style.display = "block";

    document.getElementById("botoAfegirQuarteta").style.display = "flex";
}

function canviarTemaNou() {

    const select = document.getElementById("nouTema");
    const altre = document.getElementById("altreTema");

    if (select.value === "__altre__") {

        altre.style.display = "block";
        altre.focus();

    } else {

        altre.style.display = "none";
        altre.value = "";
    }
}

async function guardarQuarteta() {

    const quarteta =
        document.getElementById("novaQuarteta").value.trim();

    const selectorTema =
        document.getElementById("nouTema").value;

    const altreTema =
        document.getElementById("altreTema").value.trim();

    const subtema =
        document.getElementById("nouSubtema").value.trim();


    let tema = selectorTema;

    if (selectorTema === "__altre__") {
        tema = altreTema;
    }


    if (!quarteta) {
        alert("Has d'escriure una quarteta.");
        return;
    }

    if (!tema) {
        alert("Has de triar un tema.");
        return;
    }


    try {

        const url =
            API_URL +
            "?action=afegir" +
            "&quarteta=" + encodeURIComponent(quarteta) +
            "&tema=" + encodeURIComponent(tema) +
            "&subtema=" + encodeURIComponent(subtema);

        const res = await fetch(url);
        const data = await res.json();


        if (!data.ok) {
            throw new Error(
                data.error || "No s'ha pogut guardar"
            );
        }


        alert("✅ Quarteta guardada correctament");


        document.getElementById("novaQuarteta").value = "";
        document.getElementById("nouTema").value = "";
        document.getElementById("altreTema").value = "";
        document.getElementById("altreTema").style.display = "none";
        document.getElementById("nouSubtema").value = "";


        tancarFormulari();

        await cargarDatos();


    } catch (err) {

        console.error("❌ Error guardant:", err);

        alert("❌ No s'ha pogut guardar la quarteta.");
    }
}
