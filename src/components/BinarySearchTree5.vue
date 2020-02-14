<!--Notes to myself:
1. Do not call d3.hierarchy in update function. It is expensive. Instead add data to hierarchy the moment a new number is entered. And,
    make data[] a hieararchical data in data function
2. -->
<template>
	<div class="aa-container container-fluid pl-0 pr-0">
		<b-row class="aa-config-row">
			<b-col sm="2">
				<b-row class="container mt-4 ml-4">
					<b-col sm="6" class="pr-sm-0">
						<b-form-input
							id="aa-new-number"
							placeholder="E.g. 5"
							:state="insertError ? false : null"
							v-model="newNumber"
						></b-form-input>
					</b-col>
					<b-col sm="6" class="text-left">
						<b-button squared variant="outline-info" @click="insert"
							>Insert</b-button
						>
					</b-col>
				</b-row>
			</b-col>
			<b-col sm="2">
				<b-row class="container mt-4 ml-4">
					<b-col sm="6" class="pr-sm-0">
						<b-form-input
							id="aa-remove-number"
							placeholder="E.g. 5"
							:state="removeError ? false : null"
							v-model="removeNumber"
						></b-form-input>
					</b-col>
					<b-col sm="6" class="text-left">
						<b-button
							squared
							variant="outline-danger"
							@click="remove"
							>Remove</b-button
						>
					</b-col>
				</b-row>
			</b-col>
		</b-row>

		<div id="aa-bst-canvas">
			<svg :height="canvasHeight" :width="canvasWidth" />
		</div>
	</div>
</template>
<script>
/* eslint-disable no-debugger */
/* eslint-disable no-unused-vars */
/* eslinst-disable no-unreachable */
import * as d3 from "d3";
import { BstD3Wrapper } from "@/model/bstD3Wrapper.js";
const uuidv4 = require("uuid/v4");
export default {
	name: "BinarySearchTree5",
	data: function() {
		return {
			//This will contain a number when a user enters a new number to add to the tree.
			//After adding to the tree, it should be set back to ""
			newNumber: "",

			//This will contain a number when a user enter a number that should be removed from
			//the tree. After the number is removed, it should be set back to ""
			removeNumber: "",

			//true if the user entered wrong input
			insertError: false,

			//This will be set to true if the user tries to remove a data that does not
			//exist in the tree
			removeError: false,

			//********* Configurations */

			fontSize: "20px",
			nodeFillColor: "#FFFFFF",
			nodeRadius: 30,
			nodeStrokeColorDefault: "#262626",
			nodeStrokeColorHilighted: "#AB0505",
			nodeFontColorDefault: "#262626",
			nodeFontColorHilighted: "#AB0505",
			nodeStrokeWidth: 2, //2px
			rootOffsetX: 0,
			rootOffsetY: 0,

			animationTimePrimary: 1000,
			animationTime800: 800,
			animationTime600: 600,
			animtionTime400: 400,
			animationTime200: 200

			//All the non reactive properties are defined in the created() lifecycle hook
		};
	},
	methods: {
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

		insert: async function() {
			if (this.newNumber === "") {
				this.insertError = true;
				return;
			}
			this.newNumber = parseInt(this.newNumber);
			let nodeId = `node-${uuidv4()}`;

			// await this.insertNodeToTree(this.newNumber);
			let node = this.bstD3Wrapper.insert(this.newNumber, nodeId);

			//Draw a temporary placeholder node
			// Note: the class should not be ".node" because otherwise existing node will
			// be updated
			await this.drawNodes(node, "node", false);

			if (this.bstD3Wrapper.height() > 1) {
				let ancestors = this.bstD3Wrapper.getPathToParent(node.data.id);
				await this.traverse(ancestors, false);

				await this.drawNodes(node, "node", true);
				await this.drawLinks(node.parent, ".link");
				await this.goToNode(node.x, node.y);
				this.fadeOutRing();
			}

			// this.graph.select(`.${nodeId}`).remove();
			this.drawNodes(this.bstD3Wrapper.tree(true), "node", true);
			this.drawLinks(this.bstD3Wrapper.tree(false), ".link");

			this.newNumber = "";
			this.insertError = false;
		},
		remove: function(data) {},

		/**
		 * Draws nodes using the specified selection String.
		 *
		 * */
		async drawNodes(node, cssSelectionClass, translate) {
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

			enterNode
				.append("circle")
				// .attr("cx", vm.rootOffsetX)
				// .attr("cy", vm.rootOffsetY)
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

			//This should happen to all new and old nodes

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
		 * This method draws links between various nodes given all the parameters. Both the parameters
		 * can have conditional values, i.e. The first parameter, node, can either be an array or a single parent node
		 * such as root node.
		 * 1. If node is an array
		 * 		If node is an array, a link is drawn between each item in the array in increasing order of their index.
		 * 		For example: if node = [node1, node2, node3], a link is drawn a such node1 ---> node2 ---> node3
		 * 2. If the node is an object (i.e a parent node)
		 * 		If node is a parent node, a link is drawn between all it's descendants (including itself)
		 *
		 * The second parameter, selectionString can be either null or a string that can be used to query the DOM
		 * 	1. If selectionString is null:
		 * 		If the selectionString is null, it almost always means a new link is drawn (as opposed to updating the link).
		 * 		In such cases, selectionString is assigned a unique id which is derived based on nodes that form the link.
		 * 2. If selectionString is not null
		 * 		In this case, it almost always means existing links are being updated.
		 *
		 * @param node This can be a single parent node (for example root node) or an array of nodes.
		 * @selectionString This can be either null or a string that can be used to query DOM (for example classes, elements and ids)
		 */
		async drawLinks(node, selectionString) {
			debugger;
			let vm = this;
			let links = node.descendants().slice(1);
			const updateLinks = d3
				.select(".aa-graph")
				.selectAll(selectionString)
				.data(links, node => node.data.id);
			let enterLinks = updateLinks
				.enter()
				.append("line")
				.attr("id", function(d) {
					return vm.getLinkId(d.parent, d);
				})
				.attr("class", "link")
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

			await enterLinks
				.merge(updateLinks)
				.transition()
				.duration(1000)
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
					return d.y;
				})
				.end();
		},
		getLinkId(parentNode, childNode) {
			return `link-${parentNode.data.data}-depth-${parentNode.depth}-to-${childNode.data.data}-depth-${childNode.depth}`;
		},
		getNodeId(node) {
			return `node-${node.data.data}-depth-${node.depth}`;
		},

		async traverse(nodes, fadeOutAtEnd) {
			let vm = this;

			let currentNode = nodes[0];
			let outerRing = this.graph
				.append("circle")
				.attr("id", "aa-selection-ring")
				.style("opacity", "0")
				.attr("cx", currentNode.x) //TODO: 50 is the actual transaction of the svg. Make this a variable
				.attr("cy", currentNode.y) //TODO: 50 is the actual transaction of the svg. Make this a variable
				.attr("r", vm.nodeRadius + vm.nodeStrokeWidth)
				.attr("fill", "none")
				.attr("stroke-width", `${vm.nodeStrokeWidth + 1}px`)
				.attr("stroke", vm.nodeStrokeColorHilighted);

			await outerRing
				.transition()
				.ease(d3.easeLinear)
				.duration(this.animationTime600)
				.style("opacity", "1")
				.end();

			for (const node of nodes.splice(1)) {
				await this.goToNode(node.x, node.y);
				currentNode = node;
			}

			if (fadeOutAtEnd) {
				this.fadeOutRing();
			}
			return currentNode;
		},
		goToNode(x, y) {
			return this.graph
				.select("#aa-selection-ring")
				.transition()
				.duration(this.animationTime800)
				.attr("cx", x)
				.attr("cy", y)
				.end();
		},
		fadeOutRing() {
			this.graph
				.select("#aa-selection-ring")
				.transition()
				.duration(this.animationTime600)
				.style("opacity", 0)
				.transition()
				.delay(this.animtionTime400)
				.remove();
		}
	},
	mounted: function() {
		this.init();
	},
	created: function() {
		//This contains the tree layout. Note:
		//this does not actually contain the hierarchical tree data
		this.tree = undefined;

		// This is the group element (<g>) that contains the the tree
		this.graph = undefined;

		// This contains the hierarchical tree data build on of d3.tree() by using
		// the constructor this.tree. Note, this only contains the reference to node.
		// Rest of the nodes can be accessed by following the hierarchy
		this.rootNode = undefined;

		// This represents the hierarchical data that builds the tree. Note, this is different
		// from the tree itself because it only knows the abstract layout of the tree (i.e, it does
		// not know the cartisan coordinates of each nodes, their depth, height, etc.). It only
		// contains data and information about it's childrens
		this.hierarchicalData = undefined;

		// initial width of the tree. After each subsequent insert and deletes, this should
		// increase or decrease by widthIncrement value declared below
		this.canvasWidth = 600;

		// initial width of the tree. After each subsequent insert and deletes, this should
		// increase or decrease by heightIncrement value declared below
		this.canvasHeight = 600;
		this.linkLength = 150;

		this.padding = 50; // padding between the svg element and the first group element
		this.widthIncrement = 50;
		this.heightIncrement = 150;

		//Keeps track of the height of the tree. This determines whether the size of the canvas should be increased or decreased
		//We start with negative height, meaning there is no root node yet. Note: this is not the height of the tree in pixels. This
		//is the number of nodes from root to the farthest leaf
		this.treeHeight = -1;

		let treeWidth = this.canvasWidth - this.padding - this.nodeRadius - 2; //2 is for stroke width
		let treeHeight = this.canvasHeight - this.padding - this.nodeRadius - 2; //2 is for stroke height
		this.bstD3Wrapper = new BstD3Wrapper(treeWidth, treeHeight);
	}
};
</script>
<style scoped>
.aa-container {
	width: 100%;
}

.aa-config-row {
	height: 100px;
	border-bottom: 1px solid #f14a60;
}
</style>
