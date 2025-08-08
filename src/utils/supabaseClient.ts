import { createClient } from "@supabase/supabase-js";
import { getEnvVar } from "./envUtils";

const SUPABASE_URL = getEnvVar("VITE_SUPABASE_URL");
const SUPABASE_ANON_KEY = getEnvVar("VITE_SUPABASE_ANON_KEY");

let supabase: any;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  // Mock client with matching interface
  supabase = {
    auth: {
      getUser: async () => ({
        data: null,
        error: { message: "Supabase not initialized: missing env vars" },
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({ data: [], error: null }),
          single: () => ({
            data: null,
            error: { message: "Supabase not initialized" },
          }),
          delete: () => ({
            data: null,
            error: { message: "Supabase not initialized" },
          }),
          update: () => ({
            data: null,
            error: { message: "Supabase not initialized" },
          }),
        }),
        in: () => ({
          eq: () => ({
            order: () => ({ data: [], error: null }),
            single: () => ({
              data: null,
              error: { message: "Supabase not initialized" },
            }),
            delete: () => ({
              data: null,
              error: { message: "Supabase not initialized" },
            }),
            update: () => ({
              data: null,
              error: { message: "Supabase not initialized" },
            }),
          }),
        }),
        order: () => ({ data: [], error: null }),
        single: () => ({
          data: null,
          error: { message: "Supabase not initialized" },
        }),
        delete: () => ({
          data: null,
          error: { message: "Supabase not initialized" },
        }),
        update: () => ({
          data: null,
          error: { message: "Supabase not initialized" },
        }),
      }),
      upsert: () => ({
        select: () => ({
          data: [],
          error: { message: "Supabase not initialized" },
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => ({
              data: null,
              error: { message: "Supabase not initialized" },
            }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => ({ error: { message: "Supabase not initialized" } }),
      }),
    }),
  };
  console.warn(
    "Supabase client not initialized: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables."
  );
}

export { supabase };
