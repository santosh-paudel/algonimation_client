import Vue from "vue";
import Router from "vue-router";

import BinarySearchTree from "@/apps/BinarySearchTree";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [{
    path: "/bst",
    name: "BinarySearchTree",
    component: BinarySearchTree
  }]
});