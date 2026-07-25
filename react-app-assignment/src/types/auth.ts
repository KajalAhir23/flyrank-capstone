export interface AuthModel {
  email: string
  password: string
}

export function createAuthModel(): AuthModel {
  return {
    email: '',
    password: '',
  }
}
