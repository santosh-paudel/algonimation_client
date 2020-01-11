<template>
	<div id="app">
		<nav-bar></nav-bar>
		<BinarySearchTree />
	</div>
</template>

<script>
import BinarySearchTree from "./components/BinarySearchTree.vue";
import NavBar from "./components/NavBar.vue";

export default {
	name: "app",
	components: {
		BinarySearchTree,
		NavBar
	}
};
</script>

<style>
#app {
	font-family: "Avenir", Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	/* margin-top: 60px; */
}
</style>
