// ====== Rates per bank (per period) ======
export const BANCOS = {
  av_villas: {
    nombre: 'Av Villas',
    producto: '',
    tasas: { mensual: 0.0165, trimestral: 0.0504, cuatrimestral: 0.0678, semestral: 0.1034, anual: 0.2175 }
  },
  banco_w: {
    nombre: 'Banco W',
    producto: '',
    tasas: { mensual: 0.0202, trimestral: 0.0618, cuatrimestral: 0.0832, semestral: 0.1274, anual: 0.2710 }
  },
  caja_social: {
    nombre: 'Banco Caja Social',
    producto: 'microempresas',
    tasas: { mensual: 0.0282, trimestral: 0.0871, cuatrimestral: 0.1178, semestral: 0.1817, anual: 0.3965 }
  },
  bancolombia: {
    nombre: 'Bancolombia',
    producto: 'Agrofácil',
    tasas: { mensual: 0.0124, trimestral: 0.0377, cuatrimestral: 0.0506, semestral: 0.0768, anual: 0.1595 }
  },
  bogota: {
    nombre: 'Banco de Bogotá',
    producto: 'FinaAgro',
    tasas: { mensual: 0.0137, trimestral: 0.0504, cuatrimestral: 0.0678, semestral: 0.1034, anual: 0.1775 }
  },
  mundo_mujer: {
    nombre: 'Mundo Mujer',
    producto: 'crédito productivo rural',
    tasas: { mensual: 0.0165, trimestral: 0.0504, cuatrimestral: 0.0678, semestral: 0.1034, anual: 0.2739 }
  },
  banco_agrario: {
    nombre: 'Banco Agrario de Colombia',
    producto: 'Mujer Rural (incluye pequeño productor)',
    tasas: { mensual: 0.0110, trimestral: 0.0334, cuatrimestral: 0.0448, semestral: 0.0679, anual: 0.1405 }
  },
  mi_banco: {
    nombre: 'Mi Banco',
    producto: 'Crédito Productivo Rural',
    tasas: { mensual: 0.0202, trimestral: 0.0617, cuatrimestral: 0.0831, semestral: 0.1272, anual: 0.2705 }
  },
  bancamia: {
    nombre: 'Bancamía',
    producto: 'AgroCrece Inversión',
    tasas: { mensual: 0.0124, trimestral: 0.0377, cuatrimestral: 0.0506, semestral: 0.0768, anual: 0.1595 }
  },
  cooperativa_avp: {
    nombre: 'Cooperativa AVP',
    producto: 'Créditos',
    tasas: { mensual: 0.0170, trimestral: 0.0520, cuatrimestral: 0.0699, semestral: 0.1066, anual: 0.2246 }
  }
};
// ====== END ======


export const PERIODICIDADES = ['mensual','trimestral','cuatrimestral','semestral','anual'];


// ====== Utilities ======
export const mesesPor = (p) => ({ mensual:1, trimestral:3, cuatrimestral:4, semestral:6, anual:12 }[p] || 1);

export const parseNumberSafe = v =>
  (typeof v === 'string'
    ? Number(v.replace(/[^0-9.,-]/g,'').replace(/\./g,'').replace(',', '.'))
    : Number(v)) || 0;

export const fmtCOP = n => n.toLocaleString('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:2 });
export const fmtPct = x => (x*100).toLocaleString('es-CO', { maximumFractionDigits:2 }) + '%';
// ====== END ======


// ====== Amortization (FRANCES) ======
export function amortizarFrances({ principal, tasaPeriodo, cuotas }) {
  const i = tasaPeriodo, P = principal, n = cuotas;
  const cuota = i === 0 ? (P/n) : (i*P)/(1 - Math.pow(1+i, -n));
  let saldo = P, totalInteres = 0;
  const filas = [];
  for (let k=1; k<=n; k++){
    const interes = saldo * i;
    const abono   = cuota - interes;
    saldo         = Math.max(0, saldo - abono);
    totalInteres += interes;
    filas.push({ k, cuota, interes, abono, saldo });
  }
  return { cuota, filas, totalInteres, totalPagar: P + totalInteres };
}
// ====== END ======


// ====== Reading the form + calculation with the bank ======
export function calcularDesdeFormulario(form) {
  const q = (sel) => form.querySelector(sel);

  const bancoId = q('#banco')?.value || '';
  if (!bancoId) throw new Error('Selecciona un banco.');

  const data = {
    bancoId,
    nombre: (q('#nombre')?.value || '').trim(),
    apellido: (q('#apellido')?.value || '').trim(),
    tipoDocumento: q('#tipoDocumento')?.value || '',
    cedula: (q('#cedula')?.value || '').trim(),
    correo: (q('#correo')?.value || '').trim(),
    telefono: (q('#telefono')?.value || '').trim(),
    ingresos: parseNumberSafe(q('#ingresos')?.value || ''),
    monto: parseNumberSafe(q('#monto')?.value || ''),
    mesesTotal: parseInt(q('#frecuenciaCuotas')?.value || '0', 10),
    comentarios: (q('#comentarios')?.value || '').trim(),
    periodicidad: q('#periodicidad')?.value || '',
    fechaNacimiento: q('#fechaNacimiento')?.value || '', //Nuevo
    sexo: q('#sexo')?.value || '', //Nuevo
    actividadEconomica: q('#actividadEconomica')?.value || '', //Nuevo
    
  };

  if (!data.monto || data.monto <= 0) throw new Error('Ingresa un monto válido.');
  if (!data.mesesTotal || data.mesesTotal <= 0) throw new Error('Selecciona la duración en meses.');
  if (!data.periodicidad) throw new Error('Selecciona la periodicidad de pagos.');

  const banco = BANCOS[data.bancoId];
  if (!banco) throw new Error('Banco no reconocido.');

  const tasaPeriodo = banco.tasas[data.periodicidad];
  if (typeof tasaPeriodo !== 'number') {
    throw new Error(`El banco ${banco.nombre} no tiene tasa para "${data.periodicidad}".`);
  }

  const mpp = mesesPor(data.periodicidad);
  if (data.mesesTotal % mpp !== 0)
    throw new Error(`El plazo (${data.mesesTotal} meses) no es divisible por la periodicidad (${mpp} meses).`);

  const cuotas = data.mesesTotal / mpp;
  const { cuota, filas, totalInteres, totalPagar } =
    amortizarFrances({ principal: data.monto, tasaPeriodo, cuotas });

  return {
    solicitante: {
      nombreCompleto: `${data.nombre} ${data.apellido}`.trim(),
      tipoDocumento: data.tipoDocumento, documento: data.cedula,
      correo: data.correo, telefono: data.telefono,
      ingresos: data.ingresos, comentarios: data.comentarios,
      fechaNacimiento: data.fechaNacimiento,
      sexo: data.sexo,
      actividadEconomica: data.actividadEconomica,
    },
    banco: { id: data.bancoId, nombre: banco.nombre, producto: banco.producto },
    resumen: {
      monto: data.monto, tasaPeriodo, mesesTotal: data.mesesTotal,
      periodicidad: data.periodicidad, mesesPorPeriodo: mpp,
      cuotas, cuota, totalInteres, totalPagar,
    },
    filas,
  };
}
// ====== END ======