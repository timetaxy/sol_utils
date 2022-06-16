<template>
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
		<TxnRow v-for="(txn,key) in filteredTransactions" :key="key" :txn="txn" :token-info="tokenInfo" :prices="prices"></TxnRow>
		</tbody>
	</table>
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
	computed: {
		filteredTransactions: function () {
			return this.mgr.transactions.filter(txn => txn.err === null).slice(0, 50);
		}
	},
	methods: {},
}
</script>

<style scoped>
</style>