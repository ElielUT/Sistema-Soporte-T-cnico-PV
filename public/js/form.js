// Manejador de clics para las flechas personalizadas de input[type="number"]
document.addEventListener('click', function (e) {
    if (e.target.tagName === 'INPUT' && e.target.type === 'number') {
        if (e.target.disabled || e.target.readOnly) return;
        const posicion = posicionEnInputNumero(e);

        if (posicion.enFlechas) {
            e.preventDefault();
            if (posicion.y < posicion.alto / 2) {
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
        e.target.style.cursor = posicionEnInputNumero(e).enFlechas ? 'pointer' : 'text';
    }
});

var btnNuevo = document.getElementById("nuevo"),
    btnCancelar = document.querySelectorAll(".cancelar"),
    btnAgregar = document.getElementById("agregar"),
    formBusqueda = document.getElementById("formBusqueda"),
    formNuevo = document.getElementById("formNuevo"),
    formEditar = document.getElementById("formEditar"),
    btnsEditar = document.querySelectorAll(".editar"),
    btnActualizar = document.getElementById("actualizar"),
    btnsEliminar = document.querySelectorAll(".eliminar");

function mostrarFormularioNuevo(mostrar) {
    formNuevo.classList.toggle("ocultar", !mostrar);
    btnNuevo.classList.toggle("ocultar", mostrar);
    formBusqueda.classList.toggle("completo", mostrar);
}

async function urlApi(sufijo = "") {
    const data = await obtenerRutas();
    return data.url + window.paginaActual + "/" + sufijo;
}

// Convierte a número los campos que la API espera como enteros en cada vista.
function tiparCampos(datos, { esNuevo, formEl }) {
    if (window.paginaActual === "/inventario") {
        if (esNuevo) {
            const subcatCheckbox = formEl.querySelector('input[name="subcategoria"]');
            datos["subcategoria"] = subcatCheckbox ? subcatCheckbox.checked : false;
            if (datos["subcategoria"]) {
                datos["cantidad"] = 0;
            } else {
                aEntero(datos, "cantidad");
            }
        } else {
            aEntero(datos, "cantidad");
        }
        aEnteroONulo(datos, "medida");
    } else if (window.paginaActual === "/producto") {
        aEntero(datos, "idinvt1");
    } else if (window.paginaActual === "/camara") {
        aEntero(datos, "idprod2");
    } else if (window.paginaActual === "/antena") {
        aEntero(datos, "idprod1");
    } else if (window.paginaActual === "/proceso") {
        aEntero(datos, "idmant1");
    }
}

btnNuevo.addEventListener("click", () => {
    mostrarFormularioNuevo(true);
});

btnsEditar.forEach(btn => {
    btn.addEventListener("click", () => {
        var id = btn.parentElement.parentElement.id;
        alternarCarga(true);

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

        alternarCarga(false);
        formEditar.classList.remove("ocultar");
    })
});

btnCancelar.forEach(btn => {
    btn.addEventListener("click", () => {
        formEditar.classList.add("ocultar");
        mostrarFormularioNuevo(false);
        const fEdit = formEditar.querySelector("form");
        if (fEdit) fEdit.reset();
        const fNew = formNuevo.querySelector("form");
        if (fNew) fNew.reset();
    })
});

btnAgregar.addEventListener("click", async () => {
    const api = await urlApi();
    mostrarFormularioNuevo(false);

    const formEl = formNuevo.querySelector("form");

    if (window.paginaActual === "/documento" || window.paginaActual === "/documentos") {
        const fileInput = formEl.querySelector('input[type="file"]');
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            alert("Por favor seleccione un archivo para subir.");
            mostrarFormularioNuevo(true);
            return;
        }
        const fileFormData = new FormData();
        fileFormData.append("archivo", fileInput.files[0]);
        const catSelect = formEl.querySelector('select[name="categoria"]');
        if (catSelect && catSelect.value) {
            fileFormData.append("categoria", catSelect.value);
        }

        await enviarPeticion({
            url: (await obtenerRutas()).url + "/documento/",
            metodo: "POST",
            cuerpo: fileFormData,
            mensajeError: "Error al subir archivo"
        });
        return;
    }

    const datos = formularioAObjeto(formEl);
    tiparCampos(datos, { esNuevo: true, formEl });

    await enviarPeticion({ url: api, metodo: "POST", cuerpo: datos, mensajeError: "Error al guardar" });
});

btnActualizar.addEventListener("click", async () => {
    const id = formEditar.dataset.id;
    if (!id) return;

    formEditar.classList.add("ocultar");
    mostrarFormularioNuevo(false);

    const api = await urlApi(id);
    const formEl = formEditar.querySelector("form");
    const datos = formularioAObjeto(formEl);
    tiparCampos(datos, { esNuevo: false, formEl });

    await enviarPeticion({ url: api, metodo: "PUT", cuerpo: datos, mensajeError: "Error al actualizar" });
});

btnsEliminar.forEach(btn => {
    btn.addEventListener("click", async () => {
        var id = btn.parentElement.parentElement.id;
        alternarCarga(true);
        const api = await urlApi(id);
        await enviarPeticion({ url: api, metodo: "DELETE", mensajeError: "Error al guardar" });
    })
});

inicializarTogglePassword();

// Tab navigation for Mantenimientos and Realizados (Procesos)
document.addEventListener("DOMContentLoaded", () => {
    const btnSeccions = document.querySelectorAll(".btn-seccion");
    btnSeccions.forEach(btn => {
        btn.addEventListener("click", () => {
            if (btn.textContent.trim() === "Tipos") {
                window.location.href = "/mantenimientos";
            } else if (btn.textContent.trim() === "Realizados") {
                window.location.href = "/proceso";
            }
        });
    });
});
