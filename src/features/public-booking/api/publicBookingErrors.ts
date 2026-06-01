import { ApiContractError, ApiError } from '@/shared/api/httpClient'

export function getPublicBookingErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return 'Revise os dados informados e tente novamente.'
    }

    if (error.status === 404) {
      return 'Esta pagina de agendamento nao foi encontrada.'
    }

    if (error.status === 409) {
      return 'Este horario nao esta mais disponivel. Escolha outro horario.'
    }

    if (error.status === 429) {
      return 'Muitas tentativas em pouco tempo. Aguarde e tente novamente.'
    }
  }

  if (error instanceof ApiContractError) {
    return 'Nao foi possivel carregar os dados de agendamento agora.'
  }

  return 'Nao foi possivel concluir a acao. Tente novamente em instantes.'
}
