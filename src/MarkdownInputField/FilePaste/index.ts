/**
 * 读取目录下全部条目。
 *
 * 浏览器 `FileSystemDirectoryReader.readEntries` 单次最多返回 100 条（且不同浏览器实现不同），
 * 必须循环调用直到返回空数组才算读完，否则大目录会丢文件。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryReader/readEntries
 */
const readAllDirectoryEntries = (
  dirReader: FileSystemDirectoryReader,
): Promise<FileSystemEntry[]> => {
  return new Promise((resolve, reject) => {
    const allEntries: FileSystemEntry[] = [];
    const readBatch = () => {
      dirReader.readEntries(
        (entries) => {
          if (entries.length === 0) {
            resolve(allEntries);
            return;
          }
          allEntries.push(...entries);
          readBatch();
        },
        (error) => {
          reject(error);
        },
      );
    };
    readBatch();
  });
};

/**
 * 将单个 FileSystemFileEntry 解析为 File，失败时返回空数组（不阻塞整批）。
 */
const readFileEntry = (entry: FileSystemFileEntry): Promise<File[]> =>
  new Promise((resolve) => {
    entry.file(
      (file) => resolve([file]),
      () => resolve([]),
    );
  });

/**
 * 递归处理 FileSystemEntry，返回该条目下所有 File 对象。
 * - 文件：直接读取
 * - 目录：递归展开
 * - 其他：返回空
 */
const processEntry = async (entry: FileSystemEntry): Promise<File[]> => {
  if (entry.isFile) {
    return readFileEntry(entry as FileSystemFileEntry);
  }

  if (entry.isDirectory) {
    try {
      const dirReader = (entry as FileSystemDirectoryEntry).createReader();
      const entries = await readAllDirectoryEntries(dirReader);
      const fileArrays = await Promise.all(entries.map(processEntry));
      return fileArrays.flat();
    } catch {
      // 目录读取失败时返回空，避免 unhandled rejection
      return [];
    }
  }

  return [];
};

/**
 * 从剪贴板事件中提取所有 File 对象。
 *
 * 优先使用 `getAsFile()`（兼容 Safari），回退到 `webkitGetAsEntry()` 以支持目录粘贴。
 *
 * @param clipboardData - 剪贴板数据对象（`ClipboardEvent.clipboardData`）
 */
export const getFileListFromDataTransferItems = async (
  clipboardData: DataTransfer | null | undefined,
): Promise<File[]> => {
  const items = Array.from(clipboardData?.items || []);
  if (items.length === 0) {
    return [];
  }

  const filePromises: Promise<File[]>[] = [];
  for (const item of items) {
    if (item.kind !== 'file') continue;

    // Safari browser may throw error when using FileSystemFileEntry.file()
    // So we prioritize using getAsFile() method first for better browser compatibility
    const file = item.getAsFile();
    if (file) {
      filePromises.push(Promise.resolve([file]));
      continue;
    }

    const entry = item.webkitGetAsEntry();
    if (entry) {
      filePromises.push(processEntry(entry));
    }
  }

  const fileArrays = await Promise.all(filePromises);
  return fileArrays.flat();
};
