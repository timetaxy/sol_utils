<template>
	<StatCard>
		<div class="row">
			<div class="col-6">
		<pre>
			<code>{{ txn }}</code>
		</pre>
			</div>
			<div class="col-6">
				<pre>
			<code>{{ trades }}</code>
		</pre>
			</div>
		</div>
	</StatCard>
</template>

<script>
import {TransactionManager} from "../util/transaction_manager";
import StatCard from "../components/dashboard/StatCard";

export default {
	name: "TransactionShow",
	components: {StatCard},
	data() {
		return {
			mgr: null,
			txn: null,
			trades: [],
		}
	},
	mounted() {
		this.mgr = new TransactionManager()
		this.mgr.getTxn(this.$route.params.id).then(r => {
			console.log("Txn", r)
			this.txn = r.txn

			for(let i = 0; i < r.summary.length; i++) {
				delete r.summary[i].transaction
				this.trades.push(r.summary[i])
			}

		})
	}
}
</script>

<style scoped>

</style>