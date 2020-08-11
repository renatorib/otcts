const keysToString = <T, K extends keyof T>(obj: T) => {
  const valueToString = (value: any): string => {
    const type = typeof value;
    switch (type) {
      case "string":
      case "number":
        return value;
      case "object":
        return Array.isArray(value)
          ? `[${value.map((v) => valueToString(v)).join(",")}]`
          : keysToString(value);
      default:
        return value.toString();
    }
  };

  return `{${(Object.getOwnPropertyNames(obj) as K[])
    .sort()
    .map((key) => {
      return `${key}:${valueToString(obj[key])}`;
    })
    .join(",")}}`;
};

export class Cache {
  private _cache: Map<string, any> = new Map();

  set(keys: object, value: any) {
    return this._cache.set(keysToString(keys), value);
  }

  has(keys: object) {
    return this._cache.has(keysToString(keys));
  }

  get(keys: object) {
    return this._cache.get(keysToString(keys));
  }
}
