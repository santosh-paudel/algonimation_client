<template>
	<div class="aa-container container-fluid pl-0 pr-0">
		<b-row class="aa-config-row">
			<b-col sm="2">
				<b-row class="container mt-4 ml-4">
					<b-col sm="6" class="pr-sm-0">
						<b-form-input
							id="aa-new-number"
							placeholder="E.g. 5"
							type="number"
							:state="insertError ? false : null"
							v-model="newNumber"
						></b-form-input>
					</b-col>
					<b-col sm="6" class="pl-sm-0">
						<b-button squared variant="outline-info" @click="insert"
							>Insert</b-button
						>
					</b-col>
				</b-row>
			</b-col>
		</b-row>

		<div id="aa-bst-canvas"></div>
	</div>
</template>

<script>
/* eslint-disable no-debugger */
/* eslint-disable no-unused-vars */
import * as d3 from "d3";
export default {
	name: "BinarySearchTree2",
	data: function() {
		return {
			newNumber: "", //Default number,
			insertError: false, //true if the user entered wrong input

			/********** D3 variables */
			svg: null,

			//********* Configurations */
			canvasWidth: 600,
			canvasHeight: 600,
			fontSize: "20px",
			nodeFillColor: "#FFFFFF",
			nodeRadius: 30,
			nodeStrokeColorDefault: "#eff0f1",
			nodeStrokeColorHilighted: "#AB2E23",
			nodeFontColorDefault: "#eff0f1",
			nodeFontColorHilighted: "#AB2E23",
			nodeStrokeWidth: "2px",
			rootOffsetX: 50,
			rootOffsetY: 50
		};
	},
	methods: {
		/**
		 * This method initializes the SVG element where the tree will be drawn.
		 * It uses the configurations defined in data property to assign attributes
		 * the the SVG container
		 */
		init: function() {
			this.svg = d3
				.select("#aa-bst-canvas")
				.append("svg")
				.attr("height", this.canvasWidth)
				.attr("width", this.canvasHeight);
		},

		/**
		 * This method builds a node with the given text (passed as parameter).
		 */
		buildNode: function(text) {
			const group = this.svg.append("g");
			const circle = group
				.append("circle")
				.attr("cx", this.rootOffsetX)
				.attr("cy", this.rootOffsetY)
				.attr("r", this.nodeRadius)
				.attr("stroke", this.nodeStrokeColorHilighted)
				.attr("stroke-width", "2px")
				.attr("fill", this.nodeFillColor);

			//Build a svp group element which will hold the circle
			//and the text inside the circle
			group
				.append("text")
				.text(text.toString())
				.attr("text-anchor", "middle")
				.attr("font-size", this.fontSize)
				.attr("fill", this.nodeFontColorHilighted)
				.attr(
					"transform",
					`translate(${this.rootOffsetX}, ${this.rootOffsetY + 7})`
				);

			setTimeout(function() {
				group
					.transition()
					.attr("transform", "translate(500,0)")
					.duration(2000);
			}, 1000);
		},
		insert: function() {
			if (this.newNumber === "") {
				this.insertError = true;
				return;
			}

			this.buildNode(this.newNumber);

			this.newNumber = "";
			this.insertError = false;
		}
	},
	mounted: function() {
		this.init();
	}
};
</script>
<style scoped>
/* #aa-bst-canvas {
} */

.aa-bst-svg {
}

.aa-container {
	width: 100%;
}

.aa-config-row {
	height: 100px;
	border-bottom: 1px solid #f14a60;
}
</style>
