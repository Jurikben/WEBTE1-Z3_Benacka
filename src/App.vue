<script setup>
import { computed, ref } from "vue";
import TodoForm from "./components/TodoForm.vue";
import TodoList from "./components/TodoList.vue";
import {
  createTodo, deleteTodo, getTodo, getTodos, resetTodos, setTodoFinished, updateTodo,
} from "./services/todoApi.js";

const TODO_LIMIT = 50;

const name = ref("");
const student = ref("");
const todos = ref([]);
const pending = ref("");
const nameError = ref("");
const error = ref("");
const message = ref("");
const form = ref(null);

const busy = computed(() => Boolean(pending.value));
const canCreate = computed(() => todos.value.length < TODO_LIMIT);

async function runRequest(status, action) {
  if (busy.value) return;

  pending.value = status;
  error.value = "";
  message.value = "";

  try {
    await action();
  } catch (err) {
    error.value = err instanceof TypeError
      ? "So serverom sa nepodarilo spojiť. Skúste znova."
      : err.message;
  } finally {
    pending.value = "";
  }
}

function loadTodos() {
  if (busy.value) return;

  nameError.value = "";
  const identifier = name.value.trim();

  if (!identifier || [...identifier].length > 100) {
    nameError.value = "Zadajte školský identifikátor s 1 až 100 znakmi.";
    return;
  }

  runRequest("Načítavam úlohy…", async () => {
    todos.value = await getTodos(identifier);
    student.value = identifier;
    name.value = identifier;
    message.value = "Úlohy boli načítané.";
  });
}

function replaceTodo(updated) {
  todos.value = todos.value.map((todo) => todo.id === updated.id ? updated : todo);
}

async function reloadAfterWrite() {
  try {
    todos.value = await getTodos(student.value);
  } catch {
    error.value = "Zmenu sa podarilo uložiť. Aktuálny zoznam načítajte znova.";
  }
}

function openCreate(initialDates = null) {
  if (busy.value || !canCreate.value) return;

  error.value = "";
  message.value = "";
  form.value = { todo: null, initialDates };
}

function openEdit(todo) {
  runRequest("Načítavam úlohu…", async () => {
    const current = await getTodo(student.value, todo.id);
    replaceTodo(current);
    form.value = { todo: current, initialDates: null };
  });
}

function closeForm() {
  form.value = null;
  error.value = "";
}

function saveTodo(data) {
  const todo = form.value.todo;

  runRequest("Ukladám úlohu…", async () => {
    if (todo) {
      replaceTodo(await updateTodo(student.value, todo.id, data));
      form.value = null;
      message.value = "Úloha bola upravená.";
      return;
    }

    todos.value = await getTodos(student.value);
    if (!canCreate.value) {
      throw new Error("Dosiahli ste limit 50 úloh. Pred pridaním jednu úlohu odstráňte.");
    }

    const created = await createTodo(student.value, data);
    todos.value = [...todos.value, created];
    form.value = null;
    await reloadAfterWrite();
    message.value = "Úloha bola pridaná.";
  });
}

function removeTodo(todo) {
  if (busy.value || !window.confirm(`Odstrániť úlohu „${todo.title}“?`)) return;

  runRequest("Odstraňujem úlohu…", async () => {
    await deleteTodo(student.value, todo.id);
    todos.value = todos.value.filter((item) => item.id !== todo.id);
    message.value = "Úloha bola odstránená.";
  });
}

function toggleTodo(todo) {
  const isFinished = !todo.is_finished;

  runRequest("Mením stav úlohy…", async () => {
    replaceTodo(await setTodoFinished(student.value, todo.id, isFinished));
    message.value = isFinished ? "Úloha bola dokončená." : "Úloha bola znovu otvorená.";
  });
}

function reset() {
  if (busy.value || !window.confirm(
    "Všetky aktuálne úlohy sa odstránia a nahradia piatimi ukážkovými úlohami. Pokračovať?",
  )) return;

  runRequest("Obnovujem ukážkové úlohy…", async () => {
    todos.value = await resetTodos(student.value);
    await reloadAfterWrite();
    message.value = "Ukážkové úlohy boli obnovené.";
  });
}
</script>

<template>
  <header class="site-header">
    <div class="page-width">
      <h1>Môj TODO List</h1>
    </div>
  </header>

  <main class="page-width">
    <form class="student-form" novalidate @submit.prevent="loadTodos">
      <div class="form-field">
        <label for="student-name">Školský identifikátor</label>
        <input id="student-name" v-model="name" maxlength="100" autocomplete="off"
          :disabled="busy" :aria-invalid="Boolean(nameError)"
          :aria-describedby="nameError ? 'name-error' : undefined">
        <p v-if="nameError" id="name-error" class="field-error" role="alert">{{ nameError }}</p>
      </div>
      <button type="submit" :disabled="busy">Načítať úlohy</button>
    </form>

    <div v-if="!form && (pending || error || message)" class="feedback">
      <p v-if="pending" role="status">{{ pending }}</p>
      <p v-if="error" class="field-error" role="alert">{{ error }}</p>
      <p v-if="message" role="status">{{ message }}</p>
    </div>

    <template v-if="student">
      <div class="list-actions">
        <p>Zoznam pre <strong>{{ student }}</strong></p>
        <button type="button" class="button-secondary" :disabled="busy" @click="reset">
          Obnoviť ukážkové úlohy
        </button>
      </div>
      <p v-if="!canCreate" class="field-error" role="status">
        Dosiahli ste limit 50 úloh. Pred pridaním jednu úlohu odstráňte.
      </p>
      <TodoList :key="student" :todos="todos" :busy="busy" :can-create="canCreate"
        @create="openCreate" @edit="openEdit" @remove="removeTodo" @toggle="toggleTodo" />
    </template>

    <TodoForm v-if="form" :todo="form.todo" :initial-dates="form.initialDates" :busy="busy"
      :error="error" @close="closeForm" @save="saveTodo" />
  </main>

  <footer class="site-footer">
    <div class="page-width">WEBTE1 · Zadanie 3</div>
  </footer>
</template>
