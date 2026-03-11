import { ref, computed, watch } from 'vue'
import { HOURS } from '../constants.js'

let uid = 0

const STORAGE_KEY = 'dayMission_slots'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const { date, slots } = JSON.parse(raw)
    if (date !== todayStr()) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return slots
  } catch {
    return null
  }
}

function initSlots() {
  const saved = loadFromStorage()
  if (saved) {
    // restore uid counter above the max saved id
    const maxId = saved.reduce((m, s) => Math.max(m, s.id), -1)
    uid = maxId + 1
    return saved
  }
  return HOURS.map((h) => ({ id: uid++, startHour: h, task: null }))
}

export function useSlots() {
  const slots = ref(initSlots())

  const editingId = ref(null)
  const editValue = ref('')

  watch(slots, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayStr(), slots: val }))
  }, { deep: true })

  // ── Computed ──

  const visibleRows = computed(() => {
    const result = []
    let skipCount = 0
    for (let i = 0; i < slots.value.length; i++) {
      const slot = slots.value[i]
      if (skipCount > 0) {
        skipCount--
        continue
      }
      const dur = slot.task?.duration ?? 1
      result.push({ ...slot, displayDuration: dur })
      if (dur > 1) skipCount = dur - 1
    }
    return result
  })

  const taskCount = computed(() => slots.value.filter((s) => s.task).length)
  const doneCount = computed(() => slots.value.filter((s) => s.task?.done).length)
  const donePercent = computed(() =>
    taskCount.value ? Math.round((doneCount.value / taskCount.value) * 100) : 0,
  )
  const today = computed(() => {
    const d = new Date()
    return d
      .toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit', weekday: 'short' })
      .replace(/\//g, '-')
      .toUpperCase()
  })

  // ── Task CRUD ──

  function onCellClick(row) {
    if (row.task) return
    // 若有正在編輯的 slot，先 save 或 cancel
    if (editingId.value !== null) {
      const prev = slots.value.find((s) => s.id === editingId.value)
      if (prev?.task) {
        if (editValue.value.trim()) {
          prev.task = { ...prev.task, name: editValue.value.trim() }
        } else {
          prev.task = null
        }
      }
      editingId.value = null
    }
    const slot = slots.value.find((s) => s.id === row.id)
    if (!slot) return
    slot.task = { name: '', done: false, duration: 1 }
    editingId.value = slot.id
    editValue.value = ''
  }

  function startEdit(row) {
    editingId.value = row.id
    editValue.value = row.task.name
  }

  function saveEdit(row) {
    const slot = slots.value.find((s) => s.id === row.id)
    if (!slot) return
    if (editValue.value.trim()) {
      slot.task = { ...slot.task, name: editValue.value.trim() }
    } else {
      slot.task = null
    }
    editingId.value = null
  }

  function cancelEdit(row) {
    const slot = slots.value.find((s) => s.id === row.id)
    if (slot?.task && !slot.task.name) slot.task = null
    editingId.value = null
  }

  function toggleDone(row) {
    const slot = slots.value.find((s) => s.id === row.id)
    if (slot?.task) slot.task.done = !slot.task.done
  }

  function deleteTask(row) {
    const slot = slots.value.find((s) => s.id === row.id)
    if (!slot) return
    const dur = slot.task?.duration ?? 1
    slot.task = null
    // 刪除任務後，移除它佔用的空白 placeholder slots
    if (dur > 1) {
      const idx = slots.value.findIndex((s) => s.id === row.id)
      const arr = [...slots.value]
      let removed = 0
      while (removed < dur - 1 && arr[idx + 1]?.task === null) {
        arr.splice(idx + 1, 1)
        removed++
      }
      arr.forEach((s, i) => { s.startHour = HOURS[0] + i })
      slots.value = arr
    }
  }

  // resize 結束時呼叫：插入/移除空 slot 來推移後面的任務
  function commitResize(slotId, newDur, oldDur) {
    const diff = newDur - oldDur
    if (diff === 0) return
    const idx = slots.value.findIndex((s) => s.id === slotId)
    if (idx < 0) return

    const arr = [...slots.value]
    if (diff > 0) {
      // 拉長：在舊範圍末端插入空 slot，把後面任務往下推
      for (let i = 0; i < diff; i++) {
        arr.splice(idx + oldDur + i, 0, { id: uid++, startHour: 0, task: null })
      }
    } else {
      // 縮短：移除多出的空 placeholder slots
      let toRemove = -diff
      const removeAt = idx + newDur
      while (toRemove > 0 && arr[removeAt]?.task === null) {
        arr.splice(removeAt, 1)
        toRemove--
      }
    }
    arr.forEach((s, i) => { s.startHour = HOURS[0] + i })
    slots.value = arr
  }

  return {
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
  }
}
