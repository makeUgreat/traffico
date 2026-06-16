import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

const DEFAULT_CPU_BOUND_MS = 50;
const DEFAULT_ASYNC_IO_DELAY_MS = 50;
const DEFAULT_PBKDF2_ITERATIONS = 100_000;
const DEFAULT_PBKDF2_KEYLEN = 32;
const DEFAULT_PBKDF2_DIGEST = 'sha256';

const INTEGER_ERROR_MESSAGE = 'value must be an integer.';
const CpuBoundRequestErrorMessage =
  'ms must be an integer between 0 and 1000.';
const AsyncIoRequestErrorMessage =
  'delayMs must be an integer between 0 and 1000.';
const AsyncLibuvRequestErrorMessage =
  'iterations must be an integer between 1 and 1000000, keylen must be an integer between 1 and 128, and digest must be one of sha1, sha256, or sha512.';

const NumericStringSchema = z.string().regex(/^\d+$/, INTEGER_ERROR_MESSAGE);

export const CpuBoundRequestSchema = z.object({
  ms: NumericStringSchema.transform(Number)
    .pipe(z.number().int().min(0).max(1000))
    .default(DEFAULT_CPU_BOUND_MS),
});

export const AsyncIoRequestSchema = z.object({
  delayMs: NumericStringSchema.transform(Number)
    .pipe(z.number().int().min(0).max(1000))
    .default(DEFAULT_ASYNC_IO_DELAY_MS),
});

export const AsyncLibuvRequestSchema = z.object({
  iterations: NumericStringSchema.transform(Number)
    .pipe(z.number().int().min(1).max(1_000_000))
    .default(DEFAULT_PBKDF2_ITERATIONS),
  keylen: NumericStringSchema.transform(Number)
    .pipe(z.number().int().min(1).max(128))
    .default(DEFAULT_PBKDF2_KEYLEN),
  digest: z
    .enum(['sha1', 'sha256', 'sha512'])
    .default(DEFAULT_PBKDF2_DIGEST),
});

export type CpuBoundRequest = z.infer<typeof CpuBoundRequestSchema>;
export type AsyncIoRequest = z.infer<typeof AsyncIoRequestSchema>;
export type AsyncLibuvRequest = z.infer<typeof AsyncLibuvRequestSchema>;

export const NodeCapacityLimitResponseSchema = z.object({
  status: z.literal('ok'),
});

export type NodeCapacityLimitResponse = z.infer<
  typeof NodeCapacityLimitResponseSchema
>;

export function parseCpuBoundRequest(
  ms: string | undefined,
): CpuBoundRequest {
  const result = CpuBoundRequestSchema.safeParse({ ms });

  if (!result.success) {
    throw new BadRequestException(CpuBoundRequestErrorMessage);
  }

  return result.data;
}

export function parseAsyncIoRequest(
  delayMs: string | undefined,
): AsyncIoRequest {
  const result = AsyncIoRequestSchema.safeParse({ delayMs });

  if (!result.success) {
    throw new BadRequestException(AsyncIoRequestErrorMessage);
  }

  return result.data;
}

export function parseAsyncLibuvRequest(
  iterations: string | undefined,
  keylen: string | undefined,
  digest: string | undefined,
): AsyncLibuvRequest {
  const result = AsyncLibuvRequestSchema.safeParse({
    iterations,
    keylen,
    digest,
  });

  if (!result.success) {
    throw new BadRequestException(AsyncLibuvRequestErrorMessage);
  }

  return result.data;
}
