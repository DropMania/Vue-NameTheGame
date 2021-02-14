<template>
<div class="content">
    <div class="container">
        <GameViewer /> 
    </div>
</div>
</template> <script setup>
import GameViewer from '../components/GameViewer.vue'

</script>
<style scoped>
    .content{
    background-image: url(../assets/background.png);
    background-repeat: no-repeat;
    background-size: cover;
    height: 100%;
} 
</style>