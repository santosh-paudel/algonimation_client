<template>
	<div class="container h-100 pt-2 pb-2">
		<drawing-board-fluid
			id="aa-graph-canvas"
			bgcolor="#fff9fb"
			@on-canvas-ready="onCanvasReady"
		></drawing-board-fluid>
	</div>
</template>
<script>
/* eslint-disable no-unused-vars */
/* eslint-disable no-debugger */
import * as d3 from "d3";
import DrawingBoardFluid from "@/components/DrawingBoardFluid.vue";
export default {
	name: "GraphTheory",
	data: function() {
		return {
			canvasHeight: Number,
			canvasWidth: Number,
			nodeRadius: 25.0,
			currentHover: null
		};
	},
	methods: {
		onCanvasReady(dimension) {
			this.canvasHeight = dimension.height;
			this.canvasWidth = dimension.width;

			this.initGraph();
		},

		initGraph() {
			// let nodes = [{}, {}, {}, {}, {}];

			this.simulation = d3
				.forceSimulation(this.nodes)
				.force("charge", d3.forceManyBody().strength(30))
				.force(
					"center",
					d3.forceCenter(this.canvasWidth / 2, this.canvasHeight / 2)
				)
				.force(
					"link",
					d3
						.forceLink()
						.links(this.links)
						.id(d => {
							return d.id;
						})
						.distance(100)
					// .strength(0)
				)
				.force("collide", d3.forceCollide().radius(this.nodeRadius * 2))
				.on("tick", this.ticked);

			this.restart(
				this.simulation.nodes(),
				this.simulation.force("link").links()
			);
		},
		restart(nodes, links) {
			const vm = this;
			let svgNodes = d3
				.select("svg")
				.selectAll(".node")
				.data(nodes);
			svgNodes
				.enter()
				.append("circle")
				.attr("r", this.nodeRadius)
				.attr("class", "node")
				.attr("fill", this.generateColor())
				.attr("stroke", "#747474")
				.attr("stroke-width", "0px")
				.style("cursor", "pointer")
				.attr("cx", d => {
					// debugger;
					return d.x;
				})
				.attr("cy", d => d.y)
				.on("mouseover", function(d, i) {
					d3.select(this)
						.transition()
						.duration(300)
						.attr("opacity", "0.9")
						.attr("stroke-width", "1px");
					vm.currentHover = d;
				})
				.on("mouseout", function(d, i) {
					d3.select(this)
						.transition()
						.duration(300)
						.attr("opacity", "1.0")
						.attr("stroke-width", "0px");
					vm.currentHover = null;
				})
				.call(
					d3
						.drag()
						.on("start", this.dragStarted)
						.on("drag", this.dragged)
						.on("end", this.dragEnded)
				);

			let lu = d3
				.select("svg")
				.selectAll(".link")
				.data(links);

			lu.enter()
				.append("line")
				.attr("class", "link")
				.attr("stroke", "#000000")
				.attr("stroke-width", "2px")
				.attr("stroke-opacity", 1.0)
				.attr("x1", d => d.source.x)
				.attr("y1", d => d.source.y)
				.attr("x2", d => d.target.x)
				.attr("y2", d => d.target.y)
				.lower();

			this.simulation.nodes(nodes);
			// debugger;
			this.simulation
				.alpha(0.2)
				.force("centerX", d3.forceX(this.canvasWidth / 2))
				.force("centerY", d3.forceY(this.canvasHeight / 2))
				.restart();
		},
		dragStarted(d, i) {
			// debugger;
			d3.select("svg")
				.append("line")
				.attr("id", "drag-line")
				.attr("stroke", "#3F3F3F")
				.attr("stroke-opacity", "0.8")
				.attr("stroke-width", "2px")
				.attr("x1", d.x)
				.attr("y1", d.y)
				.attr("x2", d.x)
				.attr("y2", d.y);
		},
		dragged(d, i) {
			d3.select("#drag-line")
				.attr("x2", d3.event.x)
				.attr("y2", d3.event.y);
		},
		dragEnded(d, i) {
			d3.select("#drag-line").remove();
			debugger;

			if (this.currentHover !== null) {
				this.simulation
					.force("link")
					.links()
					.push({ source: d, target: this.currentHover });
			}

			this.restart(
				this.simulation.nodes(),
				this.simulation.force("link").links()
			);
		},
		ticked() {
			let u = d3
				.select("svg")
				.selectAll(".node")
				.attr("cx", d => {
					return d.x;
				})
				.attr("cy", d => d.y);

			// u.exit().remove();

			// ----------------
			let lu = d3
				.select("svg")
				.selectAll(".link")
				.attr("x1", d => {
					return d.source.x;
				})
				.attr("y1", d => d.source.y)
				.attr("x2", d => d.target.x)
				.attr("y2", d => d.target.y);
		},
		generateColor() {
			let colors = [
				"#81F495",
				"#7A306C",
				"#A4C2A5",
				"#1CCAD8",
				"#F2A359",
				"#A4031F"
			];

			let randNum = Math.floor(Math.random() * 10);
			return colors[randNum % colors.length];
		}
	},
	mounted() {
		let vm = this;
		d3.select("#aa-graph-canvas").on("click", function() {
			//Don't add any nodes if the mouse is currently hovering over a node
			if (vm.currentHover !== null) return;

			let coords = d3.mouse(this);

			let node = {
				id: "Santosh",
				group: 1,
				x: coords[0],
				y: coords[1]
			};
			vm.simulation.nodes().push(node);
			// vm.simulation.links().push({

			// })
			vm.simulation.nodes().forEach(function(target) {
				var x = target.x - node.x,
					y = target.y - node.y;
				if (Math.sqrt(x * x + y * y) < 30) {
					vm.simulation
						.force("link")
						.links()
						.push({ source: node, target: target });
				}
			});

			vm.restart(
				vm.simulation.nodes(),
				vm.simulation.force("link").links()
			);
		});
	},
	created() {
		this.nodes = [
			{ id: "Myriel", group: 1 },
			{ id: "Napoleon", group: 1 },
			{ id: "Mlle.Baptistine", group: 1 },
			{ id: "Mme.Magloire", group: 1 },
			{ id: "Geborand", group: 1 }
		];
		this.links = [
			{ source: "Napoleon", target: "Myriel", value: 1 },
			{ source: "Napoleon", target: "Geborand", value: 8 },
			{ source: "Mlle.Baptistine", target: "Myriel", value: 8 }
		];

		this.simulation = null;
	},
	components: {
		"drawing-board-fluid": DrawingBoardFluid
	}
};
</script>
<style scoped>
.node:hover {
	cursor: pointer;
}
</style>
