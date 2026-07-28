import express from "express";
import session from "express-session";
import rutas from "./routes/rutas.js"
import 'dotenv/config';
import cors from "cors";
import compression from "compression";
import { catalogos } from "./config/catalogos.js";

const app = express();

app.use(compression());
//BACKEND
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use(session({
    secret: process.env.SECRET_SESSION || 'default-session-secret-key-12345',
    name: "session_id",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, path: "/" },
}));

app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs");
app.locals.catalogos = catalogos;
app.use(express.static("public"));
app.use("/", rutas);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});