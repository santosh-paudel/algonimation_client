<template>
	<svg
		class="aa-drawing-board"
		@click="onCanvasClick"
		:style="{ width: '100%', height: '100%', 'background-color': bgcolor }"
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
				<marker
					id="circle"
					markerWidth="8"
					markerHeight="8"
					refX="4"
					refY="4"
				>
					<circle cx="4" cy="4" r="4" stroke="none" fill="#f00" />
				</marker>
			</defs>
		</defs>
	</svg>
</template>
<script>
/**
 * @example ../../../docs/readme/DrawingBoardFluid.md
 */
export default {
	name: "DrawingBoardFluid",
	props: {
		/**
		 * Background color of of this drawing board
		 */
		bgcolor: {
			type: String,
			default: "#FFFFFF",
		},
	},

	methods: {
		/**
		 * This method is called when a user clicks on the canvas.
		 * @param {Event} [Click Event](https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event)
		 * @public
		 */
		onCanvasClick(event) {
			/**
			 * This event is emitted when the user click on the canavas (with class aa-drawing-board).
			 * The emitted event contains information about the coordinate of the mouse pointer (on the screen) at the time click
			 * @event on-canvas-click
			 * @type {object} An object that describes the coordinates on screen where the user clicked
			 * @property {number} x The x-coordinate of the mouse pointer at the time of the click
			 * @property {number} y The y-cvalueoorindate of the mouse pointer at the time of the click
			 */
			this.$emit("on-canvas-click", {
				x: event.offsetX,
				y: event.offsetY,
			});
		},
	},
	mounted() {
		const canvas = document.getElementsByClassName("aa-drawing-board")[0];

		/**
		 * This event is emitted when the canvas is rendered to the screen and ready to use.
		 * Users may optionally listen to this event before beginning to draw on the canvas.
		 * The emitted event contains the set width and height information of the canvas
		 * @event on-canvas-ready
		 * @type {object} An object that describes the height and width of the canvas element
		 * @property {number} height Height of the canvas element
		 * @property {number} width Width of the canvas element
		 */
		this.$emit("on-canvas-ready", {
			height: canvas.clientHeight,
			width: canvas.clientWidth,
		});
	},
};
</script>
<style scoped></style>
