import 'dotenv/config';

export async function obtenerDeApi(ruta) {
    const respuesta = await fetch(`${process.env.URL_API}${ruta}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    return await respuesta.json();
}

export function manejarErrorApi(res, error) {
    console.error("Error de la api:" + error);
    res.send(`<script> alert('Error al obtener los datos ${error.message}'); window.location.href = '/'; </script>`);
}

// Crea un handler que consulta la API y renderiza una vista con los datos obtenidos.
// ruta: string o (req) => string; datos: (respuesta, req) => objeto pasado a la vista.
export function vistaDesdeApi(vista, ruta, datos) {
    return async (req, res) => {
        try {
            const respuesta = await obtenerDeApi(typeof ruta === "function" ? ruta(req) : ruta);
            res.render(vista, datos(respuesta, req));
        } catch (error) {
            manejarErrorApi(res, error);
        }
    };
}
