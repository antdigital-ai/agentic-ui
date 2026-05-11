#!/usr/bin/env node
/**
 * 一次性迁移脚本：把简单形态的 `style.ts` 从 `useEditorStyleRegister` 改成
 * `genStyleHooks`。仅处理标准模板：
 *
 *   import {
 *     ChatTokenType,
 *     GenerateStyle,  // 可选
 *     CSSInterpolation, // 可选
 *     resetComponent,   // 可选
 *     useEditorStyleRegister,
 *   } from '<相对路径>/Hooks/useStyle';
 *
 *   const genXxxStyle: GenerateStyle<ChatTokenType> = (token) => ({ ... });
 *
 *   export function useStyle(prefixCls?: string) {
 *     return useEditorStyleRegister('name', (token) => {
 *       const xxxToken = { ...token, componentCls: `.${prefixCls}` };
 *       return [genXxxStyle(xxxToken)]; // 或 [resetComponent(...), genXxxStyle(...)]
 *     });
 *   }
 *
 * 不符合模板的（多 genStyle、动态 salt、嵌套 useStyle 等）由人工处理，
 * 脚本运行后打印未处理文件清单。
 *
 * 使用：
 *   node scripts/migrate-style-to-genstylehooks.mjs <name>=<file> [<name>=<file>...]
 *
 * 例：
 *   node scripts/migrate-style-to-genstylehooks.mjs Quote=src/Quote/style.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('usage: migrate-style-to-genstylehooks.mjs <ComponentName>=<file> ...');
  process.exit(1);
}

const failures = [];

for (const arg of args) {
  const eq = arg.indexOf('=');
  if (eq < 0) {
    console.error(`skip invalid arg: ${arg}`);
    continue;
  }
  const componentName = arg.slice(0, eq);
  const filePath = path.resolve(arg.slice(eq + 1));
  if (!fs.existsSync(filePath)) {
    console.error(`skip missing file: ${filePath}`);
    continue;
  }

  const original = fs.readFileSync(filePath, 'utf8');

  // 1. 推导 Hooks/useStyle 的相对引入路径
  // 用 [^{}] 限定花括号内不会跨到其它 import，避免一次性吞掉前面的 import 行
  const importMatch = original.match(
    /import\s*\{([^{}]*?)\}\s*from\s*['"]([^'"]*?Hooks\/useStyle)['"];?/,
  );
  if (!importMatch) {
    failures.push({ filePath, reason: 'no Hooks/useStyle import' });
    continue;
  }
  const importPath = importMatch[2];
  const importBlock = importMatch[1];
  const hasResetComponent = /\bresetComponent\b/.test(importBlock);
  const hasCSSInterpolation = /\bCSSInterpolation\b/.test(importBlock);

  // 2. 定位 genStyle 函数（仅匹配 `GenerateStyle<ChatTokenType>` 模板）
  const genStyleDeclMatch = original.match(
    /const\s+(\w+)\s*:\s*GenerateStyle<ChatTokenType>\s*=/,
  );
  if (!genStyleDeclMatch) {
    failures.push({ filePath, reason: 'no GenerateStyle<ChatTokenType> declaration' });
    continue;
  }
  const genStyleName = genStyleDeclMatch[1];

  // 3. 定位 useStyle / useEditorStyleRegister 调用
  const useStyleMatch = original.match(
    /export\s+function\s+useStyle\s*\(\s*(?:customP|p)refixCls\?:\s*string\s*\)\s*\{[\s\S]*?return\s+useEditorStyleRegister\(\s*['"]([^'"]+)['"]/,
  );
  if (!useStyleMatch) {
    failures.push({ filePath, reason: 'no useStyle/useEditorStyleRegister pattern' });
    continue;
  }
  const registryKey = useStyleMatch[1];

  // 4. 进行替换：先重写 import；再重写 useStyle 函数；再重写 genStyle 类型签名。
  let next = original;

  const newImportNames = ['genStyleHooks', 'type GenStyleFn'];
  if (hasCSSInterpolation) newImportNames.push('type CSSInterpolation');
  const newImportLine = `import { ${newImportNames.join(', ')} } from '${importPath}';`;

  next = next.replace(importMatch[0], newImportLine);

  // 重写 genStyle 类型签名
  next = next.replace(
    new RegExp(
      `const\\s+${genStyleName}\\s*:\\s*GenerateStyle<ChatTokenType>\\s*=`,
    ),
    `const ${genStyleName}: GenStyleFn<'${componentName}'> =`,
  );

  // 重写 useStyle：匹配整段函数（含 `customPrefixCls` 或 `prefixCls` 参数名）
  const useStyleFnRegex =
    /export\s+function\s+useStyle\s*\(\s*((?:customP|p)refixCls)\?:\s*string\s*\)\s*\{[\s\S]*?\n\}\n?/;
  const useStyleSegmentMatch = next.match(useStyleFnRegex);
  if (!useStyleSegmentMatch) {
    failures.push({ filePath, reason: 'cannot locate full useStyle function body' });
    continue;
  }
  const paramName = useStyleSegmentMatch[1];

  // 探测函数体里是否使用 `resetComponent`（决定迁移后是否保留）
  const bodyUsesResetComponent =
    hasResetComponent &&
    /\bresetComponent\(/.test(useStyleSegmentMatch[0]);

  const replacementUseStyle = bodyUsesResetComponent
    ? `const useGenStyle = genStyleHooks('${componentName}', (token, info) => [\n  resetComponent(token),\n  ${genStyleName}(token, info),\n]);\n\nexport function useStyle(${paramName}?: string) {\n  const [wrapSSR, hashId] = useGenStyle(${paramName} ?? '${registryKey}');\n  return { wrapSSR, hashId };\n}\n`
    : `const useGenStyle = genStyleHooks('${componentName}', ${genStyleName});\n\nexport function useStyle(${paramName}?: string) {\n  const [wrapSSR, hashId] = useGenStyle(${paramName} ?? '${registryKey}');\n  return { wrapSSR, hashId };\n}\n`;

  next = next.replace(useStyleFnRegex, replacementUseStyle);

  // 如果 bodyUsesResetComponent，需要在新 import 里加入 resetComponent
  if (bodyUsesResetComponent) {
    next = next.replace(
      `import { ${newImportNames.join(', ')} } from '${importPath}';`,
      `import { genStyleHooks, resetComponent, type GenStyleFn${hasCSSInterpolation ? ', type CSSInterpolation' : ''} } from '${importPath}';`,
    );
  }

  fs.writeFileSync(filePath, next);
  console.log(`migrated: ${filePath} (${componentName})`);
}

if (failures.length > 0) {
  console.log('\n=== UNHANDLED FILES (manual migration required) ===');
  for (const f of failures) {
    console.log(`- ${f.filePath}: ${f.reason}`);
  }
  process.exit(1);
}
