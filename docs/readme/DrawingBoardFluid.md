### Drawing Board Fluid

This component contains the actual canvas upon which all d3 elements should be drawn

```js static
<template>
    <drawing-board-fluid
        class="aa-graph-canvas"
        id="canvas-382d3"
        bgcolor="rgba(212, 114, 140, 0.03)"
        @on-canvas-click="onCanvasClick"
        @on-canvas-ready="onCanvasReady"
        >
    </drawing-board-fluid>
<template>
<script>
import DrawingBoardFluid from "@/components/commons/DrawingBoardFluid.vue";
export default{
    methods:{
        onCanvasReady(dimension) {
            const canvasHeight = dimension.height;
            const canvasWidth = dimension.width;
            console.log(`Canvas width ${canvasWidth}. Canvas height: ${canvasHeight}`);
        },
        onCanvasClick(coord){
            console.log(`User clicked on the coordinate (${coord.x}, ${coord.y})`);
        })
    },
     components: {
        "drawing-board-fluid": DrawingBoardFluid,
    }
}
</script>
<style scoped>
</style>
```
