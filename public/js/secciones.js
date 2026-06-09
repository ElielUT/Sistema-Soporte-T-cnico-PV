const btnTodos = document.getElementById("btnTodos");
const btnRealizados = document.getElementById("btnRealizados");

btnTodos.addEventListener("click", () => {
    if (!btnTodos.classList.contains("seleccionado")) {
        btnTodos.classList.add("seleccionado");
        btnRealizados.classList.remove("seleccionado");
        window.location.href = "/mantenimientos";
    }
})

btnRealizados.addEventListener("click", () => {
    if (!btnRealizados.classList.contains("seleccionado")) {
        btnRealizados.classList.add("seleccionado");
        btnTodos.classList.remove("seleccionado");
        window.location.href = "/proceso";
    }
})