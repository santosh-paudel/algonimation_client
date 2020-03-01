<template>
	<div id="aa-bst-canvas">
		<svg :height="initialHeight" :width="initialWidth" />
	</div>
</template>
<script>
export default {
	name: "DrawingBoard",
	props: {
		initialWidth: Number,
		initialHeight: Number
	}
};
</script>
<style scoped></style>
