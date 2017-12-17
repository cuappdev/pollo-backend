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

export type APIOrganization = {|
  id: id,
    name: string,
|}

export type APICourse = {|
  id: id,
  name: string,
  term: string,
  code: string,
|}

export type APILecture = {|
  id: id,
  dateTime: number,
|}

export type FreeResponseQuestion = {|
  id: id,
  text: string,
  type: string
|}

export type option = {|
  id: string,
  description: string
|}

export type MultipleChoiceQuestion = {|
  id: id,
  text: string,
  type: string,
  options: option[],
  answer: string
|}

// For multiple answer and ranking questions
export type MultipleAnswerQuestion = {|
  id: id,
  text: string,
  type: string,
  options: option[],
  answer: string[]
|}

export type APIQuestion = FreeResponseQuestion | MultipleChoiceQuestion
  | MultipleAnswerQuestion

// for free response or multiple choice questions
export type SingleResponse = {|
  id: id,
  question: id,
  answerer: id,
  type: string,
  response: string
|}

// for multiple answer or ranking questions
export type MultipleResponse = {|
  id: id,
  question: id,
  answerer: id,
  type: string,
  response: string[]
|}

export type APIAnswer = SingleResponse | MultipleResponse

export type APIUser = {|
  id: id,
  name: string,
  netid: string,
|}
