// FILE: src/pages/api/solicitudes-credito.ts
import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase.server';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    let payload: any;

    // Acepta JSON y también form-urlencoded/multipart
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else {
      const fd = await request.formData();
      payload = Object.fromEntries(fd.entries());
    }

    // Limpieza mínima de tipos numéricos
    const toNumber = (v: any) =>
      typeof v === 'number' ? v : Number(String(v).replace(/\D+/g, '') || 0);

    const record = {
      nombre: payload.nombre ?? '',
      apellido: payload.apellido ?? '',
      tipo_documento: payload.tipo_documento ?? payload.tipoDocumento ?? '',
      numero_documento: payload.numero_documento ?? payload.cedula ?? '',
      correo: payload.correo ?? '',
      telefono: payload.telefono ?? '',
      ingresos_mensuales: toNumber(payload.ingresos_mensuales ?? payload.ingresos),
      monto_solicitado: toNumber(payload.monto_solicitado ?? payload.monto),
      banco: payload.banco ?? '',
      tiempo_credito_meses: Number(payload.tiempo_credito_meses ?? payload.frecuenciaCuotas ?? 0),
      periodicidad_pagos: payload.periodicidad_pagos ?? payload.periodicidad ?? '',
      fecha_nacimiento: payload.fecha_nacimiento ?? '',
      sexo: payload.sexo ?? '',
      actividad_economica: payload.actividad_economica ?? payload.actividadEconomica ?? '',
      comentarios: payload.comentarios ?? '',
      // Campos opcionales: agrega created_at server-side (si tu tabla no tiene default now())
      // created_at: new Date().toISOString()
    };

    // Inserta y devuelve la fila creada
    const { data, error, status } = await supabase
      .from('solicitudes_credito')
      .insert([record])
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ ok: false, message: error.message, details: error }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ ok: true, data }), {
      status: status ?? 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, message: err?.message ?? 'Error interno' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
};
