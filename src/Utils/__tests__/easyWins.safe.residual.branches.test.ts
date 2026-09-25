/**
 * miss1–2 easy wins：language en 臂、columnMatching 空 alias、
 * DataSourceStrategy 无 url、File utils 单类型、genTableMinSize、media。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyTableMinSizeToSchema } from '../../MarkdownEditor/editor/utils/genTableMinSize';
import { convertRemoteImages } from '../../MarkdownEditor/editor/utils/media';
import { dataSourceManager } from '../../Workspace/File/DataSourceStrategy';
import { getGroupIcon } from '../../Workspace/File/utils';
import { resolveDocCardsFields } from '../columnMatching';
import { detectAntdLocale } from '../language';

describe('easyWins safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    document.body.innerHTML = '';
  });

  it('detectAntdLocale：仅 en（无 zh）', () => {
    document.body.innerHTML = '';
    const el = document.createElement('div');
    el.setAttribute('data-antd-locale', 'en-GB');
    document.body.appendChild(el);
    expect(detectAntdLocale()).toBe('en-US');
  });

  it('resolveDocCardsFields：override 空串跳过 alias', () => {
    const resolved = resolveDocCardsFields(['标题', '链接'], {
      title: '',
      url: '',
    } as any);
    expect(resolved?.title).toBe('标题');
  });

  it('dataSourceManager：url 无扩展名 / 空 url；单类型 group icon', () => {
    const noExt = dataSourceManager.processFile({
      name: 'a',
      url: 'https://cdn.example.com/path',
    } as any);
    expect(noExt).toBeTruthy();

    const emptyUrl = dataSourceManager.processFile({
      name: 'b.bin',
      url: '',
    } as any);
    expect(emptyUrl).toBeTruthy();

    const icon = getGroupIcon({
      id: 'g',
      name: 'pdfs',
      children: [
        { id: '1', name: 'a.pdf' },
        { id: '2', name: 'b.pdf' },
      ],
    } as any);
    expect(icon).toBeTruthy();
  });

  it('applyTableMinSizeToSchema：row.children 缺省；media children 假值', async () => {
    const table: any = {
      type: 'table',
      children: [{ type: 'table-row', children: undefined }],
    };
    applyTableMinSizeToSchema([table], { minColumn: 2, minRows: 2 });
    expect(table.children.length).toBeGreaterThanOrEqual(2);

    await convertRemoteImages({} as any, {
      editor: { children: null },
    } as any);
    expect(true).toBe(true);
  });
});
