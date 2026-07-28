// Utilidades compartidas por las vistas y los scripts del cliente.

const ANCHO_ZONA_FLECHAS = 40;

async function obtenerRutas() {
    const res = await fetch("/rutas");
    const data = await res.json();
    return data;
}

function alternarCarga(mostrar) {
    const cargando = document.getElementById("cargando");
    if (!cargando) return;
    cargando.classList.toggle("ocultar", !mostrar);
}

function formularioAObjeto(formEl) {
    const datos = {};
    new FormData(formEl).forEach((value, key) => {
        datos[key] = value;
    });
    return datos;
}

function aEntero(datos, campo, porDefecto = 0) {
    if (datos[campo] !== undefined) {
        datos[campo] = parseInt(datos[campo], 10) || porDefecto;
    }
}

function aEnteroONulo(datos, campo) {
    if (datos[campo] !== undefined && datos[campo] !== "") {
        datos[campo] = parseInt(datos[campo], 10) || null;
    } else {
        datos[campo] = null;
    }
}

// Envía la petición a la API mostrando el indicador de carga y recargando la
// página al terminar, sin importar el resultado.
async function enviarPeticion({ url, metodo, cuerpo, mensajeError }) {
    const opciones = { method: metodo };
    if (cuerpo instanceof FormData) {
        opciones.body = cuerpo;
    } else if (cuerpo !== undefined) {
        opciones.headers = { "Content-Type": "application/json" };
        opciones.body = JSON.stringify(cuerpo);
    } else {
        opciones.headers = { "Content-Type": "application/json" };
    }

    alternarCarga(true);
    try {
        const respuesta = await fetch(url, opciones);
        if (!respuesta.ok) {
            const err = await respuesta.json();
            alert(mensajeError + ": " + JSON.stringify(err.detail));
        }
    } catch (error) {
        console.error("Error al enviar la petición:", error);
    } finally {
        alternarCarga(false);
        window.location.reload();
    }
}

// Devuelve la posición del puntero dentro de un input numérico y si está sobre
// las flechas personalizadas del lado derecho.
function posicionEnInputNumero(e) {
    const rect = e.target.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        alto: rect.height,
        enFlechas: e.clientX - rect.left > rect.width - ANCHO_ZONA_FLECHAS
    };
}

// Alterna la visibilidad de los inputs de contraseña marcados con
// .toggle-password dentro de un .password-container.
function inicializarTogglePassword() {
    document.addEventListener("click", function (e) {
        if (!e.target || !e.target.classList.contains("toggle-password")) return;
        const container = e.target.closest(".password-container");
        const input = container ? container.querySelector("input") : null;
        if (!input) return;

        const oculta = input.type === "password";
        input.type = oculta ? "text" : "password";
        e.target.classList.toggle("bi-eye-fill", !oculta);
        e.target.classList.toggle("bi-eye-slash-fill", oculta);
    });
}

// Navegación entre pestañas: al pulsar un botón no seleccionado lo marca como
// seleccionado, desmarca los demás y navega a su url.
function inicializarSecciones(secciones) {
    const botones = secciones
        .map(seccion => ({ ...seccion, elemento: document.getElementById(seccion.id) }))
        .filter(seccion => seccion.elemento);

    botones.forEach(({ elemento, url }) => {
        elemento.addEventListener("click", () => {
            if (elemento.classList.contains("seleccionado")) return;
            botones.forEach(otro => otro.elemento.classList.toggle("seleccionado", otro.elemento === elemento));
            window.location.href = url;
        });
    });
}
