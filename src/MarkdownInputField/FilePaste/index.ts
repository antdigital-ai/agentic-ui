const processEntry = async (entry: FileSystemEntry): Promise<File[]> => {
  return new Promise((resolve) => {
    if (entry.isFile) {
      (entry as FileSystemFileEntry).file((file) => {
        resolve([file]);
      });
    } else if (entry.isDirectory) {
      const dirReader = (entry as FileSystemDirectoryEntry).createReader();
      dirReader.readEntries(async (entries) => {
        const filesPromises = entries.map((element) => processEntry(element));
        const fileArrays = await Promise.all(filesPromises);
        resolve(fileArrays.flat());
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
