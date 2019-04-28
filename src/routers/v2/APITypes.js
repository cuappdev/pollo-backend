// @flow
import type { Coord } from '../../models/Group';
import type { PollChoice, PollState, PollType } from '../../utils/Constants';
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
  isFilterActivated: boolean,
  isLive: boolean,
  isLocationRestricted: boolean,
  location: Coord,
  name: string,
  updatedAt: string,
|}

export type APIPoll = {|
  id: id,
  answerChoices: PollResult[],
  correctAnswer ?: string,
  createdAt ?: string,
  state: PollState,
  text: string,
  type: PollType,
  updatedAt ?: string,
  userAnswers: { string: PollChoice[] },
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
