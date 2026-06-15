import exec from 'k6/execution';

export function createTestId(): string {
  if (__ENV.K6_TESTID !== undefined && __ENV.K6_TESTID !== '') {
    return __ENV.K6_TESTID;
  }

  return crypto.randomUUID();
}

export function getTestId(): string {
  const testid = exec.test.options.tags?.testid;

  if (testid === undefined || testid === '') {
    throw new Error('Missing k6 test tag: testid');
  }

  return testid;
}

export function logTestId(): void {
  console.log(`k6 testid: ${getTestId()}`);
}
