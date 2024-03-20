export const isEmpty = (obj: any) => {
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) {
        return false;
      }
    }
  
    return true;
}

export const range = (start: number, end: number) => [...Array(end - start).keys()].map(i => i + start);
