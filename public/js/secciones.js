//
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

const btnUtiliza = document.querySelectorAll('.btnUtiliza');

btnUtiliza.forEach(btn => {
    btn.addEventListener('click', () => {
        const id = btn.parentElement.id;
        window.location.href = "/utiliza/" + id;
    });
});