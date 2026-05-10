import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
  typescript: true,
});

export const PLANS = {
  monthly: {
    name: "Monthly",
    price: 500, // $5.00 in cents
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    interval: "month" as const,
    label: "$5/mo",
  },
  yearly: {
    name: "Yearly",
    price: 5000, // $50.00 in cents
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    interval: "year" as const,
    label: "$50/yr",
  },
};

export async function createCheckoutSession(
  householdId: string,
  plan: "monthly" | "yearly",
  userId: string,
  email?: string
) {
  const priceId = PLANS[plan].priceId;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Check for existing Stripe customer
  let customerId: string | undefined;
  const customers = await stripe.customers.list({ email, limit: 1 });
  if (customers.data.length > 0) {
    customerId = customers.data[0].id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: customerId,
    customer_email: !customerId ? email : undefined,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 14,
      metadata: {
        household_id: householdId,
        user_id: userId,
      },
    },
    metadata: {
      household_id: householdId,
      user_id: userId,
    },
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/dashboard?canceled=true`,
  });

  return session;
}

export async function createBillingPortalSession(customerId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/dashboard`,
  });

  return session;
}
