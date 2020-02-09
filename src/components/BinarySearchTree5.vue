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
            <b-button squared variant="outline-danger" @click="remove"
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
import { BST } from "@/model/bst";
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

      animationTimePrimary: 1000

      //All the non reactive properties are defined in the created() lifecycle hook
    };
  },
  methods: {
    // insert: function(data) {
    //   // Traverse to the to-be parent node of the node that will hold this data
    //   let node = bst.insert();

    //   //Insert Leaf Node
    //   this.insertLeafNode(node);

    //   //Redraw the tree
    //   this.drawTree();
    // },

    insert: async function() {
      if (this.newNumber === "") {
        this.insertError = true;
        return;
      }
      this.newNumber = parseInt(this.newNumber);

      // await this.insertNodeToTree(this.newNumber);
      let node = this.bst.insert(this.newNumber);
      debugger;
      this.resizeTree();

      this.newNumber = "";
      this.insertError = false;
    },
    remove: function(data) {}
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
    this.canvasWidth = 400;

    // initial width of the tree. After each subsequent insert and deletes, this should
    // increase or decrease by heightIncrement value declared below
    this.canvasHeight = 80;
    this.linkLength = 150;

    this.padding = 50; // padding between the svg element and the first group element
    this.widthIncrement = 50;
    this.heightIncrement = 150;

    //Keeps track of the height of the tree. This determines whether the size of the canvas should be increased or decreased
    //We start with negative height, meaning there is no root node yet. Note: this is not the height of the tree in pixels. This
    //is the number of nodes from root to the farthest leaf
    this.treeHeight = -1;

    this.bst = new BST();
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
