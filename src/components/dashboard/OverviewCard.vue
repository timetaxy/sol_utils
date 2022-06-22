<template>
	<div class="overview">
		<div class="mt-4 row text-center" v-if="summary.successful_trades > 0">
			<div class="col-12 col-md-6 col-lg-3 mt-3 mt-lg-0">
				<StatCard>
					<h2 class="text-left">Transactions</h2>
					<h1>{{ simpleFormatter.format(summary.failed_trades + summary.successful_trades) }}
					</h1>
				</StatCard>
			</div>
			<div class="col-12 col-md-6 col-lg-3 mt-3 mt-lg-0">
				<StatCard>
					<h2 class="text-left">Success <small class="xsmall grey">{{ ((summary.failed_trades + summary.successful_trades) / summary.successful_trades).toFixed(2) }}%</small></h2>
					<h1>{{ simpleFormatter.format(summary.successful_trades) }}
					</h1>
				</StatCard>
			</div>
			<div class="col-12 col-md-6 col-lg-3 mt-3 mt-lg-0">
				<StatCard>
					<h2 class="text-left">Unrealised Gain</h2>
					<h1>{{ numFormatter.format(totalProfit - inputCostTotal - gasCostUsd) }}</h1>
				</StatCard>
			</div>
			<div class="col-12 col-md-6 col-lg-3 mt-3 mt-lg-0">
				<StatCard>
					<h2 class="text-left">Gas Spend
						<small class="xsmall grey">
							<SHDW style="height: 18px" mint-addr="So11111111111111111111111111111111111111112"></SHDW>
							<span class="small text-white">{{ gasCostSol }}</span></small></h2>
					<h1>{{ numFormatter.format(gasCostUsd) }}
					</h1>

				</StatCard>
			</div>
		</div>

		<div class="col-12 mt-3">
			<div class="row">
				<div class="col-4 col-md-2 col-lg-1 text-center mb-2" v-for="(token,key) in filteredTokens" :key="key">
					<div class="card h-100 token-card" :class="activeTokenSummary.mint === token.mint ? 'active':''" v-on:click="setActiveToken(token)">
						<div class="card-body p-0 pt-1 h-100">
							<img style="max-height: 32px" v-if="tokenInfo[token.mint]" class="token-logo"
									:src="tokenInfo[token.mint].logoURI" alt="">
							<div v-else style="font-size: 0.4em">{{ token.mint }}</div>
						</div>
						<div class="card-footer p-0">
							<span style="font-size: 0.8em">{{
									prices[token.mint] ? prices[token.mint].symbol : token.mint.substr(0, 4)
								}} <small>({{ simpleFormatter.format(token.trade_summary.length) }})</small></span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="col-12 mt-3">
			<StatCard>
				<OverviewGraph :summary="summary" :token-info="tokenInfo" :prices="prices" :active-token-summary="activeTokenSummary"></OverviewGraph>
			</StatCard>
		</div>

		<div class="col-12 mt-3">
			<StatCard v-show="activeTokenSummary.trade_summary.length > 0">
				<OverviewTable :summary="summary" :token-info="tokenInfo" :prices="prices" :active-token-summary="activeTokenSummary"></OverviewTable>

			</StatCard>
		</div>
	</div>
</template>

<script>
import StatCard from "./StatCard";
import SHDW from "../tokens/SHDW";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";
import OverviewGraph from "./OverviewGraph";
import OverviewTable from "./OverviewTable";

export default {
	name: "OverviewCard",
	components: {OverviewTable, OverviewGraph, SHDW, StatCard},
	props: {
		tokenInfo: {
			type: Object,
			required: true,
		},
		prices: {
			type: Object,
			required: true,
		},
		summary: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			hideSmallCap: true,
			activeTokenSummary: {
				amount_made: 0,
				mint: "11111111111111111111111111111111",
				trade_summary: [],
			},
			simpleFormatter: new Intl.NumberFormat("en-US", {}),
			numFormatter: new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}),
		}
	},
	computed: {

		gasCostSol: function () {
			return (this.summary.gas_spent / LAMPORTS_PER_SOL).toFixed(4);
		},
		gasCostUsd: function () {
			if (!this.prices['So11111111111111111111111111111111111111112'])
				return -1;

			return (this.summary.gas_spent / 1000000000) * this.prices['So11111111111111111111111111111111111111112'].value
		},
		filteredTokens: function () {
			const filtered = {};

			const ok = Object.keys(this.summary.tokens)
			for (let i = 0; i < ok.length; i++) {
				const token = this.summary.tokens[ok[i]];
				if (!this.hideSmallCap || token.trade_summary.length > 1) {
					filtered[token.mint] = token;
				}
			}

			return filtered;
		},

		totalProfit() {
			let total_profit = 0;
			for (let idx in this.summary.tokens) {
				const token = this.summary.tokens[idx]
				if (this.prices[idx] && this.tokenInfo[idx]) {
					const amount = token.amount_made / Math.pow(10, this.tokenInfo[idx].decimals);
					total_profit += amount * this.prices[idx].value;
				}
			}
			return total_profit;
		},

		inputCostTotal: function() {
			let totalCost = 0;
			for(let i = 0; i < this.summary.transfers.length; i++) {
				const xfer = this.summary.transfers[i];
				if(this.prices[xfer.mint]) {
					const amount = xfer.diff / Math.pow(10, this.tokenInfo[xfer.mint].decimals);
					totalCost += amount * this.prices[xfer.mint].value;
				}
			}

			return totalCost;
		},
	},
	methods: {
		setActiveToken: function (token) {
			this.activeTokenSummary = token
		},
	},
}
</script>

<style scoped>
.token-card:hover {
	cursor: pointer;
	border: #26B6D4 1px solid;
}

.xsmall {
	font-size: 0.5em;
}
</style>