import { EventEmitter } from "./EventEmitter";

type ConnectionOpts = {
  reconnect?: boolean;
  reconnectMaxRetries?: number;
};

export class Connection extends EventEmitter {
  private ws!: WebSocket;
  private reconnectRetries: number = 0;
  private reconnectMaxRetries: number;
  private reconnect: boolean;
  private url: string = "http://localhost:7173";

  get reconnectRetryTimeout() {
    return this.reconnectRetries * 1000;
  }

  constructor(opts: ConnectionOpts = {}) {
    super();
    const { reconnect = true, reconnectMaxRetries = 10 } = opts;
    this.reconnect = reconnect;
    this.reconnectMaxRetries = reconnectMaxRetries;

    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);
    this.ws.addEventListener("open", this.onOpen.bind(this));
    this.ws.addEventListener("message", this.onMessage.bind(this));
    this.ws.addEventListener("close", this.onClose.bind(this));
    this.ws.addEventListener("error", this.onError.bind(this));
  }

  onOpen(event: WebSocketEventMap["open"]) {
    this.emit("open", event);
  }

  onMessage(event: WebSocketEventMap["message"]) {
    this.emit("message", event);
  }

  onClose(event: WebSocketEventMap["close"]) {
    // try to reconnect
    if (
      this.reconnectRetries <= this.reconnectMaxRetries &&
      this.reconnect === true
    ) {
      this.reconnectRetries++;
      setTimeout(() => this.connect(), this.reconnectRetryTimeout);
    } else {
      this.emit("close", event);
    }
  }

  onError(event: WebSocketEventMap["error"]) {
    console.error("Closing websocket due to error", event);
    this.ws.close();
    this.emit("error", event);
  }

  sendMessage(message: any) {
    this.ws.send(message);
    this.emit("send", message);
  }
}
