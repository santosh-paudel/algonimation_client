/* eslint-disable no-console */
<template>
    <div id="aa-bstree-canvas"></div>
</template>

<script>
import * as d3 from "d3";
export default {
    name: "BinarySearchTree",
    data: function() {
        //To actually be able to display anything with three.js, we need three things: scene, camera and renderer, so that we can render the scene with camera.
        //So, declare them here so that they can be referenced anywhere in this component
        return {
            dims: { height: 500, width: 1110 }
        };
    },
    methods: {},
    mounted() {
        let data = [
            { department: "IT", name: "Yoshi", parent: "" },
            { department: "IT", name: "Mario", parent: "Yoshi" },
            { department: "Business", name: "Santosh", parent: "Yoshi" },
            { department: "IT", name: "Bob", parent: "Santosh" },
            { department: "Finance", name: "Marley", parent: "Santosh" }
        ];

        let dims = this.dims;
        const svg = d3
            .select("#aa-bstree-canvas")
            .append("svg")
            .attr("color", "green")
            .attr("width", dims.width + 100)
            .attr("height", dims.height + 100);

        const graph = svg.append("g").attr("transform", "translate(50,50)");

        //data strat
        const stratify = d3
            .stratify()
            .id(d => d.name)
            .parentId(d => d.parent);

        const tree = d3.tree().size([dims.width, dims.height]);

        const color = d3.scaleOrdinal([
            "#f4511e",
            "#e53935",
            "#e53935",
            "#9c27b0"
        ]);

        color.domain(data.map(item => item.department));

        //update functions
        //get updated root Node data
        const rootNode = stratify(data);
        // console.log(rootNode);

        const treeData = tree(rootNode);

        //get nodes selection and join data
        const nodes = graph.selectAll(".node").data(treeData.descendants());

        //get link selection and join data
        const links = graph.selectAll(".link").data(treeData.links());

        links
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("fill", "none")
            .attr("stroke", "#aaa")
            .attr("stroke-width", 2)
            .attr(
                "d",
                d3
                    .linkVertical()
                    .x(d => d.x)
                    .y(d => d.y)
            );

        //create enter node groups
        const enterNodes = nodes
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.x}, ${d.y})`);

        //append rect to enter nodes
        enterNodes
            .append("rect")
            .attr("fill", d => color(d.data.department))
            .attr("stroke", "#555")
            .attr("stroke-width", 2)
            .attr("height", 50)
            .attr("width", d => d.data.name.length * 20)
            .attr("transform", d => {
                let x = d.data.name.length * 10;
                return `translate(${-x},-25)`;
            });

        enterNodes
            .append("text")
            .attr("text-color", "middle")
            .attr("fill", "white")
            .text(d => d.data.name);

        // console.warn(data);
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#aa-bstree-canvas {
    margin-top: 50px;
}
</style>
