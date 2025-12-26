export const sortObjectByKey = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map((e) => sortObjectByKey(e)).sort();
  }

  return Object.keys(obj)
    .sort()
    .reduce<any>((sorted, k) => {
      sorted[k] = sortObjectByKey((obj as any)[k]);
      return sorted;
    }, {});
};

export const randomIntFromInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const transition = (from: number, to: number, progress: number) => {
  return from + (to - from) * progress;
};
