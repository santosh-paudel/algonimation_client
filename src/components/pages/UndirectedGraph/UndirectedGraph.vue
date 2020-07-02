<template>
    <div class="container pt-2 pb-2 pl-2 h-100" style="position:relative">
        <div class="d-flex flex-column h-100" style="border: 1px solid #E5E5E5;">
            <div
                class="pt-4 pb-2 pl-2"
                ref="graph-operation-panel"
                style="background-color: rgba(212, 114, 140, 0.1)"
            >
                <div class="d-flex justify-content-start" style="height:40px">
                    <b-button
                        variant="light"
                        style="border: 1px solid #a8acb1; height:30px"
                        class="text-secondary btn-sm mr-4"
                        @click="generateRandomGraph"
                    >Random Graph</b-button>
                    <input-data-list
                        :dataList="graphOperations"
                        placeholder="Search graph algorithms"
                        height="30px"
                        @on-item-selected="doGraphOperation(null, $event)"
                    ></input-data-list>
                </div>
                <p class="text-left text-info mb-0 mt-2" style="font-size:0.9rem;">
                    Click on the canvas below to create new nodes. Click and
                    drag your mouse from a node to another to draw a link
                    between the nodes. Click on the link to edit the weight of
                    the link. Use the controls below to perform graph operations
                </p>
            </div>
            <hr class="w-100 mt-0 mb-0" />
            <div class="w-100 h-100">
                <floating-menu
                    v-if="showFloatingMenu"
                    :menuItems="floatingMenuItems"
                    :coords="clickedRelativeCoord"
                    @on-item-selected="onFloatingMenuInput"
                ></floating-menu>
                <floating-input-box
                    v-if="showFloatingInput"
                    :coords="clickedRelativeCoord"
                    :errorMsg="floatingInputErrorMsg"
                    :placeholder="floatingMenuPlaceHolder"
                    @on-user-input="onFloatingBoxInput"
                    @on-dialog-close="showFloatingInput = false"
                ></floating-input-box>
                <aa-modal-box :show="showModalBox" @close="showModalBox = false">
                    <template v-slot:modal-body>
                        <b-form>
                            <b-form-group
                                id="input-group-source-node"
                                label="Enter the starting node"
                                label-for="input-source-node"
                            >
                                <b-form-input
                                    id="input-source-node"
                                    v-model="graphOperationSelectedNode1"
                                    type="text"
                                    required
                                    placeholder="Example: 50"
                                ></b-form-input>
                            </b-form-group>
                            <b-form-group
                                id="input-group-target-node"
                                label="Enter the ending node"
                                label-for="input-target-node"
                            >
                                <b-form-input
                                    id="input-target-node"
                                    v-model="graphOperationSelectedNode2"
                                    type="text"
                                    required
                                    placeholder="Example: 72"
                                ></b-form-input>
                            </b-form-group>
                        </b-form>
                    </template>
                    <template v-slot:modal-button>
                        <b-button
                            type="submit"
                            variant="primary"
                            size="sm"
                            @click="
								doGraphOperation(
									{
										key1: graphOperationSelectedNode1,
										key2: graphOperationSelectedNode2
									},
									selectedGraphOperation
								)
							"
                        >Submit</b-button>
                    </template>
                </aa-modal-box>
                <drawing-board-fluid
                    class="aa-graph-canvas"
                    id="canvas-382d3"
                    bgcolor="rgba(212, 114, 140, 0.03)"
                    @on-canvas-click="onCanvasClick"
                    @on-canvas-ready="onCanvasReady"
                ></drawing-board-fluid>
            </div>
        </div>
    </div>
</template>
<script>
/* eslint-disable no-unused-vars */
/* eslint-disable no-debugger */
import * as d3 from "d3";
import DrawingBoardFluid from "@/components/DrawingBoardFluid.vue";
import FloatingInputBox from "@/components/UIComponents/FloatingInputBox.vue";
import FloatingMenu from "@/components/UIComponents/FloatingMenu.vue";
import InputDataList from "@/components/UIComponents/InputDataList.vue";
import Modal from "@/components/UIComponents/Modal";
import { Graph } from "@/model/Graph";
import { GraphCanvasUtil } from "@/util/canvasUtil/GraphCanvasUtil";
import { watch } from "fs";
export default {
    name: "UndirectedGraph",
    data: function() {
        return {
            canvasHeight: Number,
            canvasWidth: Number,
            nodeRadius: 20.0,
            strokeWidth: "2px",
            nodeFillColor: "#74DB86",
            currentHover: null,

            //Floating Input
            clickCoord: { x: 0, y: 0 },
            floatingInputErrorMsg: "",
            showFloatingInput: false,
            showFloatingMenu: false,

            // Fefore editing the items in the array, search all
            // the hard coded references of the items
            // and modify them as well (ctrl + F)
            floatingMenuItems: ["Delete Link", "Add/Edit Weight"],
            floatingMenuPlaceHolder: "Key",

            //This is an object that contains the name of the
            //clicked element and the data they represent. It can have
            //the following possible values:
            //1. {type: "canvas", data:null} (canvas does not represent a data)
            //2. {type: "node", data: Object}
            //3. {type: "link", data: Object}
            // Note, this element is watched for changes.
            clickedElement: {}, //Possible values: canvas, link, node

            // Fefore editing the items in the array, search all
            // the hard coded references of the items
            // and modify them as well (ctrl + F)
            graphOperations: [
                "Dikstra's shortest path",
                "Breadth-first search",
                "Depth-first search"
            ],
            selectedGraphOperation: "",
            graphOperationSelectedNode1: null,
            graphOperationSelectedNode2: null,
            showModalBox: false
        };
    },
    computed: {
        getDefaultNodeOptions() {
            const opt = {};
            opt.parentClass = "aa-graph-canvas";

            //Class that should be assigned to the node
            opt.cssClass = "node";
            opt.removeExitNodes = true;
            opt["stroke-width"] = this.strokeWidth;
            opt["stroke"] = "#747474";
            opt["radius"] = `${this.nodeRadius}px`;
            opt["fill"] = this.nodeFillColor;
            opt["font-size"] = "14px";
            opt["font-color"] = "#FFFFFF";
            opt.fixedAtOrigin = false;
            opt.transitionTime = 0;

            opt.click = this.clickNode;
            opt.mouseover = this.mouseoverNode;
            opt.mouseout = this.mouseoutNode;

            opt.dragEvents = {
                start: this.dragStartedNode,
                drag: this.draggedNode,
                end: this.dragEndedNode
            };
            return opt;
        },
        getDefaultLinkOptions() {
            const opt = {};

            opt["stroke-width"] = this.strokeWidth;
            opt["stroke"] = "#747474";
            opt.cssClass = "link";
            opt.parentClass = "aa-graph-canvas";
            opt.removeExitLinks = false;
            opt.transitionTime = 0;

            opt.mouseover = this.mouseOverLink;
            opt.mouseout = this.mouseOutLink;
            opt.click = this.clickLink;
            opt.radiusOffset = this.nodeRadius + 2; //add a random small value

            return opt;
        },
        /**
         * This property returns the clicked coordinate. Note, the click coord has to be relative. When
         * the user clicks a node or link on the canvas, the provided coordinate is from the top left
         * corner of the canvas. However, when floating input box or menu appears, we need to account
         * for the graph operation panel on the top. This method offsets the height of the control pane
         *
         */
        clickedRelativeCoord() {
            return {
                x: this.clickCoord.x,
                y:
                    this.clickCoord.y +
                    this.$refs["graph-operation-panel"].clientHeight
            };
        },
        floatingMultiInputCoord() {
            return { x: 0, y: 0 };
        }
    },
    methods: {
        onCanvasReady(dimension) {
            this.canvasHeight = dimension.height;
            this.canvasWidth = dimension.width;

            this.initGraph();
        },
        onCanvasClick(coord) {
            let vm = this;
            //Don't add any nodes if the mouse is currently hovering over a node
            if (vm.currentHover !== null) return;
            this.clickedElement = { type: "canvas", data: null };
            this.clickCoord = { x: coord.x, y: coord.y };

            //If the floating menu is already open, just close the floating menu
            if (this.showFloatingMenu === true) {
                this.showFloatingMenu = false;
            }
            //Else show the floating input box
            else {
                this.showFloatingInput = true;
                this.floatingMenuPlaceHolder = "Key";
            }
        },
        onFloatingBoxInput(data) {
            switch (this.clickedElement.type) {
                case "canvas": {
                    try {
                        this.addNode(
                            data,
                            this.clickCoord.x,
                            this.clickCoord.y
                        );
                        this.floatingInputErrorMsg = "";
                    } catch (err) {
                        this.floatingInputErrorMsg = err.message;
                    }
                    break;
                }
                case "link": {
                    const link = this.clickedElement.data;
                    this.addWeight(link.source, link.target, data);
                    this.floatingInputErrorMsg = "";
                    break;
                }
                default:
                    break;
            }

            if (this.floatingInputErrorMsg === "") {
                this.showFloatingInput = false;
            }
        },
        onFloatingMenuInput(data) {
            switch (this.clickedElement.type) {
                case "node":
                    //Delete
                    if (data === this.floatingMenuItems[0]) {
                        this.deleteNode(this.clickedElement.data);
                    }
                    break;

                //Add or edit weight
                case "link": {
                    if (data === "Add/Edit Weight") {
                        this.showFloatingInput = true;
                        this.floatingMenuPlaceHolder = "weight";
                    } else if (data === "Delete Link") {
                        this.deleteLink(
                            this.clickedElement.data.source,
                            this.clickedElement.data.target
                        );
                    }
                    break;
                }
            }

            this.showFloatingMenu = false;
        },
        resetNodeLinkOptions() {
            this.nodeRadius = 20.0;
            this.strokeWidth = "2px";
            this.nodeFillColor = "#74DB86";
        },
        doGraphOperation(userInput, actionName) {
            switch (actionName) {
                case "Dikstra's shortest path": {
                    if (userInput === null) {
                        this.showModalBox = true;
                        this.selectedGraphOperation = actionName;
                    } else {
                        this.showModalBox = false;
                        this.showDikjstrasPath(userInput.key1, userInput.key2);
                    }
                    break;
                }

                default:
                    this.showModalBox = false;
                    break;
            }
        },

        showDikjstrasPath(key1, key2) {
            // let path = this.graph.dikjstras(key1, key2);
            // console.log(path);
            /**
             *     * {
             *   path: [1,3,4,5],
             *   checkedNodes: [
             *      {1: [2,3]},
             *      {3: [2,4]}
             *      {2: [5, 4]},
             *      {4: [5]},
             *      {5: []}
             *   ]
             * }
             */

            this.nodeFillColor = "#a2a2a2";
            this.ticked();

            let result = this.graph.dikjstras(key1, key2);

            if (Object.keys(result).length === 0) {
                console.error(
                    `There is no path between the keys ${key1} and ${key2}`
                );
                return;
            }

            // Now, create an array of objects that looks like this. Each object contains source and the target Node (which are
            // the nodes whose traversal cost is computed) and isPath is boolean flag if these two nodes were actually in the path.
            // [{source: Node(), target: Node(), isPath: true},{...},...]
            let a = [];
            for (const obj of result.checkedNodes) {
                // Get the key of this object
                let source = Object.keys(obj)[0];
                // Get the value of this object, which is an array of nodes that are neighbors of sourceKey
                let neighbors = obj[source];

                // Now iterate through each each neighbors and build an object
                // that contains sourceNode, targetNode and Boolean isPath, which is true if they are in the shortest path
                for (let neighbor of neighbors) {
                    let edge = this.graph.getEdge(source, neighbor);

                    // Now, check if the edge is in dikjstra's path, if yes, add isPath to true
                    for (let i = 0; i < result.path.length - 1; i++) {
                        if (
                            result.path[i] === source &&
                            result.path[i + 1] === neighbor
                        ) {
                            edge.isPath = true;
                        }
                    }
                    a.push(edge);
                }
            }

            console.log(a);
            GraphCanvasUtil.showPath(a, this.nodeRadius);
        },

        generateRandomGraph() {
            this.graph = new Graph();
            this.graph.add("a");
            this.graph.add("c");
            this.graph.add("b");
            this.graph.add("e");
            this.graph.add("d");

            this.graph.link("a", "b", 7);
            this.graph.link("a", "c", 3);
            this.graph.link("b", "c", 1);
            this.graph.link("b", "e", 6);
            this.graph.link("c", "d", 2);

            this.graph.link("b", "d", 2);
            this.graph.link("d", "e", 4);
            /*
      //Generate random number of edges between 4 and 12
      const numEdges = Math.ceil(8 * Math.random()) + 4;

      this.graph = new Graph();

      let nodes = [];
      for (let i = 0; i < numEdges; i++) {
        let key = Math.ceil(Math.random() * 100);
        if (this.graph.containsKey(key) === false) {
          let node = this.graph.add(key);
          nodes.push(node);
        }
      }

      //Now, create links between the nodes
      let numNodes = nodes.length;
      //   const maxEdges = (numNodes * (numNodes - 1)) / 2;
      const maxEdges = 10;
      let min = 0;
      let max = nodes.length;
      for (let i = 0; i < maxEdges; i++) {
        let sourceIndex = Math.floor(Math.random() * (max - min) + min);
        let targetIndex = Math.floor(Math.random() * (max - min) + min);
        let sourceKey = nodes[sourceIndex].key;
        let targetKey = nodes[targetIndex].key;

        let weight = Math.floor(Math.random() * 100);

        if (
          sourceKey !== targetKey &&
          this.graph.containsEdge(sourceKey, targetKey) === false
        ) {
          this.graph.link(sourceKey, targetKey, weight);
        }
      }
      */

            this.initGraph();
        },
        addNode(data, x, y) {
            try {
                let node = this.graph.add(data);
                node.x = x;
                node.y = y;
                this.simulation.nodes().push(node);

                this.restart(
                    this.simulation.nodes(),
                    this.simulation.force("link").links()
                );
            } catch (err) {
                throw err;
            }
        },

        addLink(source, target) {
            const link = this.graph.link(source.key, target.key, null);

            this.simulation
                .force("link")
                .links()
                .push(link);

            this.restart(
                this.simulation.nodes(),
                this.simulation.force("link").links()
            );
        },

        addWeight(source, target, weight) {
            let integerWeight = parseInt(weight);
            for (let link of this.simulation.force("link").links()) {
                if (
                    link.source.key === source.key &&
                    link.target.key === target.key
                ) {
                    link.weight = integerWeight;
                    this.graph.link(source.key, target.key, integerWeight);
                }
            }

            this.restart(
                this.simulation.nodes(),
                this.simulation.force("link").links()
            );
        },

        deleteNode(data) {
            this.graph.delete(data.key);
            let nodes = [];
            this.simulation.nodes().forEach(node => {
                if (this.graph.containsKey(node.key)) {
                    nodes.push(node);
                }
            });
            this.simulation.nodes(nodes);

            let links = [];
            this.simulation
                .force("link")
                .links()
                .forEach(link => {
                    if (
                        this.graph.containsEdge(
                            link.source.key,
                            link.target.key
                        )
                    ) {
                        links.push(link);
                    }
                });
            this.simulation.force("link").links(links);
        },

        deleteLink(source, target) {
            this.graph.deleteEdge(source.key, target.key);

            const links = this.simulation
                .force("link")
                .links()
                .filter(link => {
                    if (
                        link.source.key === source.key &&
                        link.target.key === target.key
                    )
                        return false;

                    return true;
                });
            this.restart(this.simulation.nodes(), links);
        },

        initGraph() {
            let vm = this;

            this.simulation = d3
                .forceSimulation(this.graph.vertices())
                .force(
                    "charge",
                    d3.forceManyBody().strength(function(d, i) {
                        return i ? -30 : -2000;
                    })
                )
                .force(
                    "center",
                    d3.forceCenter(this.canvasWidth / 2, this.canvasHeight / 2)
                )
                .force(
                    "link",
                    d3
                        .forceLink()
                        .links(vm.graph.edges())
                        .id(d => {
                            return d.key;
                        })
                        .distance(100)
                        .strength(0.9)
                )
                .force("x", d3.forceX(this.canvasWidth / 2).strength(0.05))
                .force("y", d3.forceY(this.canvasHeight / 2).strength(0.05))
                .force("collide", d3.forceCollide().radius(this.nodeRadius * 3))
                .on("tick", this.ticked);

            this.restart(
                this.simulation.nodes(),
                this.simulation.force("link").links()
            );
        },
        restart(nodes, links) {
            GraphCanvasUtil.drawCircularNodes(
                nodes,
                this.getDefaultNodeOptions
            );

            GraphCanvasUtil.drawLinksGraph(links, this.getDefaultLinkOptions);

            this.simulation.nodes(nodes);
            this.simulation.force("link").links(links);

            this.simulation
                .alpha(0.05)
                .force(
                    "centerX",
                    d3.forceX(this.canvasWidth / 2).strength(0.005)
                )
                .force(
                    "centerY",
                    d3.forceY(this.canvasHeight / 2).strength(0.005)
                )
                .restart();
        },
        mouseoverNode(svgElement, data, index) {
            d3.select(svgElement)
                .select("circle")
                .transition()
                .duration(500)
                .attr("opacity", "0.9")
                .attr("stroke-width", "3")
                .style("cursor", "pointer");

            this.currentHover = data;
        },
        mouseoutNode(svgElement, data, index) {
            d3.select(svgElement)
                .select("circle")
                .transition()
                .duration(500)
                .attr("opacity", "1.0")
                .attr("stroke-width", this.strokeWidth);
            this.currentHover = null;
        },
        dragStartedNode(d, i) {
            d3.select("#canvas-382d3")
                .append("line")
                .attr("id", "drag-line")
                .attr("stroke", "#3F3F3F")
                .attr("stroke-opacity", "0.8")
                .attr("stroke-width", this.strokeWidth)
                .attr("x1", d.x)
                .attr("y1", d.y)
                .attr("x2", d.x)
                .attr("y2", d.y);
        },
        draggedNode(d, i) {
            d3.select("#drag-line")
                .attr("x2", d3.event.x)
                .attr("y2", d3.event.y);
        },
        dragEndedNode(d, i) {
            d3.select("#drag-line").remove();

            if (this.currentHover !== null) {
                this.addLink(d, this.currentHover);
            }
        },
        mouseOverLink(svgNode, d, i) {
            let link = d3.select(svgNode);
            link.raise()
                .select("line")
                .transition()
                .duration(100)
                .attr("stroke", "#881109")
                .attr("stroke-width", "3px");

            link.select("text")
                .transition()
                .duration(100)
                .attr("fill", "#881109")
                .attr("font-size", "20px");
        },
        mouseOutLink(svgNode, d, i) {
            let link = d3.select(svgNode);

            link.lower()
                .select("line")
                .transition()
                .duration(500)
                .attr("stroke", "#3F3F3F")
                .attr("stroke-width", this.strokeWidth);

            link.select("text")
                .transition()
                .duration(100)
                .attr("fill", "#3F3F3F")
                .attr("font-size", "16px");
        },
        clickNode(svgNode, d, i) {
            this.clickCoord = { x: d.x, y: d.y };
            console.log("Click", [d.x, d.y]);

            // If the node is clicked, checked if the last clicked Node was also a Node.
            this.showFloatingMenu = true;
            this.clickedElement = { type: "node", data: d };
        },
        clickLink(svgNode, d, i) {
            let x = (d.source.x + d.target.x) / 2.0;
            let y = (d.source.y + d.target.y) / 2.0;

            this.clickCoord = { x: x, y: y };

            this.showFloatingMenu = true;
            this.clickedElement = { type: "link", data: d };
        },
        ticked() {
            let nodeOptions = this.getDefaultNodeOptions;
            nodeOptions.removeExitNodes = true;
            GraphCanvasUtil.drawCircularNodes(
                this.simulation.nodes(),
                this.getDefaultNodeOptions
            );

            let linkOptions = this.getDefaultLinkOptions;
            linkOptions.removeExitLinks = true;
            GraphCanvasUtil.drawLinksGraph(
                this.simulation.force("link").links(),
                linkOptions
            );
        },
        traverse() {
            setTimeout(() => {
                //nodeIds, parentGroup, fadeOutAtEnd, selectionId, ringColor, transitionTime, collector = null
                let nodeKeys = [];
                let vertices = this.graph.vertices();
                vertices.forEach(node => {
                    d3.select("#canvas-382d3")
                        .append("circle")
                        .attr("cx", node.x)
                        .attr("cy", node.y)
                        .attr("r", this.nodeRadius)
                        .attr("stroke", "#AB0505")
                        .attr("stroke-width", "3px")
                        .attr("fill", "none");
                });
                // let parentGroup = d3.select("#canvas-382d3");
                // GraphCanvasUtil.traverseCircularNodesById(
                //     nodeIds,
                //     parentGroup,
                //     true,
                //     "aa-selection-ring",
                //     "#AB0505",
                //     600,
                //     null
                // );
            }, 5000);
        }
    },

    watch: {
        showFloatingInput: function(newValue) {
            if (newValue === true) {
                this.showFloatingMenu = false;
            } else {
                this.floatingInputErrorMsg = "";
            }
        },
        showFloatingMenu: function(newValue) {
            if (newValue === true) {
                this.showFloatingInput = false;
            }
        }
    },
    mounted() {
        // this.traverse();
    },
    created() {
        this.simulation = null;

        this.graph = new Graph();

        // this.graph.link(12, 10, null);
        // this.graph.link(20, 25, null);
        // this.graph.link(20, 30, null);
        // this.graph.link(20, 50, null);
        // this.graph.link(30, 12, null);
        // this.graph.link(30, 25, null);
    },
    components: {
        "drawing-board-fluid": DrawingBoardFluid,
        "floating-input-box": FloatingInputBox,
        "floating-menu": FloatingMenu,
        "input-data-list": InputDataList,
        "aa-modal-box": Modal
    }
};
</script>
<style scoped>
.node:hover {
    cursor: pointer;
}
/* 
#aa-graph-canvas {
    z-index: -1;
} */
</style>
