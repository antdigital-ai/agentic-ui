#!/usr/bin/env node
/**
 * 一次性迁移脚本：把简单形态的 `style.ts` 从 `useEditorStyleRegister` 改成
 * `genStyleHooks`。
 *
 * 支持的模板形态：
 *   - 单 import：`import { ChatTokenType, GenerateStyle, useEditorStyleRegister } from '<...>/Hooks/useStyle';`
 *   - 拆分 import：`import type { ... } from '<...>'; import { useEditorStyleRegister } from '<...>';`
 *   - hook 命名：`useStyle` 或 `useXxxStyle`（不论 function 还是 const = arrow）
 *
 * 不符合模板的（多 genStyle、动态 salt 等）由人工处理，脚本运行后打印未处理清单。
 *
 * 使用：node scripts/migrate-style-to-genstylehooks.mjs <ComponentName>=<file> ...
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    'usage: migrate-style-to-genstylehooks.mjs <ComponentName>=<file> ...',
  );
  process.exit(1);
}

const failures = [];

function findImportBlock(src) {
  // 优先匹配同时含 useEditorStyleRegister 的单条 import
  const singleRe =
    /import\s*\{([^{}]*?\buseEditorStyleRegister\b[^{}]*?)\}\s*from\s*['"]([^'"]*?Hooks\/useStyle)['"];?/;
  const single = src.match(singleRe);
  if (single) return { kind: 'single', match: single };

  // 否则尝试匹配 `import type { ... } from '<...>';\nimport { useEditorStyleRegister } from '<...>';` 或反过来
  const typeRe =
    /import\s+type\s*\{([^{}]*?)\}\s*from\s*['"]([^'"]*?Hooks\/useStyle)['"];?/;
  const valRe =
    /import\s*\{([^{}]*?\buseEditorStyleRegister\b[^{}]*?)\}\s*from\s*['"]([^'"]*?Hooks\/useStyle)['"];?/;
  const typeMatch = src.match(typeRe);
  const valMatch = src.match(valRe);
  if (typeMatch && valMatch) {
    return { kind: 'split', typeMatch, valMatch };
  }
  // 也支持 `import { useEditorStyleRegister, type ChatTokenType, type GenerateStyle } from '<...>';`
  // 这种放在一起、混了 inline `type` 修饰符的写法
  const inlineRe =
    /import\s*\{([^{}]*?)\}\s*from\s*['"]([^'"]*?Hooks\/useStyle)['"];?/g;
  let m;
  while ((m = inlineRe.exec(src)) !== null) {
    if (/\buseEditorStyleRegister\b/.test(m[1])) {
      return {
        kind: 'single',
        match: [m[0], m[1], m[2], m.index],
      };
    }
  }
  return null;
}

function findGenStyleFn(src) {
  const re =
    /const\s+(\w+)\s*:\s*GenerateStyle<ChatTokenType>\s*=\s*\(([^)]*)\)\s*=>/g;
  const matches = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    matches.push({ name: m[1], paramList: m[2], full: m[0] });
  }
  return matches;
}

function findUseStyleHook(src) {
  // 形态 A：export function useXxxStyle(prefixCls?: string) { return useEditorStyleRegister('NAME', ... }
  const fnRe =
    /export\s+function\s+(use\w*)\s*\(\s*(\w+)(\??):\s*string\s*\)\s*\{[\s\S]*?return\s+useEditorStyleRegister\(\s*['"]([^'"]+)['"][\s\S]*?\n\}\n?/;
  const fnMatch = src.match(fnRe);
  if (fnMatch) {
    return {
      full: fnMatch[0],
      hookName: fnMatch[1],
      paramName: fnMatch[2],
      paramOpt: fnMatch[3],
      registryKey: fnMatch[4],
    };
  }
  // 形态 B：export const useXxxStyle = (prefixCls: string) => { return useEditorStyleRegister(...) };
  const constRe =
    /export\s+const\s+(use\w*)\s*=\s*\(\s*(\w+)(\??):\s*string\s*\)\s*=>\s*\{[\s\S]*?return\s+useEditorStyleRegister\(\s*['"]([^'"]+)['"][\s\S]*?\}\);?\n?\}\n?;?/;
  const constMatch = src.match(constRe);
  if (constMatch) {
    return {
      full: constMatch[0],
      hookName: constMatch[1],
      paramName: constMatch[2],
      paramOpt: constMatch[3],
      registryKey: constMatch[4],
      isConst: true,
    };
  }
  return null;
}

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

  const importInfo = findImportBlock(original);
  if (!importInfo) {
    failures.push({ filePath, reason: 'no Hooks/useStyle import' });
    continue;
  }

  const genStyles = findGenStyleFn(original);
  if (genStyles.length === 0) {
    failures.push({ filePath, reason: 'no GenerateStyle<ChatTokenType> declaration' });
    continue;
  }

  const hook = findUseStyleHook(original);
  if (!hook) {
    failures.push({ filePath, reason: 'no useStyle/useEditorStyleRegister pattern' });
    continue;
  }

  // 推导 hook body 是否使用 resetComponent / 多个 genStyle
  const hookBody = hook.full;
  const usesResetComponent = /\bresetComponent\(/.test(hookBody);
  const referencedGenStyles = genStyles.filter((g) =>
    new RegExp(`\\b${g.name}\\(`).test(hookBody),
  );

  // 1. 重写 import
  const importPath =
    importInfo.kind === 'single'
      ? importInfo.match[2]
      : importInfo.valMatch[2];

  const newImportParts = ['genStyleHooks', 'type GenStyleFn'];
  if (usesResetComponent) {
    newImportParts.splice(1, 0, 'resetComponent');
  }
  const newImport = `import { ${newImportParts.join(', ')} } from '${importPath}';`;

  let next = original;
  if (importInfo.kind === 'single') {
    next = next.replace(importInfo.match[0], newImport);
  } else {
    // 拆分写法：删除 type import 与 value import，插入 newImport 在原 type import 位置
    next = next.replace(importInfo.typeMatch[0], newImport);
    next = next.replace(importInfo.valMatch[0] + '\n', '');
    next = next.replace(importInfo.valMatch[0], '');
  }

  // 2. 重写所有 GenerateStyle<ChatTokenType> 声明为 GenStyleFn<'Component'>
  for (const g of genStyles) {
    next = next.replace(
      new RegExp(
        `const\\s+${g.name}\\s*:\\s*GenerateStyle<ChatTokenType>\\s*=`,
      ),
      `const ${g.name}: GenStyleFn<'${componentName}'> =`,
    );
  }

  // 3. 重写 useXxxStyle 函数。若被引用的 genStyle 只有一个且无 resetComponent，
  //    直接把函数引用传给 genStyleHooks；否则用 wrapper 传 (token, info)
  const callArg =
    hook.paramOpt === '?'
      ? `${hook.paramName} ?? '${hook.registryKey}'`
      : hook.paramName;

  const useGenStyleDecl =
    !usesResetComponent && referencedGenStyles.length === 1
      ? `const useGenStyle = genStyleHooks('${componentName}', ${referencedGenStyles[0].name});`
      : `const useGenStyle = genStyleHooks('${componentName}', (token, info) => [\n${
          usesResetComponent ? '  resetComponent(token),\n' : ''
        }${referencedGenStyles
          .map((g) => `  ${g.name}(token, info),`)
          .join('\n')}\n]);`;

  const replacement = hook.isConst
    ? `${useGenStyleDecl}\n\nexport const ${hook.hookName} = (${hook.paramName}${hook.paramOpt}: string) => {\n  const [wrapSSR, hashId] = useGenStyle(${callArg});\n  return { wrapSSR, hashId };\n};\n`
    : `${useGenStyleDecl}\n\nexport function ${hook.hookName}(${hook.paramName}${hook.paramOpt}: string) {\n  const [wrapSSR, hashId] = useGenStyle(${callArg});\n  return { wrapSSR, hashId };\n}\n`;

  next = next.replace(hook.full, replacement);

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
