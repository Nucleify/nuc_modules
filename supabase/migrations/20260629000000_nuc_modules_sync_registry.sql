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
