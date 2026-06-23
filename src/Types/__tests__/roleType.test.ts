import { describe, expect, it } from 'vitest';
import type { RoleType } from '../common';

describe('RoleType', () => {
  it('includes sessionNotice for host-injected timeline rows', () => {
    const r: RoleType = 'sessionNotice';
    expect(r).toBe('sessionNotice');
  });
});
