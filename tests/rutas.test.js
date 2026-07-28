import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import express from "express";
import request from "supertest";
import axios from "axios";

vi.mock("axios", () => ({
    default: { get: vi.fn() },
}));

process.env.URL_API = "http://api.test";
process.env.USUARIO = "admin";
process.env.CONTRASENA = "secreto";

const { default: rutas } = await import("../routes/rutas.js");

/** Builds an app mounting the router, with a session stub controlled per test. */
function buildApp({ autenticado = true } = {}) {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use((req, _res, next) => {
        req.session = { autenticado };
        next();
    });
    app.set("view engine", "ejs");
    // Render the view name and its locals instead of the real EJS templates.
    app.engine("ejs", (filePath, options, callback) => {
        const view = filePath.split("/").pop().replace(".ejs", "");
        const { settings, _locals, cache, ...locals } = options;
        callback(null, JSON.stringify({ view, locals }));
    });
    app.use("/", rutas);
    return app;
}

function mockFetchOnce(payload) {
    const fetchMock = vi.fn(async () => ({ json: async () => payload }));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

const protectedRoutes = [
    { path: "/inventario", api: "/inventario/", payload: { items: [{ id: 1 }] }, view: "inventario", locals: { data: [{ id: 1 }] } },
    { path: "/productos/5", api: "/producto/5", payload: { id: 5 }, view: "producto", locals: { data: { id: 5 } } },
    { path: "/camaras", api: "/camara/", payload: { items: [1], productos: [2] }, view: "camaras", locals: { data: [1], productos: [2] } },
    { path: "/antenas", api: "/antena/", payload: { items: [1], productos: [2] }, view: "antenas", locals: { data: [1], productos: [2] } },
    { path: "/contrasenas", api: "/passwords/", payload: { items: [1] }, view: "contraseñas", locals: { data: [1] } },
    { path: "/mantenimientos", api: "/mantenimientos/", payload: { items: [1] }, view: "mantenimientos", locals: { data: [1] } },
    { path: "/proceso", api: "/proceso/", payload: { items: [1], mantenimientos: [2] }, view: "proceso", locals: { data: [1], mantenimientos: [2] } },
];

describe("routes/rutas.js", () => {
    beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("renders the login view on GET /", async () => {
        const res = await request(buildApp({ autenticado: false })).get("/");

        expect(res.status).toBe(200);
        expect(JSON.parse(res.text).view).toBe("index");
    });

    it("authenticates and redirects to /inventario with valid credentials", async () => {
        const app = express();
        app.use(express.urlencoded({ extended: true }));
        const session = {};
        app.use((req, _res, next) => { req.session = session; next(); });
        app.use("/", rutas);

        const res = await request(app).post("/").send("usuario=admin&password=secreto");

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe("/inventario");
        expect(session.autenticado).toBe(true);
    });

    it("redirects back to / and keeps the session unauthenticated with wrong credentials", async () => {
        const app = express();
        app.use(express.urlencoded({ extended: true }));
        const session = {};
        app.use((req, _res, next) => { req.session = session; next(); });
        app.use("/", rutas);

        const res = await request(app).post("/").send("usuario=admin&password=malo");

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe("/");
        expect(session.autenticado).toBeUndefined();
    });

    it.each(protectedRoutes)("redirects to / when $path is requested without a session", async ({ path }) => {
        const fetchMock = mockFetchOnce({});

        const res = await request(buildApp({ autenticado: false })).get(path);

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe("/");
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each(protectedRoutes)("renders $view with the API data on $path", async ({ path, api, payload, view, locals }) => {
        const fetchMock = mockFetchOnce(payload);

        const res = await request(buildApp()).get(path);

        expect(res.status).toBe(200);
        expect(fetchMock).toHaveBeenCalledWith(`http://api.test${api}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        expect(JSON.parse(res.text)).toEqual({ view, locals });
    });

    it.each(protectedRoutes)("returns an alert script when the API fails on $path", async ({ path }) => {
        vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("boom"); }));

        const res = await request(buildApp()).get(path);

        expect(res.status).toBe(200);
        expect(res.text).toContain("alert('Error al obtener los datos boom')");
        expect(res.text).toContain("window.location.href = '/'");
    });

    it("passes the API url to the documentos view and defaults its data to an empty list", async () => {
        mockFetchOnce({});

        const res = await request(buildApp()).get("/documentos");

        expect(JSON.parse(res.text)).toEqual({
            view: "documentos",
            locals: { data: [], urlApi: "http://api.test" },
        });
    });

    it("renders utiliza with the axios payload and the process id from the url", async () => {
        axios.get.mockResolvedValueOnce({ data: { items: [{ id: 1 }], inventario: [{ id: 2 }] } });

        const res = await request(buildApp()).get("/utiliza/12");

        expect(axios.get).toHaveBeenCalledWith("http://api.test/utiliza/");
        expect(JSON.parse(res.text)).toEqual({
            view: "utiliza",
            locals: { items: [{ id: 1 }], inventario: [{ id: 2 }], idproc1: "12" },
        });
    });

    it("handles axios failures on /utiliza/:id", async () => {
        axios.get.mockRejectedValueOnce(new Error("sin conexion"));

        const res = await request(buildApp()).get("/utiliza/12");

        expect(res.text).toContain("alert('Error al obtener los datos sin conexion')");
    });

    it("exposes the API url on GET /rutas", async () => {
        const res = await request(buildApp({ autenticado: false })).get("/rutas");

        expect(res.body).toEqual({ url: "http://api.test" });
    });
});
