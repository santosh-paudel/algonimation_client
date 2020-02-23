<template>
    <!-- <div class="strike">
        <span>{{text}}</span>
    </div>-->
    <div class="d-flex flex-row">
        <div class="aa-hr">
            <hr />
        </div>
        <div class="aa-center-text-div mr-sm-2 ml-sm-2">
            <p class="mt-sm-1 mb-sm-2">{{text}}</p>
        </div>
        <div class="aa-hr">
            <hr />
        </div>
    </div>
</template>
<script>
export default {
    name: "HRWithText",
    props: ["text"]
};
</script>
<style scoped>
.aa-hr {
    display: block;
    width: 100%;
}

.aa-center-text-div {
    display: block;
    width: 100%;
}

.aa-center-text-div p {
    white-space: nowrap;
    text-align: center;
}
</style>