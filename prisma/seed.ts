import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpiando datos previos...");
  await prisma.viaje.deleteMany();
  await prisma.conductor.deleteMany();

  const ana = await prisma.conductor.create({
    data: { nombre: "Ana Pérez", cedula: "1023456789", ciudad: "Bogotá" },
  });
  await prisma.viaje.createMany({
    data: Array.from({ length: 6 }, (_, i) => ({
      origen: "Bogotá",
      destino: i % 2 === 0 ? "Medellín" : "Cali",
      valorFlete: 2_000_000 + i * 100_000,
      aTiempo: true,
      conductorId: ana.id,
    })),
  });

  const bruno = await prisma.conductor.create({
    data: { nombre: "Bruno Díaz", cedula: "8009988776", ciudad: "Medellín" },
  });
  await prisma.viaje.createMany({
    data: [
      { origen: "Medellín", destino: "Bogotá", valorFlete: 3_500_000, aTiempo: true, conductorId: bruno.id },
      { origen: "Medellín", destino: "Cali", valorFlete: 1_800_000, aTiempo: true, conductorId: bruno.id },
      { origen: "Medellín", destino: "Cartagena", valorFlete: 4_200_000, aTiempo: true, conductorId: bruno.id },
      { origen: "Medellín", destino: "Barranquilla", valorFlete: 4_000_000, aTiempo: false, conductorId: bruno.id },
      { origen: "Medellín", destino: "Pereira", valorFlete: 900_000, aTiempo: false, conductorId: bruno.id },
    ],
  });

  const carla = await prisma.conductor.create({
    data: { nombre: "Carla Gómez", cedula: "7112233445", ciudad: "Cali" },
  });
  await prisma.viaje.createMany({
    data: Array.from({ length: 3 }, () => ({
      origen: "Cali",
      destino: "Bogotá",
      valorFlete: 1_500_000,
      aTiempo: false,
      conductorId: carla.id,
    })),
  });

  await prisma.conductor.create({
    data: { nombre: "Diego Ruiz", cedula: "6005544332", ciudad: "Barranquilla" },
  });

  console.log("Seed completado. Conductores creados:");
  console.table([
    { nombre: "Ana Pérez", puntajeEsperado: 95 },
    { nombre: "Bruno Díaz", puntajeEsperado: 55 },
    { nombre: "Diego Ruiz", puntajeEsperado: 50 },
    { nombre: "Carla Gómez", puntajeEsperado: 5 },
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
