/**
 * Websocket user that wraps socket and user's data
 */
export class WebsocketUser {
  constructor(
    public readonly id: string,
    private _username: string,
    private readonly socket: any,
  ) {}

  public disconnect(message: string): void {
    this.socket.disconnect(message);
  }

  public emit(event: string, payload: any): void {
    this.socket.emit(event, payload);
  }

  public onDisconnect(callback: () => void): void {
    this.socket.on('disconnect', callback);
  }

  public get username(): string {
    return this._username;
  }

  public set username(value: string) {
    this._username = value;
  }
}
