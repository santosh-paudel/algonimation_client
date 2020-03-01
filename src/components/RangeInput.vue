<template>
    <form>
        <div class="form-group">
            <!-- <label for="formControlRange">Example Range input</label> -->
            <b-input
                type="range"
                class="form-control-range"
                min="0.1"
                max="1.0"
                step="0.1"
                v-model="range"
            />
        </div>
    </form>
</template>
<script>
export default {
    name: "AnimationSpeed",
    data: function() {
        return {
            rangeInput: "0.5"
        };
    },
    methods: {},
    computed: {
        range: {
            get() {
                return this.rangeInput;
            },
            set(val) {
                this.$emit("on-value-change", parseFloat(val));
                this.rangeInput = val;
            }
        }
    },
    mounted() {
        this.$emit("on-value-change", parseFloat(this.rangeInput));
    }
};
</script>
<style scoped>
</style>