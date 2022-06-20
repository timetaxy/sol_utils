<template>
	<div class="profile">
		<div class="row" v-if="!summary.loading">
			<div class="col small">
				<div class="row small grey">
					<div class="col-6">
						<span class="me-2">Last Active:</span><a target="_blank" :href="lastTxnUrl">{{ lastActive }}</a>
					</div>
					<div class="col-6">
						<span class="me-2">Created At:</span><a target="_blank" :href="firstTxnUrl">{{ createdAt }}</a>
					</div>
					<div class="col-12">
						<span class="me-2">Created By:</span><a target="_blank" :href="firstTxnUrl">{{ createdBy }}</a>
					</div>
				</div>
			</div>
			<div class="col-auto">
				<div class="badge me-2 bg-success" v-show="summary.amount_made > 1000">Whale</div>
				<div class="badge me-2 bg-warning" v-show="summary.failed_trades > 1000">Bot</div>
				<div class="badge me-2 bg-info" v-show="firstTxn.blockTime !== 0 && firstTxn.blockTime < Date.now()">Inactive</div>
			</div>
		</div>
	</div>
</template>

<script>
import Arberling from "../../api/arberling";

export default {
	name: "AccountProfile",
	props: {
		summary: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			firstTxn: {
				blockTime: 0,
				signature: '',
			},
			lastTxn: {
				blockTime: 0,
				signature: '',
			},
		}
	},
	computed: {
		firstTxnUrl: function () {
			return `https://solscan.io/tx/${this.summary.first_signature}`;
		},

		lastTxnUrl: function () {
			return `https://solscan.io/tx/${this.summary.last_signature}`;
		},

		lastActive: function () {
			if (this.firstTxn.blockTime === 0)
				return 'N/A';

			return new Date(this.firstTxn.blockTime * 1000).toLocaleString();
		},
		createdAt: function () {
			if (this.lastTxn.blockTime === 0)
				return 'N/A';

			return new Date(this.lastTxn.blockTime * 1000).toLocaleString();
		},
		createdBy: function () {
			if (this.lastTxn.blockTime === 0)
				return 'N/A';

			if (!this.lastTxn.transaction)
				return "-";

			return this.lastTxn.transaction.message.accountKeys[0];
		}
	},
	mounted() {

		if (this.summary.first_signature !== null)
			Arberling.transaction(this.summary.first_signature).then(txn => {
				console.log("first_signature", txn.data)
				this.firstTxn = txn.data
			})

		if (this.summary.last_signature !== null)
			Arberling.transaction(this.summary.last_signature).then(txn => {
				console.log("last_signature", txn.data)
				this.lastTxn = txn.data
			})
	}
}
</script>

<style scoped>

</style>