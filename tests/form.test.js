import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadClientScript } from "./helpers/domScript.js";

const html = `
    <button id="nuevo">Nuevo</button>
    <div id="cargando" class="ocultar">Cargando</div>
    <form id="formBusqueda"><input name="Buscar" /></form>
    <div id="formNuevo" class="ocultar">
        <form>
            <input name="nombre" />
            <input name="cantidad" type="number" />
            <input name="medida" />
            <input name="subcategoria" type="checkbox" />
            <input name="idinvt1" />
        </form>
        <button id="agregar">Agregar</button>
        <button class="cancelar">Cancelar</button>
    </div>
    <div id="formEditar" class="ocultar">
        <form>
            <input name="nombre" />
            <input name="cantidad" type="number" />
            <input name="medida" />
            <input name="activo" type="checkbox" />
            <select name="categoria">
                <option value=""></option>
                <option value="camara">camara</option>
            </select>
        </form>
        <button id="actualizar">Actualizar</button>
        <button class="cancelar">Cancelar</button>
    </div>
    <table>
        <tbody>
            <tr id="7" data-nombre="Cable" data-cantidad="4" data-activo="true" data-categoria="Camara">
                <td>
                    <button class="editar">Editar</button>
                    <button class="eliminar">Eliminar</button>
                    <input name="subcategoria" value="false" />
                </td>
            </tr>
        </tbody>
    </table>
    <button class="btn-seccion">Tipos</button>
    <button class="btn-seccion">Realizados</button>
    <div class="password-container">
        <input type="password" value="secreto" />
        <i class="toggle-password bi-eye-fill"></i>
    </div>
`;

async function setup({ pagina = "/inventario", ok = true, errorBody = { detail: "invalido" } } = {}) {
    const window = await loadClientScript("form.js", html);
    window.paginaActual = pagina;

    const calls = [];
    window.fetch = vi.fn(async (url, options) => {
        calls.push({ url, options });
        if (url === "/rutas") {
            return { ok: true, json: async () => ({ url: "http://api.test" }) };
        }
        return { ok, json: async () => errorBody };
    });

    const $ = selector => window.document.querySelector(selector);
    return { window, calls, $, doc: window.document };
}

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

describe("form.js", () => {
    let ctx;

    beforeEach(async () => {
        ctx = await setup();
    });

    it("shows the create form and hides the new button", () => {
        ctx.doc.getElementById("nuevo").click();

        expect(ctx.doc.getElementById("formNuevo").classList.contains("ocultar")).toBe(false);
        expect(ctx.doc.getElementById("nuevo").classList.contains("ocultar")).toBe(true);
        expect(ctx.doc.getElementById("formBusqueda").classList.contains("completo")).toBe(true);
    });

    it("hides and resets both forms when cancelling", () => {
        ctx.doc.getElementById("nuevo").click();
        ctx.$('#formNuevo input[name="nombre"]').value = "algo";

        ctx.$("#formNuevo .cancelar").click();

        expect(ctx.doc.getElementById("formNuevo").classList.contains("ocultar")).toBe(true);
        expect(ctx.doc.getElementById("formEditar").classList.contains("ocultar")).toBe(true);
        expect(ctx.$('#formNuevo input[name="nombre"]').value).toBe("");
        expect(ctx.doc.getElementById("nuevo").classList.contains("ocultar")).toBe(false);
    });

    it("fills the edit form from the row dataset and stores the row id", () => {
        ctx.$(".editar").click();

        const formEditar = ctx.doc.getElementById("formEditar");
        expect(formEditar.dataset.id).toBe("7");
        expect(formEditar.classList.contains("ocultar")).toBe(false);
        expect(ctx.$('#formEditar input[name="nombre"]').value).toBe("Cable");
        expect(ctx.$('#formEditar input[name="cantidad"]').value).toBe("4");
        expect(ctx.$('#formEditar input[name="activo"]').checked).toBe(true);
        // Select values are matched case-insensitively against the dataset value.
        expect(ctx.$('#formEditar select[name="categoria"]').value).toBe("camara");
        expect(ctx.doc.getElementById("cargando").classList.contains("ocultar")).toBe(true);
    });

    it("clears the select when the dataset value has no matching option", () => {
        ctx.doc.getElementById("7").dataset.categoria = "inexistente";

        ctx.$(".editar").click();

        expect(ctx.$('#formEditar select[name="categoria"]').value).toBe("");
    });

    it("navigates to the product page when editing a subcategoria row in /inventario", () => {
        ctx.$('.editar').parentElement.querySelector('input[name="subcategoria"]').value = "true";

        ctx.$(".editar").click();

        expect(ctx.window.navigations).toEqual(["/productos/7"]);
        expect(ctx.doc.getElementById("formEditar").classList.contains("ocultar")).toBe(true);
    });

    it("POSTs the new inventory item with numeric fields typed", async () => {
        ctx.$('#formNuevo input[name="nombre"]').value = "Cable";
        ctx.$('#formNuevo input[name="cantidad"]').value = "12";
        ctx.$('#formNuevo input[name="medida"]').value = "";

        ctx.doc.getElementById("agregar").click();
        await flush();

        const post = ctx.calls.find(c => c.options?.method === "POST");
        expect(post.url).toBe("http://api.test/inventario/");
        expect(JSON.parse(post.options.body)).toMatchObject({
            nombre: "Cable",
            cantidad: 12,
            medida: null,
            subcategoria: false,
        });
        expect(ctx.window.navigations).toEqual(["reload"]);
    });

    it("forces cantidad to 0 when the new item is a subcategoria", async () => {
        ctx.$('#formNuevo input[name="cantidad"]').value = "12";
        ctx.$('#formNuevo input[name="subcategoria"]').checked = true;

        ctx.doc.getElementById("agregar").click();
        await flush();

        const post = ctx.calls.find(c => c.options?.method === "POST");
        expect(JSON.parse(post.options.body)).toMatchObject({ cantidad: 0, subcategoria: true });
    });

    it("casts idinvt1 to a number on the /producto page", async () => {
        ctx = await setup({ pagina: "/producto" });
        ctx.$('#formNuevo input[name="idinvt1"]').value = "8";

        ctx.doc.getElementById("agregar").click();
        await flush();

        const post = ctx.calls.find(c => c.options?.method === "POST");
        expect(post.url).toBe("http://api.test/producto/");
        expect(JSON.parse(post.options.body).idinvt1).toBe(8);
    });

    it("alerts when the API rejects the creation", async () => {
        ctx = await setup({ ok: false, errorBody: { detail: "campo requerido" } });

        ctx.doc.getElementById("agregar").click();
        await flush();

        expect(ctx.window.alerts).toEqual(['Error al guardar: "campo requerido"']);
        expect(ctx.doc.getElementById("cargando").classList.contains("ocultar")).toBe(true);
    });

    it("requires a file before uploading on the documentos page", async () => {
        ctx = await setup({ pagina: "/documentos" });

        ctx.doc.getElementById("agregar").click();
        await flush();

        expect(ctx.window.alerts).toEqual(["Por favor seleccione un archivo para subir."]);
        expect(ctx.calls.some(c => c.options?.method === "POST")).toBe(false);
        expect(ctx.doc.getElementById("formNuevo").classList.contains("ocultar")).toBe(false);
    });

    it("PUTs the edited row to the id taken from the edit form", async () => {
        ctx.$(".editar").click();
        ctx.$('#formEditar input[name="cantidad"]').value = "3";
        ctx.$('#formEditar input[name="medida"]').value = "10";

        ctx.doc.getElementById("actualizar").click();
        await flush();

        const put = ctx.calls.find(c => c.options?.method === "PUT");
        expect(put.url).toBe("http://api.test/inventario/7");
        expect(JSON.parse(put.options.body)).toMatchObject({ cantidad: 3, medida: 10 });
    });

    it("does nothing when updating without a selected row", async () => {
        ctx.doc.getElementById("actualizar").click();
        await flush();

        expect(ctx.calls).toEqual([]);
    });

    it("DELETEs the row id and reloads the page", async () => {
        ctx.$(".eliminar").click();
        await flush();

        const del = ctx.calls.find(c => c.options?.method === "DELETE");
        expect(del.url).toBe("http://api.test/inventario/7");
        expect(ctx.window.navigations).toEqual(["reload"]);
    });

    it("toggles password visibility and the eye icon", () => {
        const toggle = ctx.$(".toggle-password");
        const input = ctx.$(".password-container input");

        toggle.click();
        expect(input.type).toBe("text");
        expect(toggle.classList.contains("bi-eye-slash-fill")).toBe(true);

        toggle.click();
        expect(input.type).toBe("password");
        expect(toggle.classList.contains("bi-eye-fill")).toBe(true);
    });

    it("navigates between the mantenimientos sections", () => {
        const [tipos, realizados] = ctx.doc.querySelectorAll(".btn-seccion");

        realizados.click();
        tipos.click();

        expect(ctx.window.navigations).toEqual(["/proceso", "/mantenimientos"]);
    });
});
