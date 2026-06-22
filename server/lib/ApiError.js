// Erro de negócio com código HTTP. Os services lançam-no; os controllers
// traduzem-no para a resposta.
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
