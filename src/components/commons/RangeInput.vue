<template>
    <form>
        <div class="form-group">
            <b-row>
                <b-col cols="6" class="text-left text-secondary aa-range-label">Low</b-col>
                <b-col cols="6" class="text-right text-secondary aa-range-label">High</b-col>
            </b-row>
            <b-row>
                <b-col cols="12">
                    <b-input
                        type="range"
                        class="form-control-range"
                        :min="min"
                        :max="max"
                        :step="step"
                        v-model="range"
                    />
                </b-col>
            </b-row>
        </div>
    </form>
</template>
<script>
/**
 * @example ../../../docs/readme/RangeInput.md
 */
export default {
    name: "RangeInput",
    props: {
        /**
         * Maximum allowed input in the range slider
         */
        max: {
            type: String,
            default: "2"
        },
        /**
         * Minimum allowed input in the range slider
         */
        min: {
            type: String,
            default: "0.1"
        },
        /**
         * The minimum increment or decrement in value
         * per movement
         */
        step: {
            type: String,
            default: "0.1"
        }
    },
    data: function() {
        return {
            userInput: "0.5"
        };
    },
    methods: {},
    computed: {
        range: {
            get() {
                return this.userInput;
            },
            set(val) {
                // this.$emit("on-value-change", this.invertedRangeInput);
                this.$emit("on-value-change", val);
                this.userInput = val;
            }
        },
        invertedRangeInput() {
            // returns (max + min) - num
            return (
                parseFloat(this.max) +
                parseFloat(this.min) -
                parseFloat(this.rangeInput)
            );
        }
    },
    mounted() {
        // this.userInput = ""
        this.$emit("on-value-change", this.userInput);
    }
};
</script>
<style scoped>
.aa-range-label {
    font-size: 12px;
}
</style>
