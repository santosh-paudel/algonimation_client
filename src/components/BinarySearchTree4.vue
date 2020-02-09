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
  name: "BinarySearchTree4",
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

      let width = this.canvasWidth - this.padding - this.nodeRadius - 2; //2 is for stroke width
      let height = this.canvasHeight - this.padding - this.nodeRadius - 2; //2 is for stroke height
      this.tree = d3.tree().size([width, height]);
    },

    insert: async function() {
      if (this.newNumber === "") {
        this.insertError = true;
        return;
      }
      this.newNumber = parseInt(this.newNumber);

      await this.insertNodeToTree(this.newNumber);
      debugger;
      this.resizeTree();

      this.newNumber = "";
      this.insertError = false;
    },
    remove: async function() {},

    //1. Traverse to the possible parent of the node
    //   that will contain the data (vm.newNumber)
    async insertNodeToTree(data) {
      const parentNode = await this.traverseToNode(data, "INSERT");

      await this.insertLeafNode(parentNode, data);
    },

    /**
     * Given the data, this method traverses to the Node in the DOM that
     * contains the given Data. Whether the node is found or not, it returns
     * the parent object of the Node containing the data
     * @param {Integer} data the data that should be traversed to in the tree
     * @param {string} mode this has two possible values:
     *    1. FIND
     *        If the traversal is done in FIND mode, the traversal stops the moment a node
     *        is found that contains the given data. For example: If there leaf nodes contains
     *        a number "3", then, the traversal stops on the first one.
     *    2. INSERT
     *        If the traversal is done in INSERT mode, the traversal stops after the last
     *        node containing that data is found
     * @return {object} parent object (i.e parent Node) of the node that contains the data that was passed
     *      to the parameter
     */
    async traverseToNode(data, mode) {
      //If there is no tree yet, the data does not

      if (this.rootNode === undefined) return undefined;

      // Define the target data. Target data is the data (contained in the node), which if found, the traversal
      // must stop. In case of INSERT, there is no target data (i.e., we must traverse untill we reach the leaf node). In
      // case of FIND, the traversal must stop when the first node containing the data is found
      let targetData = mode === "INSERT" ? undefined : data;
      let found = false;
      let parentNode = this.rootNode;
      while (found === false) {
        const nextNode = this.getNextNode(data, parentNode);

        if (nextNode === null) break;

        if (nextNode.data.data === targetData) {
          found = true;
        } else {
          parentNode = nextNode;
        }
      }

      return parentNode;
    },
    async insertLeafNode(parentNode, data) {
      const vm = this;
      let newNode = this.createNode(parentNode, data);

      //If parentNode is not defined, we know that this node will be the root Node of the tree
      if (parentNode === undefined) {
        this.hierarchicalData = newNode.data;
        vm.rootNode = vm.tree(newNode);
        vm.drawNewNode(vm.rootNode.descendants(), ".node");
      } else {
        // Determine if the new node is going to be the left or the right child of the parent Node.
        // If it's value is less than or equal to the parent node, it is going to be on the left
        // If it's value is greater than the parent node, it is going to be on the right
        let children = [newNode.data];
        if (newNode.data.data <= parentNode.data.data) {
          if (parentNode.rightChild() !== null) {
            children = [newNode.data, parentNode.rightChild()];
          }
        } else {
          if (parentNode.leftChild() !== null) {
            children = [parentNode.leftChild(), newNode.data];
          }
        }
        // parentNode.children = children;
        parentNode.children = children;

        debugger;
        await vm.drawNewNode([newNode], null);
        await vm.drawNewLink([parentNode, newNode], null);

        //Update nodes
        this.hierarchicalData = d3.hierarchy(this.hierarchicalData);
        vm.rootNode = vm.tree(this.hierarchicalData);

        let p1 = vm.drawNewNode(vm.rootNode.descendants(), ".node");
        let p2 = vm.drawNewLink(vm.rootNode, ".link");
        await Promise.all([p1, p2]);
      }
    },

    /**
     * Given the root node (which is not necessarily the root of the tree. rootNode in this parameter,
     * just means the current node that is being visited), this method returns one of the three things
     * 1. null if
     *      a. If rootNode has no children
     *      b. If data is less than or equal to the data of rootNode and the left child has value NaN
     *      c. If the data is more than the data of rootNode and the right child has value Nan
     * 2. left Node if
     *      a. If the data is less than or equal to the data of root node
     * 3. right node if
     *      b. If the data is more than the data of right node
     */
    getNextNode(data, parentNode) {
      let children = parentNode.children;

      //If rootNode has no children, return undefined
      if (children === undefined) return null;
      else if (data <= parentNode.data.data) {
        return parentNode.leftChild();
      } else if (data > parentNode.data.data) {
        return parentNode.rightChild();
      }
    },

    /**
     * Given the data and parentNode (in parameter), this function creates
     * a new node and assigns it data, children, height, depth attribute
     * appropriately. If no parent exist, it creates a new node as though
     * it were the root node of the tree
     * @param {object} parentNode object representing the parent node of the
     * @param {Integer} data that be assigned to the node
     *    node that this function is just about to create
     */
    createNode(parentNode, data) {
      let newNode = d3.hierarchy({ data: data, children: [] }, d => d.children);
      //If it does not have a parent node, then we know that it is a root node
      if (parentNode === undefined) {
        newNode.depth = 0;
        newNode.height = 0;
      } else {
        newNode.depth = parentNode.depth + 1;
        newNode.height = parentNode.height - 1;
        newNode.parent = parentNode;
        newNode.y = parentNode.y + this.linkLength;
        newNode.x = this.computeXCoordinate(newNode);
      }
      newNode.data.id = this.getNodeId(newNode);

      newNode.leftChild = function() {
        if (newNode.children === undefined) return null;

        //If it has 2 children, we know the first child is the left child
        if (newNode.children === 2) {
          return newNode.children[0].data;
        }

        // If it has only one child, then, we need to determine the value of that child
        // If the value of that child is less than or equal to parent's, we know it's the left child
        // Otherwise, it's the right child
        if (newNode.children[0].data.data <= newNode.data.data)
          return newNode.children[0].data;

        //Otherwise, return null, meaning there is no left child
        return null;
      };

      newNode.rightChild = function() {
        if (newNode.children === undefined) return null;

        //If it has 2 children, we know the first child is the left child
        if (newNode.children === 2) {
          return newNode.children[1].data;
        }

        // If it has only one child, then, we need to determine the value of that child
        // If the value of that child is greater than that of the parent, we know it's the left child
        // Otherwise, it's the right child
        if (newNode.children[0].data.data > newNode.data.data)
          return newNode.children[0].data;

        //Otherwise, return null, meaning there is no left child
        return null;
      };

      return newNode;
    },

    async animateTraversal(childNode) {},
    goToNode(nodes, currentIndex) {
      let vm = this;
      if (currentIndex > 0) {
        let currentNode = nodes[currentIndex];

        d3.select("#aa-selection-ring")
          .transition()
          .duration(1000)
          .attr("transform", `translate(${-currentNode.x},${currentNode.y})`)
          .on("end", function() {
            let nextNodeIndex = --currentIndex; //Note: don't put -- after the variable as it does not immediately change the value of this expression
            vm.goToNode(nodes, nextNodeIndex);
          });
      }
      // }
    },

    /**
     * When adding new Nodes, it is relatively straight forward to determine
     * it's y coordinate since a node's y coordinate is it's parent's y coordinate
     * plus the link length. However, determining it's x coordinate is a little
     * more invovled. We follow the following rules to compute a node's x coordinate:
     * 1. The node is the left child of it's parent, and it's parent is the right child of it's parent
     *    (i.e. the new node's grandparent)
     *            8
     *             \
     *              10
     *              /
     *             5
     *    In this case, the node's x coordinate is going to be the same as it's grandparent's x coordinate
     *
     * 2. The node is the right child of it's parent, and it's parent is also the right child of it's parent
     *      8
     *       \
     *        10
     *         \
     *          12
     *  In this case, the node's x coordinate is it's parent's x coordinate plus the difference between
     *  the x coordinate between it's parent and grandparent
     *
     * 3. The node is the right child of it's parent, and it's parent is the left child of it's parent
     *
     *      8
     *     /
     *    5
     *     \
     *      7
     * In this case, follow rule no. 1
     *
     * The node is the left child of it's parent, and it's parent is also the left child of it's parent
     *      8
     *     /
     *    5
     *   /
     *  4
     * In this case, follow rule no. 2
     */
    computeXCoordinate(node) {
      if (node.parent === null) {
        throw Error("The node needs to have a parent to compute x coordinate");
      }

      // If this node's grandparents don't exist, we know this is the node
      // at height 1. For this node:
      // If the node's value is less than or equal to it's parents:
      //    If it's right sibling exists:
      //        assign the x coordinate equal to parent.x - (rightSibling.x - parent.x)
      //    Else assign some arbitary value that makes it appear on left
      // Else:
      //    If it's left sibling exists:
      //      assign the x coordinate equal to parent.x + (parent.x - leftChild.x)
      //    Else assign some arbitary value that makes it appear on right

      if (node.parent.parent === null) {
        if (node.data.data <= node.parent.data.data) {
          return node.parent.rightChild() === null
            ? node.parent.x - 100
            : node.parent.x - (node.parent.rightChild().x - node.parent.x);
        } else {
          return node.parent.leftChild() === null
            ? node.parent.x + 100
            : node.parent.x + (node.parent.x - node.parent.leftChild().x);
        }
      } else if (node.data.data <= node.parent.data.data) {
        return node.parent.x - Math.abs(node.parent.x - node.parent.parent.x);
      } else {
        return node.parent.x + Math.abs(node.parent.x - node.parent.parent.x);
      }
    },

    /**
     * This method resizes the layout of the tree. Why do we need to do this?
     * Well, every time a new node is added or a node is removed, the length
     * and width of the tree may change depending on where the nodes are added. Resizing the tree when a new node is added
     * prevents the node from overflowing the canvas. Resizing the tree when a node is removed
     * prevents the nodes from spreading too far from each other.
     */
    resizeTree() {
      let treeHeightChanged = false;

      //If the tree height is greater than current value, we know tree height increased
      if (this.rootNode.height > this.treeHeight) {
        treeHeightChanged = true;
        this.treeHeight = this.rootNode.height;
        this.canvasWidth += this.widthIncrement;
        this.canvasHeight += this.heightIncrement;
      }
      // If the tree height is less than current value, we know tree height decreased
      else if (this.rootNode.height < this.treeHeight) {
        treeHeightChanged = true;
        this.treeHeight = this.rootNode.height;
        this.canvasWidth -= this.widthIncrement;
        this.canvasHeight -= this.heightIncrement;
      }

      //else: if the heights match, we know tree height did not change. In this case, we don't need to resize the tree

      if (treeHeightChanged) {
        let widthInPixels =
          this.canvasWidth - this.padding - this.nodeRadius - 2; //2 is for stroke width
        let heightInPixels =
          this.canvasHeight - this.padding - this.nodeRadius - 2; //2 is for stroke height
        this.tree = d3.tree().size([widthInPixels, heightInPixels]);
      }
    },

    /**
     * Draws nodes using the specified selection String.
     * If no selectionString is passed, it tries to use the "id" field of the node's
     * data object. If id is undefined, it throws an exception
     */
    async drawNewNode(nodes, selectionString) {
      let vm = this;

      if (selectionString === null || selectionString === undefined) {
        nodes.forEach((node, index) => {
          if (node.data.id === undefined) {
            throw Error(
              `selectionString not provided, and did not find id field in the node ${node}`
            );
          }

          selectionString += `node-${node.data.data}-depth-${node.depth}`;
          if (index < nodes.length - 1) {
            selectionString += ", ";
          }
        });
      }

      let updateNodes = vm.graph.selectAll(selectionString).data(nodes);

      const enterNode = updateNodes
        .enter()
        .append("g")
        .attr("id", d => {
          return d.data.id;
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

      enterNode
        .append("circle")
        // .attr("cx", vm.rootOffsetX)
        // .attr("cy", vm.rootOffsetY)
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
        .text(d => {
          return d.data.data;
        });

      await enterNode
        .merge(updateNodes)
        .transition()
        .delay(vm.animationTimePrimary)
        .transition()
        .duration(vm.animationTimePrimary)
        .attr("transform", function(d) {
          return `translate(${d.x},${d.y})`;
        })
        .end();

      updateNodes.exit().remove();
    },

    /**
     * This method draws links between various nodes given all the parameters. Both the parameters
     * can have conditional values, i.e. The first parameter, node, can either be an array or a single parent node
     * such as root node.
     * 1. If node is an array
     * 		If node is an array, a link is drawn between each item in the array in increasing order of their index.
     * 		For example: if node = [node1, node2, node3], a link is drawn a such node1 ---> node2 ---> node3
     * 2. If the node is an object (i.e a parent node)
     * 		If node is a parent node, a link is drawn between all it's descendants (including itself)
     *
     * The second parameter, selectionString can be either null or a string that can be used to query the DOM
     * 	1. If selectionString is null:
     * 		If the selectionString is null, it almost always means a new link is drawn (as opposed to updating the link).
     * 		In such cases, selectionString is assigned a unique id which is derived based on nodes that form the link.
     * 2. If selectionString is not null
     * 		In this case, it almost always means existing links are being updated.
     *
     * @param node This can be a single parent node (for example root node) or an array of nodes.
     * @selectionString This can be either null or a string that can be used to query DOM (for example classes, elements and ids)
     */
    async drawNewLink(node, selectionString) {
      let vm = this;
      debugger;

      let links;
      if (Array.isArray(node)) {
        if (node.length % 2 != 0)
          throw Error(
            "If you passed an array to draw links, you should have an even number of elements\
					in the array. The elements are then paired to form the link"
          );

        links = node.slice(1);
      } else {
        links = node.descendants().slice(1);
      }

      if (selectionString === null) {
        selectionString = "";
        links.forEach((node, index) => {
          selectionString += `#${vm.getLinkId(node.parent, node)}`;

          if (index < links.length - 1) {
            selectionString += ", ";
          }
        });
      }
      const updateLinks = d3
        .select(".aa-graph")
        .selectAll(selectionString)
        .data(links);
      let enterLinks = updateLinks
        .enter()
        .append("line")
        .attr("id", function(d) {
          return vm.getLinkId(d.parent, d);
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

      await enterLinks
        .merge(updateLinks)
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
        })
        .end();
    },

    getLinkId(parentNode, childNode) {
      return `link-${parentNode.data.data}-depth-${parentNode.depth}-to-${childNode.data.data}-depth-${childNode.depth}`;
    },
    getNodeId(node) {
      return `node-${node.data.data}-depth-${node.depth}`;
    }
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
/* #aa-bst-canvas {
} */

.aa-container {
  width: 100%;
}

.aa-config-row {
  height: 100px;
  border-bottom: 1px solid #f14a60;
}
</style>
