// @flow

import type { AppDevEdgesResponse } from '../utils/AppDevEdgeRouter';
import type { AppDevNodeResponse } from '../utils/AppDevNodeRouter';

/** ************************ GENERAL RESPONSE TYPES ************************ **/

export type id = string

export type Response<T> = {
  success: boolean,
  data: T,
  errors?: Array<Error>
}

export type NodeResponse<T> = Response<AppDevNodeResponse<T>>
export type EdgesResponse<T> = Response<AppDevEdgesResponse<T>>

/** ************************* CLICKER OBJECT TYPES ************************* **/
export type APIPoll = {|
  id: id,
  name: string,
  code: string,
|}

export type APIQuestion = {|
  id: id,
  text: string,
  results: Object
|}
