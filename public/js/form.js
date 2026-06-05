async function obtenerRutas() {
    const res = await fetch("/rutas");
    const data = await res.json();
    return data;
}

// Manejador de clics para las flechas personalizadas de input[type="number"]
document.addEventListener('click', function (e) {
    if (e.target.tagName === 'INPUT' && e.target.type === 'number') {
        if (e.target.disabled || e.target.readOnly) return;
        const rect = e.target.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const width = rect.width;
        const height = rect.height;

        // Si hizo clic en la zona derecha (40px) donde están las flechas
        if (clickX > width - 40) {
            e.preventDefault();
            if (clickY < height / 2) {
                e.target.stepUp();
            } else {
                e.target.stepDown();
            }
            // Disparar eventos para que cualquier listener detecte el cambio de valor
            e.target.dispatchEvent(new Event('input', { bubbles: true }));
            e.target.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
});

// Cambiar cursor a pointer al pasar sobre las flechas personalizadas
document.addEventListener('mousemove', function (e) {
    if (e.target.tagName === 'INPUT' && e.target.type === 'number') {
        if (e.target.disabled || e.target.readOnly) {
            e.target.style.cursor = 'not-allowed';
            return;
        }
        const rect = e.target.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        if (clickX > width - 40) {
            e.target.style.cursor = 'pointer';
        } else {
            e.target.style.cursor = 'text';
        }
    }
});

var btnNuevo = document.getElementById("nuevo"),
    btnCancelar = document.querySelectorAll(".cancelar"),
    btnAgregar = document.getElementById("agregar"),
    formBusqueda = document.getElementById("formBusqueda"),
    formNuevo = document.getElementById("formNuevo"),
    formEditar = document.getElementById("formEditar"),
    btnsEditar = document.querySelectorAll(".editar"),
    cargando = document.getElementById("cargando");

btnNuevo.addEventListener("click", () => {
    formNuevo.classList.remove("ocultar");
    btnNuevo.classList.add("ocultar");
    formBusqueda.classList.add("completo")
});

btnsEditar.forEach(btn => {
    btn.addEventListener("click", async () => {
        cargando.classList.remove("ocultar");
        var id = btn.parentElement.parentElement.id;
        const data = await obtenerRutas();
        var api = data.url + window.paginaActual + "/" + id;
        console.log(api);
        cargando.classList.add("ocultar");
        formEditar.classList.remove("ocultar");
    })
});

btnCancelar.forEach(btn => {
    btn.addEventListener("click", () => {
        formNuevo.classList.add("ocultar")
        formEditar.classList.add("ocultar")
        btnNuevo.classList.remove("ocultar");
        formBusqueda.classList.remove("completo")
    })
});
