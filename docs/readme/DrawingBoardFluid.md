### Drawing Board Fluid

All components that draw a shape to the browser window should import this component and use the SVG element defined here as the container
of such drawings. This component also contains the definition of all markers, such as arrowhead. The parent component can optionally listen to **on-canvas-ready** or **on-canvas-click** events which are fired when this component is mounted and when the user clicks on the component, respectively.

![](docs/readme/resources/DrawingBoardFluid.png)

Usage Example:

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
