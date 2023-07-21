import { Request, Response, NextFunction, RequestHandler } from "express";

const validate =
  (schema: any, stripUnknown: boolean = true): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Removing all fields not defined in schema
      const data: { body?: any; query?: any; params?: any } = schema.cast(
        {
          body: req.body,
          query: req.query,
          params: req.params,
        },
        { stripUnknown: true }
      );

      if (stripUnknown) {
        req.body = data.body;
        req.query = data.query;
        req.params = data.params;
      }

      schema.validateSync(data, { abortEarly: false });
      return next();
    } catch (error: any) {
      return res.status(400).json({ type: error.name, messages: error.errors });
    }
  };

export default validate;
