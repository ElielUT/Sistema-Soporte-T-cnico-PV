document.addEventListener("DOMContentLoaded", () => {
    const formBusqueda = document.getElementById("formBusqueda");
    if (!formBusqueda) return;

    const inputBuscar = formBusqueda.querySelector('input[name="Buscar"]');
    const selects = formBusqueda.querySelectorAll('select');
    const table = document.querySelector("table");
    if (!table) return;

    const rows = table.querySelectorAll("tbody tr");

    function filtrar() {
        const queryText = inputBuscar ? inputBuscar.value.trim().toLowerCase() : "";
        
        // Obtener filtros activos de los selects
        const activeFilters = {};
        selects.forEach(select => {
            const name = select.name;
            const val = select.value.trim().toLowerCase();
            if (name && val !== "") {
                activeFilters[name] = val;
            }
        });

        rows.forEach(row => {
            let matchesText = true;
            let matchesSelects = true;

            // 1. Coincidencia por texto de búsqueda (busca en todo el contenido de la fila)
            if (queryText !== "") {
                const textContent = row.textContent.trim().toLowerCase();
                matchesText = textContent.includes(queryText);
            }

            // 2. Coincidencia por selectores (compara usando dataset attributes)
            for (const [name, val] of Object.entries(activeFilters)) {
                const datasetKey = name.toLowerCase();
                const rowValue = (row.dataset[datasetKey] || "").trim().toLowerCase();
                if (rowValue !== val) {
                    matchesSelects = false;
                    break;
                }
            }

            // Mostrar u ocultar la fila
            if (matchesText && matchesSelects) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    }

    if (inputBuscar) {
        inputBuscar.addEventListener("input", filtrar);
    }
    selects.forEach(select => {
        select.addEventListener("change", filtrar);
    });

    // Evitar que el formulario intente recargar la página al presionar Enter
    formBusqueda.addEventListener("submit", (e) => {
        e.preventDefault();
    });
});
