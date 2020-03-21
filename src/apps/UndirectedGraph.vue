<template>
    <div class="container-fluid h-100 pt-2 pb-2 mt-4" style="position:relative;">
        <b-row class="h-100">
            <div class="col-lg-9 col-md-8 col-sm-7 h-100">
                <floating-menu
                    v-if="showFloatingMenu"
                    :menuItems="floatingMenuItems"
                    :coords="clickCoord"
                    @on-item-selected="onFloatingMenuInput"
                ></floating-menu>
                <floating-input-box
                    v-if="showFloatingInput"
                    :coords="{x: clickCoord.x, y:clickCoord.y - 50}"
                    :errorMsg="floatingInputErrorMsg"
                    @on-user-input="onFloatingBoxInput"
                    @on-dialog-close="showFloatingInput = false"
                ></floating-input-box>
                <drawing-board-fluid
                    class="aa-graph-canvas"
                    id="canvas-382d3"
                    bgcolor="#fff9fb"
                    @on-canvas-click="onCanvasClick"
                    @on-canvas-ready="onCanvasReady"
                ></drawing-board-fluid>
            </div>
            <div class="col-lg-3 col-md-4 col-sm-5">
                <operation-panel name="Graph Operations"></operation-panel>
            </div>
        </b-row>
    </div>
</template>
<script>
/* eslint-disable no-unused-vars */
/* eslint-disable no-debugger */
import * as d3 from "d3";
import DrawingBoardFluid from "@/components/DrawingBoardFluid.vue";
import OperationPanel from "../components/UIComponents/OperationPanel.vue";
import FloatingInputBox from "../components/UIComponents/FloatingInputBox.vue";
import FloatingMenu from "../components/UIComponents/FloatingMenu.vue";
import { Graph } from "../model/Graph";
import { GraphCanvasUtil } from "../util/GraphCanvasUtil";
import { watch } from "fs";
export default {
    name: "UndirectedGraph",
    data: function() {
        return {
            canvasHeight: Number,
            canvasWidth: Number,
            nodeRadius: 25.0,
            strokeWidth: "2px",
            currentHover: null,

            //Floating Input
            clickCoord: { x: 0, y: 0 },
            floatingInputErrorMsg: "",
            showFloatingInput: false,
            showFloatingMenu: false,
            floatingMenuItems: ["Delete"],

            //This is an object that contains the name of the
            //clicked element and the data they represent. It can have
            //the following possible values:
            //1. {type: "canvas", data:null} (canvas does not represent a data)
            //2. {type: "node", data: Object}
            //3. {type: "link", data: Object}
            clickedElement: {} //Possible values: canvas, link, node
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
            opt["fill"] = "#74DB86";
            opt["font-size"] = `16px`;
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
        }
    },
    methods: {
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
                case "link":
                    // this.addWeight(data);
                    this.floatingInputErrorMsg = "";
                    break;
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
                    if (data === "Delete") {
                        this.deleteNode(this.clickedElement.data);
                    }
            }

            this.showFloatingMenu = false;
        },

        onCanvasReady(dimension) {
            this.canvasHeight = dimension.height;
            this.canvasWidth = dimension.width;

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
            this.graph.link(source.key, target.key, 5);

            this.simulation
                .force("link")
                .links()
                .push({ source: source, target: target });

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
                .duration(300)
                .attr("opacity", "0.9")
                .attr("stroke-width", "3")
                .style("cursor", "pointer");

            this.currentHover = data;
        },
        mouseoutNode(svgElement, data, index) {
            d3.select(svgElement)
                .select("circle")
                .transition()
                .duration(300)
                .attr("opacity", "1.0")
                .attr("stroke-width", this.strokeWidth);
            this.currentHover = null;
        },
        dragStartedNode(d, i) {
            d3.select("svg")
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
            d3.select(svgNode)
                .raise()
                .select("line")
                .transition()
                .duration(300)
                .attr("cursor", "pointer")
                .attr("stroke-width", "4px");
            // .raise();
        },
        mouseOutLink(svgNode, d, i) {
            d3.select(svgNode)
                .lower()
                .select("line")
                .transition()
                .duration(300)
                .attr("stroke-width", this.strokeWidth);
        },
        clickNode(svgNode, d, i) {
            this.clickCoord = { x: d.x, y: d.y };
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
        onUserInput: function(data) {},
        ticked() {
            // GraphCanvasUtil.drawCircularNodes()

            // let u = d3
            //     .select("svg")
            //     .selectAll(".node")
            //     .attr("cx", d => {
            //         return d.x;
            //     })
            //     .attr("cy", d => d.y);

            // let u = d3
            //     .select("svg")
            //     .selectAll(".node")
            //     .attr("transform", d => {
            //         // console.log("####", JSON.stringify(d));
            //         return `translate(${d.x}, ${d.y})`;
            //         // return d.x;
            //     });
            // .attr("cy", d => d.y);

            // u.exit().remove();
            let nodeOptions = this.getDefaultNodeOptions;
            nodeOptions.removeExitNodes = true;
            GraphCanvasUtil.drawCircularNodes(
                this.simulation.nodes(),
                this.getDefaultNodeOptions
            );

            // ----------------
            // let lu = d3
            //     .select("svg")
            //     .selectAll(".link")
            //     .attr("x1", d => {
            //         return d.source.x;
            //     })
            //     .attr("y1", d => d.source.y)
            //     .attr("x2", d => d.target.x)
            //     .attr("y2", d => d.target.y);

            let linkOptions = this.getDefaultLinkOptions;
            linkOptions.removeExitLinks = true;
            GraphCanvasUtil.drawLinksGraph(
                this.simulation.force("link").links(),
                linkOptions
            );
        },
        traverse() {
            setTimeout(() => {
                // console.log("##");
                //nodeIds, parentGroup, fadeOutAtEnd, selectionId, ringColor, transitionTime, collector = null
                let nodeKeys = [];
                let vertices = this.graph.vertices();
                vertices.forEach(node => {
                    d3.select("svg")
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

        this.graph.add(10);
        this.graph.add(12);
        this.graph.add(20);
        this.graph.add(25);
        this.graph.add(30);
        this.graph.add(50);

        // this.graph.link(12, 10, null);
        // this.graph.link(20, 25, null);
        // this.graph.link(20, 30, null);
        // this.graph.link(20, 50, null);
        // this.graph.link(30, 12, null);
        // this.graph.link(30, 25, null);
    },
    components: {
        "drawing-board-fluid": DrawingBoardFluid,
        "operation-panel": OperationPanel,
        "floating-input-box": FloatingInputBox,
        "floating-menu": FloatingMenu
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
