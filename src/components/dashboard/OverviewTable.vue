<template>
	<div>
		<div class="row">
			<div class="col">
				<h4><img style="height: 1rem" v-if="tokenInfo[activeTokenSummary.mint]" class="token-logo"
						:src="tokenInfo[activeTokenSummary.mint].logoURI" alt=""> {{
						prices[activeTokenSummary.mint] ?
								prices[activeTokenSummary.mint].symbol : ''
					}} - Transactions</h4>
			</div>
			<div class="col-2">
				<select v-model="limit" class="form-control form-control-sm">
					<option :value="10">10</option>
					<option :value="25">25</option>
					<option :value="50">50</option>
				</select>
			</div>
		</div>
		<div class="row">
			<div class="col-12">
				<table class="table table-sm table-hover">
					<thead>
					<tr class="text-center">
						<td>Signature</td>
						<td class="d-none d-md-table-cell">Block</td>
						<td class="d-none d-lg-table-cell">Time</td>
						<td class="">Token</td>
						<td class="d-none d-lg-table-cell">Gas Cost</td>
						<td class="">Change</td>
						<td class="text-end">Value</td>
					</tr>
					</thead>
					<tbody>
					<TxnRow :diff="trade.diff" :prices="prices" :token-info="tokenInfo" :txn="adapted(trade)" v-for="(trade, key) in paginatedTradeSummary"
							:key="`${activeTokenSummary.mint}-${page}-${key}`"></TxnRow>
					</tbody>
					<tfoot>
					<tr>
						<td><strong>TOTAL</strong></td>
						<td class="d-none d-md-table-cell"></td>
						<td class="d-none d-lg-table-cell"></td>
						<td class="d-none d-lg-table-cell"></td>
						<td></td>
						<td class="text-end" :class="tradeBalance >= 0 ? 'green' : 'red'">{{
								tradeBalance > 0 ? '+'
										: ''
							}}{{ tradeBalance }}
							<img v-if="tokenInfo[activeTokenSummary.mint]" class="token-logo small"
									:src="tokenInfo[activeTokenSummary.mint].logoURI" alt="">
						</td>
						<td class="text-end">{{ numFormatter.format(tradeProfit) }}
							<SHDW mint-addr="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" class="small d-none d-md-inline-block"></SHDW>
						</td>
					</tr>
					</tfoot>
				</table>
				<div class="row">
					<div class="col">
						<!--					<button class="btn btn-outline-light btn-sm" :disabled="!canLoadMore" v-on:click="loadMore">Load More</button>-->
					</div>
					<div class="col-auto text-end">
						<button class="btn btn-outline-light btn-sm" :disabled="page <= 0" v-on:click="page--">Back</button>
						<span class="mx-3">{{ page }}/{{maxPage}}</span>
						<button class="btn btn-outline-light btn-sm" :disabled="!canGoNext" v-on:click="page++">Next</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import TxnRow from "./TxnRow";
import SHDW from "../tokens/SHDW";

export default {
	name: "OverviewTable",
	components: {SHDW, TxnRow},
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
		activeTokenSummary: {
			type: Object,
			required: true,
		}
	},
	data() {
		return {
			page: 0,
			limit: 10,
			simpleFormatter: new Intl.NumberFormat("en-US", {}),
			numFormatter: new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}),
		}
	},
	computed: {
		filteredTradeSummary: function () {
			return this.activeTokenSummary.trade_summary.filter(trade => trade.error === false).sort((a, b) => b.slot - a.slot);
		},

		paginatedTradeSummary: function() {
			return this.filteredTradeSummary.slice(this.page * this.limit, this.page * this.limit +
					this.limit);
		},

		tradeProfit() {
			const tradePrice = this.prices[this.activeTokenSummary.mint] ? this.prices[this.activeTokenSummary.mint].value : 0;
			const amount = this.activeTokenSummary.amount_made * tradePrice;
			return (amount / Math.pow(10, this.tokenInfo[this.activeTokenSummary.mint] ? this.tokenInfo[this.activeTokenSummary.mint].decimals : 9));
		},

		canGoNext: function () {
			return this.filteredTradeSummary.length > (this.page * this.limit) + this.limit
		},

		maxPage: function() {
			return Math.ceil(this.filteredTradeSummary.length / this.limit)
		},

		tradeBalance() {
			return this.activeTokenSummary.amount_made / Math.pow(10, this.tokenInfo[this.activeTokenSummary.mint] ? this.tokenInfo[this.activeTokenSummary.mint].decimals : 9)
		},
	},
	methods: {
		adapted(trade) {
			return Object.assign(trade, {
				slot: trade.slot,
				mint: this.activeTokenSummary.mint,
				meta: {
					fee: trade.gas,
				}
			})
		},
	}
}
</script>

<style scoped>

</style>