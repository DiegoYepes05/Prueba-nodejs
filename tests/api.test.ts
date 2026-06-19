import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    conductor: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    viaje: {
      create: vi.fn(),
    },
  },
}));

import { createApp } from "../src/app";
import { prisma } from "../src/lib/prisma";

const app = createApp();
const db = vi.mocked(prisma, true);

const UUID = "11111111-1111-1111-1111-111111111111";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /conductores", () => {
  it("registra un conductor y responde 201", async () => {
    db.conductor.findUnique.mockResolvedValue(null);
    db.conductor.create.mockResolvedValue({
      id: UUID,
      nombre: "Ana",
      cedula: "123",
      ciudad: "Bogotá",
    } as never);

    const res = await request(app)
      .post("/conductores")
      .send({ nombre: "Ana", cedula: "123", ciudad: "Bogotá" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: UUID, cedula: "123" });
  });

  it("rechaza cédula duplicada con 409", async () => {
    db.conductor.findUnique.mockResolvedValue({ id: UUID, cedula: "123" } as never);

    const res = await request(app)
      .post("/conductores")
      .send({ nombre: "Ana", cedula: "123", ciudad: "Bogotá" });

    expect(res.status).toBe(409);
    expect(db.conductor.create).not.toHaveBeenCalled();
  });

  it("rechaza datos inválidos con 400", async () => {
    const res = await request(app)
      .post("/conductores")
      .send({ nombre: "", cedula: "abc", ciudad: "Bogotá" });

    expect(res.status).toBe(400);
    expect(res.body.detalles).toBeDefined();
  });
});

describe("GET /conductores/:id", () => {
  it("devuelve el conductor con su puntaje calculado", async () => {
    db.conductor.findUnique.mockResolvedValue({
      id: UUID,
      nombre: "Ana",
      cedula: "123",
      ciudad: "Bogotá",
      createdAt: new Date(),
      viajes: [{ aTiempo: true }, { aTiempo: true }, { aTiempo: false }],
    } as never);

    const res = await request(app).get(`/conductores/${UUID}`);

    expect(res.status).toBe(200);
    expect(res.body.puntaje).toBe(55);
    expect(res.body.totalViajes).toBe(3);
  });

  it("responde 404 si el conductor no existe", async () => {
    db.conductor.findUnique.mockResolvedValue(null);
    const res = await request(app).get(`/conductores/${UUID}`);
    expect(res.status).toBe(404);
  });
});

describe("GET /conductores", () => {
  it("lista los conductores ordenados de mayor a menor puntaje", async () => {
    db.conductor.findMany.mockResolvedValue([
      { id: "a", nombre: "Bajo", cedula: "1", ciudad: "X", createdAt: new Date(), viajes: [{ aTiempo: false }] },
      { id: "b", nombre: "Alto", cedula: "2", ciudad: "Y", createdAt: new Date(), viajes: [{ aTiempo: true }, { aTiempo: true }] },
    ] as never);

    const res = await request(app).get("/conductores");

    expect(res.status).toBe(200);
    expect(res.body.map((c: { nombre: string }) => c.nombre)).toEqual(["Alto", "Bajo"]);
    expect(res.body[0].puntaje).toBe(70);
    expect(res.body[1].puntaje).toBe(35);
  });
});

describe("POST /viajes", () => {
  it("registra un viaje para un conductor existente (201)", async () => {
    db.conductor.findUnique.mockResolvedValue({ id: UUID } as never);
    db.viaje.create.mockResolvedValue({ id: "v1", conductorId: UUID } as never);

    const res = await request(app).post("/viajes").send({
      origen: "Bogotá",
      destino: "Medellín",
      valorFlete: 1500000,
      aTiempo: "si",
      conductorId: UUID,
    });

    expect(res.status).toBe(201);
    expect(db.viaje.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ aTiempo: true, valorFlete: 1500000 }),
    });
  });

  it("responde 404 si el conductor no existe", async () => {
    db.conductor.findUnique.mockResolvedValue(null);

    const res = await request(app).post("/viajes").send({
      origen: "Bogotá",
      destino: "Medellín",
      valorFlete: 1500000,
      aTiempo: true,
      conductorId: UUID,
    });

    expect(res.status).toBe(404);
    expect(db.viaje.create).not.toHaveBeenCalled();
  });

  it("rechaza un valor de flete inválido con 400", async () => {
    const res = await request(app).post("/viajes").send({
      origen: "Bogotá",
      destino: "Medellín",
      valorFlete: -5,
      aTiempo: true,
      conductorId: UUID,
    });

    expect(res.status).toBe(400);
  });
});
