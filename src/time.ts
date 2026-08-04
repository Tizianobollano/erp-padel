// Aritmetica sobre horas 'HH:MM' (24h) y dia de semana de una fecha 'YYYY-MM-DD'. Sin Date
// libraries: alcanza con minutos desde medianoche, y la comparacion lexicografica de 'HH:MM'
// ya es orden cronologico (mismo truco que usan los CHECK del schema).

export function horaAMinutos(hora: string): number {
  const partes = hora.split(":");
  return Number(partes[0] ?? 0) * 60 + Number(partes[1] ?? 0);
}

export function minutosAHora(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// 0=domingo..6=sabado, mismo criterio que strftime('%w', ...) de SQLite (interpreta 'YYYY-MM-DD'
// como medianoche UTC).
export function diaSemana(fecha: string): number {
  return new Date(`${fecha}T00:00:00Z`).getUTCDay();
}

export function fechaValida(fecha: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(fecha) && !Number.isNaN(new Date(`${fecha}T00:00:00Z`).getTime());
}

export function horaValida(hora: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(hora)) return false;
  const partes = hora.split(":");
  const h = Number(partes[0]);
  const m = Number(partes[1]);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}
