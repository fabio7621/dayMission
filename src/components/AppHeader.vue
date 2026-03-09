<script setup>
defineProps({
  today: String,
  doneCount: Number,
  taskCount: Number,
  donePercent: Number,
})
</script>

<template>
  <div class="header">
    <div class="header-top">
      <div>
        <div class="sys-label">// DAILY_TASK<span class="cursor"></span></div>
        <div class="sys-sub">SINGLE-DAY SCHEDULER v3.0</div>
      </div>
      <div class="date-display">
        <div>{{ today }}</div>
        <div class="date-sub">{{ doneCount }}/{{ taskCount }} DONE</div>
      </div>
    </div>
    <div class="progress-bar-wrap">
      <div class="progress-bar-fill" :style="{ width: donePercent + '%' }"></div>
    </div>
    <div class="progress-label">{{ donePercent }}% COMPLETE</div>
  </div>
</template>
