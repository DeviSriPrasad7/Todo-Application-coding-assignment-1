const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");
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
const isSearch = (requestQuery) => {
  return requestQuery.search_q !== undefined;
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
  let getTodo = null;
  const { search_q = "", priority, status, category } = request.query;
  let getTodosQuery;
  switch (true) {
    case isPriority(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodosQuery = `
        SELECT
          *
        FROM
          todo
        WHERE
          todo LIKE '%${search_q}%'
          AND priority = '${priority}';`;
        getTodo = await db.all(getTodosQuery);
        response.send(getTodo.map((eachTodo) => convertTodoDbObject(eachTodo)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case isStatus(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodosQuery = `
        SELECT
          *
        FROM
          todo
        WHERE
          todo LIKE '%${search_q}%'
          AND status = '${status}';`;
        getTodo = await db.all(getTodosQuery);
        response.send(getTodo.map((eachTodo) => convertTodoDbObject(eachTodo)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case isCategory(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getTodosQuery = `
        SELECT
          *
        FROM
          todo
        WHERE
          todo LIKE '%${search_q}%'
          AND category = '${category}';`;
        getTodo = await db.all(getTodosQuery);
        response.send(getTodo.map((eachTodo) => convertTodoDbObject(eachTodo)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case isCategoryAndPriority(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          getTodosQuery = `
                SELECT
                    *
                FROM
                    todo
                WHERE
                    todo LIKE '%${search_q}%'
                    AND priority = '${priority}'
                    AND category = '${category}';`;
          getTodo = await db.all(getTodosQuery);
          response.send(
            getTodo.map((eachTodo) => convertTodoDbObject(eachTodo))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case isPriorityAndStatus(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodosQuery = `
            SELECT
            *
            FROM
            todo
            WHERE
            todo LIKE '%${search_q}%'
            AND priority = '${priority}'
            AND status = '${status}';`;
          getTodo = await db.all(getTodosQuery);
          response.send(
            getTodo.map((eachTodo) => convertTodoDbObject(eachTodo))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case isStatusAndCategory(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        if (
          category === "WORK" ||
          category === "HOME" ||
          category === "LEARNING"
        ) {
          getTodosQuery = `
        SELECT
          *
        FROM
          todo
        WHERE
          todo LIKE '%${search_q}%'
          AND status = '${status}'
          AND category = '${category}';`;
          getTodo = await db.all(getTodosQuery);
          response.send(
            getTodo.map((eachTodo) => convertTodoDbObject(eachTodo))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Category");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case isSearch(request.query):
      getTodosQuery = `
        SELECT
          *
        FROM
          todo
        WHERE
          todo LIKE '%${search_q}%';`;
      getTodo = await db.all(getTodosQuery);
      response.send(getTodo.map((eachTodo) => convertTodoDbObject(eachTodo)));
    default:
      getTodosQuery = `
        SELECT
          *
        FROM
          todo`;
      getTodo = await db.all(getTodosQuery);
      response.send(getTodo.map((eachTodo) => convertTodoDbObject(eachTodo)));
  }
  /*
  const getTodo = await db.all(getTodosQuery);
  response.send(getTodo.map((eachTodo) => convertTodoDbObject(eachTodo)));
  */
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
      id = '${todoId}';`;
  const getTodoId = await db.get(getTodoIdQuery);
  response.send(convertTodoDbObject(getTodoId));
});
//api-3 ***
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  console.log(isMatch(date, "yyyy-MM-dd"));
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    const getDateQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      due_date = '${newDate}';`;
    const getDate = await db.all(getDateQuery);
    response.send(getDate.map((eachDate) => convertTodoDbObject(eachDate)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});
//api-4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const postNewDate = format(new Date(dueDate), "yyyy-MM-dd");
          const postTodoQuery = `
        INSERT INTO 
         todo(id, todo, priority, status, category, due_date)
        VALUES 
         ('${id}','${todo}','${priority}', '${status}', '${category}','${postNewDate}');`;
          await db.run(postTodoQuery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
  /*
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
  */
});
//api-5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  console.log(requestBody);
  const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body;

  let updateTodoQuery;
  switch (true) {
    // update status
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updateTodoQuery = `
            UPDATE 
              todo 
            SET 
              todo='${todo}', 
              priority='${priority}', 
              status='${status}', 
              category='${category}',
              due_date='${dueDate}' 
            WHERE 
              id = ${todoId};`;

        await db.run(updateTodoQuery);
        response.send(`Status Updated`);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    //update priority
    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
        updateTodoQuery = `
            UPDATE 
              todo 
            SET 
              todo='${todo}', 
              priority='${priority}', 
              status='${status}', 
              category='${category}',
              due_date='${dueDate}' 
            WHERE 
              id = ${todoId}`;

        await db.run(updateTodoQuery);
        response.send(`Priority Updated`);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    //update todo
    case requestBody.todo !== undefined:
      updateTodoQuery = `
            UPDATE 
              todo 
            SET 
              todo='${todo}', 
              priority='${priority}', 
              status='${status}', 
              category='${category}',
              due_date='${dueDate}' 
            WHERE 
              id = ${todoId}`;

      await db.run(updateTodoQuery);
      response.send(`Todo Updated`);
      break;

    //update category
    case requestBody.category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        updateTodoQuery = `
            UPDATE 
              todo 
            SET 
              todo='${todo}', 
              priority='${priority}', 
              status='${status}', 
              category='${category}',
              due_date='${dueDate}' 
            WHERE 
              id = ${todoId};`;

        await db.run(updateTodoQuery);
        response.send(`Category Updated`);
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    //update due date
    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDueDate = format(new Date(dueDate), "yyyy-MM-dd");
        updateTodoQuery = `
            UPDATE 
              todo 
            SET 
              todo='${todo}', 
              priority='${priority}', 
              status='${status}', 
              category='${category}',
              due_date='${dueDate}' 
            WHERE 
              id = ${todoId};`;

        await db.run(updateTodoQuery);
        response.send(`Due Date Updated`);
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
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
