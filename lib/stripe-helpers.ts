/**
 * Helper to extract current_period_end from a Stripe subscription.
 * 
 * In Stripe API version 2025-03-31 (Basil) and later,
 * `current_period_end` was removed from the top-level subscription object
 * and moved to subscription items (items.data[0].current_period_end).
 * 
 * This helper checks both locations for backward compatibility.
 */
export function getSubscriptionPeriodEnd(subscription: any): Date {
  // Try new location first (items.data[0].current_period_end)
  const itemPeriodEnd = subscription?.items?.data?.[0]?.current_period_end;
  if (itemPeriodEnd) {
    return new Date(itemPeriodEnd * 1000);
  }

  // Fallback to old location (subscription.current_period_end)
  const topLevelPeriodEnd = subscription?.current_period_end;
  if (topLevelPeriodEnd) {
    return new Date(topLevelPeriodEnd * 1000);
  }

  // Last resort: use current date + 30 days as a safe fallback
  console.warn('[Stripe] Could not extract current_period_end from subscription:', subscription?.id);
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 30);
  return fallback;
}
