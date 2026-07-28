import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function readClientScript(name) {
    return fs.readFileSync(path.join(rootDir, "public", "js", name), "utf8");
}

/**
 * Loads a browser script from public/js into a fresh jsdom document.
 * Returns the jsdom window, with navigation stubbed so window.location.href
 * assignments are recorded instead of triggering "not implemented" errors.
 */
export async function loadClientScript(name, html, { fireDomContentLoaded = true } = {}) {
    const dom = new JSDOM(`<!doctype html><html><body>${html}</body></html>`, {
        runScripts: "outside-only",
        url: "http://localhost/",
    });
    const { window } = dom;

    // Let jsdom finish parsing so its own DOMContentLoaded does not fire a second
    // time after the script under test registered its listeners.
    if (window.document.readyState === "loading") {
        await new Promise(resolve => window.document.addEventListener("DOMContentLoaded", resolve));
    }

    // jsdom's window.location cannot be replaced, so the script is evaluated with a
    // `window` proxy whose location records navigations instead of performing them.
    const navigations = [];
    const location = {
        get href() {
            return navigations.length ? navigations[navigations.length - 1] : "http://localhost/";
        },
        set href(value) {
            navigations.push(value);
        },
        reload: () => navigations.push("reload"),
    };
    const windowProxy = new Proxy(window, {
        get(target, prop) {
            if (prop === "location") return location;
            const value = Reflect.get(target, prop);
            return typeof value === "function" ? value.bind(target) : value;
        },
        set(target, prop, value) {
            if (prop === "location") return true;
            return Reflect.set(target, prop, value);
        },
    });
    window.navigations = navigations;
    const alerts = [];
    window.alerts = alerts;
    window.alert = message => alerts.push(message);
    window.Element.prototype.scrollIntoView = function () {};

    window.__scriptWindow__ = windowProxy;
    window.eval(`(function (window) {\n${readClientScript(name)}\n})(__scriptWindow__);`);

    if (fireDomContentLoaded) {
        window.document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true }));
    }

    return window;
}
