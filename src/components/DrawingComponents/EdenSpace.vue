<template>
  <div class="d-flex flex-column">
    <b-row
      no-gutters
      class="w-100"
      v-if="nodes.length > 0"
      :style="{ transform: 'translate(0,-150%)', position: 'absolute' }"
    >
      <b-col cols="1">
        <b-button
          v-if="nodes.length > 0"
          variant="outline-secondary"
          size="sm"
          class="aa-clear-btn"
          @click="onClearEden"
          :style="{
            left: '0px',
            'background-color': this.bgcolor,
            'border-color': '#DEDEDE'
          }"
          >Clear</b-button
        >
      </b-col>
      <b-col cols="11">
        <hr-with-text :text="name"></hr-with-text>
      </b-col>
    </b-row>

    <svg
      id="aa-eden-space"
      class="aa-svg w-100"
      :style="{ 'background-color': bgcolor }"
    />
  </div>
</template>
<script>
/* eslint-disable no-unused-vars */
const uuidv4 = require("uuid/v4");
import * as d3 from "d3";
import HRWithText from "../UIComponents/HRWithText";
import { TreeCanvasUtil } from "../../util/canvasUtil/TreeCanvasUtil";
export default {
  name: "EdenSpace",
  props: {
    name: {
      type: String,
      required: true
    },
    nodes: {
      type: Array,
      required: true
    },
    bgcolor: {
      type: String,
      value: "#FFFFFF"
    }
  },
  data: function() {
    return {
      nodeRadius: 20,
      parentClass: "aa-eden",
      nodeClass: "eden-node",
      strokeWidth: 2,
      stroke: "#ba5274"
    };
  },
  watch: {
    nodes: {
      deep: true,
      handler: function() {
        // eslint-disable-next-line no-debugger
        debugger;
        if (this.nodes.length === 0) {
          d3.select(`.${this.parentClass}`)
            .selectAll(`.${this.nodeClass}`)
            .remove();
          return;
        }
        // eslint-disable-next-line no-debugger
        debugger;

        let vm = this;
        let data = d3
          .select(`.${this.parentClass}`)
          .selectAll(`.${this.nodeClass}`)
          .data();
        let startIndex = data.length - 1 < 0 ? 0 : data.length - 1;
        for (let i = startIndex; i < this.nodes.length; i++) {
          vm.addNode(this.nodes[i], i);
        }
      }
    }
  },
  methods: {
    addNode(data, index) {
      let node = {
        //The first part will be zero for the index 0
        x: index * this.nodeRadius * 3 + this.nodeRadius,
        y: this.strokeWidth * 2,
        data: { key: data, id: uuidv4() }
      };

      TreeCanvasUtil.drawCircularNodes([node], this.getDefaultNodeOptions());
    },
    getDefaultNodeOptions() {
      const opt = {};
      opt.parentClass = this.parentClass;

      //Class that should be assigned to the node
      opt.cssClass = this.nodeClass;
      opt.removeExitNodes = false;
      opt["stroke-width"] = `2px`;
      opt["stroke"] = this.stroke;
      opt["radius"] = `${this.nodeRadius}px`;
      opt["fill"] = "#FFFFFF";
      opt["font-size"] = `16px`;
      opt["font-color"] = "#000000";
      opt.fixedAtOrigin = false;
      opt.transitionTime = 100;
      return opt;
    },
    onClearEden() {
      d3.select(`.${this.parentClass}`)
        .selectAll(`.${this.nodeClass}`)
        .remove();
      this.$emit("on-clear-eden", true);
    }
  },
  mounted() {
    this.eden = d3
      .select("#aa-eden-space")
      .append("g")
      .attr("class", this.parentClass)
      .attr("transform", `translate(${this.nodeRadius}, ${this.nodeRadius})`);
  },
  components: {
    "hr-with-text": HRWithText
  }
};
</script>
<style scoped>
.aa-clear-btn:hover {
  color: #dedede;
}
</style>
