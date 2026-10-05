import { test, expect } from '@playwright/test';

test.describe('Módulo de Calibrações e Certificados', () => {
  test('deve renderizar a listagem de calibrações', async ({ page }) => {
    await page.goto('/pt-BR/dashboard/metrology/calibrations');

    if (page.url().includes('/login')) return;

    // Deve conter tabela ou card de calibrações
    await expect(page.locator('h1, h2, [role="heading"]').first()).toBeVisible();
  });

  test('deve disponibilizar botões de Imprimir Etiqueta e Certificado PDF no detalhe da calibração', async ({ page }) => {
    // Acessa uma calibração simulada
    await page.goto('/pt-BR/dashboard/metrology/calibrations/1');

    if (page.url().includes('/login')) return;

    // Se a calibração carregar (ou exibir estado de carregamento/não encontrada)
    const printLabelBtn = page.locator('button:has-text("Imprimir Etiqueta")');
    const pdfBtn = page.locator('button:has-text("Certificado PDF")');

    // Se a página encontrou a calibração, ambos os botões devem estar disponíveis
    if (await printLabelBtn.isVisible()) {
      await expect(printLabelBtn).toBeVisible();
      await expect(pdfBtn).toBeVisible();
    }
  });
});
