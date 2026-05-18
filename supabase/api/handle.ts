import { apiBody, apiNotHandled, dispatchRoutes } from 'nuc_api'
import type { ApiContext, ApiHandlerResult } from 'nuc_server'

import { modulesRoutes } from './modules_routes'

export async function handleModulesApi(
  ctx: ApiContext
): Promise<ApiHandlerResult> {
  if (ctx.segments[0] !== 'modules') return apiNotHandled()
  const result = await dispatchRoutes(modulesRoutes, ctx)
  return result ?? apiBody({ success: true })
}
