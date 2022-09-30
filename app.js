const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const addDays = require("date-fns");
//
const dbPath = path.join(__dirname, "todoApplication.db");
//
const app = express();
//
app.use(express.json());
let db = null;
//
const initializeAndDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is started at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB error ${error.message}`);
    process.exit(1);
  }
};
initializeAndDbServer();
//
const convertTodoDbObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  };
};
const isPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const isCategory = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const isStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const isCategoryAndPriority = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};
const isPriorityAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const isStatusAndCategory = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.category !== undefined
  );
};
//api-1
app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status, category } = request.query;
  let getTodosQuery;
  switch (true) {
    case isPriority(request.query):
      getTodosQuery = `
        SELECT
          *
        FROM
          todo
        WHERE
          todo LIKE '%${search_q}%'
          AND priority = '${priority}';`;
      break;
    case isStatus(request.query):
      getTodosQuery = `
        SELECT
          *
        FROM
          todo
        WHERE
          todo LIKE '%${search_q}%'
          AND status = '${status}';`;
      break;
    case isCategory(request.query):
      getTodosQuery = `
        SELECT
          *
        FROM
          todo
        WHERE
          todo LIKE '%${search_q}%'
          AND category = '${category}';`;
      break;
    case isCategoryAndPriority(request.query):
      getTodosQuery = `
        SELECT
          *
        FROM
          todo
        WHERE
          todo LIKE '%${search_q}%'
          AND priority = '${priority}'
          AND category = '${category}';`;
      break;
    case isPriorityAndStatus(request.query):
      getTodosQuery = `
        SELECT
          *
        FROM
          todo
        WHERE
          todo LIKE '%${search_q}%'
          AND priority = '${priority}'
          AND status = '${status}';`;
      break;
    case isStatusAndCategory(request.query):
      getTodosQuery = `
        SELECT
          *
        FROM
          todo
        WHERE
          todo LIKE '%${search_q}%'
          AND status = '${status}'
          AND category = '${category}';`;
      break;
    default:
      getTodosQuery = `
        SELECT
          *
        FROM
          todo
        WHERE
          todo LIKE '%${search_q}%';`;
  }
  const getTodo = await db.all(getTodosQuery);
  response.send(getTodo.map((eachTodo) => convertTodoDbObject(eachTodo)));
});
//api-2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const getTodo = await db.get(getTodoQuery);
  response.send(convertTodoDbObject(getTodo));
});
//api-3 ***
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const time = addDays(date);
  const dateTime = `${time.getFullYear()}-${
    time.getMonth() + 1
  }-${time.getDate()}`;
  const getAgenda = `
    SELECT
      *
    FROM
      todo
    WHERE
      due_date = '${dateTime}';`;
  console.log(getAgenda);
  const getDateTime = await db.get(getAgenda);
  console.log(getDateTime);
  response.send(convertTodoDbObject(getDateTime));
});
//api-4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const postTodoQuery = `
    INSERT INTO
      todo (id, todo, priority, status, category, due_date)
    VALUES
      (
          ${id},
          '${todo}',
          '${priority}',
          '${status}',
          '${category}',
          '${dueDate}'
      );`;
  await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});
//api-5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let updateColumn = "";
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
    case requestBody.category !== undefined:
      updateColumn = "Category";
      break;
    case requestBody.dueDate !== undefined:
      updateColumn = "Due Date";
      break;
  }
  const getDetails = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const previousTodo = await db.get(getDetails);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.due_date,
  } = request.body;
  const getTodo = `
            UPDATE
              todo
            SET
              todo =  '${todo}',
              priority = '${priority}',
              status = '${status}',
              category = '${category}',
              due_date = '${dueDate}'
            WHERE
              id = ${todoId};`;
  await db.run(getTodo);
  response.send(`${updateColumn} Updated`);
});
//api-6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getDeleteTodo = `
    DELETE FROM
      todo
    WHERE
      id = ${todoId};`;
  await db.run(getDeleteTodo);
  response.send("Todo Deleted");
});
//
module.exports = app;
