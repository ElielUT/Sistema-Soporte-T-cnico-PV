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

router.get("/inventario", (req, res) => {
    res.render("inventario");
})

export default router;