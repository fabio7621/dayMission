<script setup>
import { ref, onMounted, nextTick } from 'vue'
import Sortable from 'sortablejs'
import { HOURS } from './constants.js'
import { useSlots } from './composables/useSlots.js'
import { useResize } from './composables/useResize.js'
import AppHeader from './components/AppHeader.vue'
import ScheduleRow from './components/ScheduleRow.vue'

const {
  slots,
  visibleRows,
  editingId,
  editValue,
  taskCount,
  doneCount,
  donePercent,
  today,
  onCellClick,
  startEdit,
  saveEdit,
  cancelEdit,
  toggleDone,
  deleteTask,
  commitResize,
} = useSlots()

const { startResize } = useResize(slots, commitResize)

const scheduleEl = ref(null)

onMounted(() => {
  nextTick(() => {
    Sortable.create(scheduleEl.value, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',

      onEnd({ oldIndex, newIndex }) {
        if (oldIndex === newIndex) return

        const visible = visibleRows.value
        const movedId = visible[oldIndex]?.id
        const targetId = visible[newIndex]?.id
        if (movedId == null || targetId == null) return

        const arr = [...slots.value]
        const fromIdx = arr.findIndex((s) => s.id === movedId)
        const toIdx = arr.findIndex((s) => s.id === targetId)
        if (fromIdx < 0 || toIdx < 0) return

        const movedSlot = arr[fromIdx]
        const dur = movedSlot.task?.duration ?? 1
        const removed = arr.splice(fromIdx, dur)

        const newToIdx = arr.findIndex((s) => s.id === targetId)
        const insertAt =
          newToIdx < 0 ? arr.length : fromIdx < toIdx ? newToIdx + 1 : newToIdx
        arr.splice(insertAt, 0, ...removed)

        arr.forEach((s, i) => {
          s.startHour = HOURS[i]
        })

        slots.value = arr
      },
    })
  })
})
</script>

<template>
  <AppHeader
    :today="today"
    :done-count="doneCount"
    :task-count="taskCount"
    :done-percent="donePercent"
  />

  <div class="boot-line">
    &gt; CLICK SLOT TO ADD · DRAG ⠿ TO REORDER · DRAG BOTTOM EDGE TO EXTEND
  </div>

  <div class="main">
    <div class="schedule" ref="scheduleEl">
      <ScheduleRow
        v-for="row in visibleRows"
        :key="row.id"
        :row="row"
        :editing-id="editingId"
        :edit-value="editValue"
        @update:edit-value="editValue = $event"
        @cell-click="onCellClick"
        @toggle-done="toggleDone"
        @start-edit="startEdit"
        @save-edit="saveEdit"
        @cancel-edit="cancelEdit"
        @delete-task="deleteTask"
        @start-resize="startResize"
      />
    </div>
  </div>
</template>
