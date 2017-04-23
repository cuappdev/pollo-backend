/**
 * Defines clicker specific errors that contain a status and error message.
 */
export class ClickerError extends Error {

  private status: number;

  constructor(message: string, status: number) {
    super(message);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ClickerError.prototype);
  }

  public get getStatus() {
    return this.status;
  }

  public get getMessage() {
    return this.message;
  }
}
