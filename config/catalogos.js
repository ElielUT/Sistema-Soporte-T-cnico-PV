// Catálogos de opciones compartidos por las vistas.
export const catalogos = {
    categoriasInventario: [
        "Periféricos",
        "Antenas",
        "Computo",
        "Cámaras",
        "Cables",
        "Mantenimiento",
        "Herramientas",
        "Impresoras",
        "Telefonía"
    ],
    categoriasContrasenas: [
        "Antenas",
        "Cámaras",
        "Redes Wifi",
        "Sistemas / Cuentas"
    ],
    categoriasDocumentos: [
        "Instrucciones",
        "Formatos",
        "Reportes",
        "Plantillas",
        "Otros"
    ],
    areas: [
        "Administración",
        "Soporte Técnico",
        "Instituto Bíblico",
        "Alcance"
    ],
    estadosProducto: [
        { valor: "En uso", texto: "En uso" },
        { valor: "Funcionado", texto: "Funcionado" },
        { valor: "Pendiente de Revisión", texto: "Pendiente de revisión" },
        { valor: "En Reparación", texto: "En reparación" }
    ],
    unidadesMedida: [
        {
            grupo: "Peso",
            opciones: [{ valor: "kg", texto: "Kg" }, { valor: "gr", texto: "Gr" }, { valor: "mg", texto: "Mg" }]
        },
        {
            grupo: "Litros",
            opciones: [{ valor: "lt", texto: "Lt" }, { valor: "ml", texto: "Ml" }]
        },
        {
            grupo: "Metros",
            opciones: [{ valor: "m", texto: "M" }, { valor: "cm", texto: "Cm" }, { valor: "mm", texto: "Mm" }]
        },
        {
            grupo: "Otra",
            opciones: [{ valor: "u", texto: "Unidad", seleccionado: true }, { valor: "", texto: "Ninguna" }]
        }
    ]
};
