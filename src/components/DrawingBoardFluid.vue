<template>
    <svg
        class="aa-drawing-board"
        @click="onCanvasClick"
        :style="{ width: '100%', height: '100%', 'background-color': bgcolor}"
    >
        <defs>
            <marker
                id="arrow-head"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
            >
                <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
            <defs>
                <marker id="circle" markerWidth="8" markerHeight="8" refX="4" refY="4">
                    <circle cx="4" cy="4" r="4" stroke="none" fill="#f00" />
                </marker>
            </defs>
        </defs>
    </svg>
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
    methods: {
        onCanvasClick(event) {
            this.$emit("on-canvas-click", {
                x: event.offsetX,
                y: event.offsetY
            });
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
