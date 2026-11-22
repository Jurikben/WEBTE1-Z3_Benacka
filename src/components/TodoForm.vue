<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { parseDateTimeInput, toDateTimeInput } from "../utils/dates.js";

const props = defineProps({
  todo: { type: Object, default: null },
  initialDates: { type: Object, default: null },
  busy: Boolean,
  error: String,
});

const emit = defineEmits(["close", "save"]);

const dialog = ref(null);
const dates = props.todo ?? props.initialDates;
const initialFrom = dates ? toDateTimeInput(dates.date_from) : "";
const initialTo = dates ? toDateTimeInput(dates.date_to) : "";
const timeStep = initialFrom.includes(".") || initialTo.includes(".") ? 0.001 : 1;
const form = ref({
  title: props.todo?.title ?? "",
  description: props.todo?.description ?? "",
  date_from: initialFrom,
  date_to: initialTo,
  is_finished: props.todo?.is_finished ?? false,
});
const errors = ref({});

onMounted(() => dialog.value.showModal());
onBeforeUnmount(() => dialog.value.close());

function close() {
  if (!props.busy) {
    emit("close");
  }
}

function save() {
  if (props.busy) return;

  const values = form.value;
  const title = values.title.trim();
  let from = parseDateTimeInput(values.date_from, dates?.date_from);
  let to = parseDateTimeInput(values.date_to, dates?.date_to);

  if (values.date_from === values.date_to) {
    if (values.date_from !== initialFrom) {
      from = to;
    } else if (values.date_to !== initialTo) {
      to = from;
    }
  }

  errors.value = {};

  if (!title) {
    errors.value.title = "Zadajte názov úlohy.";
  } else if ([...title].length > 200) {
    errors.value.title = "Názov môže mať najviac 200 znakov.";
  }

  if ([...values.description].length > 1000) {
    errors.value.description = "Popis môže mať najviac 1000 znakov.";
  }

  if (!from) {
    errors.value.date_from = "Zadajte platný začiatok úlohy.";
  }

  if (!to) {
    errors.value.date_to = "Zadajte platný koniec úlohy.";
  } else if (from && to < from) {
    errors.value.date_to = "Koniec nesmie byť pred začiatkom.";
  }

  if (Object.keys(errors.value).length > 0) return;

  emit("save", {
    title,
    description: values.description,
    date_from: from.toISOString(),
    date_to: to.toISOString(),
    is_finished: values.is_finished,
  });
}
</script>

<template>
  <dialog ref="dialog" class="form-dialog" aria-labelledby="todo-form-heading" @cancel.prevent="close">
    <h2 id="todo-form-heading">{{ todo ? "Upraviť úlohu" : "Nová úloha" }}</h2>
    <form novalidate @submit.prevent="save">
      <div class="form-field">
        <label for="todo-title">Názov</label>
        <input
          id="todo-title"
          v-model="form.title"
          required
          autofocus
          :disabled="busy"
          :aria-invalid="Boolean(errors.title)"
          :aria-describedby="errors.title ? 'todo-title-error' : undefined"
        >
        <span v-if="errors.title" id="todo-title-error" class="field-error">{{ errors.title }}</span>
      </div>

      <div class="form-field">
        <label for="todo-description">Popis</label>
        <textarea
          id="todo-description"
          v-model="form.description"
          rows="3"
          :disabled="busy"
          :aria-invalid="Boolean(errors.description)"
          :aria-describedby="errors.description ? 'todo-description-error' : undefined"
        ></textarea>
        <span v-if="errors.description" id="todo-description-error" class="field-error">
          {{ errors.description }}
        </span>
      </div>

      <div class="form-dates">
        <div class="form-field">
          <label for="todo-from">Začiatok</label>
          <input
            id="todo-from"
            v-model="form.date_from"
            type="datetime-local"
            :step="timeStep"
            required
            :disabled="busy"
            :aria-invalid="Boolean(errors.date_from)"
            :aria-describedby="errors.date_from ? 'todo-from-error' : undefined"
          >
          <span v-if="errors.date_from" id="todo-from-error" class="field-error">
            {{ errors.date_from }}
          </span>
        </div>
        <div class="form-field">
          <label for="todo-to">Koniec</label>
          <input
            id="todo-to"
            v-model="form.date_to"
            type="datetime-local"
            :step="timeStep"
            required
            :disabled="busy"
            :aria-invalid="Boolean(errors.date_to)"
            :aria-describedby="errors.date_to ? 'todo-to-error' : undefined"
          >
          <span v-if="errors.date_to" id="todo-to-error" class="field-error">
            {{ errors.date_to }}
          </span>
        </div>
      </div>

      <label v-if="todo" class="checkbox-field">
        <input v-model="form.is_finished" type="checkbox" :disabled="busy">
        Dokončená
      </label>

      <p v-if="busy" role="status">Ukladám úlohu…</p>
      <p v-if="error" class="field-error" role="alert">{{ error }}</p>
      <div class="button-row">
        <button type="submit" :disabled="busy">Uložiť</button>
        <button type="button" class="button-secondary" :disabled="busy" @click="close">Zrušiť</button>
      </div>
    </form>
  </dialog>
</template>
