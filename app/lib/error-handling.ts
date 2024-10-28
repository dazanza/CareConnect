export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export function handleSupabaseError(error: any): never {
  if (error?.code === 'PGRST116') {
    throw new APIError('Invalid permissions', 403, 'FORBIDDEN')
  }
  
  if (error?.code === '23505') {
    throw new APIError('Record already exists', 409, 'DUPLICATE')
  }
  
  throw new APIError(
    error?.message || 'An unexpected error occurred',
    error?.status || 500,
    error?.code
  )
}

export function isAPIError(error: any): error is APIError {
  return error instanceof APIError
}
