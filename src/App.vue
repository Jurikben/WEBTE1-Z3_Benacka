<script setup>
import { ref } from "vue";
import { getTodos } from "./services/todoApi.js";
import { formatDate } from "./utils/dates.js";

const name = ref("");
const student = ref("");
const todos = ref([]);
const loading = ref(false);
const nameError = ref("");
const error = ref("");
const message = ref("");

async function loadTodos() {
  if (loading.value) return;

  nameError.value = "";
  error.value = "";
  message.value = "";
  const identifier = name.value.trim();

  if (!identifier || identifier.length > 100) {
    nameError.value = "Zadajte školský identifikátor s 1 až 100 znakmi.";
    return;
  }

  loading.value = true;

  try {
    todos.value = await getTodos(identifier);
    student.value = identifier;
    message.value = "Úlohy boli načítané.";
  } catch (err) {
    error.value = err instanceof TypeError
      ? "So serverom sa nepodarilo spojiť. Skúste znova."
      : err.message;
  } finally {
    loading.value = false;
  }
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
          :disabled="loading" :aria-invalid="Boolean(nameError)" aria-describedby="name-error">
        <p v-if="nameError" id="name-error" class="field-error" role="alert">{{ nameError }}</p>
      </div>
      <button type="submit" :disabled="loading">Načítať úlohy</button>
    </form>

    <p v-if="loading" role="status">Načítavam úlohy…</p>
    <p v-if="error" class="field-error" role="alert">{{ error }}</p>
    <p v-if="message" role="status">{{ message }}</p>

    <section v-if="student" aria-labelledby="list-title">
      <h2 id="list-title">Zoznam úloh</h2>
      <p v-if="!todos.length">Zatiaľ nemáte žiadne úlohy.</p>
      <ul v-else class="todo-list">
        <li v-for="todo in todos" :key="todo.id" class="todo-card">
          <h3>{{ todo.title }}</h3>
          <p v-if="todo.description">{{ todo.description }}</p>
          <p>{{ formatDate(todo.date_from) }} – {{ formatDate(todo.date_to) }}</p>
          <p>{{ todo.is_finished ? "Dokončená" : "Nedokončená" }}</p>
        </li>
      </ul>
    </section>
  </main>

  <footer class="site-footer">
    <div class="page-width">WEBTE1 · Zadanie 3</div>
  </footer>
</template>
