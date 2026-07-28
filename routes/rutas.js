import { Router } from "express";
import 'dotenv/config';
import { requiereAutenticacion } from "../middleware/auth.js";
import { vistaDesdeApi } from "../utils/api.js";

const router = Router();

router.get("/", (req, res) => {
    res.render("index");
})

router.post("/", (req, res) => {
    const { usuario, password } = req.body;
    if (usuario === process.env.USUARIO && password === process.env.CONTRASENA) {
        req.session.autenticado = true;
        res.redirect("/inventario");
    } else {
        res.redirect("/");
    }
})

router.get("/inventario", requiereAutenticacion,
    vistaDesdeApi("inventario", "/inventario/", items => ({ data: items.items })));

router.get("/productos/:id", requiereAutenticacion,
    vistaDesdeApi("producto", req => `/producto/${req.params.id}`, items => ({ data: items })));

router.get("/camaras", requiereAutenticacion,
    vistaDesdeApi("camaras", "/camara/", items => ({ data: items.items, productos: items.productos })));

router.get("/antenas", requiereAutenticacion,
    vistaDesdeApi("antenas", "/antena/", items => ({ data: items.items, productos: items.productos })));

router.get("/contrasenas", requiereAutenticacion,
    vistaDesdeApi("contraseñas", "/passwords/", items => ({ data: items.items })));

router.get("/documentos", requiereAutenticacion,
    vistaDesdeApi("documentos", "/documento/", items => ({ data: items.items || [], urlApi: process.env.URL_API })));

router.get("/mantenimientos", requiereAutenticacion,
    vistaDesdeApi("mantenimientos", "/mantenimientos/", items => ({ data: items.items })));

router.get("/proceso", requiereAutenticacion,
    vistaDesdeApi("proceso", "/proceso/", items => ({ data: items.items, mantenimientos: items.mantenimientos })));

router.get("/utiliza/:id", requiereAutenticacion,
    vistaDesdeApi("utiliza", "/utiliza/", (items, req) => ({
        items: items.items,
        inventario: items.inventario,
        idproc1: req.params.id
    })));

router.get("/rutas", (req, res) => {
    res.json({
        url: process.env.URL_API
    });
})

export default router;
