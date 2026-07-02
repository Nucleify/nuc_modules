-- ! AUTO-GENERATED — source: modules/*/config.json (dir name = modules.name). Regenerate: pnpm supabase:merge-sql

-- Ensures sync_modules_from_registry exists before seeding (idempotent).
create or replace function public.sync_modules_from_registry(configs jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  config jsonb;
  module_names text[] := array[]::text[];
begin
  if configs is null or jsonb_typeof(configs) <> 'array' then
    raise exception 'sync_modules_from_registry expects a JSON array';
  end if;

  select coalesce(array_agg(entry->>'name'), array[]::text[])
  into module_names
  from jsonb_array_elements(configs) as entry
  where coalesce(entry->>'name', '') <> '';

  delete from public.modules
  where coalesce(name, '') <> ''
    and not (name = any (module_names));

  for config in
    select entry
    from jsonb_array_elements(configs) as entry
    where coalesce(entry->>'name', '') <> ''
  loop
    insert into public.modules (
      name,
      description,
      category,
      version,
      enabled,
      installed,
      created_at,
      updated_at
    )
    values (
      config->>'name',
      coalesce(config->>'description', ''),
      coalesce(config->>'category', 'other'),
      coalesce(config->>'version', '0.0.0'),
      coalesce((config->'enabled')::boolean, false),
      coalesce((config->'installed')::boolean, false),
      now(),
      now()
    )
    on conflict (name) do update
    set
      description = excluded.description,
      category = excluded.category,
      version = excluded.version,
      enabled = excluded.enabled,
      installed = excluded.installed,
      updated_at = now();
  end loop;
end;
$$;

select public.sync_modules_from_registry(
$registry$[
  {
    "name": "nuc_activity",
    "description": "Module that contains Nucleify's activity functions.",
    "category": "core",
    "version": "0.6.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_admin",
    "description": "Module that contains admin functions.",
    "category": "core",
    "version": "0.5.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_animations",
    "description": "Module that contains animation functions.",
    "category": "core",
    "version": "0.6.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_api",
    "description": "Module that contains API functions.",
    "category": "core",
    "version": "0.5.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_auth",
    "description": "Module that contains auth functions.",
    "category": "core",
    "version": "0.8.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_breadcrumb",
    "description": "Module that contains breadcrumb functionality.",
    "category": "core",
    "version": "0.4.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_calendar",
    "description": "Calendar, meetings, and appointment booking with month/week/day views.",
    "category": "feature",
    "version": "0.2.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_charts",
    "description": "Module that contains chart functions.",
    "category": "core",
    "version": "0.5.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_colors",
    "description": "Module that contains color functions.",
    "category": "core",
    "version": "1.5.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_dark_mode",
    "description": "Module that contains dark mode functions.",
    "category": "core",
    "version": "0.4.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_database",
    "description": "Module that manages database seeding with auto-discovery.",
    "category": "core",
    "version": "0.3.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_datatable",
    "description": "Module that contains datatable functions.",
    "category": "core",
    "version": "0.6.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_dialog",
    "description": "Module that contains dialog functionality.",
    "category": "core",
    "version": "0.5.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_dock",
    "description": "Module that contains dock functionality.",
    "category": "core",
    "version": "0.9.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_documentation",
    "description": "Module that contains documentation functions.",
    "category": "core",
    "version": "1.3.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_documents",
    "description": "Module that contains convert document functions.",
    "category": "core",
    "version": "0.3.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_entities",
    "description": "Module that contains entity functions.",
    "category": "core",
    "version": "0.11.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_entities_structural",
    "description": "Module that contains structural entity functions.",
    "category": "core",
    "version": "0.8.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_fields",
    "description": "Module that contains field functions.",
    "category": "core",
    "version": "0.5.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_files",
    "description": "Module that contains file functions.",
    "category": "core",
    "version": "0.6.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_friendship",
    "description": "Module that contains friendship functions.",
    "category": "core",
    "version": "0.8.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_globals",
    "description": "Module that contains global functions, constants, etc.",
    "category": "core",
    "version": "0.6.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_languages",
    "description": "Module that contains i18n functions.",
    "category": "core",
    "version": "0.10.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_loading",
    "description": "Module that contains loading functions.",
    "category": "core",
    "version": "0.3.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_media",
    "description": "Module that contains media functions.",
    "category": "core",
    "version": "0.3.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_modules",
    "description": "Module that manages the modules of the application.",
    "category": "core",
    "version": "1.3.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_navigation",
    "description": "Module that contains navigation functions.",
    "category": "core",
    "version": "0.3.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_openapi",
    "description": "Module that contains OpenAPI 3.0 specification generation",
    "category": "api",
    "version": "0.2.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_overrides",
    "description": "Module for overriding files for Nucleify",
    "category": "other",
    "version": "0.4.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_pagebuilder",
    "description": "Module that provides elementor-like page builder with database persistence.",
    "category": "core",
    "version": "0.7.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_pages",
    "description": "Module that contains page functions.",
    "category": "core",
    "version": "0.11.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_pricings",
    "description": "Module for pricing sections and payment links.",
    "category": "core",
    "version": "0.7.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_screen_loader",
    "description": "Module that contains screen loader functions.",
    "category": "core",
    "version": "0.3.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_sections",
    "description": "Module that contains section functions.",
    "category": "core",
    "version": "1.3.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_settings",
    "description": "Module that contains settings functions.",
    "category": "core",
    "version": "0.7.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_share",
    "description": "Module that contains entity sharing functions.",
    "category": "core",
    "version": "0.8.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_socials",
    "description": "Module that displays social media links.",
    "category": "social",
    "version": "0.3.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_stores",
    "description": "Module that contains store functions.",
    "category": "core",
    "version": "0.4.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_templates",
    "description": "Module that contains template functions.",
    "category": "core",
    "version": "0.10.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_terminal",
    "description": "Module that contains terminal functions.",
    "category": "core",
    "version": "0.7.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_tooltip",
    "description": "Module that contains tooltip functions.",
    "category": "core",
    "version": "0.4.0",
    "enabled": true,
    "installed": true
  },
  {
    "name": "nuc_users",
    "description": "Module that contains user domain logic and user settings.",
    "category": "core",
    "version": "0.7.0",
    "enabled": true,
    "installed": true
  }
]$registry$::jsonb
);
