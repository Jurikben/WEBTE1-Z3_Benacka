const API_URL = "https://wt1zadanie.iolab.sk/api";

function studentUrl(name) {
  return `${API_URL}/${encodeURIComponent(name)}`;
}

async function getJson(url, method = "GET", data) {
  const options = { method };

  if (data !== undefined) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (response.status === 403) {
    throw new Error("Školský identifikátor nie je povolený. Skontrolujte ho a skúste znova.");
  }
  if (response.status === 404) {
    throw new Error("Požadovaná úloha alebo zoznam sa nenašli.");
  }
  if (response.status === 422) {
    throw new Error("Server odmietol zadané údaje. Skontrolujte ich a skúste znova.");
  }
  if (!response.ok) {
    throw new Error(`Server odpovedal chybou ${response.status}. Skúste znova.`);
  }
  if (response.status === 204) return;

  return response.json();
}

export async function getTodos(name) {
  const data = await getJson(studentUrl(name));
  return data.todos ?? [];
}

export function getTodo(name, id) {
  return getJson(`${studentUrl(name)}/${id}`);
}

export function createTodo(name, todo) {
  return getJson(studentUrl(name), "POST", todo);
}

export function updateTodo(name, id, todo) {
  return getJson(`${studentUrl(name)}/${id}`, "PUT", todo);
}

export function deleteTodo(name, id) {
  return getJson(`${studentUrl(name)}/${id}`, "DELETE");
}

export function setTodoFinished(name, id, isFinished) {
  const action = isFinished ? "done" : "undone";
  return getJson(`${studentUrl(name)}/${id}/${action}`, "PATCH");
}

export async function resetTodos(name) {
  const data = await getJson(`${studentUrl(name)}/reset`, "POST");
  return data.todos ?? [];
}
