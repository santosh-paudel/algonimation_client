This component provides a horizontally scrollable range
slider to get range input from the user. It is often used to
allow user to toggle animation speed.

![](docs/readme/resources/RangeInput.gif)

Usage Example:

```js static
<template>
    <div>
        <range-input
            :min="1"
            :max="2"
            :step="0.2"
        >
        </range-input>
    </div>
</template>
<script>
import RangeInput from "@/components/commons/RangeInput.vue";
export default {
    name: "RangeInputExample",
    data: function() {
        return {};
    },
    components: {
        "range-input": RangeInput
    }
};
</script>
<style scoped>
</style>

```
