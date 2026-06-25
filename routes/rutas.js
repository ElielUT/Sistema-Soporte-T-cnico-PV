import { Router } from "express";
import 'dotenv/config';

const router = Router();

router.get("/", (req, res) => {
    res.render("index");
})

router.post("/", (req, res) => {
    const { usuario, password } = req.body;
    if (usuario === process.env.USUARIO && password === process.env.CONTRASENA) {
        res.redirect("/inventario");
    } else {
        res.redirect("/");
    }
})

router.get("/inventario", async (req, res) => {
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
        console.error("Error de la api:" + error);
        res.send(`<script> alert('Error al obtener los datos ${error.message}'); window.location.href = '/'; </script>`);
    }
})

router.get("/productos/:id", async (req, res) => {
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
        console.error("Error de la api:" + error);
        res.send(`<script> alert('Error al obtener los datos ${error.message}'); window.location.href = '/'; </script>`);
    }
})

router.get("/camaras", async (req, res) => {
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
        console.error("Error de la api:" + error);
        res.send(`<script> alert('Error al obtener los datos ${error.message}'); window.location.href = '/'; </script>`);
    }
})

router.get("/antenas", async (req, res) => {
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
        console.error("Error de la api:" + error);
        res.send(`<script> alert('Error al obtener los datos ${error.message}'); window.location.href = '/'; </script>`);
    }
})

router.get("/contrasenas", async (req, res) => {
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
        console.error("Error de la api:" + error);
        res.send(`<script> alert('Error al obtener los datos ${error.message}'); window.location.href = '/'; </script>`);
    }
})

router.get("/mantenimientos", async (req, res) => {
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
        console.error("Error de la api:" + error);
        res.send(`<script> alert('Error al obtener los datos ${error.message}'); window.location.href = '/'; </script>`);
    }
})

router.get("/proceso", async (req, res) => {
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
        console.error("Error de la api:" + error);
        res.send(`<script> alert('Error al obtener los datos ${error.message}'); window.location.href = '/'; </script>`);
    }
})

router.get("/utiliza/:id", async (req, res) => {
    try {
        res.render("utiliza");
    } catch (error) {
        console.error("Error de la api:" + error);
        res.send(`<script> alert('Error al obtener los datos ${error.message}'); window.location.href = '/'; </script>`);
    }
})

router.get("/rutas", (req, res) => {
    res.json({
        url: process.env.URL_API
    });
})

export default router;