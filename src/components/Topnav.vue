<template>
	<nav class="navbar sticky-top navbar-expand-lg navbar-dark bg-dark">
		<div class="container-fluid">
			<router-link class="navbar-brand" to="/explorer">
				<img src="@/assets/images/alpha_logo_new.svg" height="40" class="d-inline-block align-top" alt="AlphaBatem">
			</router-link>
			<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
					aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
				<span class="navbar-toggler-icon"></span>
			</button>
			<div class="collapse navbar-collapse" id="navbarSupportedContent">
				<ul class="navbar-nav me-auto mb-2 mb-lg-0">
					<li class="nav-item active">
						<router-link to="/" class="nav-link text-uppercase" href="#"><i class="fa fa-search"></i> Explorer <span class="sr-only">(current)</span>
						</router-link>
					</li>
				</ul>

				<!--				<div class="nav-item text-white small me-3 mb-3 mb-md-0">-->
				<!--					{{ $store.state.wallet_addr }}-->
				<!--				</div>-->
				<div class="auth">
					<!--					<button v-if="$store.state.wallet_connected" v-on:click="logout" class="btn btn-block btn-outline-light wow fadeIn"-->
					<!--									data-animation-delay="0.3s"><i class="fa fa-arrow-right-from-bracket"></i> LOGOUT-->
					<!--					</button>-->
					<Phantom class="btn btn-outline-light btn-block btn-sm wow fadeIn"></Phantom>
				</div>
			</div>
		</div>
	</nav>
</template>

<script>
import Phantom from "./wallet/Phantom";

export default {
	name: "Topnav",
	components: {Phantom},
	data() {
		return {

			connected: false,
		}
	},
	methods: {
		logout: function () {
			console.log("Logging out")
			window.solana.disconnect().then(() => {
				this.$store.commit('set_wallet_connected', false);
				this.$store.commit('clear_wallet_addr');
				if (this.$route.path !== '/')
					this.$router.push("/");
			})
		},
	}
}
</script>

<style scoped>
.topnav {
	position: fixed;

}

.navbar-brand, .navbar-dark .navbar-nav .nav-link, .nav-item {
	color: white;
}

.sol-icon {
	border-radius: 33px;
}
</style>