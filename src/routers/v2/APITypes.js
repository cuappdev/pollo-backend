// @flow
import type { PollState } from '../../utils/Constants';
import type { PollResult } from '../../models/Poll';

// *********************** GENERAL RESPONSE TYPES ***********************

export type Response<T> = {
  data: T,
  errors?: Array<Error>,
  success: boolean,
}

// ************************ POLLO OBJECT TYPES ************************

export type APIGroup = {|
  id: string,
  createdAt: string,
  updatedAt: string,
  code: string,
  isLive: boolean,
  name: string,
|}

export type APIPoll = {|
  id: string,
  createdAt: string,
  updatedAt: string,
  answerChoices: PollResult[],
  correctAnswer: number,
  state: PollState,
  text: string,
  userAnswers: { string: number[] },
|}

export type APIDraft = {|
  id: string,
  createdAt: string,
  updatedAt: string,
  options: string[],
  text: string,
|}

export type APIDraftCollection = {|
  id : string,
  createdAt: string,
  updatedAt: string,
  name: string,
|}

export type APIUser = {|
  id: string,
  createdAt: string,
  updatedAt: string,
  name: string,
  netID: string,
|}

export type APIUserSession = {|
  accessToken: string,
  isActive: boolean,
  refreshToken: string,
  sessionExpiration: string,
|}
