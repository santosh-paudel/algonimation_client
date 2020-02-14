/* eslint-disable no-unused-vars */
/* eslint-disable no-debugger */
'use strict'

import * as d3 from "d3";
class Node {
    id = null;
    key = null;
    left = null;
    right = null;
    parent = null;

    constructor(data, id) {
        this.id = id;
        this.key = data;
        this.left = null;
        this.right = null;
    }
    set left(node) {
        this.left = node;
    }
    set right(node) {
        this.right = node;
    }
    get left() {
        return this.left;
    }
    get right() {
        return this.right;
    }

    get key() {
        return this.key;
    }

    children() {
        let children = [];
        if (this.left !== null) children.push(this.left);

        if (this.right !== null) children.push(this.right);

        return children;
    }
}
class BST {

    root = null;

    insert(data, id) {
        if (this.root === null) {
            this.root = new Node(data, id);
            return this.root;
        }

        let node = this.insertData(data, id, this.root);
        return node;

    }
    insertData(key, id, parentNode) {
        /* If the tree is empty, return a new node */
        if (parentNode === null) return new Node(key, id)

        /* Otherwise, recur down the tree */
        if (key <= parentNode.key)
            parentNode.left = this.insertData(key, id, parentNode.left);
        else if (key > parentNode.key)
            parentNode.right = this.insertData(key, id, parentNode.right);

        /* return the (unchanged) node pointer */
        return parentNode;
    }

    getLeafNodes() {

        let leafNodes = [];
        let queue = [];
        queue.push(this.root);

        while (queue.length > 0) {
            let node = queue.pop();

            if (node.children.length === 0) {
                leafNodes.push(node);
            } else {
                for (const child of node.children) {
                    queue.push(child);
                }
            }
        }

        return leafNodes;
    }

    // Returns parent node. If the node
    // exists, it's parent is returned. If the node does not
    // exist, a candidate-parent node is returned
    getParentNode(key, id) {
        if (this.root === null) return null;

        if (this.root.left === null && this.root.right === null) return this.root;

        return this._searchParentNode(this.root, key, id);
    }

    _searchParentNode(parent, key, id) {

        if (key <= parent.key) {
            if (parent.left === null || key === parent.left.key) return parent;

            return this._searchParentNode(parent.left, key, id);
        } else {
            if (parent.right === null || key === parent.right.key) return parent;

            return this._searchParentNode(parent.right, key, id);
        }

    }

    height() {
        return this._height(this.root);
    }
    _height(node) {
        if (node === null) return 0;

        let leftHeight = this._height(node.left);
        let rightHeight = this._height(node.right);

        if (leftHeight > rightHeight) return leftHeight + 1;
        else return rightHeight + 1;
    }


}


export {
    Node,
    BST
};