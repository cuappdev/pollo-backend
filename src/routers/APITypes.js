// @flow

export type id = string

export type APIOrganization = {|
  id: id,
  name: string,
|}

export type APICourse = {|
  id: id,
  name: string,
  term: string,
|}

export type APILecture = {|
  id: id,
  dateTime: number,
|}

export type APIQuestion = {|
  id: id,
  text: string,
  type: string,
  data: string
|}

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
