<template>
	<div class="container">
		<div class="col-12 mt-3">
			<OverviewCard class="overview" :style="overviewStyle" :summary="summary" :token-info="tokenInfo" :prices="prices"></OverviewCard>
		</div>


		<div class="col-12 mt-3">
			<StatCard>
				<h4>GRAPH</h4>
				<TokenGraph :summary="summary"></TokenGraph>
			</StatCard>
		</div>

		<div class="col-12 mt-3">
			<StatCard>
				<div class="row">
					<div class="col">
						<h3><i class="fa fa-wallet me-2"></i> TOKENS</h3>
					</div>
					<div class="col-auto">
						<button class="btn btn-checkbox mx-2 btn-sm" :class="hideDust ? 'active' : ''"
								v-on:click="hideDust = !hideDust"><span>DUST {{hideDust ? 'HIDDEN' : 'SHOWN'}}</span></button>
						<button class="btn btn-checkbox mx-2 btn-sm" :disabled="hideDust" :class="hideEmpty ? 'active' : ''"
								v-on:click="hideEmpty = !hideEmpty"><span>EMPTY {{hideEmpty ? 'HIDDEN' : 'SHOWN'}}</span></button>
					</div>
				</div>
				<TokenTable :hide-dust="hideDust" :hide-empty="hideEmpty" :prices="prices" :token-info="tokenInfo" :ua="userAsset"></TokenTable>
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
import TokenGraph from "../components/dashboard/TokenGraph";
import Arberling from "../api/arberling";

export default {
	name: "AccountShow",
	components: {TokenGraph, OverviewCard, TxnTable, TokenTable, StatCard},
	data() {
		return {
			prices: {},
			userAsset: null,
			txnManager: null,
			tokenInfo: {},
			hideDust: false,
			hideEmpty: true,

			summary: {
				loading: true,
				successful_trades: 0,
				failed_trades: 0,
				gas_spent: 0,
				tokens: {},
			},
		}
	},
	computed: {
		overviewStyle() {
			return {
				height: this.summary.loading ? '0' : 'auto',
				maxHeight: this.summary.loading ? '0': '1000px',
				// opacity: this.summary.loading ? '0': '1'
			}
		}
	},
	methods: {
		getInfo() {
			this.userAsset.getTokenInfo().then((r) => {
				console.log("Token info", r.data)

				for (let token of r.data.tokens) {
					this.tokenInfo[token.address] = token
				}
			})
		},

		getPrices() {
			this.userAsset.getTokenPrices().then(r => {
				const sol = r.data["So11111111111111111111111111111111111111112"]
				r.data[this.$route.params.id] = sol //SOL native
				r.data["1111111111111111111111111111111111111111111"] = sol //SOL native
				r.data["11111111111111111111111111111111"] = sol //SOL native

				this.prices = r.data
			})
		},

		getSummary() {
			Arberling.summary(this.$route.params.id).then(r => {
				this.summary = r.data;
			});
		}
	},
	beforeMount() {
		this.txnManager = new TransactionManager()
		this.userAsset = new UserTokens();

		const solNative = {
			logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
			name: "Solana (Native)",
			symbol: "SOL",
			decimals: 9,
		}

		this.tokenInfo[this.$route.params.id] = solNative;
		this.tokenInfo["1111111111111111111111111111111111111111111"] = solNative
		this.tokenInfo["11111111111111111111111111111111"] = solNative
	},
	mounted() {
		this.getPrices();
		this.getInfo();
		this.getSummary()

		this.txnManager.get(this.$route.params.id);
	},
	beforeDestroy() {
		this.txnManager.stop();
	},
}
</script>

<style scoped>
.overview {
	transition: all 2s ease;
}
</style>