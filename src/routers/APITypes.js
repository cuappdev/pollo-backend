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
  dateTime: string,
|}

export type APIQuestion = {|
  id: id,
  text: string,
  type: string,
  data: string
|}

export type APIAnswer = {|
  id: id,
  question: id,
  answerer: id,
  type: string,
  data: string,
|}

export type APIUser = {|
  id: id,
  name: string,
  netid: string,
|}
