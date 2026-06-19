import { describe, expect, it } from "vitest";
import { calcularDesglose, calcularPuntaje } from "../src/score/score";

const aTiempo = (n: number) => Array.from({ length: n }, () => ({ aTiempo: true }));
const noATiempo = (n: number) => Array.from({ length: n }, () => ({ aTiempo: false }));

describe("calcularPuntaje", () => {
  it("empieza en 50 cuando no hay viajes", () => {
    expect(calcularPuntaje([])).toBe(50);
  });

  it("suma +10 por cada viaje a tiempo", () => {
    expect(calcularPuntaje(aTiempo(1))).toBe(60);
    expect(calcularPuntaje(aTiempo(2))).toBe(70);
  });

  it("topa el bono de viajes a tiempo en +40 (4 viajes)", () => {
    expect(calcularPuntaje(aTiempo(4))).toBe(90);
  });

  it("aplica el bono de experiencia (+5) a partir de 5 viajes", () => {
    expect(calcularPuntaje(aTiempo(5))).toBe(95);
    expect(calcularPuntaje(aTiempo(10))).toBe(95);
  });

  it("resta −15 por cada viaje no completado a tiempo", () => {
    expect(calcularPuntaje(noATiempo(1))).toBe(35);
    expect(calcularPuntaje(noATiempo(2))).toBe(20);
  });

  it("nunca baja de 0", () => {
    expect(calcularPuntaje(noATiempo(5))).toBe(0);
  });

  it("nunca sube de 100", () => {
    expect(calcularPuntaje(aTiempo(100))).toBeLessThanOrEqual(100);
  });

  it("combina aciertos y fallos correctamente", () => {
    const mezcla = [...aTiempo(3), ...noATiempo(2)];
    expect(calcularPuntaje(mezcla)).toBe(55);
  });
});

describe("calcularDesglose", () => {
  it("devuelve el conteo de viajes junto al puntaje", () => {
    const mezcla = [...aTiempo(3), ...noATiempo(2)];
    expect(calcularDesglose(mezcla)).toEqual({
      puntaje: 55,
      totalViajes: 5,
      viajesATiempo: 3,
      viajesNoATiempo: 2,
    });
  });
});
