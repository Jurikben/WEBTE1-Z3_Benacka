<script setup>
import { computed } from "vue";
import FullCalendar, { useCalendarController } from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/vue3/daygrid";
import timeGridPlugin from "@fullcalendar/vue3/timegrid";
import interactionPlugin from "@fullcalendar/vue3/interaction";
import skLocale from "@fullcalendar/vue3/locales/sk";
import themePlugin from "@fullcalendar/vue3/themes/monarch";
import "@fullcalendar/vue3/skeleton.css";
import "@fullcalendar/vue3/themes/monarch/theme.css";
import "@fullcalendar/vue3/themes/monarch/palettes/blue.css";

const props = defineProps({
  todos: { type: Array, required: true },
  busy: Boolean,
  canCreate: Boolean,
});
const emit = defineEmits(["open", "create"]);
const calendar = useCalendarController();
const views = [
  { name: "dayGridMonth", label: "Mesiac" },
  { name: "timeGridWeek", label: "Týždeň" },
  { name: "timeGridDay", label: "Deň" },
];
const plugins = [themePlugin, dayGridPlugin, timeGridPlugin, interactionPlugin];
const timeFormat = { hour: "2-digit", minute: "2-digit", hour12: false };

function toCalendarEvent(todo) {
  const start = new Date(todo.date_from);
  const end = new Date(todo.date_to);
  const sameTime = start.getTime() === end.getTime();

  return {
    id: String(todo.id),
    title: todo.title,
    start,
    end: sameTime ? new Date(end.getTime() + 1) : end,
    allDay: false,
    color: todo.is_finished ? "#166534" : "#1d4ed8",
    extendedProps: {
      finished: todo.is_finished,
      sameTime,
      startTime: start.toLocaleTimeString("sk-SK", timeFormat),
      endTime: end.toLocaleTimeString("sk-SK", timeFormat),
    },
  };
}

function eventTime(info) {
  const { sameTime, startTime, endTime } = info.event.extendedProps;
  if (sameTime) return startTime;
  if (!info.isNarrow || info.view.type !== "dayGridMonth") return info.timeText;
  if (info.isStart) return startTime;
  return info.isEnd ? `–${endTime}` : "";
}

function createFromDate(info) {
  if (!props.canCreate || props.busy) return;

  const start = new Date(info.date);
  if (info.allDay) start.setHours(9, 0, 0, 0);
  const minutes = info.allDay ? 60 : 30;
  const end = new Date(start.getTime() + minutes * 60_000);
  emit("create", { date_from: start, date_to: end });
}

function createFromSelection(info) {
  if (!props.canCreate || props.busy) return;

  info.view.calendar.unselect();
  emit("create", { date_from: info.start, date_to: info.end });
}

function openEvent(info) {
  if (!props.busy) emit("open", Number(info.event.id));
}

const calendarOptions = computed(() => ({
  plugins,
  controller: calendar,
  initialView: "dayGridMonth",
  headerToolbar: false,
  locale: skLocale,
  timeZone: "local",
  height: "auto",
  dayMaxEvents: 3,
  dayCellClass: "calendar-day",
  dayHeaderClass: "calendar-day-header",
  slotLaneClass: "calendar-slot",
  slotHeaderFormat: timeFormat,
  eventDisplay: "block",
  eventTimeFormat: timeFormat,
  displayEventEnd: true,
  nextDayThreshold: "00:00:00",
  eventMinHeight: 30,
  eventInteractive: true,
  selectable: props.canCreate && !props.busy,
  selectMinDistance: 6,
  selectAllow: (info) => !info.allDay,
  dateClick: createFromDate,
  select: createFromSelection,
  eventClick: openEvent,
  events: props.todos.map(toCalendarEvent),
}));
</script>

<template>
  <section class="todo-calendar" aria-label="Kalendár úloh">
    <div class="calendar-toolbar">
      <h3 aria-live="polite">{{ calendar.view?.title }}</h3>
      <div class="calendar-controls" role="group" aria-label="Obdobie kalendára">
        <button type="button" @click="calendar.prev()">Predošlé</button>
        <button type="button" @click="calendar.today()">Dnes</button>
        <button type="button" @click="calendar.next()">Nasledujúce</button>
      </div>
      <div class="calendar-controls" role="group" aria-label="Pohľad kalendára">
        <button
          v-for="view in views"
          :key="view.name"
          type="button"
          :aria-pressed="calendar.view?.type === view.name"
          @click="calendar.changeView(view.name)"
        >
          {{ view.label }}
        </button>
      </div>
    </div>

    <FullCalendar :options="calendarOptions">
      <template #eventContent="info">
        <span class="calendar-event" :title="info.event.title">
          <span class="calendar-event-label">
            <span
              role="img"
              :aria-label="info.event.extendedProps.finished ? 'Dokončená' : 'Nedokončená'"
            >{{ info.event.extendedProps.finished ? "✓ " : "" }}</span>
            <strong class="calendar-event-title">{{ info.event.title }}</strong>
          </span>
          <span class="calendar-event-time">{{ eventTime(info) }}</span>
        </span>
      </template>
    </FullCalendar>
  </section>
</template>

<style scoped>
.todo-calendar {
  min-width: 0;
}

.calendar-toolbar,
.calendar-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.calendar-toolbar {
  gap: 0.65rem;
  margin-bottom: 0.75rem;
}

.calendar-toolbar h3 {
  flex: 1 0 100%;
  margin: 0;
  overflow-wrap: anywhere;
}

.calendar-controls button {
  padding-inline: 0.55rem;
}

.calendar-controls button[aria-pressed="true"] {
  background: #1d4ed8;
  color: white;
}

.calendar-event {
  display: flex;
  gap: 0.25rem;
  min-width: 0;
  white-space: nowrap;
}

.calendar-event-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.calendar-event-time {
  flex-shrink: 0;
}

@media (max-width: 540px) {
  .todo-calendar :deep(.calendar-day-header),
  .calendar-event {
    font-size: 0.75rem;
  }

  .todo-calendar :deep(.calendar-day-header) {
    overflow-wrap: anywhere;
  }

  .calendar-event {
    display: block;
    line-height: 1.1;
  }

  .calendar-event-label,
  .calendar-event-time {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .calendar-event-time {
    font-size: 0.67rem;
  }
}
</style>
