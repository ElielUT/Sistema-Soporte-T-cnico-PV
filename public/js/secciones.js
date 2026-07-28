inicializarSecciones([
    { id: "btnTodos", url: "/mantenimientos" },
    { id: "btnRealizados", url: "/proceso" }
]);

const btnUtiliza = document.querySelectorAll('.btnUtiliza');

btnUtiliza.forEach(btn => {
    btn.addEventListener('click', () => {
        const id = btn.parentElement.id;
        window.location.href = "/utiliza/" + id;
    });
});
