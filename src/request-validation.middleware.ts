import type { Request, RequestHandler, Response } from 'express';
import z from 'zod';
import type { ZodError, ZodSchema, ZodUnknown, SafeParseError, SafeParseReturnType } from 'zod';

interface ParamsDictionary {
  [key: string]: string;
}

export declare type TypedRequest<
  TParams extends ZodSchema = ZodSchema,
  TQuery extends ZodSchema = ZodSchema,
  TBody extends ZodSchema = ZodSchema
> = Request<z.infer<TParams>, unknown, z.infer<TBody>, z.infer<TQuery>>;

export declare type TypedRequestBody<TBody extends ZodSchema> = Request<
  ParamsDictionary,
  unknown,
  z.infer<TBody>,
  unknown
>;

export declare type TypedRequestParams<TParams extends ZodSchema> = Request<
  z.infer<TParams>,
  unknown,
  unknown,
  unknown
>;

export declare type TypedRequestQuery<TQuery extends ZodSchema> = Request<
  ParamsDictionary,
  unknown,
  unknown,
  z.infer<TQuery>
>;

export type ErrorListItem = { type: 'Query' | 'Params' | 'Body'; errors: ZodError };

export const sendErrors: (errors: Array<ErrorListItem>, res: Response) => void = (errors, res) => {
  return res.status(400).send(errors.map((error) => ({ type: error.type, errors: error.errors })));
};

/** Request parameter zod schemas. Copied from `zod-express-middleware` and improved to allow
 * a mix of `ZodEffects` and `ZodSchema` schemas on 1 request. `zod-express-middleware` `processRequest` requires all of a request's
 * schemas to be either `ZodEffects` or `ZodSchema`. */
export declare type ValidationParams<TParams extends ZodSchema, TQuery extends ZodSchema, TBody extends ZodSchema> = {
  params?: TParams;
  query?: TQuery;
  body?: TBody;
};

/** Express middleware function that calls the zod schema's `.safeParseAsync` function
 * on the corresponding request data (route params, query string, body), overwrites the request data with the result,
 * and responds with 400 on failure. */
export function validateRequest<
  TParams extends ZodSchema = ZodUnknown,
  TQuery extends ZodSchema = ZodUnknown,
  TBody extends ZodSchema = ZodUnknown
>(
  schemas: ValidationParams<TParams, TQuery, TBody>,
  logger = console
): RequestHandler<z.infer<TParams>, unknown, z.infer<TBody>, z.infer<TQuery>> {
  return async (req, res, next) => {
    try {
      const errors: Array<ErrorListItem> = [];
      const parsePromises = new Array<Promise<SafeParseReturnType<unknown, unknown>>>();
      if (schemas.params) {
        parsePromises.push(schemas.params.safeParseAsync(req.params));
      } else {
        parsePromises.push(Promise.resolve({ success: true, data: req.params }));
      }
      if (schemas.query) {
        parsePromises.push(schemas.query.safeParseAsync(req.query));
      } else {
        parsePromises.push(Promise.resolve({ success: true, data: req.params }));
      }
      if (schemas.body) {
        parsePromises.push(schemas.body.safeParseAsync(req.body));
      } else {
        parsePromises.push(Promise.resolve({ success: true, data: req.params }));
      }

      const [params, query, body] = await Promise.all(parsePromises);

      if (schemas.params) {
        if (params.success) {
          req.params = params.data;
        } else {
          errors.push({ type: 'Params', errors: (params as SafeParseError<TParams>).error });
        }
      }
      if (schemas.query) {
        if (query.success) {
          req.query = query.data;
        } else {
          errors.push({ type: 'Query', errors: (query as SafeParseError<TQuery>).error });
        }
      }
      if (schemas.body) {
        if (body.success) {
          req.body = body.data;
        } else {
          errors.push({ type: 'Body', errors: (body as SafeParseError<TBody>).error });
        }
      }

      if (errors.length > 0) {
        return sendErrors(errors, res);
      }
    } catch (err) {
      logger.error('Error validating the request', { error: err });
      return res.status(400).send({ message: 'There was a problem validating the request' });
    }
    return next();
  };
}
