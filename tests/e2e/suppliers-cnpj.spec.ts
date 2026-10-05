import { test, expect } from '@playwright/test';

test.describe('Validação de Fornecedores e Documento CNPJ/CPF (Módulo 11)', () => {
  test('deve rejeitar CNPJ com dígito verificador inválido e exibir mensagem da Receita Federal', async ({ page }) => {
    await page.goto('/pt-BR/dashboard/system/suppliers/create');

    if (page.url().includes('/login')) return;

    // Preenche dados básicos obrigatórios
    await page.fill('input[name="name"]', 'Laboratório Teste Calibração');

    // Preenche um CNPJ com dígito verificador propositalmente incorreto
    const cnpjInput = page.locator('input[name="cnpj"]');
    await cnpjInput.fill('00.000.000/0001-00');

    // Submete o formulário
    await page.click('button[type="submit"]');

    // Deve exibir o erro específico do Módulo 11
    const validationMessage = page.locator('text=Documento (CNPJ/CPF) inválido conforme Módulo 11');
    await expect(validationMessage).toBeVisible();
  });

  test('deve aceitar CNPJ matematicamente válido', async ({ page }) => {
    await page.goto('/pt-BR/dashboard/system/suppliers/create');

    if (page.url().includes('/login')) return;

    await page.fill('input[name="name"]', 'Laboratório Acreditado RBC');
    
    // CNPJ matematicamente válido (00.000.000/0001-91)
    const cnpjInput = page.locator('input[name="cnpj"]');
    await cnpjInput.fill('00.000.000/0001-91');

    await page.click('button[type="submit"]');

    // A mensagem de erro de CNPJ inválido NÃO deve estar visível
    const validationMessage = page.locator('text=Documento (CNPJ/CPF) inválido conforme Módulo 11');
    await expect(validationMessage).not.toBeVisible();
  });
});
