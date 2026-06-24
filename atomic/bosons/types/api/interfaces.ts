export interface NucModuleRequestsInterface {
  installModule: (
    name: string,
    onSuccess: () => void | Promise<void>
  ) => Promise<void>
  toggleModule: (
    name: string,
    enabled: boolean,
    onSuccess: () => void | Promise<void>
  ) => Promise<void>
  uninstallModule: (
    name: string,
    onSuccess: () => void | Promise<void>,
    deleteModuleFiles?: boolean
  ) => Promise<void>
}
