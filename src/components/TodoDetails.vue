<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { formatDate } from "../utils/dates.js";

const props = defineProps({
  todo: { type: Object, required: true },
  busy: Boolean,
  pending: String,
  error: String,
  message: String,
});

const emit = defineEmits(["close", "edit", "toggle", "remove"]);
const dialog = ref(null);

onMounted(() => dialog.value.showModal());
onBeforeUnmount(() => dialog.value.close());

function close() {
  if (!props.busy) {
    emit("close");
  }
}
</script>

<template>
  <dialog ref="dialog" class="form-dialog" aria-labelledby="todo-details-heading" @cancel.prevent="close">
    <h2 id="todo-details-heading">Detail úlohy</h2>
    <div class="todo-heading" :class="{ 'is-finished': todo.is_finished }">
      <h3>{{ todo.title }}</h3>
      <span class="status">{{ todo.is_finished ? "Dokončená" : "Nedokončená" }}</span>
    </div>
    <p v-if="todo.description" class="todo-description">{{ todo.description }}</p>
    <p class="todo-interval">
      <time :datetime="todo.date_from">{{ formatDate(todo.date_from) }}</time>
      –
      <time :datetime="todo.date_to">{{ formatDate(todo.date_to) }}</time>
    </p>
    <p v-if="pending" role="status">{{ pending }}</p>
    <p v-if="error" class="field-error" role="alert">{{ error }}</p>
    <p v-if="message" role="status">{{ message }}</p>
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
      <button type="button" class="button-secondary" autofocus :disabled="busy" @click="close">
        Zavrieť
      </button>
    </div>
  </dialog>
</template>
