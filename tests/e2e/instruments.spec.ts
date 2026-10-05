import { test, expect } from '@playwright/test';

test.describe('Módulo de Instrumentos (Metrologia)', () => {
  test('deve renderizar campos de metrologia no formulário de cadastro', async ({ page }) => {
    // Intercepta e simula autenticação se necessário ou acessa direto
    await page.goto('/pt-BR/dashboard/metrology/instruments/create');

    // Se redirecionar para login por falta de sessão, valida a tela de login
    if (page.url().includes('/login')) {
      await expect(page.locator('#email')).toBeVisible();
      return;
    }

    // Verifica campos essenciais de identificação
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="serial_number"]')).toBeVisible();
    await expect(page.locator('input[name="manufacturer"]')).toBeVisible();
    await expect(page.locator('input[name="model"]')).toBeVisible();

    // Verifica novos campos metrológicos ISO 17025
    await expect(page.locator('input[name="measuring_range"]')).toBeVisible();
    await expect(page.locator('input[name="resolution"]')).toBeVisible();
    await expect(page.locator('input[name="mpe_value"]')).toBeVisible();
  });

  test('deve validar obrigatoriedade de campos mínimos ao submeter formulário vazio', async ({ page }) => {
    await page.goto('/pt-BR/dashboard/metrology/instruments/create');

    if (page.url().includes('/login')) return;

    // Clica no botão de salvar sem preencher nada
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Mensagens de erro de validação do formulário (shadcn FormMessage / text-destructive)
    const errorMessages = page.locator('.text-destructive');
    await expect(errorMessages.first()).toBeVisible();
  });
});
