/* eslint-disable no-debugger */
import * as d3 from "d3";
import {
    BST
} from "./bst";

class BstD3Wrapper {
    depth = 9999999;
    treeLayout = null;
    d3Tree = null;

    bst = null;

    // This object keeps track of the order of each node that is inserted
    // The key will be the id of the node and the value of Date.now()

    orderOfEntry = {

    }

    constructor(width, height) {
        this.cartisanWidth = width;
        this.cartisanHeight = height;
        this.treeLayout = d3.tree().size([this.cartisanWidth, this.cartisanHeight]);
        this.bst = new BST();
    }

    _buildTree() {
        let hierarchy = d3.hierarchy(this.bst.root, (data) => {
            return data.children();
        });

        this.d3Tree = this.treeLayout(hierarchy);


        this.d3Tree.descendants().forEach((node, index) => {

            // node.x += this.cartisanWidth / 3

            if (index === 0) return;

            //If the node does not have a sibling on the right, move it slightly to the left

            if (node.y - node.parent.y > 180) node.y = node.parent.y + 180;

        });

    }

    tree(rebuild) {
        if (rebuild) {
            this._buildTree();
        }
        return this.d3Tree;
    }

    insert(data, id) {
        this.bst.insert(data, id);

        if (this.d3Tree === null) {
            return this.tree(true);
        }


        // Now get the leaf node with the same id
        let parentBstNode = this.bst.getParentNode(data, id);

        //Now find the parent node of the newly inserted node
        let d3ParentNode = null;
        for (const d3Node of this.d3Tree.descendants()) {
            if (d3Node.data.id === parentBstNode.id) {
                d3ParentNode = d3Node;
            }
        }

        let newD3Node = {
            data: data <= parentBstNode.key ? parentBstNode.left : parentBstNode.right

        }

        if (newD3Node.data.key <= d3ParentNode.data.key) {
            newD3Node.x = (d3ParentNode.x - 100);
            let children = d3ParentNode.children || [];
            d3ParentNode.children = [newD3Node].concat(children);

        } else {
            newD3Node.x = (d3ParentNode.x + 100);
            let children = d3ParentNode.children || [];
            d3ParentNode.children = children.concat([newD3Node]);
        }

        newD3Node.y = d3ParentNode.y + 180;
        newD3Node.depth = d3ParentNode.depth + 1;
        newD3Node.height = 0;
        newD3Node.parent = d3ParentNode;
        newD3Node.descendants = () => [newD3Node];

        this.d3Tree.height += 1;

        return newD3Node;
    }

    // getPathToNode(id) {

    //     let targetNode = null;
    //     for (const node of this.tree(false).descendants()) {
    //         if (node.data.id === id) {
    //             targetNode = node;
    //             break;
    //         }

    //     }

    //     return targetNode === null ? [] : targetNode.ancestors().reverse();
    // }

    //Cannot use node.ancestors() because the last node may not be a 
    getPathToParent(id) {

        let targetNode = null;
        for (const node of this.tree(false).descendants()) {
            if (node.data.id === id) {
                targetNode = node;
                break;
            }

        }

        return targetNode === null ? [] : targetNode.parent.ancestors().reverse();
    }

    height() {
        return this.bst.height();
    }

}





export {
    BstD3Wrapper
}