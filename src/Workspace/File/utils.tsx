import {
  FileOther as DefaultFileIcon,
  FileAudio,
  FileCsv,
  FileDoc,
  FileFolders,
  FileMarkdown,
  FileOther,
  FilePdf,
  FilePic,
  FilePpt,
  FileVideo,
  FileXlsx,
  FileXml,
  FileZip,
} from '@sofa-design/icons';
import React from 'react';
import {
  FILE_TYPES,
  FileCategory,
  FileNode,
  FileType,
  getFileCategory,
  GroupNode,
} from '../types';

// 文件扩展名到图标的映射
const EXTENSION_ICON_MAP: Record<string, React.ReactNode> = {
  txt: <DefaultFileIcon />,
  xlsx: <FileXlsx />,
  xls: <FileXlsx />,
  doc: <FileDoc />,
  docx: <FileDoc />,
  pdf: <FilePdf />,
  csv: <FileCsv />,
  xml: <FileXml />,
  html: <FileXml />,
  md: <FileMarkdown />,
  markdown: <FileMarkdown />,
  ppt: <FilePpt />,
  pptx: <FilePpt />,
  zip: <FileZip />,
  rar: <FileZip />,
  '7z': <FileZip />,
  tar: <FileZip />,
  gz: <FileZip />,
  bz2: <FileZip />,
};

// 文件类型到默认图标的映射
const TYPE_ICON_MAP: Record<FileCategory, React.ReactNode> = {
  [FileCategory.Text]: <FileMarkdown />,
  [FileCategory.Code]: <FileXml />,
  [FileCategory.PDF]: <FilePdf />,
  [FileCategory.Word]: <FileDoc />,
  [FileCategory.Excel]: <FileXlsx />,
  [FileCategory.Presentation]: <FilePpt />,
  [FileCategory.Image]: <FilePic />,
  [FileCategory.Video]: <FileVideo />,
  [FileCategory.Audio]: <FileAudio />,
  [FileCategory.Archive]: <FileZip />,
  [FileCategory.Other]: <FileOther />,
};

/**
 * 获取文件类型图标
 */
export const getFileTypeIcon = (
  type: FileType,
  customIcon?: React.ReactNode,
  fileName?: string,
) => {
  if (customIcon) {
    return customIcon;
  }

  if (fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension && extension in EXTENSION_ICON_MAP) {
      return EXTENSION_ICON_MAP[extension];
    }
  }

  const fileDefinition = FILE_TYPES[type];
  if (fileDefinition && fileDefinition.extensions[0] in EXTENSION_ICON_MAP) {
    return EXTENSION_ICON_MAP[fileDefinition.extensions[0]];
  }

  return TYPE_ICON_MAP[getFileCategory(type)] || <DefaultFileIcon />;
};

/**
 * 获取分组图标 - 如果分组中有不同类型的文件，显示文件夹图标
 */
export const getGroupIcon = (
  group: GroupNode,
  groupType: FileType,
  customIcon?: React.ReactNode,
) => {
  if (customIcon) {
    return customIcon;
  }

  // 检查分组中是否有不同类型的文件
  if (group.children.length > 0) {
    const fileTypes = new Set(
      group.children.map((file) => {
        // 如果文件有明确的 type，使用 type
        if (file.type) {
          return file.type;
        }

        // 否则根据文件名推断类型
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension) {
          // 查找对应的文件类型
          for (const [type, definition] of Object.entries(FILE_TYPES)) {
            if (definition.extensions.includes(extension)) {
              return type;
            }
          }
        }

        return 'other'; // 默认类型
      }),
    );

    // 如果有多种不同的文件类型，显示文件夹图标
    if (fileTypes.size > 1) {
      return <FileFolders />;
    }

    // 如果只有一种文件类型，使用该类型的图标
    if (fileTypes.size === 1) {
      const singleType = Array.from(fileTypes)[0] as FileType;
      const representativeFileName = group.children[0]?.name;
      return getFileTypeIcon(singleType, undefined, representativeFileName);
    }
  }

  // 如果没有子文件，使用默认的分组类型图标
  return getFileTypeIcon(groupType);
};

// 生成唯一ID的工具函数
export const generateUniqueId = (node: FileNode | GroupNode): string => {
  if (node.id) return node.id;

  // 使用文件名、类型和时间戳组合生成唯一ID
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${node.type}_${node.name}_${timestamp}_${randomStr}`;
};
