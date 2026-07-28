import { describe, it, expect, beforeEach } from "vitest";
import { loadClientScript } from "./helpers/domScript.js";

const html = `
    <button id="btnTodos" class="seleccionado">Tipos</button>
    <button id="btnRealizados">Realizados</button>
    <div id="7"><button class="btnUtiliza">Utiliza</button></div>
    <div id="9"><button class="btnUtiliza">Utiliza</button></div>
`;

describe("secciones.js", () => {
    let window;

    beforeEach(async () => {
        window = await loadClientScript("secciones.js", html);
    });

    it("navigates to /proceso and moves the selection when clicking Realizados", () => {
        window.document.getElementById("btnRealizados").click();

        expect(window.navigations).toEqual(["/proceso"]);
        expect(window.document.getElementById("btnRealizados").classList.contains("seleccionado")).toBe(true);
        expect(window.document.getElementById("btnTodos").classList.contains("seleccionado")).toBe(false);
    });

    it("does not navigate when the clicked tab is already selected", () => {
        window.document.getElementById("btnTodos").click();

        expect(window.navigations).toEqual([]);
    });

    it("navigates back to /mantenimientos once Todos is no longer selected", () => {
        window.document.getElementById("btnRealizados").click();
        window.document.getElementById("btnTodos").click();

        expect(window.navigations).toEqual(["/proceso", "/mantenimientos"]);
    });

    it("navigates to /utiliza/<id> using the id of the button's parent", () => {
        window.document.querySelectorAll(".btnUtiliza")[1].click();

        expect(window.navigations).toEqual(["/utiliza/9"]);
    });
});
