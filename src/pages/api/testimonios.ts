import { supabase } from "../../lib/supabase.server";

export type Testimonio = {
  text: string;
  name: string;
  profession: string;
  stars: number;
  createdAt?: string;
};

/**
 * Lee 'comentarios' recientes de solicitudes_credito.
 * Filtra nulos o vacíos y mapea nombre/apellido + actividad_economica.
 */
export async function fetchTestimonios(limit = 8): Promise<Testimonio[]> {
  const { data, error } = await supabase
    .from("solicitudes_credito")
    .select("nombre, apellido, actividad_economica, comentarios, creado_en")
    .not("comentarios", "is", null)
    .neq("comentarios", "")
    .order("creado_en", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error leyendo testimonios:", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const nombreCompleto = [row.nombre, row.apellido].filter(Boolean).join(" ").trim();
    return {
      text: String(row.comentarios).trim(),
      name: nombreCompleto || "Cliente",
      profession: row.actividad_economica || "Solicitante de crédito",
      stars: 5,
      createdAt: row.creado_en ?? undefined,
    };
  });
}
