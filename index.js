import express from "express";
import session from "express-session";
import rutas from "./routes/rutas.js"
import 'dotenv/config';
import cors from "cors";
import compression from "compression";

const app = express();

const SECRET_SESSION = process.env.SECRET_SESSION;
if (!SECRET_SESSION) {
    throw new Error("Falta la variable de entorno SECRET_SESSION");
}

const origenesPermitidos = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(origen => origen.trim())
    .filter(Boolean);

app.use(compression());
//BACKEND
app.use(cors({
    origin: origenesPermitidos.length > 0 ? origenesPermitidos : false,
    credentials: true,
}));
app.use(express.json());
app.use(express.static('public'));

app.set("trust proxy", 1);
app.use(session({
    secret: SECRET_SESSION,
    name: "session_id",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 8,
        path: "/",
    },
}));

app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/", rutas);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});