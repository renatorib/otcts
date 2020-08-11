import mitt, { Handler } from "mitt";

export class EventEmitter {
  private _emitter = mitt();

  emit(type: string, event?: any) {
    return this._emitter.emit(type, event);
  }

  on(type: string, handler: Handler) {
    return this._emitter.on(type, handler);
  }

  off(type: string, handler: Handler) {
    return this._emitter.off(type, handler);
  }
}
