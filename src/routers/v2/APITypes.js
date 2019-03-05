// @flow

// *********************** GENERAL RESPONSE TYPES ***********************

export type id = string

export type Response<T> = {
  data: T,
  errors?: Array<Error>,
  success: boolean,
}

// ************************ POLLO OBJECT TYPES ************************
export type APIGroup = {|
  id: id,
  code: string,
  isLive: boolean,
  name: string,
  updatedAt: string,
|}

export type APIPoll = {|
  id: id,
  answer: ?string,
  correctAnswer: string,
  results: Object,
  shared: boolean,
  text: string,
  type: string,
|}

export type APIDraft = {|
  id: id,
  createdAt?: number,
  options: string[],
  text: string,
|}

export type APIQuestion = {|
  id: id,
  createdAt?: number,
  text: string,
|}

export type APIUser = {|
  id: id,
  name: string,
  netID: string,
|}

export type APIUserSession = {|
  accessToken: string,
  isActive: boolean,
  refreshToken: string,
  sessionExpiration: number,
|}
