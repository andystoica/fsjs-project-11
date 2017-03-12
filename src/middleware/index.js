function requireAuth(req, res, next) {
    if (!req.userId) {
        let err = new Error('Unauthorized');
        err.status = 401;
        return next(err);
    }
    return next();
}

module.exports.requireAuth = requireAuth;