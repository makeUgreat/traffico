import exec from 'k6/execution';

import { getEnv } from './env.ts';

const targetBaseUrls = getEnv('TARGET_BASE_URLS')
  .split(',')
  .map((value) => {
    const targetBaseUrl = value.trim().replace(/\/+$/, '');

    if (targetBaseUrl === '') {
      throw new Error(
        'TARGET_BASE_URLS must be a comma-separated URL list without empty entries',
      );
    }

    return targetBaseUrl;
  });

function getTargetBaseUrl(): string {
  return targetBaseUrls[exec.scenario.iterationInTest % targetBaseUrls.length];
}

export function getTargetUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${getTargetBaseUrl()}${normalizedPath}`;
}

export function getTargetRequestTags(): Record<string, string> {
  return {
    target_base_url: getTargetBaseUrl(),
  };
}
