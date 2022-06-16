<template>
	<div class="overview">
		<div class="mt-4 row text-center">
			<div class="col-3">
				<StatCard>
					<h2 class="text-left">Seen</h2>
					<h1>{{ summary.failed_trades + summary.successful_trades }}
					</h1>
				</StatCard>
			</div>
			<div class="col-3">
				<StatCard>
					<h2 class="text-left">Won</h2>
					<h1>{{ summary.successful_trades }}
					</h1>
				</StatCard>
			</div>
			<div class="col-3">
				<StatCard>
					<h2 class="text-left">Profit</h2>
					<h1>{{ numFormatter.format(total_profit / 1000000000) }}
					</h1>
				</StatCard>
			</div>
			<div class="col-3">
				<StatCard>
					<h2 class="text-left">Gas Spend
						<small style="font-size: 0.5em">
							<SHDW style="height: 18px" mint-addr="So11111111111111111111111111111111111111112"></SHDW>
							<span class="small text-white">{{ gasCostSol }}</span></small></h2>
					<h1>{{ gasCostUsd }}
					</h1>

				</StatCard>
			</div>
		</div>

		<div class="col-12 mt-3">
			<div class="row">
				<div class="col-1 text-center mb-2" v-for="(token,key) in summary.tokens" :key="key">
					<div class="card h-100 token-card" v-on:click="activeTokenSummary = token">
						<div class="card-body p-0 pt-1 h-100">
							<SHDW v-if="prices[token.mint]" :mint-addr="prices[token.mint].address"></SHDW>
							<div v-else style="font-size: 0.4em">{{token.mint}}</div>
						</div>
						<div class="card-footer p-0">
							<span style="font-size: 0.8em">{{ prices[token.mint] ? prices[token.mint].symbol : token.mint.substr(0, 4) }} <small>({{ token.trade_summary.length }})</small></span>
						</div>
					</div>
				</div>
			</div>

			<StatCard v-show="activeTokenSummary.trade_summary.length > 0">
				<h4><SHDW style="height: 1em" v-if="prices[activeTokenSummary.mint]" :mint-addr="prices[activeTokenSummary.mint].address"></SHDW> {{prices[activeTokenSummary.mint] ?
						prices[activeTokenSummary.mint].symbol : ''}} - Transactions</h4>
				<div class="row">
					<div class="col-12">
						<table class="table table-sm table-hover">
							<thead>
							<tr>
								<th>Signature</th>
								<th>Error</th>
								<th>Instructions</th>
								<th>Diff</th>
								<th>Gas</th>
							</tr>
							</thead>
							<tbody>
							<tr v-for="(trade, key) in filteredTradeSummary" :key="key">
								<td>{{ trade.signature }}</td>
								<td>{{ trade.error }}</td>
								<td>{{ trade.instruction_count }}</td>
								<td>{{ trade.diff }}</td>
								<td>{{ trade.gas }}</td>
							</tr>
							</tbody>
						</table>
					</div>
				</div>

			</StatCard>
		</div>
	</div>
</template>

<script>
import Arberling from "../../api/arberling";
import StatCard from "./StatCard";
import SHDW from "../tokens/SHDW";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";

export default {
	name: "OverviewCard",
	components: {SHDW, StatCard},
	props: {
		prices: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			activeTokenSummary: {
				trade_summary: [],
			},
			numFormatter: new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}),
			summary: {
				successful_trades: 0,
				failed_trades: 0,
				gas_spent: 0,
			},
			total_profit: 0,
		}
	},
	computed: {
		gasCostSol: function () {
			return this.summary.gas_spent / LAMPORTS_PER_SOL;
		},
		gasCostUsd: function () {
			return this.numFormatter.format((this.summary.gas_spent / 1000000000) * this.prices['So11111111111111111111111111111111111111112'].value)
		},
		filteredTradeSummary: function () {
			return this.activeTokenSummary.trade_summary.filter(trade => trade.error === false);
		}
	},
	methods: {
		calculateProfit() {
			this.total_profit = 0;
			for (let idx in this.summary.tokens) {
				const token = this.summary.tokens[idx]
				if (this.prices[idx])
					this.total_profit += token.amount_made * this.prices[idx].value;
			}
		},
	},
	mounted() {
		Arberling.summary(this.$route.params.id).then(r => {
			this.summary = r.data;
			this.calculateProfit()
		});
	}
}
</script>

<style scoped>
.token-card:hover {
	cursor: pointer;
	border: #26B6D4 1px solid;
}
</style>