import { Router } from "express";
import 'dotenv/config';

const router = Router();

class ApiError extends Error {
    constructor(mensaje, { status = 502, cause } = {}) {
        super(mensaje, { cause });
        this.name = "ApiError";
        this.status = status;
    }
}

async function obtenerDeApi(ruta) {
    if (!process.env.URL_API) {
        throw new ApiError("La variable de entorno URL_API no está configurada.", { status: 500 });
    }

    let respuesta;
    try {
        respuesta = await fetch(`${process.env.URL_API}${ruta}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        throw new ApiError(`No se pudo contactar con la API (${ruta}).`, { cause: error });
    }

    if (!respuesta.ok) {
        throw new ApiError(`La API respondió ${respuesta.status} ${respuesta.statusText} en ${ruta}.`, {
            status: respuesta.status === 404 ? 404 : 502
        });
    }

    try {
        return await respuesta.json();
    } catch (error) {
        throw new ApiError(`La API devolvió una respuesta que no es JSON válido en ${ruta}.`, { cause: error });
    }
}

function requiereSesion(req, res, next) {
    if (!req.session.autenticado) {
        res.redirect("/");
        return;
    }
    next();
}

// Envuelve un handler async para que cualquier rechazo llegue al manejador de errores
// en lugar de quedar como una promesa no capturada.
function asyncHandler(handler) {
    return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

router.get("/", (req, res) => {
    res.render("index", { error: req.query.error === "credenciales" });
})

router.post("/", (req, res) => {
    const { usuario, password } = req.body;
    if (usuario === process.env.USUARIO && password === process.env.CONTRASENA) {
        req.session.autenticado = true;
        res.redirect("/inventario");
    } else {
        res.redirect("/?error=credenciales");
    }
})

router.get("/inventario", requiereSesion, asyncHandler(async (req, res) => {
    const items = await obtenerDeApi("/inventario/");
    res.render("inventario", { data: items.items || [] });
}))

router.get("/productos/:id", requiereSesion, asyncHandler(async (req, res) => {
    const data = await obtenerDeApi(`/producto/${encodeURIComponent(req.params.id)}`);
    res.render("producto", { data });
}))

router.get("/camaras", requiereSesion, asyncHandler(async (req, res) => {
    const items = await obtenerDeApi("/camara/");
    res.render("camaras", { data: items.items || [], productos: items.productos || [] });
}))

router.get("/antenas", requiereSesion, asyncHandler(async (req, res) => {
    const items = await obtenerDeApi("/antena/");
    res.render("antenas", { data: items.items || [], productos: items.productos || [] });
}))

router.get("/contrasenas", requiereSesion, asyncHandler(async (req, res) => {
    const items = await obtenerDeApi("/passwords/");
    res.render("contraseñas", { data: items.items || [] });
}))

router.get("/documentos", requiereSesion, asyncHandler(async (req, res) => {
    const items = await obtenerDeApi("/documento/");
    res.render("documentos", { data: items.items || [], urlApi: process.env.URL_API });
}))

router.get("/mantenimientos", requiereSesion, asyncHandler(async (req, res) => {
    const items = await obtenerDeApi("/mantenimientos/");
    res.render("mantenimientos", { data: items.items || [] });
}))

router.get("/proceso", requiereSesion, asyncHandler(async (req, res) => {
    const items = await obtenerDeApi("/proceso/");
    res.render("proceso", { data: items.items || [], mantenimientos: items.mantenimientos || [] });
}))

router.get("/utiliza/:id", requiereSesion, asyncHandler(async (req, res) => {
    const respuesta = await obtenerDeApi("/utiliza/");
    res.render("utiliza", {
        items: respuesta.items || [],
        inventario: respuesta.inventario || [],
        idproc1: req.params.id
    });
}))

router.get("/rutas", (req, res) => {
    if (!process.env.URL_API) {
        res.status(500).json({ error: "URL_API no está configurada en el servidor." });
        return;
    }
    res.json({ url: process.env.URL_API });
})

// Manejador de errores: registra el error completo y responde con un estado HTTP real
// en lugar de devolver 200 con una alerta.
router.use((error, req, res, next) => {
    if (res.headersSent) {
        next(error);
        return;
    }
    console.error(`Error en ${req.method} ${req.originalUrl}:`, error);
    const status = error instanceof ApiError ? error.status : 500;
    const mensaje = error instanceof ApiError
        ? error.message
        : "Ocurrió un error inesperado al procesar la solicitud.";
    res.status(status).render("error", { status, mensaje });
})

export default router;
