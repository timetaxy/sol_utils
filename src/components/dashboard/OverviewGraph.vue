<template>
	<div class="overview-graph">

		<div class="row">
			<div class="col-auto">
				<img v-if="tokenInfo[activeTokenSummary.mint]" class="token-logo"
						:src="tokenInfo[activeTokenSummary.mint].logoURI" alt="">
			</div>
			<div class="col-auto">
				<h4>{{ tokenInfo[activeTokenSummary.mint].name }}</h4>
			</div>
			<div class="col">
				<h4 v-if="`${activeTokenProfit}` !== '0'" :class="activeTokenProfit >= 0 ? 'text-success' : 'text-danger'">{{ numFormatter.format(activeTokenProfit) }}</h4>
			</div>
			<div class="col-auto small">
				<p class="mb-0 small">Current Price: {{ prices[activeTokenSummary.mint] ? numFormatter.format(prices[activeTokenSummary.mint].value) : '-' }}</p>
				<p class="mb-0 small">Running Total: {{ simpleFormatter.format(activeTokenSummary.amount_made / Math.pow(10, tokenDecimals)) }}</p>
			</div>
		</div>
		<TokenGraph :token-info="tokenInfo" :active-token="activeTokenSummary.mint" :summary="summary"></TokenGraph>
	</div>
</template>

<script>
import TokenGraph from "./TokenGraph";

export default {
	name: "OverviewGraph",
	components: {TokenGraph},
	props: {
		summary: {
			type: Object,
			required: true
		},
		tokenInfo: {
			type: Object,
			required: true
		},
		activeTokenSummary: {
			type: Object,
			required: true
		},
		prices: {
			type: Object,
			required: true
		},
	},
	data() {
		return {
			simpleFormatter: new Intl.NumberFormat("en-US", {
				minimumSignificantDigits: this.tokenDecimals,
			}),
			numFormatter: new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}),
		}
	},
	computed: {
		tokenDecimals: function () {
			if (!this.tokenInfo[this.activeTokenSummary.mint])
				return 9;

			return this.tokenInfo[this.activeTokenSummary.mint].decimals;
		},

		tokenPrice: function () {
			if (!this.prices[this.activeTokenSummary.mint])
				return 0;

			return this.prices[this.activeTokenSummary.mint].value;
		},

		activeTokenProfit: function () {
			if (this.activeTokenSummary.amount_made === 0)
				return 0;

			const gross = (this.activeTokenSummary.amount_made / Math.pow(10, this.tokenDecimals)) * this.tokenPrice;

			return gross - this.inputPrice
		},

		/**
		 * Returns the total cost for the token inputs into the account
		 * @returns {number}
		 */
		inputPrice: function () {
			return (this.inputAmount / Math.pow(10, this.tokenDecimals)) * this.tokenPrice
		},


		inputAmount: function () {
			let input_total = 0;

			for (let i = 0; i < this.summary.transfers.length; i++) {
				if (this.summary.transfers[i].mint === this.activeTokenSummary.mint) {
					input_total += this.summary.transfers[i].diff;
				}
			}
			return input_total;
		},
	}
}
</script>

<style scoped>

</style>