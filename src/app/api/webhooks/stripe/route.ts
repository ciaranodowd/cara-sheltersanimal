import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getStripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { SubscriptionStatus } from "@prisma/client"

export const dynamic = "force-dynamic"

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":    return SubscriptionStatus.ACTIVE
    case "trialing":  return SubscriptionStatus.TRIALING
    case "past_due":  return SubscriptionStatus.PAST_DUE
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return SubscriptionStatus.CANCELLED
    default:
      return SubscriptionStatus.INACTIVE
  }
}

/** "pro" for any paid/grace state; "trial" when cancelled or inactive. */
function mapPlan(status: SubscriptionStatus): string {
  return status === SubscriptionStatus.ACTIVE ||
         status === SubscriptionStatus.TRIALING ||
         status === SubscriptionStatus.PAST_DUE
    ? "pro"
    : "trial"
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
  } catch (err) {
    console.error("[webhook] signature verification failed:", err)
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
  }

  console.log(`[webhook] received event type=${event.type} id=${event.id}`)

  try {
    switch (event.type) {

      case "checkout.session.completed": {
        const cs = event.data.object as Stripe.Checkout.Session

        console.log("[webhook] checkout.session.completed", {
          sessionId:              cs.id,
          mode:                   cs.mode,
          customer:               cs.customer,
          subscription:           cs.subscription,
          metadataOrganizationId: cs.metadata?.organizationId ?? "(missing)",
          paymentStatus:          cs.payment_status,
        })

        if (cs.mode === "subscription") {
          // Primary lookup: organizationId from session metadata.
          // Fallback: look up by the Stripe customer ID already stored in the DB
          // (handles sessions created without metadata, e.g. via Stripe dashboard).
          let organizationId = cs.metadata?.organizationId ?? null

          if (!organizationId && cs.customer) {
            const byCustomer = await prisma.organization.findUnique({
              where: { stripeCustomerId: cs.customer as string },
              select: { id: true },
            })
            if (byCustomer) {
              console.warn(
                `[webhook] checkout.session.completed: organizationId missing from metadata; ` +
                `resolved org ${byCustomer.id} via customer ${cs.customer}`
              )
              organizationId = byCustomer.id
            }
          }

          if (!organizationId) {
            console.error(
              `[webhook] checkout.session.completed: cannot resolve organizationId — ` +
              `sessionId=${cs.id} customer=${cs.customer ?? "(none)"} — no update made`
            )
            break
          }

          const subscriptionId = cs.subscription as string
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId)

          console.log("[webhook] subscription retrieved", {
            subscriptionId:         subscription.id,
            status:                 subscription.status,
            trialEnd:               subscription.trial_end,
            metadataOrganizationId: subscription.metadata?.organizationId ?? "(missing)",
          })

          const mappedStatus = mapStripeStatus(subscription.status)
          const mappedPlan   = mapPlan(mappedStatus)

          const updated = await prisma.organization.update({
            where: { id: organizationId },
            data: {
              stripeCustomerId:     cs.customer as string,
              stripeSubscriptionId: subscription.id,
              subscriptionStatus:   mappedStatus,
              plan:                 mappedPlan,
              planStatus:           "active",
              trialEndsAt: subscription.trial_end
                ? new Date(subscription.trial_end * 1000)
                : null,
            },
            select: {
              id:                  true,
              plan:                true,
              planStatus:          true,
              subscriptionStatus:  true,
              stripeCustomerId:    true,
              stripeSubscriptionId: true,
            },
          })

          console.log("[webhook] organization updated", updated)
        }

        if (cs.mode === "payment") {
          const organizationId = cs.metadata?.organizationId
          if (!organizationId) {
            console.warn(
              `[webhook] checkout.session.completed (payment): no organizationId in metadata — sessionId=${cs.id}`
            )
            break
          }

          const existing = await prisma.donation.findUnique({
            where: { stripeSessionId: cs.id },
          })
          if (existing) {
            console.log(`[webhook] donation already recorded for sessionId=${cs.id}, skipping`)
            break
          }

          const amountTotal = cs.amount_total ?? 0
          const donorName   = cs.metadata?.donorName ?? null
          const donorEmail  = cs.customer_details?.email ?? cs.metadata?.donorEmail ?? null
          const message     = cs.metadata?.donorMessage ?? null

          await prisma.donation.create({
            data: {
              organizationId,
              amount:           amountTotal / 100,
              currency:         (cs.currency ?? "eur").toUpperCase(),
              type:             "ONE_OFF",
              status:           "COMPLETED",
              stripePaymentId:  cs.payment_intent as string | null,
              stripeSessionId:  cs.id,
              donorName:        donorName || null,
              donorEmail:       donorEmail || null,
              message:          message || null,
              source:           "public_portal",
            },
          })
          console.log(`[webhook] donation created for org=${organizationId} amount=${amountTotal / 100}`)
        }

        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        // In Stripe SDK v22 current_period_end lives on SubscriptionItem, not Subscription.
        // Use it as fallback when cancel_at_period_end=true but cancel_at is not explicitly set.
        const periodEnd = subscription.items.data[0]?.current_period_end ?? null

        // Derive effective cancel date: explicit cancel_at, or period end when cancel_at_period_end=true
        const effectiveCancelAt = subscription.cancel_at
          ? new Date(subscription.cancel_at * 1000)
          : subscription.cancel_at_period_end && periodEnd
            ? new Date(periodEnd * 1000)
            : null

        console.log("[webhook] customer.subscription.updated", {
          subscriptionId:      subscription.id,
          status:              subscription.status,
          customer:            subscription.customer,
          organizationId:      subscription.metadata?.organizationId ?? "(missing)",
          cancelAt:            subscription.cancel_at ?? null,
          cancelAtPeriodEnd:   subscription.cancel_at_period_end,
          canceledAt:          subscription.canceled_at ?? null,
          periodEnd,
          effectiveCancelAt:   effectiveCancelAt?.toISOString() ?? null,
        })

        const organizationId = subscription.metadata?.organizationId
        if (!organizationId) {
          console.warn(
            `[webhook] customer.subscription.updated: no organizationId in metadata — ` +
            `subscriptionId=${subscription.id}`
          )
          break
        }

        const mappedStatus = mapStripeStatus(subscription.status)
        const mappedPlan   = mapPlan(mappedStatus)

        const updated = await prisma.organization.update({
          where: { id: organizationId },
          data: {
            subscriptionStatus:  mappedStatus,
            plan:                mappedPlan,
            trialEndsAt: subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : null,
            cancelAt:          effectiveCancelAt,
            cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
            canceledAt:        subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000)
              : null,
          },
          select: { id: true, plan: true, subscriptionStatus: true, cancelAt: true, cancelAtPeriodEnd: true },
        })

        console.log("[webhook] organization updated", updated)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        console.log("[webhook] customer.subscription.deleted", {
          subscriptionId:         subscription.id,
          customer:               subscription.customer,
          metadataOrganizationId: subscription.metadata?.organizationId ?? "(missing)",
        })

        const organizationId = subscription.metadata?.organizationId
        if (!organizationId) {
          console.warn(
            `[webhook] customer.subscription.deleted: no organizationId in metadata — ` +
            `subscriptionId=${subscription.id}`
          )
          break
        }

        const updated = await prisma.organization.update({
          where: { id: organizationId },
          data: {
            subscriptionStatus:   SubscriptionStatus.CANCELLED,
            stripeSubscriptionId: null,
            plan:                 "trial",
            cancelAt:             null,
            cancelAtPeriodEnd:    false,
            canceledAt:           subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000)
              : new Date(),
          },
          select: { id: true, plan: true, subscriptionStatus: true },
        })

        console.log("[webhook] organization updated", updated)
        break
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account
        const fullyOnboarded = account.charges_enabled && account.payouts_enabled && account.details_submitted

        console.log("[webhook] account.updated", {
          accountId:        account.id,
          chargesEnabled:   account.charges_enabled,
          payoutsEnabled:   account.payouts_enabled,
          detailsSubmitted: account.details_submitted,
          fullyOnboarded,
        })

        // Only auto-enable donations when the account first becomes fully onboarded.
        // If already onboarded, leave donationsEnabled as-is (admin controls it).
        const existing = await prisma.organization.findFirst({
          where: { stripeAccountId: account.id },
          select: { stripeOnboarded: true },
        })
        const wasOnboarded = existing?.stripeOnboarded ?? false

        await prisma.organization.updateMany({
          where: { stripeAccountId: account.id },
          data: {
            stripeOnboarded:  fullyOnboarded,
            // Auto-enable on first successful onboarding; don't touch if already set
            ...(fullyOnboarded && !wasOnboarded ? { donationsEnabled: true } : {}),
          },
        })
        break
      }

      default:
        console.log(`[webhook] unhandled event type=${event.type} — ignored`)
    }
  } catch (err) {
    console.error(`[webhook] handler error for event type=${event.type} id=${event.id}:`, err)
    return NextResponse.json({ error: "Handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
