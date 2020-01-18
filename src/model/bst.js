/* eslint-disable no-debugger */
'use strict'

import * as d3 from "d3";
class Node {
    data = undefined;
    left = undefined;
    right = undefined;

    constructor(data) {
        this.data = data;
        this.left = undefined;
        this.right = undefined;
    }
}
class BST {

    root = undefined;


    getD3Hierarchy() {
        return d3.hierarchy(this.root, function (d) {
            let children = [];
            if (d.left !== undefined) {
                children.push(d.left);
            }
            if (d.right !== undefined) {
                children.push(d.right);
            }
            return children;
        })
    }

    insertData(data) {

        // debugger;

        if (this.root == undefined) {
            this.root = new Node(data);
        } else {
            this.insert(this.root, data);
        }

        return this.getD3Hierarchy();

    }

    insert(root, data) {
        // debugger;
        if (root === undefined) {
            return new Node(data);
        }

        if (data <= root.data) {
            root.left = this.insert(root.left, data);
        } else if (data > root.data) {
            root.right = this.insert(root.right, data);
        }
        return root;
    }

}


export {
    BST
};