import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, it } from 'vitest';
import { RealtimeFollow } from '../RealtimeFollow';
import { TestWrapper } from './RealtimeFollow/testUtils';

describe('rt-debug-tmp', () => {
  it('shell dom html', () => {
    const { container } = render(
      <TestWrapper>
        <RealtimeFollow
          data={{ type: 'shell', content: 'test', status: 'done' }}
        />
      </TestWrapper>,
    );
    process.stderr.write('===SHELL_HTML_START===\n');
    process.stderr.write(container.innerHTML + '\n');
    process.stderr.write('===SHELL_HTML_END===\n');
  });

  it('markdown dom html', () => {
    const { container } = render(
      <TestWrapper>
        <RealtimeFollow
          data={{ type: 'markdown', content: '# hello', status: 'done' }}
        />
      </TestWrapper>,
    );
    process.stderr.write('===MD_HTML_START===\n');
    process.stderr.write(container.innerHTML + '\n');
    process.stderr.write('===MD_HTML_END===\n');
  });
});
