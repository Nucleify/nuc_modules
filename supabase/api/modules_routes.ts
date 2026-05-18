import type { ApiRoute } from 'nuc_api'
import { when } from 'nuc_api'

import {
  handleGetModule,
  handleInstallModule,
  handleListModules,
  handleToggleModule,
  handleUninstallModule,
} from './modules_handlers'

/** GET /modules/all */
export const routeListModules = when(
  { method: 'GET', path: [undefined, 'all'] },
  handleListModules
)

/** GET /modules/:name */
export const routeGetModule = when({ method: 'GET' }, handleGetModule)

/** PATCH /modules/toggle */
export const routeToggleModule = when(
  { method: 'PATCH', path: [undefined, 'toggle'] },
  handleToggleModule
)

/** POST /modules/install — JSON lub multipart (ZIP) */
export const routeInstallModule = when(
  { method: 'POST', path: [undefined, 'install'] },
  handleInstallModule
)

/** POST /modules/uninstall */
export const routeUninstallModule = when(
  { method: 'POST', path: [undefined, 'uninstall'] },
  handleUninstallModule
)

export const modulesRoutes: ApiRoute[] = [
  routeListModules,
  routeGetModule,
  routeToggleModule,
  routeInstallModule,
  routeUninstallModule,
]
