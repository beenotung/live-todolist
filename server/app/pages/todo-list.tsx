import { proxy } from '../../../db/proxy.js'
import { title } from '../../config.js'
import { mapArray } from '../components/fragment.js'
import { o } from '../jsx/jsx.js'
import { Routes } from '../routes'
import { apiEndpointTitle } from '../../config.js'
import { Context } from '../context.js'
import { getContextFormBody } from '../context.js'
import { id, object, string } from 'cast.ts'
import { filter } from 'better-sqlite3-proxy'
import { WsContext } from '../context'
import { Link } from '../components/router.js'
import { TodoList } from '../../../db/proxy.js'
import { renderError } from '../components/error.js'
import Style from '../components/style.js'

function TodoListOverview() {
  return (
    <div>
      <h1>Todo List</h1>
      <form
        method="post"
        action="/todo-list/create-list"
        onsubmit="emitForm(event)"
      >
        <input type="text" name="name" placeholder="List name" />
        <input type="submit" value="Create List" />
      </form>
      <p>{proxy.todo_list.length} lists</p>
      {mapArray(proxy.todo_list, todo_list => (
        <div>
          <h2>
            <Link href={`/todo-list/${todo_list.id}/details`}>
              #{todo_list.id} {todo_list.name}
            </Link>
          </h2>
        </div>
      ))}
    </div>
  )
}

function TodoListDetail(attrs: { list: TodoList }) {
  let todo_list = attrs.list
  let todo_items = filter(proxy.todo_item, {
    todo_list_id: todo_list.id!,
  })
  return (
    <div>
      <h1>{todo_list.name}</h1>
      <Link href="/todo-list">Back to Todo List</Link>
      <p>{todo_items.length} items</p>
      <form
        method="post"
        action="/todo-list/create-item"
        onsubmit="emitForm(event)"
      >
        <input name="list_id" value={todo_list.id} hidden />
        <input name="title" placeholder="Task title" />
        <input type="submit" value="Create Task" />
      </form>
      {Style(/* css */ `
			  .todo-item label {
					padding: 0.5rem;
					border: 1px solid black;
					display: inline-flex;
					gap: 0.5rem;
					width: 100%;
				}
			`)}
      <div style="display: flex; flex-direction: column; width: fit-content; margin: 0.5rem">
        {mapArray(todo_items, todo_item => (
          <div class="todo-item">
            <label>
              <input
                type="checkbox"
                name="is_done"
                checked={todo_item.is_done || undefined}
                oninput={`emit('/todo-list/tick-task',${todo_item.id},this.checked)`}
              />
              {todo_item.title}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

let createTodoListParser = object({
  name: string({ trim: true, nonEmpty: true }),
})

function CreateTodoList(attrs: {}, context: Context) {
  let body = getContextFormBody(context)
  let input = createTodoListParser.parse(body)
  let list_id = proxy.todo_list.push({ name: input.name })
  // return <div>Created Todo List #{list_id}</div>
  return <TodoListOverview />
}

let createTodoItemParser = object({
  list_id: id(),
  title: string({ trim: true, nonEmpty: true }),
})

function CreateTodoItem(attrs: {}, context: Context) {
  let body = getContextFormBody(context)
  let input = createTodoItemParser.parse(body)
  let item_id = proxy.todo_item.push({
    todo_list_id: input.list_id,
    title: input.title,
    is_done: false,
  })
  let list = proxy.todo_list[input.list_id]
  return <TodoListDetail list={list} />
}

function TickTask(attrs: {}, context: WsContext) {
  let [id, done] = context.args as any
  let item = proxy.todo_item[id]
  item.is_done = done
  return <TodoListDetail list={item.todo_list!} />
}

let routeDict: Routes = {
  '/todo-list': {
    title: title('Todo List'),
    description: 'Reminding items to be done',
    menuText: 'Todo List',
    node: <TodoListOverview />,
  },
  '/todo-list/:id/details': {
    resolve(context) {
      let id = context.routerMatch?.params.id
      let list = proxy.todo_list[id]
      if (!list) {
        return {
          title: title('Todo List Not Found'),
          description: 'The todo list is not available right now',
          node: renderError(`Todo List #${id} not found`, context),
        }
      }
      return {
        title: title('Todo List'),
        description: 'Reminding items to be done',
        node: <TodoListDetail list={list} />,
      }
    },
  },
  '/todo-list/create-list': {
    title: apiEndpointTitle,
    description: 'create a todo list',
    node: <CreateTodoList />,
  },
  '/todo-list/create-item': {
    title: apiEndpointTitle,
    description: 'create a todo task',
    node: <CreateTodoItem />,
  },
  '/todo-list/tick-task': {
    title: apiEndpointTitle,
    description: 'mark a task as done / not done',
    node: <TickTask />,
  },
}

export default routeDict
