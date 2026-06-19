const PUNTAJE_BASE = 50;
const PUNTOS_POR_VIAJE_A_TIEMPO = 10;
const TOPE_BONO_A_TIEMPO = 40;
const PENALIZACION_NO_A_TIEMPO = 15;
const BONO_EXPERIENCIA = 5;
const VIAJES_PARA_EXPERIENCIA = 5;
const PUNTAJE_MIN = 0;
const PUNTAJE_MAX = 100;

export interface ViajeParaPuntaje {
  aTiempo: boolean;
}

export interface DesglosePuntaje {
  puntaje: number;
  totalViajes: number;
  viajesATiempo: number;
  viajesNoATiempo: number;
}

export function calcularPuntaje(viajes: ViajeParaPuntaje[]): number {
  return calcularDesglose(viajes).puntaje;
}

export function calcularDesglose(viajes: ViajeParaPuntaje[]): DesglosePuntaje {
  const viajesATiempo = viajes.filter((v) => v.aTiempo).length;
  const viajesNoATiempo = viajes.length - viajesATiempo;

  let puntaje = PUNTAJE_BASE;
  puntaje += Math.min(viajesATiempo * PUNTOS_POR_VIAJE_A_TIEMPO, TOPE_BONO_A_TIEMPO);
  puntaje -= viajesNoATiempo * PENALIZACION_NO_A_TIEMPO;

  if (viajes.length >= VIAJES_PARA_EXPERIENCIA) {
    puntaje += BONO_EXPERIENCIA;
  }

  puntaje = Math.max(PUNTAJE_MIN, Math.min(PUNTAJE_MAX, puntaje));

  return {
    puntaje,
    totalViajes: viajes.length,
    viajesATiempo,
    viajesNoATiempo,
  };
}
