#!/usr/bin/env node

/**
 * Demo文件检查脚本 (Node.js版本)
 * 使用方法: node scripts/checkDemoFiles.js
 */

const fs = require('fs');
const path = require('path');

/**
 * 从markdown内容中提取demo文件路径
 */
function extractDemoFilePaths(markdownContent) {
  const filePaths = [];
  const lines = markdownContent.split('\n');
  
  // 匹配 <code src="../demos/xxx.tsx" 格式
  const codeBlockRegex = /<code\s+src="\.\.\/demos\/([^"]+)"[^>]*>/;
  
  lines.forEach((line, index) => {
    const match = line.match(codeBlockRegex);
    if (match) {
      const relativePath = match[1];
      filePaths.push({
        path: relativePath,
        lineNumber: index + 1
      });
    }
  });
  
  return filePaths;
}

/**
 * 检查单个demo文件是否存在
 */
function checkSingleDemoFile(relativePath, demosDir) {
  const fullPath = path.join(demosDir, relativePath);
  
  try {
    const exists = fs.existsSync(fullPath);
    return {
      filePath: relativePath,
      exists,
      error: exists ? undefined : `文件不存在: ${fullPath}`
    };
  } catch (error) {
    return {
      filePath: relativePath,
      exists: false,
      error: `检查文件时出错: ${error.message}`
    };
  }
}

/**
 * 检查demo页面中引用的所有文件
 */
function checkDemoFiles(markdownFilePath, demosDir) {
  try {
    // 读取markdown文件内容
    const markdownContent = fs.readFileSync(markdownFilePath, 'utf-8');
    
    // 提取文件路径
    const filePaths = extractDemoFilePaths(markdownContent);
    
    // 检查每个文件
    const results = filePaths.map(({ path: relativePath, lineNumber }) => {
      const result = checkSingleDemoFile(relativePath, demosDir);
      return {
        ...result,
        lineNumber
      };
    });
    
    // 统计结果
    const existingFiles = results.filter(r => r.exists).length;
    const missingFiles = results.filter(r => !r.exists).length;
    const missingFilesList = results.filter(r => !r.exists).map(r => r.filePath);
    
    return {
      totalFiles: results.length,
      existingFiles,
      missingFiles,
      results,
      missingFilesList
    };
  } catch (error) {
    throw new Error(`检查demo文件时出错: ${error.message}`);
  }
}

/**
 * 检查所有demo页面文件
 */
function checkAllDemoPages(projectRoot) {
  const demosPagesDir = path.join(projectRoot, 'docs', 'demos-pages');
  const demosDir = path.join(projectRoot, 'docs', 'demos');
  
  const reports = {};
  
  try {
    const files = fs.readdirSync(demosPagesDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    markdownFiles.forEach(file => {
      const filePath = path.join(demosPagesDir, file);
      try {
        reports[file] = checkDemoFiles(filePath, demosDir);
      } catch (error) {
        console.error(`检查文件 ${file} 时出错:`, error);
      }
    });
    
    return reports;
  } catch (error) {
    throw new Error(`检查demo页面时出错: ${error.message}`);
  }
}

async function main() {
  try {
    console.log('🔍 开始检查demo文件...\n');
    
    const projectRoot = path.resolve(__dirname, '..');
    const reports = checkAllDemoPages(projectRoot);
    
    let totalMissing = 0;
    let totalFiles = 0;
    
    console.log('='.repeat(60));
    console.log('📊 检查结果汇总');
    console.log('='.repeat(60));
    
    Object.entries(reports).forEach(([fileName, report]) => {
      console.log(`\n📄 ${fileName}:`);
      console.log(`   总文件数: ${report.totalFiles}`);
      console.log(`   存在文件: ${report.existingFiles}`);
      console.log(`   缺失文件: ${report.missingFiles}`);
      
      totalFiles += report.totalFiles;
      totalMissing += report.missingFiles;
      
      if (report.missingFiles > 0) {
        console.log(`   ❌ 缺失文件:`);
        report.missingFilesList.forEach(filePath => {
          const result = report.results.find(r => r.filePath === filePath);
          console.log(`      - ${filePath} (第${result?.lineNumber}行)`);
        });
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('📈 总体统计');
    console.log('='.repeat(60));
    console.log(`总文件数: ${totalFiles}`);
    console.log(`缺失文件数: ${totalMissing}`);
    console.log(`完整性: ${totalFiles > 0 ? ((totalFiles - totalMissing) / totalFiles * 100).toFixed(1) : 0}%`);
    
    if (totalMissing > 0) {
      console.log('\n⚠️  发现缺失文件，请检查上述列表！');
      process.exit(1);
    } else {
      console.log('\n✅ 所有demo文件都存在！');
    }
    
  } catch (error) {
    console.error('❌ 检查过程中出错:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}
