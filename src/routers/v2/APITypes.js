// @flow

// *********************** GENERAL RESPONSE TYPES ***********************

export type id = string

export type Response<T> = {
  success: boolean,
  data: T,
  errors?: Array<Error>
}

// ************************ POLLO OBJECT TYPES ************************
export type APIGroup = {|
  id: id,
  name: string,
  code: string
|}

export type APIPoll = {|
  id: id,
  text: string,
  results: Object,
  shared: boolean,
  type: string,
  answer: ?string,
  correctAnswer: string
|}

export type APIDraft = {|
  id: id,
  text: string,
  options: string[],
  createdAt?: number
|}

export type APIQuestion = {|
  id: id,
  text: string,
  createdAt?: number
|}

export type APIUser = {|
  id: id,
  name: string,
  netID: string
|}

export type APIUserSession = {|
  accessToken: string,
  refreshToken: string,
  sessionExpiration: number,
  isActive: boolean
|}
