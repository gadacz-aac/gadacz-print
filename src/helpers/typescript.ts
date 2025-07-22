/** Works like Omit but for Unions
 * type U = A | B;
 * type UnionOmit<U, 'id'> = Omit<A, 'id'> | Omit<B, 'id'>
 * https://www.reddit.com/r/typescript/comments/qvad8a/omitting_keys_in_union_types/
 */
export type UnionOmit<T, K extends string | number | symbol> = T extends unknown
  ? Omit<T, K>
  : never;
