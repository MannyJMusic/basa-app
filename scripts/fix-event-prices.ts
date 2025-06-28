import { prisma } from '../src/lib/db'

async function main() {
  const events = await prisma.event.findMany({
    where: { OR: [{ price: null }, { price: 0 }] }
  });

  for (const event of events) {
    await prisma.event.update({
      where: { id: event.id },
      data: { price: 20 } // <-- Set your default non-member price here
    });
    console.log(`Updated event ${event.title} with non-member price $20`);
  }
}

main().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch((e) => {
  console.error(e);
  process.exit(1);
}); 