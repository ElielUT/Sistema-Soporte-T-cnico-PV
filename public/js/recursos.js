//Recursos
const btnContraseñas = document.getElementById("btnContraseñas"),
    btnDocumentos = document.getElementById("btnDocumentos");

btnContraseñas.addEventListener("click", () => {
    if (!btnContraseñas.classList.contains("seleccionado")) {
        btnContraseñas.classList.add("seleccionado");
        btnDocumentos.classList.remove("seleccionado");
        window.location.href = "/contrasenas";
    }
})

btnDocumentos.addEventListener("click", () => {
    if (!btnDocumentos.classList.contains("seleccionado")) {
        btnDocumentos.classList.add("seleccionado");
        btnContraseñas.classList.remove("seleccionado");
        window.location.href = "/documentos";
    }
})