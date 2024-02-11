import z, { ZodEffects, ZodSchema, ZodString, ZodUnion } from 'zod';

export function jsonString<T extends ZodSchema>(schema: T): ZodEffects<ZodString, T["_output"]> {
  return z.string().transform((val, ctx) => {
    try {
      const parsed = JSON.parse(val) as z.infer<T>;
      if (schema.safeParse(parsed).success) {
        return parsed;
      } else {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid JSON string',
        });
      }
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid JSON string',
      });
    }
  });
}
