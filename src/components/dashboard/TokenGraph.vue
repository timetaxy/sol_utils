<template>
	<div class="token-graph">
		<div class="loading-screen" :class="summary.loading ? 'active' : ''">
			<div class="row">
				<div class="col text-center">
					<div class="overview-loading-spinner mt-3">
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

		<div v-if="!summary.loading">
			<v-chart class="chart" :option="graphOptions"/>
		</div>


	</div>
</template>

<script>
import {use} from "echarts/core";
import {CanvasRenderer} from "echarts/renderers";
import {LineChart} from "echarts/charts";
import {GridComponent, TitleComponent, TooltipComponent,} from "echarts/components";
import VChart from "vue-echarts";


use([
	GridComponent,
	CanvasRenderer,
	LineChart,
	TitleComponent,
	TooltipComponent,
]);

export default {
	name: "TokenGraph",
	components: {VChart},
	props: {
		summary: {
			type: Object,
			required: true,
		},
	},
	computed: {
		solData() {
			const solAmountArr = [];
			const labelArr = [];
			const st = this.summary.tokens['So11111111111111111111111111111111111111112'];
			if (!st)
				return solAmountArr;


			let largestGainAmount = 0;
			let largestGainIdx = 0;
			let largestLossAmount = 0;
			let largestLossIdx = 0;

			let lastAmount = 0;
			for (let i = 0; i < st.trade_summary.length; i++) {
				if (st.trade_summary[i].diff > 4000000000 || st.trade_summary[i].diff < -1080000000)
					continue

				// solAmountArr.push(st.trade_summary[i].diff);
				solAmountArr.push(lastAmount + st.trade_summary[i].diff);

				labelArr.push(st.trade_summary[i].block);
				lastAmount += st.trade_summary[i].diff;

				if (st.trade_summary[i].diff > largestGainAmount) {
					largestGainAmount = st.trade_summary[i].diff;
					largestGainIdx = i;
				}

				if (st.trade_summary[i].diff < largestLossAmount) {
					largestLossAmount = st.trade_summary[i].diff;
					largestLossIdx = i;
				}

			}

			return {
				biggestGain: st.trade_summary[largestGainIdx],
				biggestLoss: st.trade_summary[largestLossIdx],
				labels: labelArr,
				data: solAmountArr,
			};
		},

		graphOptions() {
			const solData = this.solData;

			const limit = 801;
			const offset = this.solData.data.length - limit;


			console.log("Soldata", solData.data.slice(offset, offset + limit));
			return {
				id: "Block",
				grid: {
					show: false,
				},
				xAxis: {
					type: 'category',
					data: solData.labels.slice(offset,offset + limit),
					boundaryGap: false,
					splitLine: {
						show: false
					},
				},
				yAxis: {
					type: 'value',
					splitLine: {
						show: false
					},
				},
				tooltip: {
					trigger: "item",
					formatter: "<strong>{a}</strong> <br/>{b} : {c}",
					extraCssText: `background-color: rgba(0,0,0,0.2);color:#fff`,
				},
				series: [
					{
						name: "Tokens",
						type: "line",
						smooth: true,
						lineStyle: {
							// width: 0
							color: '#fff'
						},
						itemStyle: {
							color: '#fff'
						},
						data: solData.data.slice(offset,offset + limit),
						areaStyle: {
							opacity: 0.8,
							color: '#46CE7C'
						},
					}
				]
			}
		}
	}
}
</script>

<style scoped>
.chart {
	height: 500px;
}
</style>