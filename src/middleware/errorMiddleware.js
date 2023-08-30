import { NODE_ENV } from "../config/index.js";

const notFound = (req, res, next) => {
  const error = new Error(`Endpoint Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode == 200 ? 500 : res.statusCode;
  let message = err.message;

  res.status(statusCode).json({
    message: message,
    stack: NODE_ENV == "development" ? err.stack : null,
  });
};

export { notFound, errorHandler };
