import { Router } from "express";
import { timingSafeEqual } from "crypto";
import axios from "axios";
import 'dotenv/config';

const router = Router();

function requireAuth(req, res, next) {
    if (!req.session.autenticado) {
        res.redirect("/");
        return;
    }
    next();
}

function errorApi(res, error) {
    console.error("Error de la api:", error);
    res.status(502).render("error", { mensaje: "Error al obtener los datos." });
}

function equalsSecret(entrada, esperado) {
    if (typeof entrada !== "string" || typeof esperado !== "string" || esperado === "") {
        return false;
    }
    const a = Buffer.from(entrada);
    const b = Buffer.from(esperado);
    if (a.length !== b.length) {
        return false;
    }
    return timingSafeEqual(a, b);
}

function requireIdNumerico(req, res, next) {
    if (!/^[0-9]+$/.test(req.params.id)) {
        res.status(400).render("error", { mensaje: "Identificador inválido." });
        return;
    }
    next();
}

router.get("/", (req, res) => {
    res.render("index");
})

router.post("/", (req, res) => {
    const { usuario, password } = req.body;
    const valido = equalsSecret(usuario, process.env.USUARIO) && equalsSecret(password, process.env.CONTRASENA);
    if (!valido) {
        res.redirect("/");
        return;
    }
    req.session.regenerate((error) => {
        if (error) {
            console.error("Error al iniciar sesión:", error);
            res.redirect("/");
            return;
        }
        req.session.autenticado = true;
        res.redirect("/inventario");
    });
})

router.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("session_id");
        res.redirect("/");
    });
})

router.get("/inventario", requireAuth, async (req, res) => {
    try {
        const respuesta = await fetch(`${process.env.URL_API}/inventario/`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        const items = await respuesta.json();
        const data = items.items;
        res.render("inventario", { data });
    } catch (error) {
        errorApi(res, error);
    }
})

router.get("/productos/:id", requireAuth, requireIdNumerico, async (req, res) => {
    try {
        const respuesta = await fetch(`${process.env.URL_API}/producto/${req.params.id}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        const items = await respuesta.json();
        const data = items;
        res.render("producto", { data });
    } catch (error) {
        errorApi(res, error);
    }
})

router.get("/camaras", requireAuth, async (req, res) => {
    try {
        const respuesta = await fetch(`${process.env.URL_API}/camara/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const items = await respuesta.json();
        const data = items.items;
        const productos = items.productos;
        res.render("camaras", { data, productos });
    } catch (error) {
        errorApi(res, error);
    }
})

router.get("/antenas", requireAuth, async (req, res) => {
    try {
        const respuesta = await fetch(`${process.env.URL_API}/antena/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const items = await respuesta.json();
        const data = items.items;
        const productos = items.productos;
        res.render("antenas", { data, productos });
    } catch (error) {
        errorApi(res, error);
    }
})

router.get("/contrasenas", requireAuth, async (req, res) => {
    try {
        const respuesta = await fetch(`${process.env.URL_API}/passwords/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const items = await respuesta.json();
        const data = items.items;
        res.render("contraseñas", { data });
    } catch (error) {
        errorApi(res, error);
    }
})

router.get("/documentos", requireAuth, async (req, res) => {
    try {
        const respuesta = await fetch(`${process.env.URL_API}/documento/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const items = await respuesta.json();
        const data = items.items || [];
        res.render("documentos", { data, urlApi: process.env.URL_API });
    } catch (error) {
        errorApi(res, error);
    }
})

router.get("/mantenimientos", requireAuth, async (req, res) => {
    try {
        const respuesta = await fetch(`${process.env.URL_API}/mantenimientos/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const items = await respuesta.json();
        const data = items.items;
        res.render("mantenimientos", { data });
    } catch (error) {
        errorApi(res, error);
    }
})

router.get("/proceso", requireAuth, async (req, res) => {
    try {
        const respuesta = await fetch(`${process.env.URL_API}/proceso/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const items = await respuesta.json();
        const data = items.items;
        const mantenimientos = items.mantenimientos;
        res.render("proceso", { data, mantenimientos });
    } catch (error) {
        errorApi(res, error);
    }
})

router.get("/utiliza/:id", requireAuth, requireIdNumerico, async (req, res) => {
    try {
        const respuesta = await axios.get(`${process.env.URL_API}/utiliza/`)
        const items = respuesta.data.items;
        const inventario = respuesta.data.inventario;
        res.render("utiliza", { items, inventario, idproc1: req.params.id });
    } catch (error) {
        errorApi(res, error);
    }
})

router.get("/rutas", requireAuth, (req, res) => {
    res.json({
        url: process.env.URL_API
    });
})

export default router;