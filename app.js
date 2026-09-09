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


// =========================================================
// VISTES
// =========================================================

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

        el.classList.add(
            "active"
        );

    }

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
