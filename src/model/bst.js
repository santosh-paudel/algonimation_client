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

    constructor(data, parent, id) {
        this.id = id;
        this.key = data;
        this.parent = parent;
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

    get children() {
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
        if (parentNode === null) return new Node(key, parentNode, id)

        /* Otherwise, recur down the tree */
        if (key <= parentNode.key)
            parentNode.left = this.insertData(key, id, parentNode.left);
        else if (key > parentNode.key)
            parentNode.right = this.insertData(key, id, parentNode.right);

        /* return the (unchanged) node pointer */
        return parentNode;
    }

    /*
        parameter looks like this:
        {attribute: "id", value:"node-75442486-0878-440c-9db1-a7006c25a39f"}
        {attribute: "key", value:"5"}
    */
    searchNode(parameter) {
        if (this.root === null) return null;

        switch (parameter.id) {
            case "id":
                return this.searchNodeById(this.root);
            case "key":
                return this.searchNodeByKey(this.root);
        }
    }

    searchNodeByKey(parent) {

    }

    searchNodeById(id, parent) {
        if (parent === null)
            return null;

        if (parent.id === id)
            return parent;

    }

    get root() {
        return this.root;
    }

}


export {
    Node,
    BST
};