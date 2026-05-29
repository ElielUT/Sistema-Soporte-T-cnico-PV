import { Router } from "express";
import 'dotenv/config';

const router = Router();

router.get("/", (req, res) => {
    res.render("index");
})

router.post("/", (req, res) => {
    const { usuario, password } = req.body;
    if (usuario === process.env.USUARIO && password === process.env.CONTRASENA) {
        //res.redirect("/dashboard");
        res.send("Entro");
    } else {
        res.send("No entro");
        //res.redirect("/");
    }
})

export default router;