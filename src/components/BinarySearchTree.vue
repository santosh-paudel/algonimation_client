
<template>
    <div>
        <button id="add-child" disabled="disabled">Add Child</button>
        <button id="remove" disabled="disabled">Remove</button>
        <div id="aa-bstree-canvas"></div>
    </div>
</template>

<script>
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-debugger */
import * as d3 from "d3";
export default {
    name: "BinarySearchTree",
    data: function() {
        //To actually be able to display anything with three.js, we need three things: scene, camera and renderer, so that we can render the scene with camera.
        //So, declare them here so that they can be referenced anywhere in this component
        return {
            duration: 750
        };
    },
    methods: {
        update: function(source) {
            let treeData = this.treemap(this.root);

            //compute the new tree layout
            let nodes = treeData.descendants();
            let links = treeData.descendants().slice(1);

            //normalize for fixed-depth
            nodes.forEach(function(d) {
                d.y = d.depth * 180;
            });

            let link = this.svg.selectAll("line.link").data(links, function(d) {
                return d.id;
            });

            debugger;
            let linkEnter = link
                .enter()
                .append("line")
                .attr("class", "link")
                .attr("stroke-width", 2)
                .attr("stroke", "black")
                .attr("x1", function(d) {
                    return source.y0;
                })
                .attr("y1", function(d) {
                    return source.x0;
                })
                .attr("x2", function(d) {
                    return source.y0;
                })
                .attr("y2", function(d) {
                    return source.x0;
                });

            debugger;

            let linkUpdate = linkEnter.merge(link);

            linkUpdate
                .transition()
                .duration(this.duration)
                .attr("x1", function(d) {
                    return d.parent.y;
                })
                .attr("y1", function(d) {
                    return d.parent.x;
                })
                .attr("x2", function(d) {
                    return d.y;
                })
                .attr("y2", function(d) {
                    return d.x;
                });

            // Transition back to the parent element position
            // linkUpdate
            //     .transition()
            //     .duration(this.duration)
            //     .attr("x1", function(d) {
            //         return d.parent.y;
            //     })
            //     .attr("y1", function(d) {
            //         return d.parent.x;
            //     })
            //     .attr("x2", function(d) {
            //         return d.y;
            //     })
            //     .attr("y2", function(d) {
            //         return d.x;
            //     });

            // Remove any exiting links
            var linkExit = link
                .exit()
                .transition()
                .duration(this.duration)
                .attr("x1", function(d) {
                    return source.x;
                })
                .attr("y1", function(d) {
                    return source.y;
                })
                .attr("x2", function(d) {
                    return source.x;
                })
                .attr("y2", function(d) {
                    return source.y;
                })
                .remove();

            // ### CIRCLES
            // Update the nodes...
            var node = this.svg.selectAll("g.node").data(nodes, function(d) {
                this.i = this.i + 1;
                return d.id || (d.id = this.i);
            });

            // Enter any new modes at the parent's previous position.
            var nodeEnter = node
                .enter()
                .append("g")
                .attr("class", "node")
                .attr("transform", function(d) {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                })
                .on("click", this.click);

            // Add Circle for the nodes
            nodeEnter
                .append("circle")
                .attr("class", "node")
                .attr("r", 25)
                .style("fill", function(d) {
                    return "#0e4677";
                });

            // Update
            var nodeUpdate = nodeEnter.merge(node);
            // var nodeUpdate = nodeEnter;

            // Transition to the proper position for the node
            nodeUpdate
                .transition()
                .duration(this.duration)
                .attr("transform", function(d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            // Update the node attributes and style
            nodeUpdate
                .select("circle.node")
                .attr("r", 25)
                .style("fill", function(d) {
                    return "#0e4677";
                })
                .attr("cursor", "pointer");

            // Remove any exiting nodes
            var nodeExit = node
                .exit()
                .transition()
                .duration(this.duration)
                .attr("transform", function(d) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();

            // On exit reduce the node circles size to 0
            nodeExit.select("circle").attr("r", 0);

            // Store the old positions for transition.
            nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });

            // debugger;
        },
        click: function(d) {
            debugger;
            this.selected = d;
            document.getElementById("add-child").disabled = false;
            document.getElementById("remove").disabled = false;
            // this.update(d);
            document.getElementById("add-child").click();
        }
    },
    mounted() {
        var data = {
            type: "action",
            name: "1",
            attributes: [],
            children: [
                {
                    type: "children",
                    name: "2",
                    attributes: [
                        {
                            "source-type-property-value": "streetlight"
                        }
                    ],
                    children: [
                        {
                            type: "parents",
                            name: "3",
                            attributes: [
                                {
                                    "source-type-property-value": "cable"
                                }
                            ],
                            children: [
                                {
                                    type: "resource-delete",
                                    name: "4",
                                    attributes: [],
                                    children: []
                                }
                            ]
                        },
                        {
                            type: "children",
                            name: "5",
                            attributes: [
                                {
                                    "source-type-property-value": "lantern"
                                }
                            ],
                            children: []
                        }
                    ]
                }
            ]
        };

        // Set the dimensions and margins of the diagram
        let margin = { top: 20, right: 90, bottom: 30, left: 90 };
        let width = 960 - margin.left - margin.right;
        let height = 500 - margin.top - margin.bottom;

        this.svg = d3
            .select("#aa-bstree-canvas")
            .append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        this.treemap = d3.tree().size([height, width]);

        //Assign parent, children, height, depth
        this.root = d3.hierarchy(data, function(d) {
            return d.children;
        });
        this.root.x0 = height / 2;
        this.root.y0 = 0;

        this.update(this.root);

        let vm = this;
        document.getElementById("add-child").onclick = function() {
            console.log(vm.selected);
            //creates New OBJECT
            var newNodeObj = {
                type: "resource-delete",
                name: new Date().getTime(),
                attributes: [],
                children: []
            };
            //Creates new Node
            var newNode = d3.hierarchy(newNodeObj);
            newNode.depth = vm.selected.depth + 1;
            newNode.height = vm.selected.height - 1;
            newNode.parent = vm.selected;
            newNode.id = Date.now();

            if (!vm.selected.children) {
                vm.selected.children = [];
                vm.selected.data.children = [];
            }
            vm.selected.children.push(newNode);
            vm.selected.data.children.push(newNode.data);

            vm.update(vm.selected);
        };
    },
    created() {
        (this.dims = { height: 500, width: 1110 }),
            (this.treemap = undefined),
            (this.root = undefined),
            (this.svg = undefined),
            (this.selected = undefined),
            (this.i = 0);
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#aa-bstree-canvas {
    margin-top: 50px;
}
</style>
