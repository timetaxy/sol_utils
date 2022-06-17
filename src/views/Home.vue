<template>
	<div>
		<div class="row">

			<div class="col-6 offset-3 mt-5 text-center">

				<h1 class="text-white mb-0">Arberling</h1>
				<h3 class="grey">The Solana Arbitrage Tracker</h3>
				<img class="mb-5 mt-3" src="@/assets/images/logo.png" alt="Arberling Logo">

				<form class="mt-5" @submit="searchAddress">
					<input v-model="form.search" class="form-control" type="text" placeholder="Address">

					<div class="row">
						<button type="submit" class="btn btn-outline-light btn-lg my-4">SEARCH</button>
					</div>
				</form>

				<div class="row text-white">
					<div class="card">
						<div class="card-body p-1">
							<h6 class="text-white text-left">Recent Searches</h6>
							<div v-for="(search, key) in recentSearches" :key="key">
								<div class="recent-search p-2 my-2" @click="go(search)">{{ search }}</div>
							</div>
						</div>
					</div>
				</div>

			</div>

		</div>
	</div>
</template>

<script>
export default {
	name: "Home",
	data() {
		return {
			form: {
				search: '',
			},
			recentSearches: [],
		}
	},
	methods: {
		go: function (search) {
			this.form.search = search;
			this.pushSearch(this.form.search)
			this.$router.push(`/account/${this.form.search}`)
		},

		searchAddress: function (e) {
			e.preventDefault()

			this.pushSearch(this.form.search)
			this.$router.push(`/account/${this.form.search}`)
		},

		pushSearch: function (search) {
			const recent = this.getRecentSearches()
			if (recent.includes(search)) {
				return
			}

			recent.push(search)
			localStorage.setItem("recentSearches", JSON.stringify(recent))
		},

		getRecentSearches: function () {
			let recent = localStorage.getItem("recentSearches")
			if (recent === null)
				recent = []
			else
				recent = JSON.parse(recent)

			return recent
		}
	},
	mounted() {
		this.recentSearches = this.getRecentSearches()
	}
}
</script>

<style scoped>

.recent-search {
	border-radius: 7px;
	cursor: pointer;
}

.recent-search:hover {
	background: rgba(255, 255, 255, 0.1);
}
</style>