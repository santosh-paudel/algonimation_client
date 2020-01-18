import Vue from 'vue';
import Router from 'vue-router';

import BinarySearchTree from "@/components/BinarySearchTree";
// eslint-disable-next-line no-unused-vars
import BinarySearchTree2 from "@/components/BinarySearchTree2";

import BinarySearchTree3 from "@/components/BinarySearchTree3";

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [{
            path: "/",
            name: "BinarySearchTree",
            component: BinarySearchTree
        },
        {
            path: "/bst2",
            name: "BinarySearchTree2",
            component: BinarySearchTree2
        },
        {
            path: "/bst3",
            name: "BinarySearchTree3",
            component: BinarySearchTree3
        }
    ]
})