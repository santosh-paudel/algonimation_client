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
// import { link } from "fs";
import { BST } from "@/model/bst";
import { link } from "fs";
export default {
	name: "BinarySearchTree3",
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
			canvasWidth: 200,
			canvasHeight: 200,
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

			widthIncrement: 50,
			heightIncrement: 180,

			animationTimePrimary: 1000

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
				.attr("transform", "translate(50, 50)");

			//create a tree generator and specify the size of the digram
			this.tree = d3
				.tree()
				.size([
					this.canvasWidth,
					this.canvasHeight - 50 - this.nodeRadius - 5
				]);
		},

		update(rootNode) {
			const vm = this;

			let linkLength = 180;

			vm.treeData = this.tree(vm.treeRootNode);
			//   debugger;

			vm.treeData.descendants().forEach((descendant, index) => {
				//If it's the first child, we know it's the root element. So, we don't want to move it yet
				if (index == 0) return;

				let parent = descendant.parent;

				descendant.y = parent.y + linkLength;
			});

			//get link selection and join data
			// const links = this.graph.selectAll(".link").data(vm.treeData.links());

			const nodes1 = vm.treeData.descendants();

			//get nodes selection and join data
			const nodes = this.graph
				.selectAll(".node")
				.data(vm.treeData.descendants());

			//update text of existing element
			nodes.select("text").text(function(d) {
				return d.data.data;
			});
			//create enter node groups
			const enterNodes = nodes
				.enter()
				.append("g")
				.attr("id", d => {
					return `node-${d.data.data}-depth-${d.depth}`;
				})
				.attr("class", "node")
				.attr("visibility", d => {
					// if(isNaN(d.data.data)){
					//     return "hidden";
					// }
					// else{
					return "visible";
					// }
				});

			//append circle to enter nodes
			enterNodes
				.append("circle")
				// .attr("cx", vm.rootOffsetX)
				// .attr("cy", vm.rootOffsetY)
				.attr("r", vm.nodeRadius)
				.attr("stroke", vm.nodeStrokeColorDefault)
				.attr("stroke-width", `${vm.nodeStrokeWidth}px`)
				.attr("fill", vm.nodeFillColor);

			//append text
			enterNodes
				.append("text")
				.attr("text-anchor", "middle")
				.attr("font-size", vm.fontSize)
				.attr("fill", vm.nodeFontColorDefault)
				.attr("transform", `translate(0, 7)`)
				.text(function(d) {
					return d.data.data;
				});

			nodes.exit().remove();

			//Update both the existing node and enter node
			enterNodes
				.merge(nodes)
				// .transition()
				// .duration(1000)
				.attr("transform", function(d) {
					return `translate(${d.x},${d.y})`;
				});

			const links1 = vm.treeData.descendants().slice(1);
			const links = this.graph.selectAll(".link").data(links1);
			let linkEnter = links
				.enter()
				.append("line")
				.attr("id", function(d) {
					return `${d.data.data}-depth-${d.depth}-link-${d.data.data}-depth-${d.depth}`;
				})
				.attr("class", "link")
				.attr("fill", "none")
				.attr("stroke", "#aaa")
				// .attr("stroke-opacity", d => {
				//   if (isNaN(d.data.data)) {
				//     return "0%";
				//   } else {
				//     return "100%";
				//   }
				// })
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

			let linkUpdate = linkEnter.merge(links);

			linkUpdate
				.transition()
				.delay(1000)
				.transition(1000)
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
				});

			links.exit().remove();
		},
		insert: async function() {
			const vm = this;
			if (vm.newNumber === "") {
				vm.insertError = true;
				return;
			}
			vm.newNumber = parseInt(vm.newNumber);

			let rootNode;
			//If the tree is not already defined, we know that there are no nodes in the
			//tree yet. Thus make the root node
			let newNode;
			if (vm.treeData !== undefined) {
				//Now go down the tree and light the nodes as we visit them in bst
				rootNode = vm.treeData;
				let inserted = false;

				while (inserted === false) {
					//Get the next node that should be visited for this data
					let nextNode = vm.getNextNode(vm.newNumber, rootNode);

					if (nextNode === undefined) {
						newNode = vm.makeChild(vm.newNumber, rootNode);
						let emptyNode = vm.makeChild(NaN, rootNode);
						let children = rootNode.children;

						if (vm.newNumber <= rootNode.data.data) {
							//If root node already has a child, make this the first child
							if (children === undefined) {
								rootNode.children = [newNode, emptyNode];
							} else {
								rootNode.children = [newNode, children[1]];
							}
						} else {
							//If root node already has a child, make this the first child
							if (children === undefined) {
								rootNode.children = [emptyNode, newNode];
							} else {
								rootNode.children = [children[0], newNode];
							}
						}
						inserted = true;
					} else {
						rootNode = nextNode;
					}
				}
			} else {
				newNode = vm.makeChild(this.newNumber, undefined);
				vm.treeRootNode = newNode;
				// vm.update(rootNode);
			}

			debugger;
			vm.animateTraversal(newNode);
			vm.update(newNode);
			// this.addANode(rootNode, newNode);

			// debugger;
			// vm.update(rootNode);

			vm.canvasHeight += vm.heightIncrement;
			vm.canvasWidth += vm.widthIncrement;
			//   vm.tree = d3
			//     .tree()
			//     .size([vm.canvasWidth, vm.canvasHeight - 50 - vm.nodeRadius - 5]);
			vm.newNumber = "";
			vm.insertError = false;
		},
		async addANode(rootNode, newNode) {
			debugger;
			let vm = this;
			let tree = this.tree(rootNode);

			let selectorString = "";
			tree.descendants().forEach((descendant, index) => {
				selectorString += "#" + descendant.data.id;
				if (index < tree.descendants().length - 1) {
					selectorString += ",";
				}

				//If it's the first child, we know it's the root element. So, we don't want to move it yet
				if (index == 0) return;

				let parent = descendant.parent;

				descendant.y = parent.y + 180;
			});

			const nodes = this.graph
				.selectAll(`${selectorString}`)
				.data(tree.descendants());

			const enterNodes = nodes
				.enter()
				.append("g")
				.attr("id", d => {
					return `node-${d.data.data}-depth-${d.depth}`;
				})
				.attr("class", "node")
				.attr("visibility", d => {
					// if(isNaN(d.data.data)){
					//     return "hidden";
					// }
					// else{
					return "visible";
					// }
				});

			//append circle to enter nodes
			enterNodes
				.append("circle")
				.attr("r", vm.nodeRadius)
				.attr("stroke", vm.nodeStrokeColorDefault)
				.attr("stroke-width", `${vm.nodeStrokeWidth}px`)
				.attr("fill", vm.nodeFillColor);

			//append text
			enterNodes
				.append("text")
				.attr("text-anchor", "middle")
				.attr("font-size", vm.fontSize)
				.attr("fill", vm.nodeFontColorDefault)
				.attr("transform", `translate(0, 7)`)
				.text(function(d) {
					return d.data.data;
				});

			//Update both the existing node and enter node
			let transition = enterNodes
				.transition()
				.duration(function(d, i) {
					if (isNaN(d.data.data)) return 0;
					else return 1000;
				})
				.attr("transform", function(d) {
					return `translate(${d.x},${d.y})`;
				});

			await transition.end();

			// vm.update(undefined);
		},

		/**
		 * Given the root node (which is not necessarily the root of the tree. rootNode in this parameter,
		 * just means the current node that is being visited), this method returns one of the three things
		 * 1. undefined if
		 *      a. If rootNode has no children
		 *      b. If data is less than or equal to the data of rootNode and the left child has value NaN
		 *      c. If the data is more than the data of rootNode and the right child has value Nan
		 * 2. left Node if
		 *      a. If the data is less than or equal to the data of root node
		 * 3. right node if
		 *      b. If the data is more than the data of right node
		 */
		getNextNode(data, rootNode) {
			let children = rootNode.children;

			//If rootNode has no children, return undefined
			if (children === undefined) return undefined;
			else if (data <= rootNode.data.data) {
				if (isNaN(children[0].data.data)) {
					return undefined;
				} else {
					return children[0];
				}
			} else if (data > rootNode.data.data) {
				if (isNaN(children[1].data.data)) {
					return undefined;
				} else {
					return children[1];
				}
			}
		},
		makeChild(data, parentNode) {
			let newNode = d3.hierarchy(
				{ data: data, children: [] },
				d => d.children
			);
			//If it does not have a parent node, then we know that it is a root node
			if (parentNode === undefined) {
				newNode.depth = 0;
				newNode.height = 0;
			} else {
				newNode.depth = parentNode.depth + 1;
				newNode.height = parentNode.height - 1;
				newNode.parent = parentNode;
			}
			newNode.data.id = `node-${data}-depth-${newNode.depth}`;

			return newNode;
		},

		async animateTraversal(childNode) {
			debugger;
			let vm = this;

			let ancestors = childNode.ancestors();

			let currentNode = ancestors[ancestors.length - 1];
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
				.duration(1000)
				.style("opacity", "1")
				.end();

			//go to the next node
			let nextNodeIndex = ancestors.length - 2;

			// if(nextNodeIndex >=)

			// .on("end", function() {
			//   debugger;
			//   let nextNodeIndex = ancestors.length - 2;
			//   if (nextNodeIndex >= 0) {
			//     vm.goToNode(ancestors, nextNodeIndex);
			//   } else {
			//     outerRing
			//       .transition()
			//       .duration(500)
			//       .remove();
			//   }
			// });
		},
		goToNode(nodes, currentIndex) {
			let vm = this;
			// if (currentIndex < 0) {

			//   d3.select('#aa-selection-ring')
			//   .transition()
			//   .duration(1000)
			//   .style('opacity',"0")
			//   .remove();
			// } else {
			if (currentIndex > 0) {
				let currentNode = nodes[currentIndex];

				d3.select("#aa-selection-ring")
					.transition()
					.duration(1000)
					.attr(
						"transform",
						`translate(${-currentNode.x},${currentNode.y})`
					)
					.on("end", function() {
						let nextNodeIndex = --currentIndex; //Note: don't put -- after the variable as it does not immediately change the value of this expression
						vm.goToNode(nodes, nextNodeIndex);
					});
			}
			// }
		},

		remove: function() {}
	},
	mounted: function() {
		this.init();
	},
	created: function() {
		/********** D3 variables */
		this.svg = undefined;
		// this.bst = undefined;
		// this.bst = {
		//     data: 20,
		//     id: 1,
		//     children: [
		//         {
		//             data: 30,
		//             id: 2,
		//             children: []
		//         },
		//         {
		//             data: 40,
		//             id: 3,
		//             children: [
		//                 {
		//                     data: 10,
		//                     id: 2,
		//                     children: []
		//                 }
		//             ]
		//         }
		//     ]
		// };
		this.tree = undefined;
		this.graph = undefined;
		this.bst = new BST();

		this.treeData = undefined;

		this.treeRootNode = undefined;
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
