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
    cargando = document.getElementById("cargando"),
    btnActualizar = document.getElementById("actualizar"),
    btnsEliminar = document.querySelectorAll(".eliminar");

btnNuevo.addEventListener("click", () => {
    formNuevo.classList.remove("ocultar");
    btnNuevo.classList.add("ocultar");
    formBusqueda.classList.add("completo")
});

btnsEditar.forEach(btn => {
    btn.addEventListener("click", () => {
        var id = btn.parentElement.parentElement.id;
        cargando.classList.remove("ocultar");

        // Comprobación si está en "/inventario" y tiene subcategoría
        if (window.paginaActual === "/inventario") {
            const subcategoriaInput = btn.parentElement.querySelector('input[name="subcategoria"]');
            if (subcategoriaInput) {
                const val = subcategoriaInput.value.trim().toLowerCase();
                if (val === "true" || val === "1") {
                    window.location.href = `/productos/${id}`;
                    return;
                }
            }
        }

        // Guardar ID en el dataset del formEditar para uso posterior
        formEditar.dataset.id = id;

        // Rellenar formulario con los datasets de la fila tr sin llamadas a la API
        const tr = btn.closest("tr");
        const formEl = formEditar.querySelector("form");
        if (tr && formEl) {
            Object.keys(tr.dataset).forEach(key => {
                const input = formEl.querySelector(`[name="${key}"]`);
                if (input) {
                    if (input.type === "checkbox") {
                        input.checked = tr.dataset[key] === "true" || tr.dataset[key] === "1";
                    } else if (input.tagName === "SELECT") {
                        const valToFind = (tr.dataset[key] || "").trim().toLowerCase();
                        const matchingOption = Array.from(input.options).find(opt => opt.value.trim().toLowerCase() === valToFind);
                        if (matchingOption) {
                            input.value = matchingOption.value;
                        } else {
                            input.value = "";
                        }
                    } else {
                        input.value = tr.dataset[key] || "";
                    }
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        }

        cargando.classList.add("ocultar");
        formEditar.classList.remove("ocultar");
    })
});

btnCancelar.forEach(btn => {
    btn.addEventListener("click", () => {
        formNuevo.classList.add("ocultar")
        formEditar.classList.add("ocultar")
        const fEdit = formEditar.querySelector("form");
        if (fEdit) fEdit.reset();
        const fNew = formNuevo.querySelector("form");
        if (fNew) fNew.reset();
        btnNuevo.classList.remove("ocultar");
        formBusqueda.classList.remove("completo")
    })
});

btnAgregar.addEventListener("click", async () => {
    const data = await obtenerRutas();
    var api = data.url + window.paginaActual + "/";
    formNuevo.classList.add("ocultar")
    btnNuevo.classList.remove("ocultar");
    formBusqueda.classList.remove("completo");
    console.log(api)

    const formEl = formNuevo.querySelector("form");
    const formData = new FormData(formEl);
    const plainFormData = {};

    formData.forEach((value, key) => {
        plainFormData[key] = value;
    });

    // Validar y tipar campos según la vista
    if (window.paginaActual === "/inventario") {
        const subcatCheckbox = formEl.querySelector('input[name="subcategoria"]');
        const isSubcategoria = subcatCheckbox ? subcatCheckbox.checked : false;
        plainFormData["subcategoria"] = isSubcategoria;

        if (isSubcategoria) {
            plainFormData["cantidad"] = 0;
        } else {
            if (plainFormData["cantidad"] !== undefined) {
                plainFormData["cantidad"] = parseInt(plainFormData["cantidad"], 10) || 0;
            }
        }

        if (plainFormData["medida"] !== undefined && plainFormData["medida"] !== "") {
            plainFormData["medida"] = parseInt(plainFormData["medida"], 10) || null;
        } else {
            plainFormData["medida"] = null;
        }
    } else if (window.paginaActual === "/producto") {
        if (plainFormData["idinvt1"] !== undefined) {
            plainFormData["idinvt1"] = parseInt(plainFormData["idinvt1"], 10) || 0;
        }
    }

    cargando.classList.remove("ocultar");
    try {
        const respuesta = await fetch(api, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(plainFormData)
        });
        if (!respuesta.ok) {
            const err = await respuesta.json();
            alert("Error al guardar: " + JSON.stringify(err.detail));
        }
    } catch (error) {
        console.error("Error al enviar la petición:", error);
    } finally {
        cargando.classList.add("ocultar");
        window.location.reload();
    }
});

btnActualizar.addEventListener("click", () => {
    formEditar.classList.add("ocultar")
    btnNuevo.classList.remove("ocultar");
    formBusqueda.classList.remove("completo")
});

btnsEliminar.forEach(btn => {
    btn.addEventListener("click", async () => {
        var id = btn.parentElement.parentElement.id;
        cargando.classList.remove("ocultar");
        const data = await obtenerRutas();
        var api = data.url + window.paginaActual + "/" + id;
        try {
            const respuesta = await fetch(api, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!respuesta.ok) {
                const err = await respuesta.json();
                alert("Error al guardar: " + JSON.stringify(err.detail));
            }
        } catch (error) {
            console.error("Error al enviar la petición:", error);
        } finally {
            console.log(api);
            cargando.classList.add("ocultar");
            window.location.reload();
        }
    })
})
