export const TASAS = {
    mensual: 0.0157, trimestral: 0.0477, cuatrimestral: 0.0641, semestral: 0.0977, anual: 0.2126,
  };
  export const mesesPor = (p) => ({ mensual:1, trimestral:3, cuatrimestral:4, semestral:6, anual:12 }[p] || 1);
  export const parseNumberSafe = v =>
    (typeof v === 'string'
      ? Number(v.replace(/[^0-9.,-]/g,'').replace(/\./g,'').replace(',', '.'))
      : Number(v)) || 0;
  export const fmtCOP = n => n.toLocaleString('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:2 });
  export const fmtPct = x => (x*100).toLocaleString('es-CO', { maximumFractionDigits:2 }) + '%';
  
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
  
  export function calcularDesdeFormulario(form) {
    const q = (sel) => form.querySelector(sel);
    const data = {
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
    };
  
    if (!data.monto || data.monto <= 0) throw new Error('Ingresa un monto válido.');
    if (!data.mesesTotal || data.mesesTotal <= 0) throw new Error('Selecciona la duración en meses.');
    if (!data.periodicidad) throw new Error('Selecciona la periodicidad de pagos.');
  
    const mpp = mesesPor(data.periodicidad);
    if (data.mesesTotal % mpp !== 0)
      throw new Error(`El plazo (${data.mesesTotal} meses) no es divisible por la periodicidad (${mpp} meses).`);
  
    const cuotas = data.mesesTotal / mpp;
    const tasaPeriodo = TASAS[data.periodicidad];
    const { cuota, filas, totalInteres, totalPagar } =
      amortizarFrances({ principal: data.monto, tasaPeriodo, cuotas });
  
    return {
      solicitante: {
        nombreCompleto: `${data.nombre} ${data.apellido}`.trim(),
        tipoDocumento: data.tipoDocumento, documento: data.cedula,
        correo: data.correo, telefono: data.telefono,
        ingresos: data.ingresos, comentarios: data.comentarios,
      },
      resumen: {
        monto: data.monto, tasaPeriodo, mesesTotal: data.mesesTotal,
        periodicidad: data.periodicidad, mesesPorPeriodo: mpp,
        cuotas, cuota, totalInteres, totalPagar,
      },
      filas,
    };
  }
  