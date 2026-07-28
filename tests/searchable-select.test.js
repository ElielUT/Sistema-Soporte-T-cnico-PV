import { describe, it, expect, beforeEach } from "vitest";
import { loadClientScript } from "./helpers/domScript.js";

const html = `
    <select id="sel" name="categoria" data-searchable="true">
        <option value="" disabled selected>Seleccione una categoria</option>
        <option value="1">Camara</option>
        <option value="2">Antena</option>
        <option value="3">Cable</option>
    </select>
`;

async function setup() {
    const window = await loadClientScript("searchable-select.js", html);
    const select = window.document.getElementById("sel");
    const container = window.document.querySelector(".searchable-select-container");
    return {
        window,
        select,
        container,
        input: container.querySelector(".searchable-select-input"),
        dropdown: container.querySelector(".searchable-select-dropdown"),
        options: () => Array.from(container.querySelectorAll(".searchable-select-option")).map(o => o.textContent),
        key: key => container
            .querySelector(".searchable-select-input")
            .dispatchEvent(new window.KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })),
    };
}

describe("searchable-select.js", () => {
    let ctx;

    beforeEach(async () => {
        ctx = await setup();
    });

    it("wraps the select in a container with a hidden native select", () => {
        expect(ctx.container).not.toBeNull();
        expect(ctx.select.style.display).toBe("none");
        expect(ctx.select.dataset.searchableInitialized).toBe("true");
        expect(ctx.input.placeholder).toBe("Seleccione una categoria");
        expect(ctx.dropdown.classList.contains("ocultar")).toBe(true);
    });

    it("opens the dropdown with every selectable option, skipping the placeholder", () => {
        ctx.input.click();

        expect(ctx.dropdown.classList.contains("ocultar")).toBe(false);
        expect(ctx.options()).toEqual(["Camara", "Antena", "Cable"]);
    });

    it("closes the dropdown when the input is clicked again", () => {
        ctx.input.click();
        ctx.input.click();

        expect(ctx.dropdown.classList.contains("ocultar")).toBe(true);
    });

    it("filters options by the typed query", () => {
        ctx.input.value = "ca";
        ctx.input.dispatchEvent(new ctx.window.Event("input", { bubbles: true }));

        expect(ctx.options()).toEqual(["Camara", "Cable"]);
    });

    it("shows a no-results message when nothing matches", () => {
        ctx.input.value = "zzz";
        ctx.input.dispatchEvent(new ctx.window.Event("input", { bubbles: true }));

        expect(ctx.options()).toEqual(["No se encontraron resultados"]);
    });

    it("selects an option on click, updating the select and the input", () => {
        const changes = [];
        ctx.select.addEventListener("change", () => changes.push(ctx.select.value));

        ctx.input.click();
        ctx.container.querySelectorAll(".searchable-select-option")[1].click();

        expect(ctx.select.value).toBe("2");
        expect(changes).toEqual(["2"]);
        expect(ctx.input.value).toBe("Antena");
        expect(ctx.dropdown.classList.contains("ocultar")).toBe(true);
    });

    it("selects the focused option with the arrow keys and Enter", () => {
        ctx.key("ArrowDown"); // opens the dropdown
        ctx.key("ArrowDown"); // focuses "Camara"
        ctx.key("ArrowDown"); // focuses "Antena"
        ctx.key("ArrowUp");   // back to "Camara"
        ctx.key("Enter");

        expect(ctx.select.value).toBe("1");
        expect(ctx.input.value).toBe("Camara");
    });

    it("selects the first match when Enter is pressed without arrowing", () => {
        ctx.input.click();
        ctx.input.value = "cab";
        ctx.input.dispatchEvent(new ctx.window.Event("input", { bubbles: true }));
        ctx.key("Enter");

        expect(ctx.select.value).toBe("3");
    });

    it("closes the dropdown on Escape and on an outside click", () => {
        ctx.input.click();
        ctx.key("Escape");
        expect(ctx.dropdown.classList.contains("ocultar")).toBe(true);

        ctx.input.click();
        ctx.window.document.body.click();
        expect(ctx.dropdown.classList.contains("ocultar")).toBe(true);
    });

    it("mirrors external changes of the native select in the input", () => {
        ctx.select.value = "3";
        ctx.select.dispatchEvent(new ctx.window.Event("change", { bubbles: true }));

        expect(ctx.input.value).toBe("Cable");
    });

    it("does not initialize the same select twice", () => {
        ctx.window.document.dispatchEvent(new ctx.window.Event("DOMContentLoaded", { bubbles: true }));

        expect(ctx.window.document.querySelectorAll(".searchable-select-container").length).toBe(1);
    });
});
