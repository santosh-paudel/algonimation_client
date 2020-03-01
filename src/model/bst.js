/* eslint-disable no-unused-vars */
/* eslint-disable no-debugger */
"use strict";
const uuidv4 = require("uuid/v4");
class Node {
    _id = null;
    _key = null;
    _left = null;
    _right = null;

    constructor(data, id) {
        this._id = id;
        this._key = data;
        this._left = null;
        this._right = null;
    }
    set left(node) {
        this._left = node;
    }
    set right(node) {
        this._right = node;
    }
    get left() {
        return this._left;
    }
    get right() {
        return this._right;
    }

    get key() {
        return this._key;
    }

    get id() {
        return this._id;
    }

    set key(key) {
        this._key = key;
    }

    set id(id) {
        this._id = id;
    }

    get data() {
        return {
            key: this.key,
            id: this.id
        }
    }

    children() {
        let children = [];
        if (this.left !== null) children.push(this.left);

        if (this.right !== null) children.push(this.right);

        return children;
    }

    /**
     * Returns a child with the given key and id if any
     * @param {} key 
     * @param {*} id 
     */
    child(key, id) {
        if (key <= this.key) {
            return this.left;
        }
        return this.right;
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

    getNode(key, id) {
        if (this.root === null) return null;

        if (this.root.key === key && this.root.id === id) return this.root;

        return this._searchNode(this.root, this.root.key, this.root.id);
    }

    _searchNode(parent, key, id) {
        if (parent === null) return null;

        if (key == parent.key && id === parent.id) {
            return parent;
        }

        if (key <= parent.key) {
            return this._searchNode(parent.left, key, id);
        } else {
            return this._searchNode(parent.right, key, id);
        }
    }

    // Returns parent node. If the node
    // exists, it's parent is returned. If the node does not
    // exist, a candidate-parent node is returned
    getParentNode(key, id) {
        // if (
        //     this.root === null ||
        //     (this.root.left === null && this.root.right === null)
        // )
        //     return null;

        if (this.root === null) return null;
        if (this.root, key === key && this.root.id === id) return null;
        // else if(this.left )

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


    _getMinValNode(node) {
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


    // findSuccessor(key, id) {
    //     debugger;
    //     let parentNode = this.getParentNode(key, id);
    //     let targetNode = null;
    //     let successorNode = null;

    //     // If the key and id belong to the root node, parentNode is going to be null

    //     if (parentNode === null) {
    //         targetNode = this.root;
    //     } else if (parentNode.left !== null && parentNode.left.key === key && parentNode.left.id === id) {
    //         targetNode = parentNode.left;
    //     } else {
    //         targetNode = parentNode.right;
    //     }

    //     //If the node to remove has no children
    //     if (targetNode.children().length === 0) {
    //         successorNode = null;
    //     }

    //     //If the node to remove has one child
    //     else if (targetNode.children().length === 1) {
    //         successorNode = targetNode.children()[0];
    //     } else {
    //         let collector = [];
    //         this._preorderTraversal(this.root, collector);

    //         for (let i = 0; i < collector.length; i++) {
    //             const node = collector[i];
    //             if (node.key === key && node.id === id) {
    //                 successorNode = collector[i + 1];
    //             }
    //         }
    //     }

    //     return {
    //         parent: parentNode,
    //         target: targetNode,
    //         successor: successorNode
    //     }
    // }

    // _preorderTraversal(node, collector) {
    //     if (node === null) return null;
    //     this._preorderTraversal(node.left, collector);
    //     collector.push(node);
    //     this._preorderTraversal(node.right, collector);
    // }

    /**
     * Swaps nodes 
     * @param {object} node
     * @param {Object} successor
     */

    //TODO: Make this function more efficient
    deleteNode(key, id) {

        // let parentNode = this.getParentNode(removalNodeKey, removalNodeId);

        // let removalNode = null;
        // //If parent node is null, we know it is the root node
        // if (parentNode === null) {
        //     removalNode = this.root;
        // } else if (parentNode.left != null && parentNode.left.id === removalNodeId) {
        //     removalNode = parentNode.left;
        // } else {
        //     removalNode = parentNode.right;
        // }

        const collector = [];

        this._deleteNode(this.root, key, id, collector);



        return collector.length == 0 ? null : collector[0];
    }

    _deleteNode(ancestor, key, id, collector) {

        let parent = this.root.id === id ? null : this._searchParentNode(ancestor, key, id);
        let node = this.root.id === id ? this.root : this._searchNode(parent, key, id);
        if (node === null)
            return;

        //Case 1: If the node to be deleted has no children (i.e if it is a leaf node)
        if (node.left === null && node.right === null) {

            //If the node to be deleted is not a root node, just
            //set the parent's left or right child to null
            if (node.id !== this.root.id) {
                if (parent.left !== null && parent.left.id === node.id) {
                    parent.left = null;
                } else {
                    parent.right = null;
                }
            } else {
                this.root = null;
            }

        }
        //Case 2 node to be deleted has two children
        else if (node.children().length === 2) {
            let successor = this._getMinValNode(node.right);
            debugger;


            collector.push(successor);

            const successorParent = this._searchParentNode(node, successor.key, successor.id);
            this._deleteNode(successorParent, successor.key, successor.id, collector);

            let tempNode = new Node(successor.key, successor.id);
            if (this.root.id === id) {
                this.root = tempNode;
            } else {

                //At this point, the left node may have already been removed by the above
                //this.__deleteNode function call above the if block. So check to see if left is null first
                if (parent.left !== null && parent.left.id === id) {
                    parent.left = tempNode;
                } else {
                    parent.right = tempNode;
                }
            }
            tempNode.left = node.left;
            tempNode.right = node.right;

            // node.key = successorKey;
        }
        //Case 3: node to be deleted has only one child
        else {

            //Get the child of the node to be deleted
            let childNode = node.left === null ? node.right : node.left;
            if (node.id === this.root.id) {
                this.root = childNode;

            } else {

                if (parent.left !== null && parent.left.id === node.id) {
                    parent.left = childNode;
                } else {
                    parent.right = childNode;
                }
            }

            collector.push(childNode.data);

        }

    }
}

export {
    Node,
    BST
};