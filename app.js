console.log("APP CARREGADA");

const URL_CSV = "Quartetes.csv";
let datos = [];

// ----------------------
// CARGAR CSV
// ----------------------
async function cargarDatos() {
    const res = await fetch(URL_CSV);
    const text = await res.text();

    const rows = text
        .split("\n")
        .filter(l => l.trim() !== "");

    let current = "";
    let insideQuotes = false;
    const parsed = [];

    for (let i = 1; i < rows.length; i++) {
        let line = rows[i];

        current += (current ? "\n" : "") + line;

        const quotes = (current.match(/"/g) || []).length;
        insideQuotes = quotes % 2 !== 0;

        if (!insideQuotes) {
            parsed.push(current);
            current = "";
        }
    }

    datos = parsed.map(f => {
        const cols = f.split(";");

        return {
            id: (cols[0] || "").replace(/"/g, "").trim(),
            quarteta: (cols[1] || "").replace(/"/g, "").trim(),
            tema: (cols[2] || "").replace(/"/g, "").trim(),
            subtema: (cols[3] || "").replace(/"/g, "").trim()
        };
    }).filter(d => d.quarteta);

   const temes = [...new Set(datos.map(d => d.tema).filter(Boolean))];

    document.getElementById("filtroTema").innerHTML =
        `<option value="">Tots els temes</option>` +
        temes.map(t => `<option value="${t}">${t}</option>`).join("");

    console.log("Cargados:", datos.length);

    // 🔥 AIXÒ FALTAVA
    actualitzarLlista(); 

}

// ----------------------
// ALEATORIO
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
// BUSCAR
// ----------------------
function actualitzarLlista() {
    const text = document.getElementById("busqueda").value.toLowerCase();
    const tema = document.getElementById("filtroTema").value;

    const filtrats = datos.filter(d => {

        const matchText =
            (d.quarteta || "").toLowerCase().includes(text) ||
            (d.tema || "").toLowerCase().includes(text) ||
            (d.subtema || "").toLowerCase().includes(text);

        const matchTema =
            !tema || d.tema === tema;

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
// VISTES (SISTEMA ÚNIC)
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
cargarDatos().then(() => {
    canviarVista("home");
    mostrarAleatoria();
});

function mostrarLlista() {
    const container = document.getElementById("lista");

    container.innerHTML = datos.map(d => `
        <div class="item">
            <div class="tema">${d.tema || ""}</div>
            <div class="subtema">${d.subtema || ""}</div>
            <p>${d.quarteta || ""}</p>
        </div>
    `).join("");
}

