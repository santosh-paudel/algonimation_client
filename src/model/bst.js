/* eslint-disable no-unused-vars */
/* eslint-disable no-debugger */
"use strict";

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
    if (parentNode === null) return new Node(key, id);

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
    if (
      this.root === null ||
      (this.root.left === null && this.root.right === null)
    )
      return null;

    return this._searchParentNode(this.root, key, id);
  }

  _searchParentNode(parent, key, id) {
    if (key <= parent.key) {
      // compare by key for data
      // compare by id if there are multiple nodes with same key
      if (
        parent.left === null ||
        (key === parent.left.key && id === parent.left.id)
      )
        return parent;

      return this._searchParentNode(parent.left, key, id);
    } else {
      if (
        parent.right === null ||
        (key === parent.right.key && id === parent.right.id)
      )
        return parent;

      return this._searchParentNode(parent.right, key, id);
    }
  }

  deleteNode(key, id) {
    if (this.root.key === key && this.root.id === id) {
      this.root = null;
    } else {
      this._removeNode(this.root, id);
    }
  }

  /**
   * This method removes the node and returns a new node to take that place
   * Need to consider three cases
   * 1: The node to remove has no children
   *    a. Simply change the parent's left/right reference to null
   * 2. The node to remove has one child
   *    a. Link the single child to the node's parent
   * 3. The node to remove has two children
   *    a. Replace the node (n) by the smallest child on it's right (c)
   *    b. Remove c
   *
   * @param {N} parent
   * @param {*} key
   * @param {*} id
   */
  _removeNode(parent, key, id) {
    if (parent === null) return null;

    //If the node to remove has one child
    if (parent.key === key && parent.id === id) {
      //If the node to remove has no children
      if (parent.children.length === 0) return null;

      //If the node to remove has one child
      if (parent.children.length === 1) return parent.children[0];

      //If the node to remove has two children
      return this._minValueNode(parent.right);
    }

    if (key <= parent.key) {
      parent.left = this._removeNode(parent.left, key, id);
    } else {
      parent.right = this._removeNode(parent.right, key, id);
    }

    return parent;
  }

  _minValueNode(node) {
    let minValueNode = node;
    let nextSmallNode = node;
    while (nextSmallNode.left !== null) {
      nextSmallNode = nextSmallNode.left;
      if (nextSmallNode !== null) {
        minValueNode = nextSmallNode;
      }
    }

    return minValueNode;
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

export { Node, BST };
