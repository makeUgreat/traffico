import { z } from 'zod';

export const NodeCapacityLimitResponseSchema = z.object({
  status: z.literal('ok'),
});

export type NodeCapacityLimitResponse = z.infer<
  typeof NodeCapacityLimitResponseSchema
>;
