/**
 * ──────────────────────────────────────────────────────────────────────────────
 * 03 ‣ ALGEBRAIC DATA TYPES (ADT) — *Sum (OR) & Product (AND)*
 * ──────────────────────────────────────────────────────────────────────────────
 *
 *  Plain TypeScript — no libraries.
 *
 *  Cheat-sheet
 *  -----------
 *        “A | B”  → SUM  (choice)           ↠ add the counts
 *        “{ x; y }” → PRODUCT (all fields) ↠ multiply the counts
 *
 *  Boolean has two values (`true`, `false`) so it often serves as our
 *  smallest building block.
 */

/* ───────────────────────────── 1. SUM TYPES (“OR”) ───────────────────────── */

export type Bool = true | false; // 1 + 1 = 2 variants

type HttpSuccess = { tag: 'Success'; body: string };
type HttpFailure = { tag: 'Failure'; status: number; message: string };
export type HttpResult = HttpSuccess | HttpFailure; // 1 + 1 = 2 variants

/* ──────────────────────────── 2. PRODUCT TYPES (“AND”) ───────────────────── */

type BoolPair = { left: boolean; right: boolean }; // 2 × 2 = 4 variants
/*
    { left: false, right: false }
    { left: false, right: true  }
    { left: true,  right: false }
    { left: true,  right: true  }
*/

/* ────────────────────────────── 3. MIXING BOTH ───────────────────────────── */

type User = {
  loggedIn: boolean;
  auth: 'Anon' | 'Member' | 'Admin';
};
// true + false x anon + member + admin
// 2 x 3
// 6 variants

/* ───────────────── 4. CASE STUDY — THE “EIGHT-STATE” QUERY ──────────────── */

type Data = { data: string };
type Err = { error: string; status: number };

type QueryFlags = {
  data: Data | undefined;
  error: Err | undefined;
  isLoading: boolean;
};
/*
      2 × 2 × 2 = 8 possible tuples, but only 4 make sense:
        idle, loading, success, failure
      Flags are a PRODUCT; we really wanted a SUM of those 4 states.
*/

type QueryState =
  | { tag: 'Idle' }
  | { tag: 'Loading' }
  | { tag: 'Success'; data: Data }
  | { tag: 'Failure'; error: Err };

/* ────────────────────── 5. MINI QUIZ — COUNT THE VARIANTS ────────────────── */

/**
 * 5.1  Simple sum:  true | null | undefined
 *
 */
export type SimpleSum = true | null | undefined;
// How many variants?
// TODO []: Answer ->

/**
 * 5.2  Simple product: { isCat; isDog; walked? }
 *
 */
export type SimpleProduct = {
  isCat: boolean;
  isDog: boolean;
  walked?: true;
};
// How many variants?
// TODO []: Answer ->

/**
 * 5.3  Nested: sum inside product
 */
export type Complex = {
  typeTheoryIsEasy: SimpleSum;
  mySpiritAnimal: SimpleProduct;
};
// How many variants?
// TODO []: Answer ->

/**
 * 5.4  This is one is more difficult, and not as practical, but helps illustrate the concept.
 *
 */
export type ABitMoreTheory = {
  score: number;
  won: boolean;
};
// How many variants? The answers here may vary slightly, but it's not: (number x boolean) -> (1 x 2) -> 2.
// TODO []: Answer ->

/* ───────────────────────── 6. TAKE-AWAY MESSAGE ─────────────────────────── */
/*
    • Use SUMS when only *one* variant can be valid at a time.
    • Use PRODUCTS when *all* fields must be present together.
    • “Eight-state flag objects” sneak in because three booleans form a
      2 × 2 × 2 product; replace them with a four-variant sum.

    • Consider: How few variants do I need to represent this type?

*/
