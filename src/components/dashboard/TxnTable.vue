<template>
	<div>
		<div class="row">
			<div class="col-auto">
				<h3><i class="fa fa-arrow-right-arrow-left me-2"></i> TRANSACTIONS</h3>
			</div>
			<div class="col-1">
				<span v-show="mgr.loading">
					<i class="fa fa-spinner fa-spin"></i>
				</span>
			</div>
			<div class="col text-center small">
				<div class="small">
					<span class="green">{{ mgr.summary.success }}</span>
					<span>/</span>
					<span class="me-3 red">{{ mgr.summary.failed }}</span>
					<span class="me-3 ">Gas: {{ numFormatter.format(recentGasUsed) }}</span>
					<span>Gross: </span><span class="me-3">{{ numFormatter.format(recentAmountMade) }}</span>
					<span>Net: </span><span class="me-3" :class="`${recentProfit > 0 ? 'green' : 'red'}`">{{ numFormatter.format(recentProfit) }}</span>
				</div>
			</div>
			<div class="col-auto">
				<button class="btn btn-checkbox mx-2 btn-sm" :class="!showErrors ? 'active' : ''"
						v-on:click="showErrors = !showErrors"><span>ERRORS {{ showErrors ? 'SHOWN' : 'HIDDEN' }}</span></button>
			</div>
			<div class="col-2">
				<select v-model="limit" class="form-control form-control-sm">
					<option :value="10">10</option>
					<option :value="25">25</option>
					<option :value="50">50</option>
					<option :value="100">100</option>
				</select>
			</div>
		</div>
		<table class="table table-hover">
			<thead>
			<tr>
				<td>Signature</td>
				<td class="d-none d-md-table-cell">Block</td>
				<td class="d-none d-lg-table-cell">Time</td>
				<td>Token</td>
				<td class="d-none d-lg-table-cell">Gas Cost</td>
				<td>Change</td>
				<td class="text-end">Value</td>
			</tr>
			</thead>
			<tbody v-if="this.mgr !== null">
			<TxnRow v-for="(txn,key) in filteredTransactions" :key="`${showErrors}${txn.signature}-${showErrors}-${page}-${key}`" :txn="txn" :token-info="tokenInfo" :prices="prices"
					:mgr="mgr"></TxnRow>
			</tbody>
		</table>
		<div class="row">
			<div class="col">
				<button class="btn btn-outline-light btn-sm" :disabled="!canLoadMore" v-on:click="loadMore">Load More</button>
			</div>
			<div class="col-auto text-end">
				<button class="btn btn-outline-light btn-sm" :disabled="page <= 0" v-on:click="page--">Back</button>
				<span class="mx-3">{{ page }}</span>
				<button class="btn btn-outline-light btn-sm" :disabled="!canGoNext" v-on:click="page++">Next</button>
			</div>
		</div>
	</div>
</template>

<script>
import TxnRow from "./TxnRow";
import {TransactionManager} from "../../util/transaction_manager";
import {UserTokens} from "../../util/user_tokens";

export default {
	name: "TxnTable",
	components: {TxnRow},
	props: {
		tokenInfo: {
			type: Object,
			required: true,
		},
		prices: {
			type: Object,
			required: true,
		},
		ua: {
			type: UserTokens,
			required: true,
		},
		mgr: {
			type: TransactionManager,
			required: true,
		},
	},
	data() {
		return {
			txnPolling: null,
			showErrors: false,
			page: 0,
			limit: 10,
			numFormatter: new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
				minimumFractionDigits: 3,
			}),
		}
	},
	computed: {
		recentAmountMade: function () {
			return this.mgr.summary.amountMade
		},
		recentGasUsed: function () {
			if (!this.prices["So11111111111111111111111111111111111111112"])
				return 0

			const cost = (this.mgr.summary.gas / Math.pow(10, 9)) * this.prices["So11111111111111111111111111111111111111112"].value;
			return cost
		},

		recentProfit: function () {
			return this.recentAmountMade - this.recentGasUsed;
		},

		canGoNext: function () {
			return this.mgr.trades.filter(txn => txn.err === null).length > (this.page * this.limit) + this.limit
		},

		canLoadMore: function () {
			return !this.canGoNext && !this.mgr.loading;
		},

		filteredTransactions: function () {
			if (this.showErrors)
				return this.mgr.trades.slice(this.page * this.limit, this.page * this.limit + this.limit);

			return this.mgr.trades.filter(txn => txn.err === null).slice(this.page * this.limit, this.page * this.limit + this.limit);
		}
	},
	methods: {
		loadMore: function () {
			this.mgr.pollLimit += 1000
			const lastTxn = this.mgr.trades[this.mgr.trades.length - 1]
			this.mgr.get(this.$route.params.id, lastTxn.signature)
		},
		loadRecent: function () {
			const firstTxn = this.mgr.trades[0]
			console.log("Checking for recent txns since", firstTxn)
			this.mgr.get(this.$route.params.id, null, firstTxn.signature).then((newTrades) => {
				if (newTrades.length === 0)
					return

				for (let i = 0; i < newTrades.length; i++) {

					if (newTrades[i].err !== null) {
						this.$toastr.e(`<small>${newTrades[i].signature.substr(0,32)}</small>`, "Transaction Failed")
					} else {
						this.$toastr.s(`<small>${newTrades[i].signature.substr(0,32)}</small>`, "Transaction Success")
					}
				}

				console.log("New Trades", newTrades)
			})

		},
	},
	mounted() {
		this.txnPolling = setInterval(() => {
			this.loadRecent()
		}, 3000)
	},
	beforeDestroy() {
		clearInterval(this.txnPolling)
	}
}
</script>

<style scoped>
</style>