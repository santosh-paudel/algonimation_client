<!--Notes to myself:
1. Do not call d3.hierarchy in update function. It is expensive. Instead add data to hierarchy the moment a new number is entered. And,
    make data[] a hieararchical data in data function
2. -->
<template>
	<div class="container-fluid h-100 pb-sm-3">
		<div class="row justify-content-center h-100">
			<div class="col-lg-9 col-md-8 col-sm-7 hidden-md-down" id="yellow">
				<div id="aa-bst-canvas">
					<!-- <svg :height="canvasHeight" :width="canvasWidth" /> -->
					<drawing-board
						:initialHeight="canvasHeight"
						:initialWidth="canvasWidth"
					></drawing-board>
				</div>
			</div>

			<div class="col-lg-3 col-md-4 col-sm-5 aa-config-col">
				<p class="mt-2">Control Panel</p>
				<b-row class="mt-2">
					<hr-with-text
						text="Animation Speed"
						class="col-sm-12"
					></hr-with-text>
				</b-row>
				<range-input
					@on-value-change="changeAnimationSpeed"
				></range-input>
				<b-row>
					<hr-with-text
						text="Insert"
						class="col-sm-12"
					></hr-with-text>
				</b-row>
				<user-input-box
					inputType="integer"
					buttonLabel="Insert"
					:disableInput="disableUserInteraction"
					@on-user-input="userAction($event, 'insert')"
				></user-input-box>
				<b-row>
					<hr-with-text
						text="Delete"
						class="col-sm-12 mt-2"
					></hr-with-text>
				</b-row>
				<user-input-box
					inputType="integer"
					buttonLabel="Delete"
					:disableInput="disableUserInteraction"
					@on-user-input="userAction($event, 'delete')"
				></user-input-box>
				<b-row>
					<hr-with-text
						text="Visit"
						class="col-sm-12 mt-2"
					></hr-with-text>
				</b-row>
				<user-input-box
					inputType="integer"
					buttonLabel="Visit"
					:disableInput="disableUserInteraction"
					@on-user-input="userAction($event, 'visit')"
				></user-input-box>
			</div>
		</div>
	</div>
</template>
<script>
import * as d3 from "d3";
import { BstD3Wrapper } from "@/model/bstD3Wrapper.js";
import { GraphCanvasUtil } from "../util/GraphCanvasUtil";
import DrawingBoard from "@/components/DrawingBoard.vue";
import HRWithText from "@/components/HRWithText.vue";
import UserInputBox from "@/components/UserInputBox.vue";
import RangeInput from "../components/RangeInput";
const uuidv4 = require("uuid/v4");
export default {
	name: "BinarySearchTree5",
	data: function() {
		return {
			//********* Configurations */

			fontSize: "20px",
			nodeFillColor: "#FFFFFF",
			nodeRadius: 30,
			nodeStrokeColorDefault: "#262626",
			nodeFontColorDefault: "#262626",
			nodeFontColorHilighted: "#AB0505",
			nodeStrokeWidth: 2, //2px
			rootOffsetX: 0,
			rootOffsetY: 0,
			linkLength: 180,

			animationTimePrimary: 800,
			animationTime800: 600,
			animationTime600: 400,

			// initial width of the tree. After each subsequent insert and deletes, this should
			// increase or decrease by widthIncrement value declared below
			canvasWidth: 600,

			// initial width of the tree. After each subsequent insert and deletes, this should
			// increase or decrease by heightIncrement value declared below
			canvasHeight: 1000,
			nodeStrokeColorHilighted: "#AB0505",
			orange: "#F45D27",

			//All the non reactive properties are defined in the created() lifecycle hook

			disableUserInteraction: false
		};
	},
	computed: {
		/**
		 * This method returns the value by which the height of the canvas should increase if the node
		 * start overflowing towards the bottom.
		 */
		canvasHeightIncrement() {
			return this.linkLength + this.nodeStrokeWidth;
		}
	},
	methods: {
		async userAction(userInput, actionName) {
			this.disableUserInteraction = true;
			switch (actionName) {
				case "insert":
					await this.insertNode(userInput);
					break;
				case "delete":
					await this.deleteNode(userInput);
					break;
				case "visit":
					await this.visitNode(userInput);
					break;
			}

			this.disableUserInteraction = false;
		},

		changeAnimationSpeed(scale) {
			this.animationTimePrimary = 2000 * scale;
			this.animationTime800 = 1600 * scale;
			this.animationTime600 = 1200 * scale;
			console.log(
				`animationTimePrimary changed to ${this.animationTimePrimary} by scale ${scale}`
			);
		},

		/**
		 * This method initializes the SVG element where the tree will be drawn.
		 * It uses the configurations defined in data property to assign attributes
		 * the the SVG container
		 */
		init: function() {
			this.svg = d3.select("svg");

			//Create the group that contain the tree. Add a margin to the left
			//and to the top by translating the group 50 pixelx to the right and pixels down
			this.graph = this.svg
				.append("g")
				.attr("class", "aa-graph")
				.attr("transform", "translate(50, 50)");

			//create a tree generator and specify the size of the digram
		},

		insertNode: async function(inputInt) {
			let nodeId = `node-${uuidv4()}`;

			// await this.insertNodeToTree(this.insertInput);
			let node = this.bstD3Wrapper.insert(inputInt, nodeId);

			//Draw a temporary placeholder node
			// Note: the class should not be ".node" because otherwise existing node will
			// be updated
			await this.drawNodes(node, "node", false);

			if (this.bstD3Wrapper.height() > 1) {
				let ancestors = this.bstD3Wrapper.getPathToParentById(
					node.data.id
				);
				const ringId = "aa-selection-ring";
				await GraphCanvasUtil.traverseCircularNodes(
					ancestors,
					this.graph,
					false,
					ringId,
					this.nodeStrokeColorHilighted,
					this.animationTime800
				);

				await this.drawNodes(node, "node", true);
				await this.drawLinks(node.parent, "link", false);
				await GraphCanvasUtil.moveCircularNodeById(
					ringId,
					node.x,
					node.y,
					this.animationTime800
				);
				GraphCanvasUtil.removeElementById(
					ringId,
					this.animationTime600
				);
			}

			this.drawTree();

			this.insertInput = "";
			this.insertError = false;
		},

		deleteNode: async function(inputInt) {
			let nodes = this.bstD3Wrapper.getPathToNodeByKey(inputInt);

			// If there are no nodes in the path to the node that should be removed
			// no further action can be performed
			if (nodes.length === 0) return;

			// Traverse to the node to be removed so the user can see the visual
			// traversal
			// await this.traverse(
			//     nodes,
			//     true,
			//     "aa-selection-ring",
			//     this.nodeStrokeColorHilighted
			// );

			const removalNodeSelectionRingId = "aa-selection-ring";

			await GraphCanvasUtil.traverseCircularNodes(
				nodes,
				this.graph,
				false,
				removalNodeSelectionRingId,
				this.nodeStrokeColorHilighted,
				this.animationTime800
			);

			//Create a clone of the removal
			let removalNode = nodes[nodes.length - 1];

			let successorPath = this.bstD3Wrapper.deleteNode(removalNode);

			if (successorPath !== null) {
				// let successorPath = removalNode.path(successorNode);
				let successorNode = successorPath[successorPath.length - 1];

				await GraphCanvasUtil.traverseCircularNodes(
					successorPath,
					this.graph,
					true,
					"successor-path-ring",
					this.orange,
					this.animationTime800
				);

				// Remove the link that connect the successor node to it's parent
				await GraphCanvasUtil.removeElementById(
					this.getLinkId(successorNode),
					this.animationTime600
				);

				await GraphCanvasUtil.translateNode(
					successorNode.data.id,
					removalNode.x,
					removalNode.y,
					this.animationTime800
				);
			}

			//Remove the selection ring surrounding the removal node
			await GraphCanvasUtil.removeElementById(
				removalNodeSelectionRingId,
				0
			);

			// Now remove the removalNode from DOM. Note, this does not
			// actually remove the node from the tree.
			await GraphCanvasUtil.removeElementById(
				removalNode.data.id,
				this.animationTime800
			);

			this.drawTree();
		},

		visitNode: async function(inputInt) {
			let nodes = this.bstD3Wrapper.getPathToNodeByKey(inputInt);
			await GraphCanvasUtil.traverseCircularNodes(
				nodes,
				this.graph,
				true,
				"traversal-node",
				this.nodeStrokeColorHilighted,
				this.animationTime800
			);
		},

		drawTree: async function() {
			let bstD3Tree = this.bstD3Wrapper.tree(true);

			if (bstD3Tree === null) return;

			this.drawNodes(bstD3Tree, "node", true, true);
			this.drawLinks(bstD3Tree, "link", true);
		},
		/**
		 * Draws nodes using the specified cssSelectionClass string. A node
		 * is a group that contains a circle and a text inside the circle. The text
		 * represents the key of the node.
		 *
		 * @param node Object - A Node object as represented in d3 tree hierarchy. This can be a root/parent node (in which case
		 * all the descendant nodes are also drawn). This can also be a single node, in which case the single node is drawn
		 * @param cssSelectionClass String - CSS class that should be used to select the existing
		 *      node to update. Note: All the existing nodes are updated before binding a new node
		 * @param translate Boolean - All the nodex of x and y value, which represent where the nodes should end up in the screen. If true,
		 * the node will be translated to that x and y position
		 * */
		async drawNodes(
			node,
			cssSelectionClass,
			translate,
			removeExitNode = false
		) {
			let vm = this;

			// this.graph.select(".node").remove();
			let nodes = node.descendants();
			let updateNodes = vm.graph
				.selectAll(`.${cssSelectionClass}`)
				.data(nodes, node => node.data.id);

			const enterNode = updateNodes
				.enter()
				.append("g")
				.attr("id", d => {
					return d.data.id;
				})
				.attr("class", cssSelectionClass);

			if (cssSelectionClass != "node") {
				enterNode.attr("class", "node");
			}

			if (removeExitNode) {
				updateNodes.exit().remove();
			}

			enterNode
				.append("circle")
				.attr("r", vm.nodeRadius)
				.attr("stroke", vm.nodeStrokeColorDefault)
				.attr("stroke-width", `${vm.nodeStrokeWidth}px`)
				.attr("fill", vm.nodeFillColor);

			//append text
			enterNode
				.append("text")
				.attr("text-anchor", "middle")
				.attr("font-size", vm.fontSize)
				.attr("fill", vm.nodeFontColorDefault)
				.attr("transform", `translate(0, 7)`)
				.text(d => d.data.key);

			if (translate) {
				await enterNode
					.merge(updateNodes)
					.transition()
					.duration(vm.animationTimePrimary)
					.attr("transform", function(d) {
						return `translate(${d.x},${d.y})`;
					})
					.end();
			}
		},
		/**
		 * This method draws a links between each descendant node of the given node in the parameter and it's parent.
		 * For example, if the given node is Node(5) which has a left child Node(4), and Node(4) has a left child Node(3), a link is
		 * drawn between Node(5) and Node(4), another between Node(4) and Node(3)
		 *
		 * @param node Object - The parent node from where the links should be drawn
		 * @cssSelectionClass String - css class that should be used to query the existing link to update. This class
		 * is also assigned to all the new links that are drawn
		 */
		async drawLinks(node, cssSelectionClass, removeExitLinks) {
			let vm = this;
			let links = node.descendants().slice(1);
			const updateLinks = vm.graph
				.selectAll(`.${cssSelectionClass}`)
				.data(links, node => node.data.id);

			let enterLinks = updateLinks
				.enter()
				.append("line")
				.attr("id", function(node) {
					return vm.getLinkId(node);
				})
				.attr("class", cssSelectionClass)
				.attr("fill", "none")
				.attr("stroke", "#aaa")
				.attr("stroke-color", vm.nodeStrokeColorDefault)
				.attr("x1", d => {
					return d.parent.x;
				})
				.attr("y1", d => {
					return d.parent.y;
				})
				.attr("x2", function(d) {
					return d.parent.x;
				})
				.attr("y2", d => {
					return d.parent.y;
				});

			//Remove any links from the DOM which could not be bound to a datum
			if (removeExitLinks) {
				updateLinks.exit().remove();
			}

			// Before the animation, lower the links
			// to appear behind the circle
			enterLinks.lower();

			await enterLinks
				.merge(updateLinks)
				.transition()
				.duration(this.animationTime800)
				.attr("x1", d => {
					return d.parent.x;
				})
				.attr("y1", d => {
					return d.parent.y;
				})
				.attr("x2", function(d) {
					return d.x;
				})
				.attr("y2", d => {
					return d.y - vm.nodeRadius;
				})
				.end();
		},
		getLinkId: function(node) {
			return `link-${node.data.id}`;
		},

		initCanvasHeight() {
			this.canvasHeight =
				window.top.innerHeight -
				document.getElementById("aa-bst-canvas").getBoundingClientRect()
					.y -
				10;
		}
	},
	mounted: function() {
		this.initCanvasHeight();
		this.init();

		let treeWidth = this.canvasWidth - this.padding - this.nodeRadius - 2; //2 is for stroke width
		let treeHeight =
			this.canvasHeight -
			this.padding -
			this.nodeRadius * 2 -
			2 -
			this.canvasHeightIncrement; //2 is for stroke height

		this.bstD3Wrapper = new BstD3Wrapper(treeWidth, treeHeight);

		//Keeps track of the height of the tree. It will be useful
		//to decide whether the tree should be resized in the next
		//draw
		this.treeDepth = 0;
	},
	created: function() {
		// This is the group element (<g>) that contains the the tree
		this.graph = undefined;

		this.padding = 50; // padding between the svg element and the first group element

		// this.$gtag.event("login", { method: "Google" });
	},
	components: {
		"hr-with-text": HRWithText,
		"user-input-box": UserInputBox,
		"range-input": RangeInput,
		"drawing-board": DrawingBoard
	}
};
</script>
<style scoped>
.aa-container {
	width: 100%;
	height: 100%;
	padding: 1%;
}

/* .aa-config-row {
    height: 100px;
    border-bottom: 1px solid #f14a60;
} */

.aa-config-col {
	border-left: 1px solid #f14a60;
}

hr {
	border: 0;
	clear: both;
	display: block;
	width: 96%;
	background-color: #ffff00;
	background-color: gray;
	height: 1px;
}
</style>
