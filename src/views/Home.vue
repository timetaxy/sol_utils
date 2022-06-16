<template>
	<div>
		<div class="row">

			<div class="col-6 offset-3 mt25">
				<form @submit="searchAddress">
					<input v-model="form.search" class="form-control" type="text" placeholder="Address">

					<div class="row">
						<button type="submit" class="btn btn-outline-light btn-lg mt-3">SEARCH</button>
					</div>
				</form>

				<div class="row text-white mt-3">
					<div class="card">
						<div class="card-body p-1">
							<div v-for="(search, key) in recentSearches" :key="key">
								<div class="recent-search p-2 my-2" @click="go(search)">{{search}}</div>
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
		go: function(search) {
			this.form.search = search;
			this.pushSearch(this.form.search)
			this.$router.push(`/account/${this.form.search}`)
		},

		searchAddress: function (e) {
			e.preventDefault()

			this.pushSearch(this.form.search)
			this.$router.push(`/account/${this.form.search}`)
		},

		pushSearch: function(search) {
			const recent = this.getRecentSearches()
			if (recent.includes(search)) {
				return
			}

			recent.push(search)
			localStorage.setItem("recentSearches", JSON.stringify(recent))
		},

		getRecentSearches: function(){
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
.mt25 {
	margin-top: 20%;
}

.recent-search {
	border-radius: 7px;
	cursor: pointer;
}

.recent-search:hover {
	background: rgba(255, 255, 255, 0.1);
}
</style>