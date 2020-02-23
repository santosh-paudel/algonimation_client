<template>
    <div id="app" class>
        <nav-bar></nav-bar>
        <router-view></router-view>
    </div>
</template>

<script>
import NavBar from "./components/NavBar.vue";

export default {
    name: "app",
    components: {
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
    width: 100%;
    height: 100%;
    /* margin-top: 60px; */
}

html,
body {
    height: 100%;
}
</style>
