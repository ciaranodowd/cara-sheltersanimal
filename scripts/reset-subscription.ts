import { PrismaClient, SubscriptionStatus } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const slug = "cara-organisation"

  const org = await prisma.organization.findUnique({ where: { slug } })
  if (!org) {
    console.error(`No organisation found with slug "${slug}"`)
    process.exit(1)
  }

  const updated = await prisma.organization.update({
    where: { slug },
    data: {
      subscriptionStatus: SubscriptionStatus.INACTIVE,
      stripeSubscriptionId: null,
      stripeCustomerId: null,
    },
  })

  console.log(`Reset subscription for org "${updated.slug}" (id=${updated.id})`)
  console.log(`  subscriptionStatus  : ${updated.subscriptionStatus}`)
  console.log(`  stripeSubscriptionId: ${updated.stripeSubscriptionId}`)
  console.log(`  stripeCustomerId    : ${updated.stripeCustomerId}`)
}

main()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
