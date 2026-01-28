/**
 * Error Handling Service
 * Centralized error management for consistent API responses
 * @version 1.0.0
 */

export interface APIError {
  success: false
  error: string
  code?: string
  details?: any
  timestamp: string
}

export interface APISuccess<T = any> {
  success: true
  data?: T
  message?: string
  timestamp: string
}

/**
 * Error codes for consistent error handling
 */
export const ErrorCodes = {
  // Authentication errors (401)
  AUTH_TOKEN_MISSING: 'AUTH_TOKEN_MISSING',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_CREDENTIALS_INVALID: 'AUTH_CREDENTIALS_INVALID',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  AUTH_EMAIL_NOT_VERIFIED: 'AUTH_EMAIL_NOT_VERIFIED',
  
  // Validation errors (400)
  VALIDATION_MISSING_FIELD: 'VALIDATION_MISSING_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_FILE_TOO_LARGE: 'VALIDATION_FILE_TOO_LARGE',
  
  // Resource errors (404)
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  TRIP_NOT_FOUND: 'TRIP_NOT_FOUND',
  PACKAGE_NOT_FOUND: 'PACKAGE_NOT_FOUND',
  
  // Business logic errors (400)
  KYC_NOT_VERIFIED: 'KYC_NOT_VERIFIED',
  KYC_FACE_MISMATCH: 'KYC_FACE_MISMATCH',
  STRIPE_ACCOUNT_NOT_CONNECTED: 'STRIPE_ACCOUNT_NOT_CONNECTED',
  INSUFFICIENT_WEIGHT: 'INSUFFICIENT_WEIGHT',
  
  // Server errors (500)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  AWS_REKOGNITION_ERROR: 'AWS_REKOGNITION_ERROR',
  STRIPE_ERROR: 'STRIPE_ERROR',
  
  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: string,
  code?: string,
  details?: any,
  statusCode: number = 500
): { response: APIError; status: number } {
  return {
    response: {
      success: false,
      error,
      code,
      details,
      timestamp: new Date().toISOString()
    },
    status: statusCode
  }
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T = any>(
  data?: T,
  message?: string
): APISuccess<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  }
}

/**
 * Handle errors with logging and standardized response
 */
export function handleError(
  error: any,
  context: string,
  c: any
): Response {
  // Log error with context
  console.error(`[${context}] Error:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  })

  // Determine error type and create appropriate response
  if (error.name === 'JWTExpired') {
    const { response, status } = createErrorResponse(
      'Token expiré. Veuillez vous reconnecter.',
      ErrorCodes.AUTH_TOKEN_EXPIRED,
      null,
      401
    )
    return c.json(response, status)
  }

  if (error.name === 'JWTInvalid') {
    const { response, status } = createErrorResponse(
      'Token invalide',
      ErrorCodes.AUTH_TOKEN_INVALID,
      null,
      401
    )
    return c.json(response, status)
  }

  if (error.message?.includes('Database')) {
    const { response, status } = createErrorResponse(
      'Erreur de base de données',
      ErrorCodes.DATABASE_ERROR,
      process.env.ENVIRONMENT === 'development' ? error.message : null,
      500
    )
    return c.json(response, status)
  }

  // Default internal server error
  const { response, status } = createErrorResponse(
    'Une erreur interne est survenue',
    ErrorCodes.INTERNAL_SERVER_ERROR,
    process.env.ENVIRONMENT === 'development' ? error.message : null,
    500
  )
  return c.json(response, status)
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  data: any,
  requiredFields: string[]
): { valid: boolean; missing?: string[] } {
  const missing = requiredFields.filter(field => !data[field])
  
  if (missing.length > 0) {
    return { valid: false, missing }
  }
  
  return { valid: true }
}

/**
 * Create not found error
 */
export function notFoundError(resource: string, id?: string) {
  return createErrorResponse(
    `${resource} ${id ? `avec l'ID ${id}` : ''} introuvable`,
    ErrorCodes.RESOURCE_NOT_FOUND,
    { resource, id },
    404
  )
}

/**
 * Create validation error
 */
export function validationError(message: string, details?: any) {
  return createErrorResponse(
    message,
    ErrorCodes.VALIDATION_INVALID_FORMAT,
    details,
    400
  )
}

/**
 * Create unauthorized error
 */
export function unauthorizedError(message: string = 'Non autorisé') {
  return createErrorResponse(
    message,
    ErrorCodes.AUTH_TOKEN_INVALID,
    null,
    401
  )
}
