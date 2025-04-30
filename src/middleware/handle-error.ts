import { ErrorRequestHandler } from 'express';

export function handleError(): ErrorRequestHandler {
  return (error, req, res, _next) => {
    console.error(
      'API Request Error: method ' + req.method + '; url ' + req.url,
      error
    );
    res.status(500).json({ error: true, message: error.message });
  };
}
