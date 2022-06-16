<template>
	<div class="container">
		<div class="col-12 mt-3">
			<OverviewCard :prices="prices"></OverviewCard>
		</div>


		<div class="col-12 mt-3">
			<StatCard>
				TODO Lil Graph

			</StatCard>
		</div>

		<div class="col-12 mt-3">
			<StatCard>
				<h3><i class="fa fa-wallet me-2"></i> TOKENS</h3>
				<TokenTable :prices="prices" :token-info="tokenInfo" :ua="userAsset"></TokenTable>
			</StatCard>
		</div>

		<div class="col-12 mt-3">
			<StatCard>
				<h3><i class="fa fa-arrow-right-arrow-left me-2"></i> TRANSACTIONS</h3>
				<TxnTable :prices="prices" :mgr="txnManager" :token-info="tokenInfo" :ua="userAsset"></TxnTable>
			</StatCard>
		</div>

	</div>
</template>

<script>
import StatCard from "../components/dashboard/StatCard";
import TokenTable from "../components/dashboard/TokenTable";
import TxnTable from "../components/dashboard/TxnTable";
import {UserTokens} from "../util/user_tokens";
import {TransactionManager} from "../util/transaction_manager";
import OverviewCard from "../components/dashboard/OverviewCard";

export default {
	name: "AccountShow",
	components: {OverviewCard, TxnTable, TokenTable, StatCard},
	data() {
		return {
			prices: {},
			userAsset: null,
			txnManager: null,
			tokenInfo: {},
		}
	},
	beforeMount() {
		this.txnManager = new TransactionManager()
		this.userAsset = new UserTokens();

		this.tokenInfo[this.$route.params.id] = {
			logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
			name: "Solana (Native)",
			decimals: 9,
		}

		this.tokenInfo["1111111111111111111111111111111111111111111"] = {
			logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
			name: "Solana (Native)",
			decimals: 9,
		}
	},
	mounted() {
		this.userAsset.getTokenPrices().then(r => {
			const sol = r.data["So11111111111111111111111111111111111111112"]
			r.data[this.$route.params.id] = sol //SOL native
			r.data["1111111111111111111111111111111111111111111"] = sol //SOL native

			this.prices = r.data
		})

		this.userAsset.getTokenInfo().then((r) => {
			console.log("Token info", r.data)

			for (let token of r.data) {
				this.tokenInfo[token.address] = token
			}
		})

		this.txnManager.get(this.$route.params.id);
	},
}
</script>

<style scoped>

</style>