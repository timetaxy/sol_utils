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
					<h2 class="text-left">Profit</h2>
					<h1>{{ numFormatter.format(totalProfit / 1000000000) }}
					</h1>
				</StatCard>
			</div>
			<div class="col-12 col-md-6 col-lg-3 mt-3 mt-lg-0">
				<StatCard>
					<h2 class="text-left">Gas Spend
						<small class="xsmall grey">
							<SHDW style="height: 18px" mint-addr="So11111111111111111111111111111111111111112"></SHDW>
							<span class="small text-white">{{ gasCostSol }}</span></small></h2>
					<h1>{{ gasCostUsd }}
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
				<div class="row">
					<div class="col-auto">
						<img v-if="tokenInfo[activeTokenSummary.mint]" class="token-logo"
								:src="tokenInfo[activeTokenSummary.mint].logoURI" alt="">
					</div>
					<div class="col">
						<h4>{{ tokenInfo[activeTokenSummary.mint].name }}</h4>
					</div>
					<div class="col-auto small">
						<p class="mb-0 small">Current Price: {{ prices[activeTokenSummary.mint] ? numFormatter.format(prices[activeTokenSummary.mint].value) : '-' }}</p>
						<p class="mb-0 small">Running Total: {{ simpleFormatter.format(activeTokenSummary.amount_made / 1000000000 || 0) }}</p>
					</div>
				</div>
				<TokenGraph :token-info="tokenInfo" :active-token="activeTokenSummary.mint" :summary="summary"></TokenGraph>
			</StatCard>
		</div>

		<div class="col-12 mt-3">
			<StatCard v-show="activeTokenSummary.trade_summary.length > 0">
				<h4><img style="height: 1rem" v-if="tokenInfo[activeTokenSummary.mint]" class="token-logo"
						:src="tokenInfo[activeTokenSummary.mint].logoURI" alt=""> {{
						prices[activeTokenSummary.mint] ?
								prices[activeTokenSummary.mint].symbol : ''
					}} - Transactions</h4>
				<div class="row">
					<div class="col-12">
						<table class="table table-sm table-hover">
							<thead>
							<tr>
								<td>Signature</td>
								<td class="d-none d-md-table-cell">Block</td>
								<td class="d-none d-lg-table-cell">Time</td>
								<td class="d-none d-lg-table-cell">Gas Cost</td>
								<td>Change</td>
								<td>Token</td>
								<td class="text-end">Value</td>
							</tr>
							</thead>
							<tbody>
							<TxnRow :diff="trade.diff" :prices="prices" :token-info="tokenInfo" :txn="adapted(trade)" v-for="(trade, key) in filteredTradeSummary"
									:key="`${activeTokenSummary.mint}-${key}`"></TxnRow>
							</tbody>
							<tfoot>
							<tr>
								<td><strong>TOTAL</strong></td>
								<td class="d-none d-md-table-cell"></td>
								<td class="d-none d-lg-table-cell"></td>
								<td class="d-none d-lg-table-cell"></td>
								<td></td>
								<td></td>
								<td class="text-end">{{ numFormatter.format(tradeProfit) }}</td>
							</tr>
							</tfoot>
						</table>
					</div>
				</div>

			</StatCard>
		</div>
	</div>
</template>

<script>
import StatCard from "./StatCard";
import SHDW from "../tokens/SHDW";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";
import TxnRow from "./TxnRow";
import TokenGraph from "./TokenGraph";

export default {
	name: "OverviewCard",
	components: {TokenGraph, TxnRow, SHDW, StatCard},
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
			page: 0,
			limit: 25,

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

			return this.numFormatter.format((this.summary.gas_spent / 1000000000) * this.prices['So11111111111111111111111111111111111111112'].value)
		},
		filteredTradeSummary: function () {
			return this.activeTokenSummary.trade_summary.filter(trade => trade.error === false).sort((a, b) => b.slot - a.slot).slice(this.page * this.limit, this.page * this.limit +
					this.limit);
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

		tradeProfit() {
			const tradePrice = this.prices[this.activeTokenSummary.mint] ? this.prices[this.activeTokenSummary.mint].value : 0;
			const amount = this.activeTokenSummary.amount_made * tradePrice;
			return (amount / Math.pow(10, this.tokenInfo[this.activeTokenSummary.mint] ? this.tokenInfo[this.activeTokenSummary.mint].decimals : 9));
		},

		totalProfit() {
			let total_profit = 0;
			for (let idx in this.summary.tokens) {
				const token = this.summary.tokens[idx]
				if (this.prices[idx])
					total_profit += token.amount_made * this.prices[idx].value;
			}

			return total_profit;
		}
	},
	methods: {
		setActiveToken: function (token) {
			this.activeTokenSummary = token
		},

		adapted(trade) {
			return Object.assign(trade, {
				slot: trade.slot,
				mint: this.activeTokenSummary.mint,
				meta: {
					fee: trade.gas,
				}
			})
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