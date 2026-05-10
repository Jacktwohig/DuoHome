import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  const supabase = await createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const householdId = session.metadata?.household_id;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (!householdId) break;

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const plan = subscription.items.data[0].price.recurring?.interval === "year"
          ? "yearly"
          : "monthly";

        // Upsert subscription record
        await supabase.from("subscriptions").upsert({
          household_id: householdId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan,
          status: subscription.status === "trialing" ? "trialing" : "active",
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "household_id",
        });

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const householdId = subscription.metadata?.household_id;

        if (!householdId) break;

        const plan = subscription.items.data[0].price.recurring?.interval === "year"
          ? "yearly"
          : "monthly";

        let status: "trialing" | "active" | "canceled" | "past_due" = "active";
        if (subscription.status === "trialing") status = "trialing";
        else if (subscription.status === "active") status = "active";
        else if (subscription.status === "canceled") status = "canceled";
        else if (subscription.status === "past_due") status = "past_due";

        await supabase.from("subscriptions").update({
          plan,
          status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("stripe_subscription_id", subscription.id);

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase.from("subscriptions").update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        }).eq("stripe_subscription_id", subscription.id);

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
