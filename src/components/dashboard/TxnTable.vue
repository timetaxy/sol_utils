<template>
	<div>
		<table class="table table-hover">
			<thead>
			<tr>
				<td>Signature</td>
				<td>Block</td>
				<td>Time</td>
				<td>Gas Cost</td>
				<td>Change Amount</td>
				<td>Token</td>
				<td>Value <small>(today)</small></td>
			</tr>
			</thead>
			<tbody v-if="this.mgr !== null">
			<TxnRow v-for="(txn,key) in filteredTransactions" :key="`${page}-${key}`" :txn="txn" :token-info="tokenInfo" :prices="prices"></TxnRow>
			</tbody>
		</table>
		<div class="row">
			<div class="col">
				<button class="btn btn-outline-light btn-sm" :disabled="!canLoadMore" v-on:click="loadMore">Load More</button>
			</div>
			<div class="col-auto text-end">
				<button class="btn btn-outline-light btn-sm" :disabled="page <= 0" v-on:click="page--">Back</button>
				<span class="mx-3">{{page}}</span>
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
		mgr:{
			type: TransactionManager,
			required: true,
		},
	},
	data() {
		return {
			page: 0,
			limit: 10,
		}
	},
	computed: {
		canGoNext: function () {
			return this.mgr.transactions.filter(txn => txn.err === null).length > (this.page * this.limit) + this.limit
		},

		canLoadMore: function() {
			return !this.canGoNext && !this.mgr.loading;
		},

		filteredTransactions: function () {
			return this.mgr.transactions.filter(txn => txn.err === null).slice(this.page * this.limit, this.page * this.limit + this.limit);
		}
	},
	methods: {
		loadMore: function() {
			this.mgr.pollLimit += 1000
			const lastTxn = this.mgr.transactions[this.mgr.transactions.length - 1]
			this.mgr.get(this.$route.params.id, lastTxn.signature)
		}
	},
}
</script>

<style scoped>
</style>