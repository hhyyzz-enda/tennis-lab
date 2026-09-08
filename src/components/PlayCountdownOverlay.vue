<template>
  <Transition name="countdown-fade">
    <div v-if="visible" class="countdown-overlay" role="status" aria-live="assertive">
      <div class="countdown-ring">
        <span class="countdown-number">{{ count }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  count: {
    type: Number,
    default: 3
  }
})
</script>

<style scoped>
.countdown-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  background: rgba(16, 16, 16, 0.48);
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(7px);
}

.countdown-ring {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 1px solid rgba(245, 245, 242, 0.38);
  background: rgba(16, 16, 16, 0.7);
  box-shadow:
    0 16px 34px rgba(0, 0, 0, 0.32),
    inset 0 1px 0 rgba(245, 245, 242, 0.16);
  display: grid;
  place-items: center;
}

.countdown-number {
  color: #f5f5f2;
  font-size: 64px;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1;
}

.countdown-fade-enter-active,
.countdown-fade-leave-active {
  transition: opacity 0.22s ease;
}

.countdown-fade-enter-from,
.countdown-fade-leave-to {
  opacity: 0;
}
</style>
