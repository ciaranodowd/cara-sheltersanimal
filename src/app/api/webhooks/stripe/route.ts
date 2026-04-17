import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getStripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { SubscriptionStatus } from "@prisma/client"

export const dynamic = "force-dynamic"

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
      return SubscriptionStatus.ACTIVE
    case "trialing":
      return SubscriptionStatus.TRIALING
    case "past_due":
      return SubscriptionStatus.PAST_DUE
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return SubscriptionStatus.CANCELLED
    default:
      return SubscriptionStatus.INACTIVE
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === "subscription") {
          const organizationId = session.metadata?.organizationId
          if (!organizationId) break

          const subscription = await getStripe().subscriptions.retrieve(
            session.subscription as string
          )

          await prisma.organization.update({
            where: { id: organizationId },
            data: {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscription.id,
              subscriptionStatus: mapStripeStatus(subscription.status),
              trialEndsAt: subscription.trial_end
                ? new Date(subscription.trial_end * 1000)
                : null,
            },
          })
        }

        if (session.mode === "payment") {
          const organizationId = session.metadata?.organizationId
          if (!organizationId) break

          const amountTotal = session.amount_total ?? 0
          const donorName = session.metadata?.donorName ?? null
          const donorEmail = session.customer_details?.email ?? session.metadata?.donorEmail ?? null

          await prisma.donation.create({
            data: {
              organizationId,
              amount: amountTotal / 100,
              currency: (session.currency ?? "eur").toUpperCase(),
              type: "ONE_OFF",
              status: "COMPLETED",
              stripePaymentId: session.payment_intent as string | null,
              donorName: donorName || null,
              donorEmail: donorEmail || null,
              source: "public_portal",
            },
          })
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const organizationId = subscription.metadata?.organizationId
        if (!organizationId) break

        await prisma.organization.update({
          where: { id: organizationId },
          data: {
            subscriptionStatus: mapStripeStatus(subscription.status),
            trialEndsAt: subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : null,
          },
        })
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const organizationId = subscription.metadata?.organizationId
        if (!organizationId) break

        await prisma.organization.update({
          where: { id: organizationId },
          data: {
            subscriptionStatus: SubscriptionStatus.CANCELLED,
            stripeSubscriptionId: null,
          },
        })
        break
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err)
    return NextResponse.json({ error: "Handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
