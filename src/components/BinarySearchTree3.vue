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
                        <b-button squared variant="outline-info" @click="insert">Insert</b-button>
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
import * as d3 from "d3";
// import { link } from "fs";
import { BST } from "@/model/bst";
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
            canvasWidth: 400,
            canvasHeight: 400,
            fontSize: "20px",
            nodeFillColor: "#FFFFFF",
            nodeRadius: 30,
            nodeStrokeColorDefault: "#eff0f1",
            nodeStrokeColorHilighted: "#AB2E23",
            nodeFontColorDefault: "#eff0f1",
            nodeFontColorHilighted: "#AB2E23",
            nodeStrokeWidth: "2px",
            rootOffsetX: 0,
            rootOffsetY: 0,

            widthIncrement: 50,
            heightIncrement: 180

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
            // this.svg = d3
            //     .select("#aa-bst-canvas")
            //     .append("svg")
            //     .attr("height", this.canvasWidth)
            //     .attr("width", this.canvasHeight);
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
            //data hierarchy
            // const rootNode = d3.hierarchy(data, d => {
            //     return d.children;
            // });

            let linkLength = 180;
            //remove current nodes
            this.graph.selectAll(".node").remove();
            this.graph.selectAll(".link").remove();

            vm.treeData = this.tree(rootNode);

            vm.treeData.descendants().forEach((descendant, index) => {
                //If it's the first child, we know it's the root element. So, we don't want to move it yet
                if (index == 0) return;

                let parent = descendant.parent;

                if (descendant.data.data <= parent.data.data) {
                    // descendant.x -= descendant.depth * vm.widthIncrement;
                    descendant.y = parent.y + vm.heightIncrement;
                } else {
                    // descendant.x += descendant.depth * vm.widthIncrement;
                    descendant.y = parent.y + vm.heightIncrement;
                }
            });

            //get nodes selection and join data
            const nodes = this.graph
                .selectAll(".node")
                .data(vm.treeData.descendants());

            //get link selection and join data
            // const links = this.graph.selectAll(".link").data(vm.treeData.links());

            const nodes1 = vm.treeData.descendants();
            const links1 = vm.treeData.descendants().slice(1);

            const links = this.graph
                .selectAll(".link")
                .data(vm.treeData.links());

            //enter new links
            // links
            //     .enter()
            //     .append("path")
            //     .attr("clapathss", "link")
            //     .attr("fill", "none")
            //     .attr("stroke", "#aaa")
            //     .attr("stroke-color", 2)
            //     .attr(
            //         "d",
            //         d3
            //             .linkVertical()
            //             .x(d => d.x)
            //             .y(d => d.y)
            //     );
            links
                .enter()
                .append("line")
                .attr("id", function(d) {
                    return `${d.source.data.data}-depth-${d.source.depth}-link-${d.target.data.data}-depth-${d.target.depth}`;
                })
                .attr("class", "link")
                .attr("fill", "none")
                .attr("stroke", "#aaa")
                .attr("stroke-color", 2)
                .attr("x1", d => {
                    // debugger;
                    return d.source.x;
                })
                .attr("y1", d => {
                    return d.source.y;
                })
                .attr("x2", function(d) {
                    return d.target.x;
                })
                .attr("y2", d => {
                    console.log(d.target);
                    return d.target.y;
                });

            //create enter node groups
            const enterNodes = nodes
                .enter()
                .append("g")
                .attr("id", d => {
                    return `node-${d.data.data}-depth-${d.depth}`;
                })
                .attr("class", "node")
                .attr("transform", function(d) {
                    // if (!d.parent || d.data.data > d.parent.data.data) {
                    //     return `translate(${d.x + d.depth * 50}, ${d.y})`;
                    // } else {
                    //     return `translate(${d.x - d.depth * 50}, ${d.y})`;
                    // }
                    return `translate(${d.x},${d.y})`;
                });

            //append circle to enter nodes
            enterNodes
                .append("circle")
                .attr("cx", this.rootOffsetX)
                .attr("cy", this.rootOffsetY)
                .attr("r", this.nodeRadius)
                .attr("stroke", this.nodeStrokeColorHilighted)
                .attr("stroke-width", "2px")
                .attr("fill", this.nodeFillColor);

            //append text
            enterNodes
                .append("text")
                .text(function(d) {
                    return d.data.data;
                })
                .attr("text-anchor", "middle")
                .attr("font-size", this.fontSize)
                .attr("fill", this.nodeFontColorHilighted)
                .attr(
                    "transform",
                    `translate(${this.rootOffsetX}, ${this.rootOffsetY + 7})`
                );
        },
        insert: function() {
            if (this.newNumber === "") {
                this.insertError = true;
                return;
            }
            this.newNumber = parseInt(this.newNumber);

            let rootNode = this.bst.insertData(this.newNumber);

            this.newNumber = "";
            this.insertError = false;
            this.update(rootNode);

            this.canvasHeight += this.heightIncrement;
            this.canvasWidth += this.widthIncrement;
            this.tree = d3
                .tree()
                .size([
                    this.canvasWidth,
                    this.canvasHeight - 50 - this.nodeRadius - 5
                ]);

            if (this.treeData !== undefined) {
                let descendants = this.treeData.descendants();

                let group = d3.select(
                    `node-${this.treeData.data.data}-depth-${this.treeData.depth}`
                );

                debugger;
                d3.select(
                    `node-${this.treeData.data.data}-depth-${this.treeData.depth}`
                )
                    .transition()
                    .duration(500)
                    .style("stroke", "blue");
            }
        },

        remove: function() {}
    },
    mounted: function() {
        this.init();
        // this.update(this.bst);
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
