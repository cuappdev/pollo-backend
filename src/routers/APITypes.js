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
export type APISession = {|
  id: id,
  name: string,
  code: string,
|}

export type APIGroup = {|
  id: id,
  name: string,
  code: string
|}

export type APIPoll = {|
  id: id,
  text: string,
  results: Object
|}

export type APIUser = {|
  id: id,
  name: string,
  netId: string
|}

export type APIUserSession = {|
  accessToken: string,
  refreshToken: string,
  sessionExpiration: number,
  isActive: boolean
|}
