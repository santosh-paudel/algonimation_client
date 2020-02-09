import Vue from "vue";
import Router from "vue-router";

import BinarySearchTree from "@/components/BinarySearchTree";
// eslint-disable-next-line no-unused-vars
import BinarySearchTree2 from "@/components/BinarySearchTree2";

import BinarySearchTree3 from "@/components/BinarySearchTree3";

import BinarySearchTree4 from "@/components/BinarySearchTree4";

import BinarySearchTree5 from "@/components/BinarySearchTree5";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
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
    },
    {
      path: "/bst4",
      name: "BinarySearchTree4",
      component: BinarySearchTree4
    },
    {
      path: "/bst5",
      name: "BinarySearchTree5",
      component: BinarySearchTree5
    }
  ]
});
