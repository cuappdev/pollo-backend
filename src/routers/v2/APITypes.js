// @flow
import type { PollChoice, PollState } from '../../utils/Constants';
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
  correctAnswer: string,
  state: PollState,
  text: string,
  userAnswers: { string: PollChoice[] },
|}

export type APIDraft = {|
  id: string,
  createdAt: string,
  updatedAt: string,
  options: string[],
  text: string,
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
