<script setup>
import { computed, ref } from "vue";
import { formatDate, fromApiDate } from "../utils/dates.js";

const props = defineProps({
  todos: { type: Array, required: true },
  busy: Boolean,
  canCreate: Boolean,
});

const emit = defineEmits(["create", "edit", "remove", "toggle"]);

const search = ref("");
const status = ref("all");
const sortBy = ref("date_from");

const visibleTodos = computed(() => {
  const query = search.value.trim().toLocaleLowerCase("sk-SK");

  return props.todos
    .filter((todo) => {
      const matchesTitle = todo.title.toLocaleLowerCase("sk-SK").includes(query);
      const matchesStatus = status.value === "all" ||
        Boolean(todo.is_finished) === (status.value === "finished");
      return matchesTitle && matchesStatus;
    })
    .sort((a, b) => fromApiDate(a[sortBy.value]) - fromApiDate(b[sortBy.value]));
});

function isOverdue(todo) {
  return !todo.is_finished && fromApiDate(todo.date_to) < Date.now();
}
</script>

<template>
  <section aria-labelledby="todo-list-heading">
    <div class="section-heading">
      <h2 id="todo-list-heading">Zoznam úloh</h2>
      <button type="button" :disabled="busy || !canCreate" @click="emit('create')">
        Pridať úlohu
      </button>
    </div>

    <div class="todo-filters">
      <label class="form-field">
        Vyhľadať podľa názvu
        <input v-model="search" type="search">
      </label>
      <label class="form-field">
        Stav
        <select v-model="status">
          <option value="all">Všetky</option>
          <option value="unfinished">Nedokončené</option>
          <option value="finished">Dokončené</option>
        </select>
      </label>
      <label class="form-field">
        Zoradiť podľa
        <select v-model="sortBy">
          <option value="date_from">Začiatku</option>
          <option value="date_to">Konca</option>
        </select>
      </label>
    </div>

    <ul v-if="visibleTodos.length > 0" class="todo-items">
      <li
        v-for="todo in visibleTodos"
        :key="todo.id"
        class="todo-card"
        :class="{ 'is-finished': todo.is_finished, 'is-overdue': isOverdue(todo) }"
      >
        <div class="todo-heading">
          <h3>{{ todo.title }}</h3>
          <span v-if="todo.is_finished" class="status">Dokončená</span>
          <span v-else-if="isOverdue(todo)" class="status">Po termíne</span>
          <span v-else class="status">Nedokončená</span>
        </div>
        <p v-if="todo.description" class="todo-description">{{ todo.description }}</p>
        <p class="todo-interval">
          <time :datetime="todo.date_from">{{ formatDate(todo.date_from) }}</time>
          –
          <time :datetime="todo.date_to">{{ formatDate(todo.date_to) }}</time>
        </p>
        <div class="button-row">
          <button type="button" class="button-secondary" :disabled="busy" @click="emit('edit', todo)">
            Upraviť
          </button>
          <button type="button" class="button-secondary" :disabled="busy" @click="emit('toggle', todo)">
            {{ todo.is_finished ? "Znovu otvoriť" : "Dokončiť" }}
          </button>
          <button type="button" class="button-danger" :disabled="busy" @click="emit('remove', todo)">
            Odstrániť
          </button>
        </div>
      </li>
    </ul>
    <p v-else-if="todos.length === 0" class="muted">Zatiaľ nemáte žiadne úlohy.</p>
    <p v-else class="muted">Vyhľadávaniu a filtru nevyhovuje žiadna úloha.</p>
  </section>
</template>
