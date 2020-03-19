<template>
    <div class="aa-config-col h-100">
        <h5>{{name}}</h5>
        <slot></slot>
    </div>
</template>
<script>
export default {
    name: "OperationPanel",
    props: {
        name: {
            type: String,
            required: true
        }
    }
};
</script>
<style scoped>
.aa-config-col {
    border-left: 1px solid #f14a60;
}
</style>