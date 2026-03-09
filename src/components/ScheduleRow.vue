<script setup>
import { SLOT_H } from '../constants.js'

const props = defineProps({
  row: Object,
  editingId: Number,
  editValue: String,
})

const emit = defineEmits([
  'update:editValue',
  'cell-click',
  'toggle-done',
  'start-edit',
  'save-edit',
  'cancel-edit',
  'delete-task',
  'start-resize',
])

function formatHour(h) {
  return String(h).padStart(2, '0') + ':00'
}
</script>

<template>
  <div
    class="row"
    :data-id="row.id"
    :style="{ minHeight: SLOT_H * row.displayDuration + 'px' }"
  >
    <!-- 時間格 -->
    <div class="time-cell">{{ formatHour(row.startHour) }}</div>

    <!-- 任務格 -->
    <div class="task-cell-wrap">
      <div
        class="task-cell"
        :class="{ 'has-task': row.task }"
        @click="emit('cell-click', row)"
      >
        <template v-if="row.task">
          <div class="drag-handle" @click.stop>⠿</div>

          <div
            class="task-check"
            :class="{ checked: row.task.done }"
            @click.stop="emit('toggle-done', row)"
          >
            {{ row.task.done ? '✓' : '' }}
          </div>

          <template v-if="editingId === row.id">
            <input
              class="task-input"
              :value="editValue"
              @input="emit('update:editValue', $event.target.value)"
              @keyup.enter="emit('save-edit', row)"
              @keyup.esc="emit('cancel-edit', row)"
              @click.stop
              :ref="(el) => { if (el) el.focus() }"
            />
          </template>
          <template v-else>
            <div class="task-name" :class="{ done: row.task.done }">
              {{ row.task.name }}
            </div>
          </template>

          <div class="duration-badge" v-if="row.task.duration > 1">
            {{ row.task.duration }}H
          </div>

          <div class="task-actions" @click.stop>
            <template v-if="editingId === row.id">
              <button class="btn-icon" @click="emit('save-edit', row)">OK</button>
              <button class="btn-icon" @click="emit('cancel-edit', row)">✕</button>
            </template>
            <template v-else>
              <button class="btn-icon" @click="emit('start-edit', row)">ED</button>
              <button class="btn-icon del" @click="emit('delete-task', row)">RM</button>
            </template>
          </div>
        </template>

        <template v-else>
          <span class="empty-prompt">+ ADD TASK</span>
        </template>
      </div>

      <!-- 拉伸把手 -->
      <div
        v-if="row.task"
        class="resize-handle"
        @mousedown.stop="emit('start-resize', $event, row)"
        @touchstart.stop.prevent="emit('start-resize', $event, row)"
      ></div>
    </div>
  </div>
</template>
