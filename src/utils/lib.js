// @flow

/** Removes element from array on predicate */
export const remove = <T>(arr: Array<T>, pred:(T, number) => boolean) => {
  for (let i = arr.length - 1; i > -1; i--) {
    if (pred(arr[i], i)) {
      arr.splice(i, 1);
    }
  }
};
