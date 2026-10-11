export interface ActionState {
  ok: boolean
  message?: string
  errors?: Record<string, string>
  /** Identifiant créé, pour rediriger vers la fiche après une création. */
  id?: string
}
