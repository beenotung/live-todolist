import { proxySchema } from 'better-sqlite3-proxy'
import { db } from './db'

export type Method = {
  id?: null | number
  method: string
}

export type Url = {
  id?: null | number
  url: string
}

export type UaType = {
  id?: null | number
  name: string
  count: number
}

export type UaBot = {
  id?: null | number
  name: string
  count: number
}

export type UserAgent = {
  id?: null | number
  user_agent: string
  count: number
  ua_type_id: null | number
  ua_type?: UaType
  ua_bot_id: null | number
  ua_bot?: UaBot
}

export type RequestLog = {
  id?: null | number
  method_id: number
  method?: Method
  url_id: number
  url?: Url
  user_agent_id: null | number
  user_agent?: UserAgent
  timestamp: number
}

export type UaStat = {
  id?: null | number
  last_request_log_id: number
}

export type TodoList = {
  id?: null | number
  name: string
}

export type TodoItem = {
  id?: null | number
  todo_list_id: number
  todo_list?: TodoList
  title: string
  is_done: boolean
}

export type DBProxy = {
  method: Method[]
  url: Url[]
  ua_type: UaType[]
  ua_bot: UaBot[]
  user_agent: UserAgent[]
  request_log: RequestLog[]
  ua_stat: UaStat[]
  todo_list: TodoList[]
  todo_item: TodoItem[]
}

export let proxy = proxySchema<DBProxy>({
  db,
  tableFields: {
    method: [],
    url: [],
    ua_type: [],
    ua_bot: [],
    user_agent: [
      /* foreign references */
      ['ua_type', { field: 'ua_type_id', table: 'ua_type' }],
      ['ua_bot', { field: 'ua_bot_id', table: 'ua_bot' }],
    ],
    request_log: [
      /* foreign references */
      ['method', { field: 'method_id', table: 'method' }],
      ['url', { field: 'url_id', table: 'url' }],
      ['user_agent', { field: 'user_agent_id', table: 'user_agent' }],
    ],
    ua_stat: [],
    todo_list: [],
    todo_item: [
      /* foreign references */
      ['todo_list', { field: 'todo_list_id', table: 'todo_list' }],
    ],
  },
})
