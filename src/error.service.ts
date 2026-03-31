export const ErrorCodes = {
  AUTH_TOKEN_MISSING: 'AUTH_TOKEN_MISSING',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR'
}

export function createErrorResponse(message: string, code: string, details: any = null, status: number = 400) {
  return {
    response: {
      success: false,
      error: message,
      code,
      details
    },
    status
  }
}

export function unauthorizedError(message: string = 'Non autorisé') {
  return createErrorResponse(message, ErrorCodes.UNAUTHORIZED, null, 401)
}

export function handleError(error: any, context: string, c: any) {
  console.error(`❌ Error in ${context}:`, error)
  return c.json({
    success: false,
    error: error.message || 'Erreur interne du serveur'
  }, 500)
}
