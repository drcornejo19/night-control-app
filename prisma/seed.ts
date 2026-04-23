import { PrismaClient, UserRole, NightStatus, PaymentMethod, SaleType, ExpenseCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // VENUE
  const venue = await prisma.venue.create({
    data: {
      name: "Night Control Club",
      city: "Buenos Aires",
    },
  });

  const supplier = await prisma.supplier.create({
  data: {
    venueId: venue.id,
    name: "Distribuidora Central",
  },
});

  // USER
 const owner = await prisma.user.upsert({
  where: { email: "admin@night.com" },
  update: {},
  create: {
    name: "Admin",
    email: "admin@night.com",
    role: UserRole.OWNER,
  },
});

  await prisma.membership.create({
    data: {
      userId: owner.id,
      venueId: venue.id,
      role: UserRole.OWNER,
    },
  });

  // PRODUCTS
  const vodka = await prisma.product.create({
    data: {
      name: "Vodka Absolut",
      price: 8000,
      cost: 4000,
      venueId: venue.id,
      stock: {
        create: {
          quantity: 50,
          minStock: 10,
        },
      },
    },
  });

  const fernet = await prisma.product.create({
    data: {
      name: "Fernet Branca",
      price: 9000,
      cost: 4500,
      venueId: venue.id,
      stock: {
        create: {
          quantity: 40,
          minStock: 8,
        },
      },
    },
  });

  // NIGHT
  const night = await prisma.night.create({
    data: {
      name: "Sábado Explosivo",
      date: new Date(),
      venueId: venue.id,
      status: NightStatus.OPEN,
      openedAt: new Date(),
      cashBox: {
        create: {
          opening: 100000,
        },
      },
    },
  });

  // SALES
  const sale1 = await prisma.sale.create({
    data: {
      nightId: night.id,
      type: SaleType.BAR,
      total: 16000,
      userId: owner.id,
      items: {
        create: [
          {
            productId: vodka.id,
            quantity: 2,
            price: 8000,
          },
        ],
      },
      payments: {
        create: [
          {
            method: PaymentMethod.CASH,
            amount: 16000,
          },
        ],
      },
    },
  });

  const sale2 = await prisma.sale.create({
    data: {
      nightId: night.id,
      type: SaleType.BAR,
      total: 9000,
      userId: owner.id,
      items: {
        create: [
          {
            productId: fernet.id,
            quantity: 1,
            price: 9000,
          },
        ],
      },
      payments: {
        create: [
          {
            method: PaymentMethod.TRANSFER,
            amount: 9000,
          },
        ],
      },
    },
  });

  // EXPENSE
  await prisma.expense.create({
    data: {
      nightId: night.id,
      category: ExpenseCategory.DJ,
      amount: 30000,
      note: "Pago DJ",
    },
  });

  // TICKETS
  await prisma.ticketSale.create({
    data: {
      nightId: night.id,
      type: "General",
      price: 5000,
      quantity: 120,
    },
  });

  console.log("🔥 Seed completado");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());