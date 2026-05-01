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

const processEntry = async (entry: FileSystemEntry): Promise<File[]> => {
  return new Promise((resolve) => {
    if (entry.isFile) {
      (entry as FileSystemFileEntry).file(
        (file) => {
          resolve([file]);
        },
        () => {
          // 单个文件读取失败时跳过，不阻塞整批
          resolve([]);
        },
      );
    } else if (entry.isDirectory) {
      const dirReader = (entry as FileSystemDirectoryEntry).createReader();
      readAllDirectoryEntries(dirReader)
        .then(async (entries) => {
          const filesPromises = entries.map((element) => processEntry(element));
          const fileArrays = await Promise.all(filesPromises);
          resolve(fileArrays.flat());
        })
        .catch(() => {
          // 目录读取失败时返回空，避免 unhandled rejection
          resolve([]);
        });
    } else {
      resolve([]);
    }
  });
};

export const getFileListFromDataTransferItems = async (
  event: React.ClipboardEvent<HTMLDivElement>,
) => {
  const items = Array.from(event.clipboardData?.items || []);
  if (items.length === 0) {
    return [];
  }

  // get filesList
  const filePromises: Promise<File[]>[] = [];
  for (const item of items) {
    if (item.kind === 'file') {
      // Safari browser may throw error when using FileSystemFileEntry.file()
      // So we prioritize using getAsFile() method first for better browser compatibility
      const file = item.getAsFile();

      if (file) {
        filePromises.push(
          new Promise((resolve) => {
            resolve([file]);
          }),
        );
      } else {
        const entry = item.webkitGetAsEntry();

        if (entry) {
          filePromises.push(processEntry(entry));
        }
      }
    }
  }

  const fileArrays = await Promise.all(filePromises);
  return fileArrays.flat();
};
