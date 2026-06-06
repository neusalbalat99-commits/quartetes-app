console.log("APP CARREGADA");
const URL_CSV = "Quartetes.csv";

let datos = [];

// ----------------------
// CARGAR CSV (ROBUSTO)
// ----------------------

async function cargarDatos() {
    const res = await fetch(URL_CSV);
    const text = await res.text();

    const lines = [];
    let current = "";
    let insideQuotes = false;

    for (let char of text) {
        if (char === '"') {
            insideQuotes = !insideQuotes;
        }

        if (char === "\n" && !insideQuotes) {
            lines.push(current);
            current = "";
        } else {
            current += char;
        }
    }

    if (current) lines.push(current);

    const filas = lines.filter(l => l.trim() !== "");

    datos = filas.slice(1).map(f => {
        const cols = f.split(";");

        return {
            id: (cols[0] || "").trim(),
            quarteta: (cols[1] || "").trim(),
            tema: (cols[2] || "").trim(),
            subtema: (cols[3] || "").trim()
        };
    }).filter(d => d.quarteta);

    console.log("Cargados:", datos.length);
    console.log("Ejemplo:", datos[0]);
}

// ----------------------
// PARSER CSV SIMPLE PERO SEGURO
// ----------------------
function parseCSVLine(line) {
    const result = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === "," && !insideQuotes) {
            result.push(current);
            current = "";
        } else {
            current += char;
        }
    }

    result.push(current);

    return result.map(v => v.trim().replace(/"/g, ""));
}

// ----------------------
// ALEATORIO
// ----------------------
function mostrarAleatoria() {
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
function buscar() {
    const texto = document.getElementById("busqueda").value.toLowerCase();

    const filtrados = datos.filter(d =>
        (d.quarteta || "").toLowerCase().includes(texto) ||
        (d.tema || "").toLowerCase().includes(texto) ||
        (d.subtema || "").toLowerCase().includes(texto)
    );

    document.getElementById("lista").innerHTML =
    filtrados.map(d => `
        <div class="item">
            <div class="tema">${d.tema || ""}</div>
            <div class="subtema">${d.subtema || ""}</div>
            <p>${d.quarteta || ""}</p>
        </div>
    `).join("");
}

// ----------------------
// INICIO
// ----------------------
cargarDatos();