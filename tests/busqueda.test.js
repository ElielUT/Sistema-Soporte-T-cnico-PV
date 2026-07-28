import { describe, it, expect, beforeEach } from "vitest";
import { loadClientScript } from "./helpers/domScript.js";

const html = `
    <form id="formBusqueda">
        <input name="Buscar" />
        <select name="categoria">
            <option value=""></option>
            <option value="camara">Camara</option>
            <option value="antena">Antena</option>
        </select>
    </form>
    <table>
        <tbody>
            <tr id="1" data-categoria="camara"><td>Camara Hikvision</td></tr>
            <tr id="2" data-categoria="antena"><td>Antena Ubiquiti</td></tr>
            <tr id="3" data-categoria="camara"><td>Camara Dahua</td></tr>
        </tbody>
    </table>
`;

function visibleIds(window) {
    return Array.from(window.document.querySelectorAll("tbody tr"))
        .filter(row => row.style.display !== "none")
        .map(row => row.id);
}

function type(window, value) {
    const input = window.document.querySelector('input[name="Buscar"]');
    input.value = value;
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
}

function choose(window, value) {
    const select = window.document.querySelector('select[name="categoria"]');
    select.value = value;
    select.dispatchEvent(new window.Event("change", { bubbles: true }));
}

describe("busqueda.js", () => {
    let window;

    beforeEach(async () => {
        window = await loadClientScript("busqueda.js", html);
    });

    it("filters rows by the search text, case insensitively", () => {
        type(window, "  DAHUA ");

        expect(visibleIds(window)).toEqual(["3"]);
    });

    it("shows every row again when the search text is cleared", () => {
        type(window, "dahua");
        type(window, "");

        expect(visibleIds(window)).toEqual(["1", "2", "3"]);
    });

    it("filters rows by a select value using the row dataset", () => {
        choose(window, "camara");

        expect(visibleIds(window)).toEqual(["1", "3"]);
    });

    it("combines the text query and the select filter", () => {
        choose(window, "camara");
        type(window, "hikvision");

        expect(visibleIds(window)).toEqual(["1"]);
    });

    it("hides every row when the text and the select filter do not overlap", () => {
        choose(window, "antena");
        type(window, "hikvision");

        expect(visibleIds(window)).toEqual([]);
    });

    it("prevents the default form submission", () => {
        const event = new window.Event("submit", { bubbles: true, cancelable: true });
        window.document.getElementById("formBusqueda").dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
    });

    it("does nothing when the page has no search form", async () => {
        await expect(loadClientScript("busqueda.js", "<table><tbody></tbody></table>")).resolves.toBeDefined();
    });

    it("does nothing when the page has no table", async () => {
        await expect(loadClientScript("busqueda.js", '<form id="formBusqueda"></form>')).resolves.toBeDefined();
    });
});
