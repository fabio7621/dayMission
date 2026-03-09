import { SLOT_H } from '../constants.js'

export function useResize(slots) {
  let rsSlot = null
  let rsStartY = 0
  let rsStartDur = 1

  function onResize(e) {
    if (!rsSlot?.task) return
    if (e.cancelable) e.preventDefault()
    const y = e.touches ? e.touches[0].clientY : e.clientY
    const delta = Math.round((y - rsStartY) / SLOT_H)
    const idx = slots.value.findIndex((s) => s.id === rsSlot.id)
    const maxDur = slots.value.length - idx
    rsSlot.task.duration = Math.max(1, Math.min(maxDur, rsStartDur + delta))
  }

  function stopResize() {
    rsSlot = null
    window.removeEventListener('mousemove', onResize)
    window.removeEventListener('mouseup', stopResize)
    window.removeEventListener('touchmove', onResize)
    window.removeEventListener('touchend', stopResize)
  }

  function startResize(e, row) {
    rsSlot = slots.value.find((s) => s.id === row.id)
    rsStartY = e.touches ? e.touches[0].clientY : e.clientY
    rsStartDur = rsSlot?.task?.duration ?? 1
    window.addEventListener('mousemove', onResize)
    window.addEventListener('mouseup', stopResize)
    window.addEventListener('touchmove', onResize, { passive: false })
    window.addEventListener('touchend', stopResize)
  }

  return { startResize }
}
