<!--Notes to myself:
1. Do not call d3.hierarchy in update function. It is expensive. Instead add data to hierarchy the moment a new number is entered. And,
    make data[] a hieararchical data in data function
2. -->
<template>
    <div class="aa-container container-fluid pl-0 pr-0">
        <b-row class="aa-config-row">
            <b-col sm="2">
                <b-row class="container mt-4 ml-4">
                    <b-col sm="8" class="pr-sm-0">
                        <b-form-input
                            id="aa-new-number"
                            placeholder="5"
                            :state="insertError ? false : null"
                            v-model="insertInput"
                        ></b-form-input>
                    </b-col>
                    <b-col sm="4" class="text-left">
                        <b-button squared variant="outline-info" @click="insert">Insert</b-button>
                    </b-col>
                </b-row>
            </b-col>
            <b-col sm="2">
                <b-row class="container mt-4 ml-4">
                    <b-col sm="8" class="pr-sm-0">
                        <b-form-input
                            id="aa-remove-number"
                            placeholder="5"
                            :state="removeError ? false : null"
                            v-model="removeInput"
                        ></b-form-input>
                    </b-col>
                    <b-col sm="4" class="text-left">
                        <b-button squared variant="outline-danger" @click="remove">Remove</b-button>
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
            insertInput: "",

            //This will contain a number when a user enter a number that should be removed from
            //the tree. After the number is removed, it should be set back to ""
            removeInput: "",

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
            nodeFontColorDefault: "#262626",
            nodeFontColorHilighted: "#AB0505",
            nodeStrokeWidth: 2, //2px
            rootOffsetX: 0,
            rootOffsetY: 0,

            animationTimePrimary: 1000 * 0.5,
            animationTime800: 800 * 0.5,
            animationTime600: 600 * 0.5,
            animtionTime400: 400 * 0.5,
            animationTime200: 200 * 0.5,

            nodeStrokeColorHilighted: "#AB0505",
            orange: "#F45D27"

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
            let inputInt = this.sanitizeInput(this.insertInput);

            if (inputInt === null) return;

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
                await this.traverse(
                    ancestors,
                    false,
                    ringId,
                    this.nodeStrokeColorHilighted
                );

                await this.drawNodes(node, "node", true);
                await this.drawLinks(node.parent, "link", false);
                await this.goToNode(node.x, node.y, ringId);
                this.fadeOutRing(ringId);
            }

            this.drawTree();

            this.insertInput = "";
            this.insertError = false;
        },

        remove: async function() {
            let inputInt = this.sanitizeInput(this.removeInput);

            if (inputInt === null) return;

            let nodes = this.bstD3Wrapper.getPathToNodeByKey(inputInt);

            // If there are no nodes in the path to the node that should be removed
            // no further action can be performed
            if (nodes.length === 0) return;

            // Traverse to the node to be removed so the user can see the visual
            // traversal
            await this.traverse(
                nodes,
                true,
                "aa-selection-ring",
                this.nodeStrokeColorHilighted
            );

            let removalNode = nodes[nodes.length - 1];

            let successorNode = this.bstD3Wrapper.findSuccessor(
                removalNode.data.key,
                removalNode.data.id
            );
            if (successorNode !== null) {
                let successorPath = removalNode.path(successorNode);

                // traverse to the successor from the removal node
                await this.traverse(
                    successorPath,
                    true,
                    "successor-path-ring",
                    this.orange
                );

                // Remove the link that connect the successor node to it's parent
                await this.removeElement(
                    this.getLinkId(successorNode),
                    this.animationTime600
                );

                // Translate the successor node to the removal node's position
                // so that the user can see the node swapping visually
                await this.graph
                    .select(`#${successorNode.data.id}`)
                    .transition()
                    .duration(this.animationTime800)
                    .attr(
                        "transform",
                        `translate(${removalNode.x}, ${removalNode.y})`
                    );
            }

            // Now remove the removalNode from DOM. Note, this does not
            // actually remove the node from the tree.
            this.removeElement(removalNode.data.id, 0);

            //Now swap the removal node and successor node
            debugger;
            this.bstD3Wrapper.deleteNode(removalNode, successorNode);

            debugger;
            this.drawTree();

            //Remove the node
            // this.removeElement(removalNode.data.id, this.animationTime600);

            //Remove the link
            // this.removeElement(
            //     this.getLinkId(removalNode),
            //     this.animationTime600
            // );

            // debugger;
            //Now, remove the node from the actual tree itself
            // if (removalNode !== null) {
            //     this.bstD3Wrapper.removeNode(
            //         removalNode.data.key,
            //         removalNode.data.id
            //     );
            //     this.drawTree();
            // }
        },

        drawTree: async function() {
            // this.graph.select(`.${nodeId}`).remove();
            this.drawNodes(this.bstD3Wrapper.tree(true), "node", true);
            this.drawLinks(this.bstD3Wrapper.tree(false), "link", true);
        },

        sanitizeInput: function(data) {
            if (data === "") {
                this.insertError = true;
                return null;
            }
            return parseInt(data);
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

        /**
         * This method creates a traversal animation from the first index
         * of nodes (which is an array) to the last index.
         *
         * @param nodes Array of nodes for which traversal animation should
         * be created
         */
        async traverse(nodes, fadeOutAtEnd, selectionId, ringColor) {
            let vm = this;

            let currentNode = nodes[0];
            let outerRing = this.graph
                .append("circle")
                .attr("id", selectionId)
                .style("opacity", "0")
                .attr("cx", currentNode.x) //TODO: 50 is the actual transaction of the svg. Make this a variable
                .attr("cy", currentNode.y) //TODO: 50 is the actual transaction of the svg. Make this a variable
                .attr("r", vm.nodeRadius + vm.nodeStrokeWidth)
                .attr("fill", "none")
                .attr("stroke-width", `${vm.nodeStrokeWidth + 1}px`)
                .attr("stroke", ringColor);

            await outerRing
                .transition()
                .ease(d3.easeLinear)
                .duration(this.animationTime600)
                .style("opacity", "1")
                .end();

            // Note: Do not use nodes.splice(1) to iterate
            // through the nodes as it modified the original
            // nodes array
            for (let i = 1; i < nodes.length; i++) {
                const node = nodes[i];
                await this.goToNode(node.x, node.y, selectionId);
                currentNode = node;
            }

            if (fadeOutAtEnd) {
                this.fadeOutRing(selectionId);
            }
            return currentNode;
        },
        goToNode(x, y, selectionId) {
            return this.graph
                .select(`#${selectionId}`)
                .transition()
                .duration(this.animationTime800)
                .attr("cx", x)
                .attr("cy", y)
                .end();
        },
        fadeOutRing(selectionId) {
            this.graph
                .select(`#${selectionId}`)
                .transition()
                .duration(this.animationTime600)
                .style("opacity", 0)
                .transition()
                .delay(this.animtionTime400)
                .remove();
        },
        removeElement: async function(id, transitionTime) {
            await this.graph
                .select(`#${id}`)
                .transition()
                .duration(transitionTime)
                .style("opacity", 0)
                .end();

            this.graph.select(`#${id}`).remove();
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
