const keysToString = <T, K extends keyof T>(obj: T) => {
  const valueToString = (value: unknown): string => {
    const type = typeof value;
    switch (type) {
      case "string":
      case "number":
        return String(value);
      case "object":
        if (value === null) return "null";
        return Array.isArray(value)
          ? `[${value.map((v) => valueToString(v)).join(",")}]`
          : keysToString(value);
      default:
        return String(value);
    }
  };

  return `{${(Object.getOwnPropertyNames(obj) as K[])
    .sort()
    .map((key) => {
      return `${String(key)}:${valueToString(obj[key])}`;
    })
    .join(",")}}`;
};

export class Cache<T = unknown> {
  private _cache: Map<string, T> = new Map();

  set(keys: object, value: T) {
    return this._cache.set(keysToString(keys), value);
  }

  has(keys: object) {
    return this._cache.has(keysToString(keys));
  }

  get(keys: object) {
    return this._cache.get(keysToString(keys));
  }
}
