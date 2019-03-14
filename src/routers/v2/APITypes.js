// @flow
import type {
  PollType, PollChoice, PollState,
} from '../../utils/Constants';

import type { PollResult } from '../../models/Poll';

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
  createdAt?: string,
  updatedAt?: string,
  text: string,
  answerChoices: PollResult[],
  type: PollType,
  correctAnswer: string,
  submittedAnswers: PollChoice[],
  state: PollState
|}

export type APIDraft = {|
  id: id,
  createdAt: string,
  options: string[],
  text: string,
|}

export type APIQuestion = {|
  id: id,
  createdAt: string,
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
  sessionExpiration: string,
|}
