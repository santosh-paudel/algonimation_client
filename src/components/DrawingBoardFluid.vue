<template>
    <svg
        class="aa-drawing-board"
        :style="{ width: '100%', height: '100%', 'background-color': bgcolor}"
    />
</template>
<script>
export default {
    name: "DrawingBoardFluid",
    props: {
        bgcolor: {
            type: String,
            value: "#FFFFFF"
        }
    },
    mounted() {
        const canvas = document.getElementsByClassName("aa-drawing-board")[0];
        this.$emit("on-canvas-ready", {
            height: canvas.clientHeight,
            width: canvas.clientWidth
        });
    }
};
</script>
<style scoped></style>
