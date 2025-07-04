import { test, expect } from '@playwright/test';

test.describe('Stripe and Supabase Subscription E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Clear local storage before each test to ensure a clean state
    await page.evaluate(() => localStorage.clear());
    await page.goto('/subscribe');
  });

  test('should successfully subscribe to a monthly plan and reflect status in settings', async ({ page }) => {
    // 1. Assert that the subscription page is loaded
    await expect(page.locator('h1')).toContainText('Choose Your Subscription Plan');

    // 2. Ensure monthly plan is selected by default (or click it if not)
    await page.click('button:has-text("Monthly")');
    await expect(page.locator('button:has-text("Monthly")')).toHaveClass(/bg-blue-600/);

    // 3. Click "Proceed to Checkout"
    // Intercept the navigation that StripeService.createCheckoutSession would trigger
    await page.route('**/subscribe', route => {
      // Simulate a successful Stripe checkout by setting mock data in localStorage
      // and then redirecting to the success URL
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <script>
            localStorage.setItem('mock_subscription', JSON.stringify({
              id: 'sub_mock_test_monthly',
              plan: 'monthly',
              status: 'active',
              created: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
              customer_id: 'cus_mock_test_monthly',
              terms_accepted: true
            }));
            window.location.href = '/subscribe?subscription=success';
          </script>
        `,
      });
    });

    // Click the button that triggers the checkout process
    await page.click('button:has-text("Proceed to Checkout")');

    // 4. Verify the success message on the subscription page
    await expect(page.locator('text=Success! Thank you for subscribing to Options World!')).toBeVisible();

    // 5. Navigate to the settings page to verify subscription status
    await page.goto('/app/settings');
    await expect(page.locator('h2')).toContainText('Settings');

    // 6. Assert that the subscription status is "Pro Monthly" and "Terms Accepted"
    await expect(page.locator('text=Pro Monthly')).toBeVisible();
    await expect(page.locator('text=Terms Accepted')).toBeVisible();
    await expect(page.locator('text=Next billing:')).toBeVisible();

    // 7. Test the "Manage" subscription button
    // Intercept window.open to verify the URL
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('button:has-text("Manage")')
    ]);
    await expect(newPage.url()).toMatch(/https:\/\/billing\.stripe\.com\/p\/session\/cus_mock_test_monthly_/);
    await newPage.close();
  });

  test('should successfully subscribe to a yearly plan and reflect status in settings', async ({ page }) => {
    // 1. Assert that the subscription page is loaded
    await expect(page.locator('h1')).toContainText('Choose Your Subscription Plan');

    // 2. Select yearly plan
    await page.click('button:has-text("Yearly")');
    await expect(page.locator('button:has-text("Yearly")')).toHaveClass(/bg-blue-600/);

    // 3. Click "Proceed to Checkout"
    await page.route('**/subscribe', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <script>
            localStorage.setItem('mock_subscription', JSON.stringify({
              id: 'sub_mock_test_yearly',
              plan: 'yearly',
              status: 'active',
              created: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 365 days from now
              customer_id: 'cus_mock_test_yearly',
              terms_accepted: true
            }));
            window.location.href = '/subscribe?subscription=success';
          </script>
        `,
      });
    });

    await page.click('button:has-text("Proceed to Checkout")');

    // 4. Verify the success message on the subscription page
    await expect(page.locator('text=Success! Thank you for subscribing to Options World!')).toBeVisible();

    // 5. Navigate to the settings page to verify subscription status
    await page.goto('/app/settings');
    await expect(page.locator('h2')).toContainText('Settings');

    // 6. Assert that the subscription status is "Pro Yearly" and "Terms Accepted"
    await expect(page.locator('text=Pro Yearly')).toBeVisible();
    await expect(page.locator('text=Terms Accepted')).toBeVisible();
    await expect(page.locator('text=Next billing:')).toBeVisible();

    // 7. Test the "Manage" subscription button
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('button:has-text("Manage")')
    ]);
    await expect(newPage.url()).toMatch(/https:\/\/billing\.stripe\.com\/p\/session\/cus_mock_test_yearly_/);
    await newPage.close();
  });

  test('should show free plan status if no active subscription', async ({ page }) => {
    // Ensure no mock subscription is set
    await page.evaluate(() => localStorage.removeItem('mock_subscription'));
    await page.goto('/app/settings'); // Go directly to settings

    // Assert that the subscription status is "Free Plan"
    await expect(page.locator('text=Free Plan')).toBeVisible();
    await expect(page.locator('button:has-text("Upgrade")')).toBeVisible();
  });

  test('should apply coupon code and show discount', async ({ page }) => {
    // 1. Assert that the subscription page is loaded
    await expect(page.locator('h1')).toContainText('Choose Your Subscription Plan');

    // 2. Enter and apply a valid coupon code
    await page.fill('input[placeholder="Enter coupon code"]', 'WELCOME50');
    await page.click('button:has-text("Apply")');

    // 3. Verify the coupon is applied
    await expect(page.locator('text=WELCOME50 Applied')).toBeVisible();
    await expect(page.locator('text=50% OFF')).toBeVisible();

    // 4. Verify the price is updated
    await expect(page.locator('text=/Was \\$\\d+/')).toBeVisible();
    await expect(page.locator('text=/Save \\$\\d+/')).toBeVisible();

    // 5. Click "Proceed to Checkout" with coupon
    await page.route('**/subscribe', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <script>
            localStorage.setItem('mock_subscription', JSON.stringify({
              id: 'sub_mock_test_coupon',
              plan: 'monthly',
              status: 'active',
              created: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              customer_id: 'cus_mock_test_coupon',
              terms_accepted: true,
              coupon_applied: 'WELCOME50'
            }));
            window.location.href = '/subscribe?subscription=success';
          </script>
        `,
      });
    });

    // 6. Accept terms and proceed to checkout
    await page.click('button:has-text("Proceed to Checkout")');
    await page.click('button:has-text("I Accept")');

    // 7. Verify success message
    await expect(page.locator('text=Success! Thank you for subscribing to Options World!')).toBeVisible();
  });

  test('should handle special deals selection', async ({ page }) => {
    // Skip if no deals are available
    const hasDeals = await page.locator('text=Special Offers').isVisible();
    if (!hasDeals) {
      test.skip();
      return;
    }

    // 1. Find and click on a deal
    const dealCard = page.locator('.cursor-pointer').first();
    await dealCard.click();

    // 2. Verify the deal is selected (price should update)
    await expect(page.locator('text=/Save \\$\\d+/')).toBeVisible();

    // 3. Click "Claim Deal" button
    await page.route('**/subscribe', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <script>
            localStorage.setItem('mock_subscription', JSON.stringify({
              id: 'sub_mock_test_deal',
              plan: 'monthly',
              status: 'active',
              created: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              customer_id: 'cus_mock_test_deal',
              terms_accepted: true,
              deal_applied: true
            }));
            window.location.href = '/subscribe?subscription=success';
          </script>
        `,
      });
    });

    await page.click('button:has-text("Claim Deal")');

    // 4. Verify success message
    await expect(page.locator('text=Success! Thank you for subscribing to Options World!')).toBeVisible();
  });

  test('should handle terms agreement modal', async ({ page }) => {
    // 1. Click "Proceed to Checkout" to trigger terms modal
    await page.click('button:has-text("Proceed to Checkout")');

    // 2. Verify terms modal appears
    await expect(page.locator('text=Terms and Conditions')).toBeVisible();
    await expect(page.locator('text=I Accept')).toBeDisabled(); // Should be disabled until checkbox is checked

    // 3. Check the terms agreement checkbox
    await page.click('input[type="checkbox"]');
    await expect(page.locator('button:has-text("I Accept")')).toBeEnabled();

    // 4. Click "I Decline" to close the modal
    await page.click('button:has-text("I Decline")');
    await expect(page.locator('text=Terms and Conditions')).not.toBeVisible();
  });

  test('should navigate from landing page to subscription page', async ({ page }) => {
    // 1. Start at landing page
    await page.goto('/');

    // 2. Click on a subscription button
    await page.click('text=Get Started');

    // 3. Verify redirect to subscription page
    await expect(page).toHaveURL('/subscribe');
    await expect(page.locator('h1')).toContainText('Choose Your Subscription Plan');
  });

  test('should handle Stripe payment errors gracefully', async ({ page }) => {
    // 1. Click "Proceed to Checkout" to trigger terms modal
    await page.click('button:has-text("Proceed to Checkout")');
    
    // 2. Mock a Stripe error
    await page.route('**', route => {
      const url = route.request().url();
      if (url.includes('stripe')) {
        // Simulate a Stripe error
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'Invalid payment method' } })
        });
      } else {
        route.continue();
      }
    });
    
    // 3. Accept terms and proceed to checkout
    await page.click('input[type="checkbox"]');
    await page.click('button:has-text("I Accept")');
    
    // 4. Verify error message is displayed
    await expect(page.locator('text=Invalid payment method')).toBeVisible();
  });
});