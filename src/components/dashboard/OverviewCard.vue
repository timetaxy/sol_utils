<template>
	<div class="overview">
		<div class="loading-screen" :class="summary.loading ? 'active' : ''" v-show="summary.loading">
			<StatCard>
				<div class="row">
					<div class="col text-center">
						<div class="overview-loading-spinner mt-3">
							<div class="spinner-border text-primary" role="status">
							</div>
						</div>
					</div>
					<div class="col-5">
						<h6>Loading Account Summary</h6>
						<p class="small">Summaries for accounts with large transaction history may take a while to generate until the account cache is warmed.</p>
					</div>
				</div>
			</StatCard>
		</div>

		<div class="mt-4 row text-center" v-if="summary.successful_trades > 0">
			<div class="col-12 col-md-6 col-lg-3 mt-3 mt-lg-0">
				<StatCard>
					<h2 class="text-left">Transactions</h2>
					<h1>{{ summary.failed_trades + summary.successful_trades }}
					</h1>
				</StatCard>
			</div>
			<div class="col-12 col-md-6 col-lg-3 mt-3 mt-lg-0">
				<StatCard>
					<h2 class="text-left">Success <small class="xsmall grey">{{ ((summary.failed_trades + summary.successful_trades) / summary.successful_trades).toFixed(2) }}%</small></h2>
					<h1>{{ summary.successful_trades }}
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
					<div class="card h-100 token-card" v-on:click="setActiveToken(token)">
						<div class="card-body p-0 pt-1 h-100">
							<img style="max-height: 32px" v-if="tokenInfo[token.mint]" class="token-logo"
									:src="tokenInfo[token.mint].logoURI" alt="">
							<div v-else style="font-size: 0.4em">{{ token.mint }}</div>
						</div>
						<div class="card-footer p-0">
							<span style="font-size: 0.8em">{{ prices[token.mint] ? prices[token.mint].symbol : token.mint.substr(0, 4) }} <small>({{ token.trade_summary.length }})</small></span>
						</div>
					</div>
				</div>
			</div>
		</div>



		<div class="col-12 mt-3">
			<StatCard>
				<h4>GRAPH</h4>
				<TokenGraph :active-token="activeTokenSummary.mint" :summary="summary"></TokenGraph>
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
								<th>Signature</th>
								<th>Block</th>
								<th>Time</th>
								<th>Gas Cost</th>
								<th>Change Amount</th>
								<th>Value (today)</th>
							</tr>
							</thead>
							<tbody>
							<TxnRow :diff="trade.diff" :prices="prices" :token-info="tokenInfo" :txn="adapted(trade)" v-for="(trade, key) in filteredTradeSummary"
									:key="`${activeTokenSummary.mint}-${key}`"></TxnRow>
							</tbody>
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
				mint: "11111111111111111111111111111111",
				trade_summary: [],
			},
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