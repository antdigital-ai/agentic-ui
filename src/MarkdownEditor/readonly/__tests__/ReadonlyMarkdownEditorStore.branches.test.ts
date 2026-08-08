import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createReadonlyMarkdownEditorInstance,
  ReadonlyMarkdownEditorStore,
} from '../ReadonlyMarkdownEditorStore';
import { READONLY_MARKDOWN_CONTAINER_KEY } from '../findTextInReadonlyMarkdownDom';

describe('ReadonlyMarkdownEditorStore 分支覆盖', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('getMDContent / editor / 空操作占位', () => {
    const store = new ReadonlyMarkdownEditorStore({
      getContent: () => '# hi',
      getContainer: () => null,
    });
    expect(store.getMDContent()).toBe('# hi');
    expect(store.editor[READONLY_MARKDOWN_CONTAINER_KEY]).toBeNull();
    expect(store.findByPathAndText([], 'x')).toEqual([]);
    store.updateNodeList();
    store.insertNodes();
    expect(store.footnoteDefinitionMap.size).toBe(0);
  });

  it('setMDContent 在非 production 打 warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const store = new ReadonlyMarkdownEditorStore({
      getContent: () => '',
      getContainer: () => null,
    });
    store.setMDContent('x');
    expect(warn).toHaveBeenCalled();
    process.env.NODE_ENV = prev;
  });

  it('getContentContainer 优先 markdown-readonly / content / 回退根', () => {
    const root = document.createElement('div');
    const content = document.createElement('div');
    content.className = 'x-content';
    root.appendChild(content);
    const store = new ReadonlyMarkdownEditorStore({
      getContent: () => '',
      getContainer: () => root,
    });
    expect(store.getContentContainer()).toBe(content);

    const readonly = document.createElement('div');
    readonly.className = 'x-content-markdown-readonly';
    root.appendChild(readonly);
    expect(store.getContentContainer()).toBe(readonly);

    const bare = document.createElement('div');
    const bareStore = new ReadonlyMarkdownEditorStore({
      getContent: () => '',
      getContainer: () => bare,
    });
    expect(bareStore.getContentContainer()).toBe(bare);
  });

  it('findByPathAndText 在有容器时搜索', () => {
    const root = document.createElement('div');
    const content = document.createElement('div');
    content.className = 'md-content-markdown-readonly';
    const p = document.createElement('p');
    p.setAttribute('data-be', 'paragraph');
    p.textContent = 'Find me';
    content.appendChild(p);
    root.appendChild(content);
    const store = new ReadonlyMarkdownEditorStore({
      getContent: () => 'Find me',
      getContainer: () => root,
    });
    expect(store.findByPathAndText([], 'Find').length).toBe(1);
  });

  it('createReadonlyMarkdownEditorInstance exportHtml 分支', () => {
    const createObjectURL = vi.fn(() => 'blob:mock');
    const revoke = vi.fn();
    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL: revoke,
    });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      () => {},
    );

    const ref = { current: null as HTMLDivElement | null };
    const instance = createReadonlyMarkdownEditorInstance({
      markdownContainerRef: ref,
      getDisplayedContent: () => 'body',
    });
    instance.exportHtml('doc');
    expect(createObjectURL).not.toHaveBeenCalled();

    ref.current = document.createElement('div');
    ref.current.innerHTML = '<p>x</p>';
    instance.exportHtml('report');
    expect(createObjectURL).toHaveBeenCalled();
    expect(revoke).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(instance.store.getMDContent()).toBe('body');
    expect(instance.getDisplayedContent()).toBe('body');
    expect(instance.markdownEditorRef.current).toBeNull();
  });
});
