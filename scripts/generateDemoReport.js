#!/usr/bin/env node

/**
 * 生成Demo文件检查HTML报告
 * 使用方法: node scripts/generateDemoReport.js
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
 * 获取文件类型
 */
function getFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.tsx':
      return 'React组件';
    case '.ts':
      return 'TypeScript';
    case '.jsx':
      return 'React组件(JS)';
    case '.js':
      return 'JavaScript';
    case '.css':
      return '样式文件';
    case '.json':
      return 'JSON配置';
    default:
      return '其他';
  }
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 检查单个demo文件的详细信息
 */
function checkSingleDemoFileDetailed(relativePath, demosDir) {
  const fullPath = path.join(demosDir, relativePath);
  const fileType = getFileType(relativePath);
  
  try {
    const stats = fs.statSync(fullPath);
    return {
      filePath: relativePath,
      exists: true,
      fileSize: stats.size,
      lastModified: stats.mtime,
      fileType
    };
  } catch (error) {
    return {
      filePath: relativePath,
      exists: false,
      error: `文件不存在: ${fullPath}`,
      fileType
    };
  }
}

/**
 * 检查demo页面中引用的所有文件（详细版）
 */
function checkDemoFilesDetailed(markdownFilePath, demosDir) {
  try {
    // 读取markdown文件内容
    const markdownContent = fs.readFileSync(markdownFilePath, 'utf-8');
    
    // 提取文件路径
    const filePaths = extractDemoFilePaths(markdownContent);
    
    // 检查每个文件
    const results = filePaths.map(({ path: relativePath, lineNumber }) => {
      const result = checkSingleDemoFileDetailed(relativePath, demosDir);
      return {
        ...result,
        lineNumber
      };
    });
    
    // 统计结果
    const existingFiles = results.filter(r => r.exists).length;
    const missingFiles = results.filter(r => !r.exists).length;
    const missingFilesList = results.filter(r => !r.exists).map(r => r.filePath);
    const totalSize = results.reduce((sum, r) => sum + (r.fileSize || 0), 0);
    
    // 按文件类型统计
    const fileTypeStats = {};
    results.forEach(result => {
      if (result.exists && result.fileType) {
        if (!fileTypeStats[result.fileType]) {
          fileTypeStats[result.fileType] = { count: 0, size: 0 };
        }
        fileTypeStats[result.fileType].count++;
        fileTypeStats[result.fileType].size += result.fileSize || 0;
      }
    });
    
    return {
      checkTime: new Date(),
      totalFiles: results.length,
      existingFiles,
      missingFiles,
      totalSize,
      results,
      missingFilesList,
      fileTypeStats
    };
  } catch (error) {
    throw new Error(`检查demo文件时出错: ${error.message}`);
  }
}

/**
 * 检查所有demo页面文件（详细版）
 */
function checkAllDemoPagesDetailed(projectRoot) {
  const demosPagesDir = path.join(projectRoot, 'docs', 'demos-pages');
  const demosDir = path.join(projectRoot, 'docs', 'demos');
  
  const reports = {};
  
  try {
    const files = fs.readdirSync(demosPagesDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    markdownFiles.forEach(file => {
      const filePath = path.join(demosPagesDir, file);
      try {
        reports[file] = checkDemoFilesDetailed(filePath, demosDir);
      } catch (error) {
        console.error(`检查文件 ${file} 时出错:`, error);
      }
    });
    
    return reports;
  } catch (error) {
    throw new Error(`检查demo页面时出错: ${error.message}`);
  }
}

/**
 * 生成HTML格式的检查报告
 */
function generateHTMLReport(reports) {
  // 合并所有报告的数据
  let totalFiles = 0;
  let existingFiles = 0;
  let missingFiles = 0;
  let totalSize = 0;
  const allResults = [];
  const allMissingFiles = [];
  const allFileTypeStats = {};
  
  Object.entries(reports).forEach(([fileName, report]) => {
    totalFiles += report.totalFiles;
    existingFiles += report.existingFiles;
    missingFiles += report.missingFiles;
    totalSize += report.totalSize;
    
    // 添加页面信息到结果中
    report.results.forEach(result => {
      allResults.push({
        ...result,
        pageName: fileName
      });
    });
    
    allMissingFiles.push(...report.missingFilesList.map(file => ({ file, page: fileName })));
    
    // 合并文件类型统计
    Object.entries(report.fileTypeStats).forEach(([type, stats]) => {
      if (!allFileTypeStats[type]) {
        allFileTypeStats[type] = { count: 0, size: 0 };
      }
      allFileTypeStats[type].count += stats.count;
      allFileTypeStats[type].size += stats.size;
    });
  });
  
  const completeness = totalFiles > 0 ? ((existingFiles / totalFiles) * 100).toFixed(1) : 0;
  const checkTime = new Date();
  
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demo文件检查报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 2em; }
        .header .subtitle { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #007bff; }
        .stat-card.success { border-left-color: #28a745; }
        .stat-card.warning { border-left-color: #ffc107; }
        .stat-card.danger { border-left-color: #dc3545; }
        .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .stat-label { color: #6c757d; font-size: 0.9em; }
        .section { margin: 30px 0; }
        .section h2 { color: #333; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; }
        .file-list { background: #f8f9fa; border-radius: 8px; padding: 20px; }
        .file-item { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
        .file-item:last-child { border-bottom: none; }
        .file-status { margin-right: 10px; font-size: 1.2em; }
        .file-info { flex: 1; }
        .file-path { font-family: 'Monaco', 'Menlo', monospace; background: #e9ecef; padding: 2px 6px; border-radius: 4px; }
        .file-meta { font-size: 0.8em; color: #6c757d; margin-top: 2px; }
        .missing-files { background: #fff5f5; border: 1px solid #fed7d7; }
        .missing-files h2 { color: #c53030; }
        .file-type-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
        .type-card { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
        .type-name { font-weight: bold; margin-bottom: 5px; }
        .type-count { color: #007bff; font-size: 1.2em; }
        .page-section { margin: 20px 0; }
        .page-title { background: #e3f2fd; padding: 10px 15px; border-radius: 6px; margin-bottom: 10px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Demo文件检查报告</h1>
            <p class="subtitle">检查时间: ${checkTime.toLocaleString('zh-CN')}</p>
        </div>
        
        <div class="content">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${totalFiles}</div>
                    <div class="stat-label">总文件数</div>
                </div>
                <div class="stat-card success">
                    <div class="stat-number">${existingFiles}</div>
                    <div class="stat-label">存在文件</div>
                </div>
                <div class="stat-card ${missingFiles > 0 ? 'danger' : 'success'}">
                    <div class="stat-number">${missingFiles}</div>
                    <div class="stat-label">缺失文件</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${formatFileSize(totalSize)}</div>
                    <div class="stat-label">总大小</div>
                </div>
                <div class="stat-card ${parseFloat(completeness) === 100 ? 'success' : 'warning'}">
                    <div class="stat-number">${completeness}%</div>
                    <div class="stat-label">完整性</div>
                </div>
            </div>
            
            ${Object.keys(allFileTypeStats).length > 0 ? `
            <div class="section">
                <h2>📁 文件类型统计</h2>
                <div class="file-type-stats">
                    ${Object.entries(allFileTypeStats).map(([type, stats]) => `
                        <div class="type-card">
                            <div class="type-name">${type}</div>
                            <div class="type-count">${stats.count}个文件</div>
                            <div class="stat-label">${formatFileSize(stats.size)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${missingFiles > 0 ? `
            <div class="section">
                <div class="missing-files">
                    <h2>❌ 缺失文件列表</h2>
                    <div class="file-list">
                        ${allMissingFiles.map(({ file, page }) => `
                            <div class="file-item">
                                <span class="file-status">❌</span>
                                <div class="file-info">
                                    <div class="file-path">${file}</div>
                                    <div class="file-meta">页面: ${page}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            ` : ''}
            
            <div class="section">
                <h2>📋 按页面分类的详细结果</h2>
                ${Object.entries(reports).map(([fileName, report]) => `
                    <div class="page-section">
                        <div class="page-title">📄 ${fileName} (${report.totalFiles}个文件, ${report.existingFiles}存在, ${report.missingFiles}缺失)</div>
                        <div class="file-list">
                            ${report.results.map(result => `
                                <div class="file-item">
                                    <span class="file-status">${result.exists ? '✅' : '❌'}</span>
                                    <div class="file-info">
                                        <div class="file-path">${result.filePath}</div>
                                        <div class="file-meta">
                                            第${result.lineNumber}行
                                            ${result.exists ? `
                                                • ${result.fileType} • ${formatFileSize(result.fileSize || 0)}
                                                ${result.lastModified ? `• ${result.lastModified.toLocaleString('zh-CN')}` : ''}
                                            ` : `• ${result.error}`}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;
}

async function main() {
  try {
    console.log('🔍 开始生成Demo文件检查报告...\n');
    
    const projectRoot = path.resolve(__dirname, '..');
    const reports = checkAllDemoPagesDetailed(projectRoot);
    
    // 生成HTML报告
    const htmlReport = generateHTMLReport(reports);
    
    // 保存HTML报告
    const reportPath = path.join(projectRoot, 'demo-check-report.html');
    fs.writeFileSync(reportPath, htmlReport, 'utf-8');
    
    // 统计信息
    let totalFiles = 0;
    let totalMissing = 0;
    Object.values(reports).forEach(report => {
      totalFiles += report.totalFiles;
      totalMissing += report.missingFiles;
    });
    
    console.log('='.repeat(60));
    console.log('📊 报告生成完成');
    console.log('='.repeat(60));
    console.log(`📄 报告文件: ${reportPath}`);
    console.log(`📈 总文件数: ${totalFiles}`);
    console.log(`❌ 缺失文件数: ${totalMissing}`);
    console.log(`✅ 完整性: ${totalFiles > 0 ? ((totalFiles - totalMissing) / totalFiles * 100).toFixed(1) : 0}%`);
    
    if (totalMissing > 0) {
      console.log('\n⚠️  发现缺失文件，请查看HTML报告了解详情！');
    } else {
      console.log('\n🎉 所有demo文件都存在！');
    }
    
  } catch (error) {
    console.error('❌ 生成报告时出错:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}
