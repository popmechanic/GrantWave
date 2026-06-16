/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as discover from "../discover.js";
import type * as http from "../http.js";
import type * as lib_classify from "../lib/classify.js";
import type * as refresh from "../refresh.js";
import type * as sources_grantsGov from "../sources/grantsGov.js";
import type * as sources_propublica from "../sources/propublica.js";
import type * as sources_types from "../sources/types.js";
import type * as sources_usaspending from "../sources/usaspending.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  crons: typeof crons;
  discover: typeof discover;
  http: typeof http;
  "lib/classify": typeof lib_classify;
  refresh: typeof refresh;
  "sources/grantsGov": typeof sources_grantsGov;
  "sources/propublica": typeof sources_propublica;
  "sources/types": typeof sources_types;
  "sources/usaspending": typeof sources_usaspending;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
