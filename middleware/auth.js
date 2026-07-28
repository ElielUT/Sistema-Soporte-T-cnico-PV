export function requiereAutenticacion(req, res, next) {
    if (!req.session.autenticado) {
        res.redirect("/");
        return;
    }
    next();
}
