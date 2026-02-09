import {
  CheckSquareOutlined,
  CodeOutlined,
  FontSizeOutlined,
  OrderedListOutlined,
  PlayCircleOutlined,
  TableOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Button, ConfigProvider, Input, Menu, Tabs } from 'antd';
import { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import classNames from 'clsx';
import isHotkey from 'is-hotkey';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import ReactDOM from 'react-dom';
import { Editor, Element, Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { I18nContext, LocalKeys } from '../../../I18n';
import { CardNode } from '../../el';
import { useSubject } from '../../hooks/subscribe';
import { selChange$ } from '../plugins/useOnchange';
import { useEditorStore } from '../store';
import { getOffsetLeft } from '../utils/dom';
import { EditorUtils } from '../utils/editorUtils';
import { getRemoteMediaType } from '../utils/media';
import { useLocalState } from '../utils/useLocalState';
import { useStyle } from './insertAutocompleteStyle';

const ImageIcon = () => {
  return (
    <svg
      className="ant-menu-item-icon"
      viewBox="0 0 1024 1024"
      version="1.1"
      width="1em"
      height="1em"
    >
      <path
        fill="currentColor"
        d="M0 128l0 768 1024 0L1024 128 0 128zM944 816 80 816 80 208l864 0L944 816zM704 368c0 53.024 42.976 96 96 96 53.024 0 96-42.976 96-96 0-53.024-42.976-96-96-96C746.976 272 704 314.976 704 368M888 760l-192-288-128 96-240-304-192 496L888 760z"
      />
    </svg>
  );
};

const Quote = () => {
  return (
    <svg
      className="ant-menu-item-icon"
      viewBox="0 0 1024 1024"
      version="1.1"
      width="1em"
      height="1em"
    >
      <path
        d="M128 472.896h341.344v341.344H128zM128 472.896L272.096 192h110.08l-144.128 280.896z"
        fill="currentColor"
      ></path>
      <path
        d="M544 472.896h341.344v341.344H544zM544 472.896L688.096 192h110.08l-144.128 280.896z"
        fill="currentColor"
      ></path>
    </svg>
  );
};

// const ColumnIcon = () => {
//   return (
//     <svg
//       className="ant-menu-item-icon"
//       viewBox="0 0 1024 1024"
//       version="1.1"
//       width="1em"
//       height="1em"
//     >
//       <path
//         fill="currentColor"
//         d="M880 112c17.7 0 32 14.3 32 32v736c0 17.7-14.3 32-32 32H144c-17.7 0-32-14.3-32-32V144c0-17.7 14.3-32 32-32z m-404 72H184v656h292V184z m364 0H548v656h292V184z"
//       />
//     </svg>
//   );
// };

export type InsertAutocompleteItem = {
  label: string[];
  key: string;
  task: any;
  icon: React.ReactNode;
  args?: any[];
};

export type InsertOptions = {
  label: [string, string];
  key: string;
  children: InsertAutocompleteItem[];
};

const replaceUrl = [
  {
    reg: /https?:\/\/youtu.be\/([\w-]+)(\?si=\w+)?/i,
    replace: (match: RegExpMatchArray) => {
      return `https://www.youtube.com/embed/${match[1]}${match[2] || ''}`;
    },
  },
  {
    reg: /https?:\/\/www.bilibili.com\/video\/([\w-]+)\/?/,
    replace: (match: RegExpMatchArray) => {
      return `https://player.bilibili.com/player.html?isOutside=true&bvid=${match[1]}`;
    },
  },
  {
    reg: /src=["']([^"\n]+)["']/i,
    replace: (match: RegExpMatchArray) => {
      return match[1];
    },
  },
];

export const getInsertOptions: (
  ctx: { isTop: boolean },
  locale: LocalKeys,
) => InsertOptions[] = (ctx, locale) => {
  const options: InsertOptions[] = [
    {
      label: ['元素', 'Elements'],
      key: 'element',
      children: [
        {
          label: [locale?.table || '表格'],
          key: 'table',
          task: 'insertTable',
          icon: <TableOutlined />,
        },

        {
          label: [locale?.quote || '引用'],
          key: 'quote',
          task: 'insertQuote',
          icon: <Quote />,
        },
        {
          label: [locale?.code || '代码'],
          key: 'code',
          task: 'insertCode',
          icon: <CodeOutlined />,
        },
      ],
    },
    {
      label: ['媒体', 'media'],
      key: 'media',
      children: [
        {
          label: [locale?.localeImage || '本地图片'],
          task: 'uploadImage',
          key: 'localeImage',
          args: ['', true],
          icon: <ImageIcon />,
        },
      ],
    },
    {
      label: ['列表', 'List'],
      key: 'list',
      children: [
        {
          label: [locale['b-list'] || '无序列表'],
          task: 'list',
          key: 'b-list',
          args: ['unordered'],
          icon: <UnorderedListOutlined />,
        },
        {
          label: [locale['n-list'] || '有序列表'],
          task: 'list',
          key: 'n-list',
          args: ['ordered'],
          icon: <OrderedListOutlined />,
        },
        {
          label: [locale['t-list'] || '任务列表'],
          task: 'list',
          key: 't-list',
          args: ['task'],
          icon: <CheckSquareOutlined />,
        },
      ],
    },
  ];
  if (ctx.isTop) {
    options.splice(2, 0, {
      label: ['标题', 'Heading'],
      key: 'head',
      children: [
        {
          label: [locale?.head1 || '主标题'],
          task: 'head',
          key: 'head1',
          args: [1],
          icon: <FontSizeOutlined />,
        },
        {
          label: [locale?.head2 || '段标题'],
          task: 'head',
          key: 'head2',
          icon: <FontSizeOutlined />,
          args: [2],
        },
        {
          label: [locale?.head3 || '小标题'],
          task: 'head',
          key: 'head3',
          icon: <FontSizeOutlined />,
          args: [3],
        },
      ],
    });
  }
  return options;
};

/**
 * 插入自动完成组件的属性接口。
 *
 * @interface InsertAutocompleteProps
 * @property {InsertAutocompleteItem[]} [insertOptions] - 可选的插入选项数组。
 * @property {(task: InsertAutocompleteItem) => Promise<boolean>} [runInsertTask] - 执行插入任务的函数，接受一个插入选项作为参数，返回一个 Promise，表示任务是否成功。
 */
export interface InsertAutocompleteProps {
  /**
   * 可选的插入选项数组。
   */
  insertOptions?: InsertAutocompleteItem[];
  /**
   * 执行插入任务的函数，接受一个插入选项作为参数，返回一个 Promise，表示任务是否成功。
   * @param task
   * @returns
   */
  runInsertTask?: (
    task: InsertAutocompleteItem,
    offset: {
      x: number;
      y: number;
    },
  ) => Promise<boolean>;
  getContainer?: () => HTMLElement;

  /**
   * 操作 InsertAutocomplete 的选项
   * @param options
   * @returns
   */
  optionsRender?: (options: ItemType[]) => ItemType[];
}

export const InsertAutocomplete: React.FC<InsertAutocompleteProps> = (
  props,
) => {
  const {
    markdownEditorRef,
    markdownContainerRef,
    openInsertCompletion,
    setOpenInsertCompletion,
    keyTask$,
    insertCompletionText$,
  } = useEditorStore();
  const dom = useRef<HTMLDivElement>(null);
  const ctx = useRef<{
    path: number[];
    isTop: boolean;
  }>({ path: [], isTop: true });
  const [state, setState] = useLocalState({
    index: 0,
    filterOptions: [] as InsertOptions[],
    options: [] as InsertOptions['children'],
    left: 0,
    insertLink: false,
    insertAttachment: false,
    loading: false,
    insertUrl: '',
    top: 0 as number | undefined,
    bottom: 0 as number | undefined,
    text: '',
  });

  const clickClose = useCallback((e: Event) => {
    if (!dom.current?.contains(e.target as HTMLElement)) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      close();
    }
  }, []);

  const close = useCallback(() => {
    setState({
      filterOptions: [],
      options: [],
      index: 0,
      text: '',
      insertLink: false,
      insertAttachment: false,
      insertUrl: '',
    });
    if (typeof window === 'undefined') return;
    window.removeEventListener('click', clickClose);
  }, []);

  const runInsertTask = useCallback(
    async (
      op: InsertOptions['children'][number],
      params?: {
        isCustom?: boolean;
      },
    ) => {
      if (params?.isCustom) {
        Transforms.delete(markdownEditorRef.current, {
          at: ctx.current.path,
        });
        await props.runInsertTask?.(op, {
          x: state.left,
          y: state.top || state.bottom || 0,
        });
        if (typeof window === 'undefined') return;
        if (typeof window.matchMedia === 'undefined') return;
        setOpenInsertCompletion?.(false);
        close();
        return;
      }
      //@ts-ignore
      if (op.task === 'image' || op.task === 'attachment') {
        //@ts-ignore
        if (op.task === 'image') {
          setState({ insertLink: true });
          setTimeout(() => {
            dom.current?.querySelector('input')?.focus();
          }, 30);
        } else {
          setState({ insertAttachment: true });
        }
      } else if (op) {
        Transforms.insertText(markdownEditorRef.current, '', {
          at: {
            anchor: Editor.start(markdownEditorRef.current, ctx.current.path),
            focus: Editor.end(markdownEditorRef.current, ctx.current.path),
          },
        });
        keyTask$.next({
          key: op.task,
          args: op.args,
        });
        if (typeof window === 'undefined') return;
        if (typeof window.matchMedia === 'undefined') return;
        setOpenInsertCompletion?.(false);
        close();
      }
    },
    [],
  );

  const insertAttachByLink = useCallback(async () => {
    setState({ loading: true });
    try {
      let url = state.insertUrl;
      let size = 0;
      let name = url;
      if (/^https?:\/\//.test(url)) {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error();
        }
        size = Number(res.headers.get('content-length') || 0);
        const match = url.match(/([\w_-]+)\.\w+$/);
        if (match) {
          name = match[1];
        }
      }
      Transforms.insertText(markdownEditorRef.current, '', {
        at: {
          anchor: Editor.start(markdownEditorRef.current, ctx.current.path),
          focus: Editor.end(markdownEditorRef.current, ctx.current.path),
        },
      });
      const node = {
        type: 'attach',
        name,
        url,
        size,
        children: [{ text: '' }],
      };
      Transforms.setNodes(markdownEditorRef.current, node, {
        at: ctx.current.path,
      });
      EditorUtils.focus(markdownEditorRef.current);
      const next = Editor.next(markdownEditorRef.current, {
        at: ctx.current.path,
      });
      if (next?.[0].type === 'paragraph' && !Node.string(next[0])) {
        Transforms.delete(markdownEditorRef.current, { at: next[1] });
      }
      const [m] = Editor.nodes(markdownEditorRef.current, {
        match: (n) => !!n.type,
        mode: 'lowest',
      });
      selChange$.next({ node: m, sel: markdownEditorRef.current.selection });
      close();
    } finally {
      setState({ loading: false });
    }
  }, []);

  const keydown = useCallback((e: KeyboardEvent) => {
    if (
      state.options.length &&
      (e.key === 'ArrowUp' || e.key === 'ArrowDown')
    ) {
      e.preventDefault();
      if (e.key === 'ArrowUp' && state.index > 0) {
        setState({ index: state.index - 1 });
        const key = state.options[state.index].key;
        const target = document.querySelector(
          `[data-action="${key}"]`,
        ) as HTMLDivElement;
        if (target && dom.current!.scrollTop > target.offsetTop) {
          dom.current!.scroll({
            top: dom.current!.scrollTop - 160 + 30,
          });
        }
      }
      if (e.key === 'ArrowDown' && state.index < state.options.length - 1) {
        setState({ index: state.index + 1 });
        const key = state.options[state.index].key;
        const target = document.querySelector(
          `[data-action="${key}"]`,
        ) as HTMLDivElement;
        if (
          target &&
          target.offsetTop >
            dom.current!.scrollTop + dom.current!.clientHeight - 30
        ) {
          dom.current!.scroll({
            top: target.offsetTop - 30,
          });
        }
      }
    }
    if (e.key === 'Enter' && openInsertCompletion) {
      const op = state.options[state.index];
      if (op) {
        e.preventDefault();
        e.stopPropagation();
        runInsertTask(op);
      }
    }
    if (isHotkey('esc', e)) {
      setOpenInsertCompletion?.(false);
      EditorUtils.focus(markdownEditorRef.current);
    }
    if (isHotkey('backspace', e)) {
      setOpenInsertCompletion?.(false);
      EditorUtils.focus(markdownEditorRef.current);
    }
  }, []);

  const i18n = useContext(I18nContext);

  const insertOptions = useMemo(() => {
    return getInsertOptions(
      {
        isTop: ctx.current.isTop,
      },
      i18n.locale,
    );
  }, [i18n.locale, ctx.current.isTop]);
  /**
   * 插入媒体
   */
  const insertMedia = useCallback(async () => {
    setState({ loading: true });
    try {
      let url = state.insertUrl;
      for (const r of replaceUrl) {
        const m = url.match(r.reg);
        if (m) {
          url = r.replace(m);
          break;
        }
      }
      if (!/^(\w+:)?\/\//.test(url)) {
        throw new Error();
      }
      const type = await getRemoteMediaType(url);
      if (!type) {
        throw new Error();
      }
      Transforms.insertText(markdownEditorRef.current, '', {
        at: {
          anchor: Editor.start(markdownEditorRef.current, ctx.current.path),
          focus: Editor.end(markdownEditorRef.current, ctx.current.path),
        },
      });
      const node = EditorUtils.createMediaNode(url, 'image', {}) as CardNode;
      Transforms.setNodes(markdownEditorRef.current, node, {
        at: ctx.current.path,
      });
      EditorUtils.focus(markdownEditorRef.current);
      const [n] = Editor.nodes(markdownEditorRef.current, {
        match: (n) => !!n.type,
        mode: 'lowest',
      });
      selChange$.next({
        sel: markdownEditorRef.current.selection,
        node: n,
      });
      close();
    } finally {
      setState({ loading: false });
    }
  }, []);

  useSubject(insertCompletionText$, (text) => {
    let tempText = text || '';

    let filterOptions: InsertOptions[] = [];
    let options: InsertOptions['children'] = [];
    if (tempText) {
      for (let item of insertOptions) {
        const ops = item.children.filter((op) => {
          return op.label.some((l) =>
            l.toLowerCase().includes(tempText.toLowerCase()),
          );
        });
        options.push(...ops);
        if (ops.length) {
          filterOptions.push({
            ...item,
            children: ops,
          });
        }
      }
    } else {
      filterOptions = insertOptions;
      options = insertOptions.reduce(
        (a, b) => a.concat(b.children),
        [] as InsertOptions['children'],
      );
    }
    if (props.insertOptions && props?.insertOptions?.length) {
      filterOptions.unshift({
        label: ['快捷设置', 'My Quick'],
        key: 'quick',
        children: [...props.insertOptions],
      });
    }
    setState({
      index: 0,
      text: tempText,
      options,
      filterOptions,
    });
  });

  useEffect(() => {
    const calculatePosition = (
      nodeEl: HTMLElement,
      containerEl: HTMLElement,
    ) => {
      const top = nodeEl.getBoundingClientRect().top;

      const left = getOffsetLeft(nodeEl, containerEl) + 24;

      const containerScrollTop = containerEl.scrollTop;
      const containerHeight = document.documentElement.clientHeight;

      const nodeHeight = nodeEl.clientHeight;

      const nodeTopRelativeToContainer = top - containerScrollTop;
      const nodeBottomRelativeToContainer =
        nodeTopRelativeToContainer + nodeHeight;

      const spaceAbove = nodeTopRelativeToContainer;
      const spaceBelow = containerHeight - nodeBottomRelativeToContainer;

      // 当节点上方空间不足，且下方空间不足时，触底显示
      if (spaceBelow < 212 && spaceAbove < 212) {
        return {
          top: undefined,
          bottom: 0,
          left,
        };
      }

      // 如果节点下方空间不足但上方有足够空间，显示在上方
      if (spaceBelow < 212 && spaceAbove >= 212) {
        return {
          top: undefined,
          bottom: containerHeight - nodeTopRelativeToContainer,
          left,
        };
      }

      // 默认逻辑，优先显示在下方
      if (spaceBelow >= 212) {
        return {
          top: nodeBottomRelativeToContainer,
          bottom: undefined,
          left,
        };
      }

      return undefined;
    };

    const setupEventListeners = () => {
      if (typeof window === 'undefined') return;
      markdownContainerRef?.current?.addEventListener('keydown', keydown);
      markdownContainerRef?.current?.addEventListener('click', clickClose);
    };

    const removeEventListeners = () => {
      if (typeof window === 'undefined') return;
      markdownContainerRef?.current?.removeEventListener('keydown', keydown);
      markdownContainerRef?.current?.removeEventListener('click', clickClose);
    };

    if (openInsertCompletion) {
      const [node] = Editor.nodes<any>(markdownEditorRef.current, {
        match: (n) => Element.isElement(n),
        mode: 'lowest',
      });

      if (node) {
        ctx.current = {
          path: node[1],
          isTop: EditorUtils.isTop(markdownEditorRef.current, node[1]),
        };
        if (node?.[0]?.type === 'paragraph') {
          const el = ReactEditor.toDOMNode(markdownEditorRef.current, node[0]);
          if (el) {
            const position = calculatePosition(el, document.body);
            if (position) {
              setState(position);
            } else {
              setState({ top: 0, left: 0, bottom: undefined });
            }
          }
        }
        setupEventListeners();

        setTimeout(() => {
          dom.current?.scroll({ top: 0 });
        });
      }
    } else {
      removeEventListeners();
      close();
    }

    return () => {
      removeEventListeners();
    };
  }, [openInsertCompletion]);

  const context = useContext(ConfigProvider.ConfigContext);
  const baseClassName = context?.getPrefixCls(`md-editor-insert-autocomplete`);

  const { wrapSSR, hashId } = useStyle(baseClassName);

  return ReactDOM.createPortal(
    wrapSSR(
      <div
        ref={dom}
        className={classNames(baseClassName, hashId)}
        style={{
          position: 'absolute',
          zIndex: 9999,
          display:
            !openInsertCompletion || !state.filterOptions.length
              ? 'none'
              : 'flex',
          width: state.insertLink || state.insertAttachment ? 320 : undefined,
          maxHeight: 212,
          overflowY: 'auto',
          left: state.left,
          top: state.top,
          bottom: state.bottom,
        }}
        onMouseDown={(e) => {
          e.preventDefault();
        }}
      >
        {!state.insertLink && !state.insertAttachment && (
          <>
            <Menu
              items={
                props.optionsRender?.(
                  state.filterOptions
                    .map((l) => {
                      return {
                        label: l?.label?.[1],
                        key: l?.key,
                        icon: l?.children?.[0]?.icon,
                        children: l?.children?.map((el) => ({
                          label: el.label?.[1],
                          key: el.key,
                          icon: el.icon,
                          onClick: (_: any) => {
                            _.domEvent.stopPropagation();
                            _.domEvent.preventDefault();

                            const task = insertOptions
                              .map((o) => o?.children)
                              .flat(1)
                              .find((o) => {
                                return o.key === el.key;
                              });

                            const myInsertOptions =
                              props?.insertOptions?.find?.(
                                (o) => o.key === el.key,
                              );

                            if (myInsertOptions) {
                              runInsertTask(myInsertOptions, {
                                isCustom: true,
                              });
                              return;
                            }

                            if (task) {
                              runInsertTask(task);
                            }
                          },
                        })),
                      };
                    })
                    .map((l) => {
                      return l?.children;
                    })
                    .flat(1) || [],
                ) as any[]
              }
            />
          </>
        )}
        {state.insertLink && (
          <div
            style={{
              padding: 8,
            }}
          >
            <div
              style={{
                fontSize: '1em',
                color: 'rgba(0,0,0,0.8)',
                marginBottom: 4,
                display: 'flex',
                alignContent: 'center',
                gap: 4,
              }}
            >
              <PlayCircleOutlined />
              <span>Embed media links</span>
            </div>
            <Input
              placeholder={'Paste media link'}
              onMouseDown={(e) => e.stopPropagation()}
              value={state.insertUrl}
              onKeyDown={(e) => {
                if (isHotkey('enter', e)) {
                  insertMedia();
                }
              }}
              onChange={(e) => setState({ insertUrl: e.target.value })}
            />
            <Button
              block={true}
              loading={state.loading}
              type={'primary'}
              size={'small'}
              style={{
                marginTop: '1em',
              }}
              onClick={insertMedia}
              disabled={!state.insertUrl}
            >
              Embed
            </Button>
          </div>
        )}
        {state.insertAttachment && (
          <div
            style={{
              width: 320,
              padding: 8,
            }}
          >
            <Tabs
              size={'small'}
              items={[
                {
                  label: 'Local',
                  key: 'local',
                  children: (
                    <div>
                      <Button
                        block={true}
                        size={'small'}
                        type={'primary'}
                        onClick={() => {
                          Transforms.insertText(markdownEditorRef.current, '', {
                            at: {
                              anchor: Editor.start(
                                markdownEditorRef.current,
                                ctx.current.path,
                              ),
                              focus: Editor.end(
                                markdownEditorRef.current,
                                ctx.current.path,
                              ),
                            },
                          });
                          setState({ insertUrl: '' });
                          insertAttachByLink();
                        }}
                      >
                        Choose a file
                      </Button>
                    </div>
                  ),
                },
                {
                  label: 'Embed Link',
                  key: 'embed',
                  children: (
                    <div>
                      <Input
                        placeholder={'Paste attachment link'}
                        onMouseDown={(e) => e.stopPropagation()}
                        value={state.insertUrl}
                        onKeyDown={(e) => {
                          if (isHotkey('enter', e)) {
                            insertAttachByLink();
                          }
                        }}
                        onChange={(e) =>
                          setState({ insertUrl: e.target.value })
                        }
                      />
                      <Button
                        block={true}
                        loading={state.loading}
                        type={'primary'}
                        style={{
                          marginTop: '1em',
                        }}
                        size={'small'}
                        onClick={insertAttachByLink}
                        disabled={!state.insertUrl}
                      >
                        Embed
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </div>,
    ),
    document.body,
  );
};
