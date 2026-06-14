import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

const DEFAULT_BLOCK_MS = 50;
const MIN_BLOCK_MS = 0;
const MAX_BLOCK_MS = 1000;
const ERROR_MESSAGE = 'ms must be an integer between 0 and 1000.';

export const CpuBlockingRequestSchema = z.object({
  ms: z
    .string()
    .regex(/^\d+$/, ERROR_MESSAGE)
    .transform(Number)
    .pipe(z.number().int().min(MIN_BLOCK_MS).max(MAX_BLOCK_MS))
    .default(DEFAULT_BLOCK_MS),
});

export type CpuBlockingRequest = z.infer<typeof CpuBlockingRequestSchema>;

export const CpuBlockingResponseSchema = z.object({
  status: z.literal('ok'),
});

export type CpuBlockingResponse = z.infer<typeof CpuBlockingResponseSchema>;

export function parseCpuBlockingRequest(
  ms: string | undefined,
): CpuBlockingRequest {
  const result = CpuBlockingRequestSchema.safeParse({ ms });

  if (!result.success) {
    throw new BadRequestException(ERROR_MESSAGE);
  }

  return result.data;
}
