<!--Notes to myself:
1. Do not call d3.hierarchy in update function. It is expensive. Instead add data to hierarchy the moment a new number is entered. And,
    make data[] a hieararchical data in data function
2. -->
<template>
    <base-layout
        :userInstruction="userInstruction"
        :basicUserActions="[
            {name: 'Insert', inputRule: {type: 'integer', hint: 'E.g. 5' }}, 
            {name: 'Delete', inputRule: {type: 'integer', hint: 'E.g. 10' }},
            {name: 'Look Up', inputRule: {type: 'integer', hint: 'E.g. 12' }}
        ]"
        :randomizeBtn="{show:true, btnText:'Random Tree'}"
        :customUserActions="otherBstOperations"
        @on-rand-btn-click="generateRandomTree"
        @on-canvas-ready="onCanvasReady"
        @on-user-action="userAction($event.actionName, $event.userInput)"
    >
        <template v-slot:canvas-footer>
            <eden-space
                class="aa-eden-space"
                :nodes="edenNodes"
                :name="edenName"
                bgcolor="rgba(212, 114, 140, 0.03)"
                :style="{ height: `${edenHeight}px` }"
                @on-clear-eden="clearEden"
            ></eden-space>
        </template>
    </base-layout>
    <!-- <div class="container-fluid h-100 pb-sm-3 mt-5">
        <div class="row justify-content-center h-100">
            <div class="col-lg-9 col-md-8 col-sm-7 h-100" id="yellow">
                <div class="d-flex flex-column h-100" style="border: 1px solid rgba(90,90,90, 0.2)">
                    <div id="aa-bst-canvas" class="h-100">
                        <drawing-board-fluid
                            bgcolor="rgba(212, 114, 140, 0.03)"
                            @on-canvas-ready="onCanvasInit"
                        ></drawing-board-fluid>
                    </div>
                    <eden-space
                        class="aa-eden-space"
                        :nodes="edenNodes"
                        :name="edenName"
                        bgcolor="rgba(212, 114, 140, 0.03)"
                        :style="{ height: `${edenHeight}px` }"
                        @on-clear-eden="clearEden"
                    ></eden-space>
                </div>
            </div>

            <div class="col-lg-3 col-md-4 col-sm-5 aa-config-col">
                <p class="mt-2">Control Panel</p>
                <b-row class="mt-2">
                    <hr-with-text text="Animation Speed" class="col-sm-12"></hr-with-text>
                </b-row>
                <range-input @on-value-change="changeAnimationSpeed"></range-input>
                <b-row>
                    <hr-with-text text="Insert" class="col-sm-12"></hr-with-text>
                </b-row>
                <user-input-box
                    inputType="integer"
                    buttonLabel="Insert"
                    :disableInput="disableUserInteraction"
                    @on-user-input="userAction($event, 'insert')"
                ></user-input-box>
                <b-row>
                    <hr-with-text text="Delete" class="col-sm-12 mt-2"></hr-with-text>
                </b-row>
                <user-input-box
                    inputType="integer"
                    buttonLabel="Delete"
                    :disableInput="disableUserInteraction"
                    @on-user-input="userAction($event, 'delete')"
                ></user-input-box>
                <b-row>
                    <hr-with-text text="Visit" class="col-sm-12 mt-2"></hr-with-text>
                </b-row>
                <user-input-box
                    inputType="integer"
                    buttonLabel="Visit"
                    :disableInput="disableUserInteraction"
                    @on-user-input="userAction($event, 'visit')"
                ></user-input-box>
                <b-row>
                    <hr-with-text text="Other Operations" class="col-sm-12 mt-2"></hr-with-text>
                </b-row>
                <input-data-list
                    :dataList="otherBstOperations"
                    @on-item-selected="userAction($event, $event)"
                ></input-data-list>
            </div>
        </div>
    </div>-->
</template>
<script>
import * as d3 from "d3";
import { BstD3Wrapper } from "@/model/bstD3Wrapper.js";
import { TreeCanvasUtil } from "@/util/canvasUtil/TreeCanvasUtil.js";
// import DrawingBoardFluid from "@/components/commons/DrawingBoardFluid.vue";
// import HRWithText from "@/components/UIComponents/HRWithText.vue";
// import UserInputBox from "@/components/UserInputBox.vue";
// import RangeInput from "@/components/RangeInput";
// import InputDataList from "@/components/UIComponents/InputDataList.vue";
import EdenSpace from "@/components/DrawingComponents/EdenSpace.vue";
import BaseLayout from "@/components/commons/BaseLayout.vue";
const uuidv4 = require("uuid/v4");

/**
 * @example ../../../../docs/readme/BinarySearchTree.md
 */
export default {
    name: "BinarySearchTree",
    data: function() {
        return {
            /**
             * Size of the text on a node
             */
            fontSize: 16,
            /**
             * The color of nodes
             */
            nodeFillColor: "#FFFFFF",
            /**
             * Radius of a node
             */
            nodeRadius: 25,
            edenHeight: 60,
            nodeStrokeColorDefault: "#262626",
            nodeFontColorDefault: "#262626",
            nodeFontColorHilighted: "#AB0505",
            nodeStrokeWidth: 2,
            linkLength: 110,
            animationTimePrimary: 800,
            nodeStrokeColorHilighted: "#AB0505",
            orange: "#F45D27",

            //All the non reactive properties are defined in the created() lifecycle hook
            otherBstOperations: [
                { actionName: "Inorder Traversal", userInput: null },
                { actionName: "Preorder Traversal", userInput: null },
                { actionName: "Postorder Traversal", userInput: null },
                { actionName: "Breadth First Traversal", userInput: null },
                { actionName: "Depth First Traversal", userInput: null },
                { actionName: "Maximum Node", userInput: null },
                { actionName: "Minimum Node", userInput: null }
            ],

            /**
             * Name that should be displayed on the eden space
             */
            edenName: "",
            edenNodes: []
        };
    },
    computed: {
        userInstruction() {
            return `<p>Begin by inserting a root node using the controls above. 
            Then, delete or visit nodes using the adjacent controls. 
            Use the dropdown above to perform other Tree operations search as BFS, DFS, Traversals, etc.</p>`;
        }
    },
    methods: {
        /**
         * This method should generate random tree
         */
        async generateRandomTree() {
           
           if(this.bstD3Wrapper.bst.root != null)
           {
                await this.bstD3Wrapper.clearTree(TreeCanvasUtil.clearNode);
                await this.clearEden();
           }
            
            // console.log("Root after clear: ", this.bstD3Wrapper.bst.root)

            let offset = 400
            let randoms = [...Array(6)].map(() => Math.floor(Math.random() * 100));
            for(let each of randoms)
                await this.insertNode(each, this.animationTimePrimary - offset);
            // await this.insertNode(5, this.animationTimePrimary - offset);
            // await this.insertNode(15, this.animationTimePrimary - offset);
            // await this.insertNode(3, this.animationTimePrimary - offset);
            // await this.insertNode(8, this.animationTimePrimary - offset);
            // await this.insertNode(1, this.animationTimePrimary - offset);
            // await this.insertNode(25, this.animationTimePrimary - offset);          
        },

        /**
         * This method deletes all the svg elements drawn on the eden space.
         */
        async clearEden() {
            this.edenNodes = [];
            this.edenName = "";
        },
        async userAction(actionName, userInput) {
            //clear eden space before any operations
            this.clearEden();

            // clear zoom effect of nodes before any operations
            this.clearMaxZoom();
            this.clearMinZoom();
            switch (actionName) {
                case "Insert":
                    await this.insertNode(userInput);
                    break;
                case "Delete":
                    await this.deleteNode(userInput);
                    break;
                case "Look Up":
                    await this.visitNode(userInput);
                    break;
                case "Inorder Traversal":
                    this.edenName = actionName;
                    await this.inorderTraversal();
                    break;
                case "Preorder Traversal":
                    this.edenName = actionName;
                    await this.preorderTraversal();
                    break;
                case "Postorder Traversal":
                    this.edenName = actionName;
                    await this.postorderTraversal();
                    break;
                case "Breadth First Traversal":
                    this.edenName = actionName;
                    await this.breadthFirstTraversal();
                    break;
                case "Depth First Traversal":
                    this.edenName = actionName;
                    await this.preorderTraversal();
                    break;
                case "Minimum Node":
                    this.edenName = actionName;
                    await this.visitMinNode();
                    break;
                case "Maximum Node":
                    this.edenName = actionName;
                    await this.visitMaxNode();
                    break;
                default:
                    break;
            }
        },

        changeAnimationSpeed(scale) {
            this.animationTimePrimary = 1600 * scale;
            console.log(
                `Animation speed changed by scale ${scale} to the value of ${this.animationTimePrimary}`
            );
        },

        /**
         * This method is called when the user clicks "Insert" button on
         * the screen
         */
        insertNode: async function(inputInt, animationTimePrimary=this.animationTimePrimary) {
            let nodeId = `node-${uuidv4()}`;

            // await this.insertNodeToTree(this.insertInput);
            let node = this.bstD3Wrapper.insert(inputInt, nodeId);

            //Draw a temporary placeholder node
            // Note: the class should not be ".node" because otherwise existing node will
            // be updated
            let nodeOpt = this.getDefaultNodeOptions();
            //This node has to be fixed to origin.
            //When the height of the tree is greater
            nodeOpt.fixedAtOrigin = true;
            nodeOpt.removeExitNodes = false;
            await TreeCanvasUtil.drawCircularNodes(node.descendants(), nodeOpt);

            if (this.bstD3Wrapper.height() > 1) {
                let ancestors = this.bstD3Wrapper.getPathToParentById(
                    node.data.id
                );
                const ringId = "aa-selection-ring";
                await TreeCanvasUtil.traverseCircularNodes(
                    ancestors,
                    this.graph,
                    false,
                    ringId,
                    this.nodeStrokeColorHilighted,
                    animationTimePrimary
                );

                //Now, when the height of the tree is greater than 1,
                // translate the node to it's actual position (Before
                // this translation, this node is guarenteed to be at origin)
                await TreeCanvasUtil.translateNode(
                    node.data.id,
                    node.x,
                    node.y,
                    animationTimePrimary
                );
                // Draw links between the newly translated node and it's parent
                let linkOpt = this.getDefaultLinkOptions();
                linkOpt.removeExitLinks = false;
                await TreeCanvasUtil.drawLinks(node.descendants(), linkOpt);

                //Move the hilighter node (circle) to the newly
                //translated node
                await TreeCanvasUtil.moveCircularNodeById(
                    ringId,
                    node.x,
                    node.y,
                    animationTimePrimary
                );

                //Remove the hilighter node
                TreeCanvasUtil.removeElementById(
                    ringId,
                    animationTimePrimary
                );
            }

            this.drawTree();
        },

        deleteNode: async function(inputInt) {
            let nodes = this.bstD3Wrapper.getPathToNodeByKey(inputInt);

            // If there are no nodes in the path to the node that should be removed
            // no further action can be performed
            if (nodes.length === 0) return;

            // Traverse to the node to be removed so the user can see the visual

            const removalNodeSelectionRingId = "aa-selection-ring";

            await TreeCanvasUtil.traverseCircularNodes(
                nodes,
                this.graph,
                false,
                removalNodeSelectionRingId,
                this.nodeStrokeColorHilighted,
                this.animationTimePrimary
            );

            //Create a clone of the removal
            let removalNode = nodes[nodes.length - 1];

            let successorPath = this.bstD3Wrapper.deleteNode(removalNode);

            if (successorPath !== null) {
                // let successorPath = removalNode.path(successorNode);
                let successorNode = successorPath[successorPath.length - 1];

                await TreeCanvasUtil.traverseCircularNodes(
                    successorPath,
                    this.graph,
                    true,
                    "successor-path-ring",
                    this.orange,
                    this.animationTimePrimary
                );

                // Remove the link that connect the successor node to it's parent
                await TreeCanvasUtil.removeElementById(
                    `link-${successorNode.data.id}`,
                    this.animationTimePrimary
                );

                await TreeCanvasUtil.translateNode(
                    successorNode.data.id,
                    removalNode.x,
                    removalNode.y,
                    this.animationTimePrimary
                );
            }

            //Remove the selection ring surrounding the removal node
            await TreeCanvasUtil.removeElementById(
                removalNodeSelectionRingId,
                0
            );

            // Now remove the removalNode from DOM. Note, this does not
            // actually remove the node from the tree.
            await TreeCanvasUtil.removeElementById(
                removalNode.data.id,
                this.animationTimePrimary
            );

            this.drawTree();
        },

        visitNode: async function(inputInt) {
            let nodes = this.bstD3Wrapper.getPathToNodeByKey(inputInt);

            if (nodes.length === 0) return;

            await TreeCanvasUtil.traverseCircularNodes(
                nodes,
                this.graph,
                true,
                "traversal-node",
                this.nodeStrokeColorHilighted,
                this.animationTimePrimary
            );
        },

        async clearMaxZoom() {
            let maxNodeId = this.bstD3Wrapper.visitMaxNode();
            await TreeCanvasUtil.zoomNode(
                maxNodeId,
                this.nodeRadius,
                this.nodeStrokeWidth,
                this.fontSize,
                this.nodeStrokeColorDefault
            );
        },

        async clearMinZoom() {
            let minNodeId = this.bstD3Wrapper.visitMinNode();
            await TreeCanvasUtil.zoomNode(
                minNodeId,
                this.nodeRadius,
                this.nodeStrokeWidth,
                this.fontSize,
                this.nodeStrokeColorDefault
            );
        },

        visitMinNode: async function() {
            let nodeId = this.bstD3Wrapper.visitMinNode();
            await TreeCanvasUtil.zoomNode(
                nodeId,
                this.nodeRadius + 15,
                this.nodeStrokeWidth + 2,
                this.fontSize + 8,
                this.nodeStrokeColorHilighted
            );
            await TreeCanvasUtil.traverseCircularNodesById(
                nodeId,
                this.graph,
                true,
                "traversal-node",
                this.nodeStrokeColorHilighted,
                this.animationTimePrimary,
                this.edenNodes
            );
        },

        visitMaxNode: async function() {
            let nodeId = this.bstD3Wrapper.visitMaxNode();
            await TreeCanvasUtil.zoomNode(
                nodeId,
                this.nodeRadius + 15,
                this.nodeStrokeWidth + 2,
                this.fontSize + 8,
                this.nodeStrokeColorHilighted
            );
            await TreeCanvasUtil.traverseCircularNodesById(
                nodeId,
                this.graph,
                true,
                "traversal-node",
                this.nodeStrokeColorHilighted,
                this.animationTimePrimary,
                this.edenNodes
            );
        },

        async inorderTraversal() {
            let nodeIds = this.bstD3Wrapper.inorderTraversal();
            await TreeCanvasUtil.traverseCircularNodesById(
                nodeIds,
                this.graph,
                true,
                "traversal-node",
                this.nodeStrokeColorHilighted,
                this.animationTimePrimary,
                this.edenNodes
            );
        },

        async preorderTraversal() {
            let nodeIds = this.bstD3Wrapper.preorderTraversal();
            await TreeCanvasUtil.traverseCircularNodesById(
                nodeIds,
                this.graph,
                true,
                "traversal-node",
                this.nodeStrokeColorHilighted,
                this.animationTimePrimary,
                this.edenNodes
            );
        },

        async postorderTraversal() {
            let nodeIds = this.bstD3Wrapper.postorderTraversal();
            await TreeCanvasUtil.traverseCircularNodesById(
                nodeIds,
                this.graph,
                true,
                "traversal-node",
                this.nodeStrokeColorHilighted,
                this.animationTimePrimary,
                this.edenNodes
            );
        },

        async breadthFirstTraversal() {
            let nodeIds = this.bstD3Wrapper.breadthFirstTraversal();
            await TreeCanvasUtil.traverseCircularNodesById(
                nodeIds,
                this.graph,
                true,
                "traversal-node",
                this.nodeStrokeColorHilighted,
                this.animationTimePrimary,
                this.edenNodes
            );
        },

        drawTree: async function() {
            let bstD3Tree = this.bstD3Wrapper.tree(true);

            if (bstD3Tree === null) return;

            TreeCanvasUtil.drawCircularNodes(
                bstD3Tree.descendants(),
                this.getDefaultNodeOptions()
            );
            // this.drawNodes(bstD3Tree, "node", true, true);
            if (bstD3Tree.descendants().length > 1) {
                TreeCanvasUtil.drawLinks(
                    bstD3Tree.descendants().slice(1),
                    this.getDefaultLinkOptions()
                );
            }
        },
        getDefaultNodeOptions() {
            const opt = {};
            opt.parentClass = "aa-graph";

            //Class that should be assigned to the node
            opt.cssClass = "node";
            opt.removeExitNodes = true;
            opt["stroke-width"] = `${this.nodeStrokeWidth}px`;
            opt["stroke"] = this.nodeStrokeColorDefault;
            opt["radius"] = `${this.nodeRadius}px`;
            opt["fill"] = this.nodeFillColor;
            opt["font-size"] = `${this.fontSize}px`;
            opt["font-color"] = this.nodeFontColorDefault;
            opt.fixedAtOrigin = false;
            opt.transitionTime = this.animationTimePrimary;
            return opt;
        },
        getDefaultLinkOptions() {
            const opt = {};

            opt["stroke-width"] = `${this.nodeStrokeWidth}px`;
            opt["stroke"] = this.nodeStrokeColorDefault;
            opt.cssClass = "link";
            opt.parentClass = "aa-graph";
            opt.removeExitLinks = true;
            opt.transitionTime = this.animationTimePrimary;

            return opt;
        },
        onCanvasReady(canvasSize) {
            //Space on the x axis on left
            const offsetX = this.nodeRadius * 2 + this.nodeStrokeWidth;

            //Space on the y axis on top (add extra five for nicer padding)
            const offsetY = this.nodeRadius + this.nodeStrokeWidth + 25;

            //space that should be left empty on the bottom for the
            //tree to grow when inserting new nodes (before the tree is
            //re-drawn)
            //strokeWidth*2 because we need to add space for the border of hilighter node
            const spaceBottom =
                this.linkLength + this.nodeStrokeWidth * 2 + this.nodeRadius;

            //Create the group that contain the tree. Add a margin to the left
            //and to the top by translating the group 50 pixelx to the right and pixels down
            this.graph = d3
                .select(".aa-drawing-board")
                .append("g")
                .attr("class", "aa-graph")
                .attr("transform", `translate(${offsetX}, ${offsetY})`);

            let treeWidth = canvasSize.width - offsetX;
            let treeHeight = canvasSize.height - offsetY - spaceBottom;

            this.bstD3Wrapper = new BstD3Wrapper(
                treeWidth,
                treeHeight,
                this.linkLength
            );

            //Keeps track of the height of the tree. It will be useful
            //to decide whether the tree should be resized in the next
            //draw
            this.treeDepth = 0;
        }
    },
    created: function() {
        // This is the group element (<g>) that contains the the tree
        this.graph = undefined;
        // this.$gtag.event("login", { method: "Google" });
    },
    components: {
        // "hr-with-text": HRWithText,
        // "user-input-box": UserInputBox,
        // "range-input": RangeInput,
        // "drawing-board-fluid": DrawingBoardFluid,
        // "input-data-list": InputDataList,
        "eden-space": EdenSpace,
        "base-layout": BaseLayout
    }
};
</script>
<style scoped>
.aa-container {
    width: 100%;
    height: 100%;
    padding: 1%;
}

.aa-config-col {
    border-left: 1px solid #f14a60;
}

hr {
    border: 0;
    clear: both;
    display: block;
    width: 96%;
    background-color: #ffff00;
    background-color: gray;
    height: 1px;
}
</style>
