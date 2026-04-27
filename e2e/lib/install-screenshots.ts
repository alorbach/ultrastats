import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Page, TestInfo } from '@playwright/test';

const stepRows: { file: string; title: string }[] = [];

export function reportRoot(): string {
  return join(process.cwd(), 'install-e2e-report');
}

/** Clear and recreate report dirs (call once per test run). */
export function resetInstallReport(): void {
  const root = reportRoot();
  if (existsSync(root)) {
    rmSync(root, { recursive: true });
  }
  mkdirSync(join(root, 'screenshots'), { recursive: true });
  stepRows.length = 0;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function captureInstallStep(
  page: Page,
  testInfo: TestInfo,
  step: number,
  title: string,
): Promise<void> {
  const file = `step-${String(step).padStart(2, '0')}.png`;
  const abs = join(reportRoot(), 'screenshots', file);
  await page.screenshot({ path: abs, fullPage: true });
  stepRows.push({ file, title });
  await testInfo.attach(`Step ${step}: ${title}`, {
    path: abs,
    contentType: 'image/png',
  });
}

/** Write install-e2e-report/index.html (call in finally so partial runs still get a gallery). */
export function finalizeInstallReport(): void {
  const root = reportRoot();
  if (!existsSync(join(root, 'screenshots'))) {
    return;
  }
  const when = new Date().toISOString();
  const sections = stepRows
    .map(
      (s) =>
        `<section class="step"><h2>${escapeHtml(s.title)}</h2><img src="screenshots/${escapeHtml(s.file)}" width="960" loading="lazy" alt=""></section>`,
    )
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>UltraStats install wizard — screenshot run</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 1000px; margin: 1rem auto; padding: 0 1rem; background: #1a1a1a; color: #e0e0e0; }
    h1 { font-size: 1.25rem; }
    .meta { color: #888; font-size: 0.9rem; margin-bottom: 1.5rem; }
    .step { margin-bottom: 2rem; border-bottom: 1px solid #333; padding-bottom: 1.5rem; }
    .step h2 { font-size: 1rem; color: #9cf; }
    img { max-width: 100%; height: auto; border: 1px solid #444; }
  </style>
</head>
<body>
  <h1>UltraStats install wizard — captured screens</h1>
  <p class="meta">Generated ${escapeHtml(when)} · ${String(stepRows.length)} steps</p>
  ${sections}
</body>
</html>`;
  writeFileSync(join(root, 'index.html'), html, 'utf8');
}
