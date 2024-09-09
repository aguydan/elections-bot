import { ErrorRequestHandler } from 'express';

export function handleError(): ErrorRequestHandler {
    return (error, req, res, _next) => {
        console.log('api request error: method ' + req.method + '; url ' + req.url, error);
        res.status(500).json({ error: true, message: error.message });
    };
}
