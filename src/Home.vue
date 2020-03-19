<template>
    <div class="jumbotron jumbotron-fluid h-100">
        <div class="aa-home container">
            <h1 class="display-4">Imagine Algorithms</h1>
            <div id="aa-user-search-app">
                <input
                    class="form-control mr-sm-2"
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                    v-model="searchInput"
                />
                <ul class="list-group aa-search-suggestion-list">
                    <li
                        v-for="suggestion in searchSuggestions"
                        class="list-group-item text-left pt-2 pb-2"
                        @click="navigate(suggestion)"
                        :key="suggestion"
                    >{{ suggestion }}</li>
                </ul>
            </div>

            <hr class="my-4" />
            <!-- Apply margin to the right if the item is on the even column. Else margin on left only for medium to large
            devices-->
            <div class="d-flex justify-content-center flex-wrap">
                <navigation-card
                    v-for="(app, index) in displayAbleApps"
                    :app="app"
                    :class="[index % 2 === 0 ? 'mr-md-2' : 'ml-md-2']"
                    :key="app.name"
                ></navigation-card>
            </div>
        </div>
    </div>
</template>
<script>
import NavigationCard from "@/components/NavigationCard";
export default {
    name: "Home",
    props: {},
    data: function() {
        return {
            searchInput: "",

            //TODO: Load this from firebase with appropriate ranking
            apps: [
                {
                    name: "Binary Search Tree",
                    description: `Visualize binary search tree through animation, and performs
                    various bst operations such as insertion, deletion, traversal, etc.`,
                    image: "bst.png",
                    display: true,
                    path: "/bst"
                },
                {
                    name: "Directed Graph",
                    description: `This is under development`,
                    image: "graph.png",
                    display: true,
                    path: "/graph"
                }
            ]
        };
    },
    computed: {
        searchSuggestions() {
            const suggestion = [];

            // if (this.searchInput === "") return suggestion;

            this.apps.forEach(app => {
                const match = app.name
                    .toLowerCase()
                    .includes(this.searchInput.toLowerCase());

                if (match) {
                    app.display = true;

                    if (this.searchInput !== "") {
                        suggestion.push(app.name);
                    }
                } else {
                    app.display = false;
                }
            });

            return suggestion;
        },
        displayAbleApps() {
            return this.apps.filter(app => app.display === true);
        }
    },
    methods: {
        navigate(appName) {
            let targetApp = null;
            for (const app of this.apps) {
                if (app.name === appName) {
                    targetApp = app;
                }
            }

            if (targetApp !== null) {
                this.$router.push({ path: targetApp.path });
            }
        }
    },
    components: {
        "navigation-card": NavigationCard
    },
    created() {}
};
</script>
<style scoped>
#aa-app-list {
    width: 100%;
}

#aa-user-search-app {
    position: relative;
}

.aa-search-suggestion-list {
    position: absolute;
    width: 100%;
}

.aa-search-suggestion-list li {
    z-index: 1000;
    max-height: 40px;
}

.aa-search-suggestion-list li:hover {
    background-color: #f4f4f4;
}
</style>
