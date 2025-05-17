import { TriggerClient, cronTrigger } from "@trigger.dev/sdk";

const client = new TriggerClient({ id: "contentpilot-ai" });

client.defineJob({
  id: "scheduled-posts",
  name: "Publicar posts programados",
  version: "1.0.0",
  trigger: cronTrigger({
    cron: "*/5 * * * *", // cada 5 minutos (puedes cambiar a "0 * * * *" para cada hora)
  }),
  run: async (payload, io, ctx) => {
    // Aquí va la lógica para buscar y publicar posts programados en Supabase
    // Ejemplo: fetch a Supabase Edge Function o consulta directa
    console.log("¡Ejecutando cron de posts programados!");
  },
});

export default client;