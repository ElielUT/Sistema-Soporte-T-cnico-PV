import { describe, it, expect, beforeEach } from "vitest";
import { loadClientScript } from "./helpers/domScript.js";

const html = `
    <button id="btnContraseñas" class="seleccionado">Contraseñas</button>
    <button id="btnDocumentos">Documentos</button>
`;

describe("recursos.js", () => {
    let window;

    beforeEach(async () => {
        window = await loadClientScript("recursos.js", html);
    });

    it("navigates to /documentos and toggles the selected class", () => {
        window.document.getElementById("btnDocumentos").click();

        expect(window.navigations).toEqual(["/documentos"]);
        expect(window.document.getElementById("btnDocumentos").classList.contains("seleccionado")).toBe(true);
        expect(window.document.getElementById("btnContraseñas").classList.contains("seleccionado")).toBe(false);
    });

    it("ignores clicks on the already selected button", () => {
        window.document.getElementById("btnContraseñas").click();

        expect(window.navigations).toEqual([]);
    });

    it("navigates to /contrasenas after the selection moved away", () => {
        window.document.getElementById("btnDocumentos").click();
        window.document.getElementById("btnContraseñas").click();

        expect(window.navigations).toEqual(["/documentos", "/contrasenas"]);
    });
});
