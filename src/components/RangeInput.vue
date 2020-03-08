<template>
    <form>
        <div class="form-group">
            <!-- <label for="formControlRange">Example Range input</label> -->
            <b-row>
                <b-col cols="6" class="text-left text-secondary aa-range-label">Low</b-col>
                <b-col cols="6" class="text-right text-secondary aa-range-label">High</b-col>
            </b-row>
            <b-row>
                <b-col cols="12">
                    <b-input
                        type="range"
                        class="form-control-range"
                        :min="rangeMin"
                        :max="rangeMax"
                        :step="rangeStep"
                        v-model="range"
                    />
                </b-col>
            </b-row>
        </div>
    </form>
</template>
<script>
export default {
    name: "AnimationSpeed",
    data: function() {
        return {
            rangeInput: "0.5",
            rangeMax: "1.0",
            rangeMin: "0.01",
            rangeStep: "0.01"
        };
    },
    methods: {},
    computed: {
        range: {
            get() {
                return this.rangeInput;
            },
            set(val) {
                this.$emit("on-value-change", this.invertedRangeInput);
                this.rangeInput = val;
            }
        },
        invertedRangeInput() {
            // returns (max + min) - num
            return (
                parseFloat(this.rangeMax) +
                parseFloat(this.rangeMin) -
                parseFloat(this.rangeInput)
            );
        }
    },
    mounted() {
        this.$emit("on-value-change", this.invertedRangeInput);
    }
};
</script>
<style scoped>
.aa-range-label {
    font-size: 12px;
}
</style>