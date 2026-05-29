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
        const respuesta = await fetch(`${process.env.URL_API}/inventario`,
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

export default router;