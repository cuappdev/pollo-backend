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

export type APIGroup = {
  id: string,
  createdAt: string,
  updatedAt: string,
  code: string,
  isFilterActivated: boolean,
  isLive: boolean,
  isLocationRestricted: boolean,
  location: Coord,
  name: string,
}

export type APIPoll = {
  id: string,
  createdAt: string,
  updatedAt: string,
  answerChoices: PollResult[],
  correctAnswer: string,
  state: PollState,
  text: string,
  type: PollType,
  userAnswers: { string: PollChoice[] },
}

export type APIDraft = {
  id: string,
  createdAt: string,
  updatedAt: string,
  options: string[],
  text: string,
}

export type APIQuestion = {
  id: string,
  createdAt: string,
  updatedAt: string,
  text: string,
}

export type APIUser = {
  id: string,
  createdAt: string,
  updatedAt: string,
  name: string,
  netID: string,
}

export type APIUserSession = {
  accessToken: string,
  isActive: boolean,
  refreshToken: string,
  sessionExpiration: string,
}
