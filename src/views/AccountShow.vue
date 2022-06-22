<template>
	<div class="container">
		<div class="col-12 mt-3">
			<StatCard>
				<div class="row">
					<div class="col">
						<h4>{{ $route.params.id }}</h4>
					</div>
					<div class="col-auto">
						<a class="me-2" target="_blank" :href="`https://solscan.io/account/${$route.params.id}`"><img height="24px" src="@/assets/images/solscan.png" alt="a"></a>
						<a class="me-2" target="_blank" :href="`https://explorer.solana.com/account/${$route.params.id}`"><img height="24px" src="@/assets/images/solana_explorer.png" alt="a"></a>
						<a class="me-2" target="_blank" :href="`https://solana.fm//account/${$route.params.id}`"><img height="24px" src="@/assets/images/solanafm.png" alt="a"></a>
					</div>
				</div>

				<AccountProfile :summary="summary" v-if="!summary.loading"></AccountProfile>

				<div class="loading-screen" :class="summary.loading ? 'active' : ''" v-show="summary.loading">
					<div class="row">
						<div class="col text-center">
							<div class="overview-loading-spinner mt-4">
								<div class="spinner-border text-primary" role="status">
								</div>
							</div>
						</div>
						<div class="col-5">
							<h6>Loading Account Summary</h6>
							<p class="small">Summaries for accounts with large transaction history may take a while to generate until the account cache is warmed.</p>
						</div>
					</div>
				</div>
			</StatCard>


			<OverviewCard class="overview" :style="overviewStyle" :summary="summary" :token-info="tokenInfo" :prices="prices"></OverviewCard>
		</div>

		<div class="col-12 mt-3">
			<StatCard>
				<div class="row">
					<div class="col">
						<h3><i class="fa fa-wallet me-2"></i> TOKENS</h3>
					</div>
					<div class="col-auto">
						<button class="btn btn-checkbox mx-2 btn-sm" :class="hideDust ? 'active' : ''"
								v-on:click="hideDust = !hideDust"><span>DUST {{ hideDust ? 'HIDDEN' : 'SHOWN' }}</span></button>
						<button class="btn btn-checkbox mx-2 btn-sm" :disabled="hideDust" :class="hideEmpty ? 'active' : ''"
								v-on:click="hideEmpty = !hideEmpty"><span>EMPTY {{ hideEmpty ? 'HIDDEN' : 'SHOWN' }}</span></button>
					</div>
				</div>
				<TokenTable :hide-dust="hideDust" :hide-empty="hideEmpty" :prices="prices" :token-info="tokenInfo" :ua="userAsset"></TokenTable>
			</StatCard>
		</div>

		<div class="col-12 mt-3">
			<StatCard>
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
import Arberling from "../api/arberling";
import AccountProfile from "../components/dashboard/AccountProfile";

export default {
	name: "AccountShow",
	components: {AccountProfile, OverviewCard, TxnTable, TokenTable, StatCard},
	data() {
		return {
			prices: {},
			userAsset: null,
			txnManager: null,
			tokenInfo: {},
			hideDust: true,
			hideEmpty: true,

			summaryTimeout: null,
			summary: {
				loading: true,
				successful_trades: 0,
				failed_trades: 0,
				gas_spent: 0,
				tokens: {},
				transfers: [],
			},
		}
	},
	computed: {
		overviewStyle() {
			return {
				height: this.summary.loading ? '0' : 'auto',
				maxHeight: this.summary.loading ? '0' : '10000000px',
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
				this.txnManager.setTokenPrices(this.prices)
				this.txnManager.get(this.$route.params.id);
			})
		},

		getSummary() {
			Arberling.summary(this.$route.params.id).then(r => {
				if (r.data.loading) {
					this.summaryTimeout = setTimeout(() => {
						this.getSummary()
					}, 3000)
					return
				}

				this.summary = this.combineWrappedNativeSOL(r.data);
			});
		},


		/**
		 * Combine Native & Wrapped SOL txns into one array for better viewing
		 * @param data
		 * @returns {*}
		 */
		combineWrappedNativeSOL(data) {
			data.tokens["So11111111111111111111111111111111111111112"] = this.combine(
					data.tokens["11111111111111111111111111111111"],
					data.tokens["So11111111111111111111111111111111111111112"]
			)
			delete data.tokens["11111111111111111111111111111111"]

			for (let i = 0; i < data.transfers.length; i++) {
				if (data.transfers[i].mint === "11111111111111111111111111111111") {
					data.transfers[i].mint = "So11111111111111111111111111111111111111112"
				}
			}

			return data;
		},

		combine(ov1, ov2) {
			if (!ov2) {
				return ov1
			}
			if (!ov1) {
				return ov2
			}

			const ov = {
				mint: ov2.mint,
				amount_made: ov1.amount_made + ov2.amount_made,
				failed_trades: ov1.failed_trades + ov2.failed_trades,
				successful_trades: ov1.successful_trades + ov2.successful_trades,
				gas_spent: ov1.gas_spent + ov2.gas_spent,
				trade_summary: ov1.trade_summary.concat(ov2.trade_summary),
			}


			let lastIdx = 0;
			for (let i = 0; i < ov1.trade_summary.length; i++) {
				let t1 = ov1.trade_summary[i]

				for (let l = lastIdx; l < ov2.trade_summary.length; l++) {
					let t2 = ov2.trade_summary[l]

					if (t2.slot >= t1.slot) {
						const pre = ov2.trade_summary.slice(0, l)
						const later = ov2.trade_summary.slice(l + 1)
						pre.push(t1)
						ov2.trade_summary = pre.concat(later)
						lastIdx = l
						break
					}
				}

			}

			return ov;
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
	},
	beforeDestroy() {
		this.txnManager.stop();
		clearTimeout(this.summaryTimeout)
	},
}
</script>

<style scoped>
.overview {
	transition: all 2s ease;
}
</style>