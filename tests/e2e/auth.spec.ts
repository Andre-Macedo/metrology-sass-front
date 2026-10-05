import { test, expect } from '@playwright/test';

test.describe('Autenticação e Sessão', () => {
  test('deve redirecionar a rota raiz para o locale correto', async ({ page }) => {
    await page.goto('/');
    // Deve conter no path o locale (pt-BR ou en)
    await expect(page).toHaveURL(/\/(pt-BR|en)(\/.*)?$/);
  });

  test('deve renderizar os elementos da tela de login', async ({ page }) => {
    await page.goto('/pt-BR/login');

    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('deve exibir mensagem de erro ao informar credenciais inválidas', async ({ page }) => {
    await page.goto('/pt-BR/login');

    await page.fill('#email', 'usuario_inexistente@leantech.com.br');
    await page.fill('#password', 'senha_errada_123');
    await page.click('button[type="submit"]');

    // Aguarda o container de erro aparecer
    const errorMessage = page.locator('.text-destructive, [role="alert"]');
    await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });
  });
});
