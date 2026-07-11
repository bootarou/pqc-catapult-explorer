<template>
	<Card>
		<template #title>
			{{ widgetTitle }}
		</template>
		<template #body>
			<div class="smd-widget">
				<div v-if="loading" class="loading-container">
					<Loading />
				</div>
				
				<div v-else>
					<div v-if="socialMetadata.length === 0" class="no-data">
						<p>{{ getNameByKey('noDataFound') || 'No social metadata found' }}</p>
					</div>

					<div v-else>
						<!-- Sort Controls -->
						<div class="sort-controls">
							<label for="sortSelect">{{ getNameByKey('sortBy') || 'Sort by' }}:</label>
							<select id="sortSelect" v-model="sortBy" @change="applySorting" class="sort-select">
								<option value="default">{{ getNameByKey('sortDefault') || 'Default' }}</option>
								<option value="name">{{ getNameByKey('sortName') || 'Name' }}</option>
								<option value="namespace">{{ getNameByKey('sortNamespace') || 'Namespace' }}</option>
								<option value="url">{{ getNameByKey('sortUrl') || 'URL' }}</option>
							</select>
							<button @click="toggleSortOrder" class="sort-order-btn" :title="sortOrder === 'asc' ? (getNameByKey('sortAscending') || 'Ascending') : (getNameByKey('sortDescending') || 'Descending')">
								{{ sortOrder === 'asc' ? '↑' : '↓' }}
							</button>
						</div>

						<div class="smd-grid">
							<div 
								v-for="(item, index) in sortedSocialMetadata" 
								:key="index"
								class="smd-card"
							>
								<div class="smd-card-image">
									<img 
										v-if="item.imageUrl && !getImageErrorStatus(item.id)" 
										:src="item.imageUrl" 
										:alt="item.name"
										@error="handleImageError($event, item.id)"
										@load="handleImageLoad(item.id)"
									>
									<div v-else class="placeholder-image">
										<img :src="accountIcon" :alt="item.name || 'Account'" class="account-icon">
									</div>
								</div>
								<div class="smd-card-content">
									<h5 class="smd-card-title">{{ item.name || 'Unnamed' }}</h5>
									<p class="smd-card-url" @click="openUrl(item.url)">{{ item.url || 'No URL' }}</p>
									<p v-if="item.targetAddress" class="smd-card-address" @click="openAccountPage(item.targetAddress)">
										{{ item.targetAddress }}
									</p>
									<p v-if="item.namespace" class="smd-card-namespace" @click="openNamespacePage(item.namespace)">
										Namespace: {{ item.namespace }}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>
	</Card>
</template>

<script>
import Card from '@/components/containers/Card.vue';
import Loading from '@/components/Loading.vue';
import http from '@/infrastructure/http';
import IconAccounts from '@/styles/img/account.png';

export default {
	components: {
		Card,
		Loading
	},

	props: {
		title: {
			type: String,
			default: null // computedで動的に設定
		}
	},

	data() {
		return {
			imageErrors: [], // 画像読み込みエラーを追跡
			accountIcon: IconAccounts, // アカウントアイコン
			sortBy: 'default', // 並び替え基準
			sortOrder: 'asc' // 並び替え順序 (asc/desc)
		};
	},

	computed: {
		getNameByKey() {
			return this.$store.getters['ui/getNameByKey'];
		},

		widgetTitle() {
			return this.title || this.getNameByKey('socialMetadataTitle') || 'Social Metadata';
		},
		
		socialMetadata() {
			return this.$store.getters['socialMetadata/getSocialMetadata'];
		},
		
		loading() {
			return this.$store.getters['socialMetadata/isLoading'];
		},

		sortedSocialMetadata() {
			const data = [...this.socialMetadata];
			
			if (this.sortBy === 'default') {
				return data; // 元の順序を維持
			}

			return data.sort((a, b) => {
				let valueA, valueB;
				
				switch (this.sortBy) {
					case 'name':
						valueA = (a.name || '').toLowerCase();
						valueB = (b.name || '').toLowerCase();
						break;
					case 'namespace':
						valueA = (a.namespace || '').toLowerCase();
						valueB = (b.namespace || '').toLowerCase();
						break;
					case 'url':
						valueA = (a.url || '').toLowerCase();
						valueB = (b.url || '').toLowerCase();
						break;
					default:
						return 0;
				}

				let result = valueA.localeCompare(valueB);
				return this.sortOrder === 'desc' ? -result : result;
			});
		}
	},

	mounted() {
		// NODE_URLが利用可能になったら初期データを取得
		this.$nextTick(async () => {
			// http.nodeUrlが利用可能になるまで待機
			let attempts = 0;
			const maxAttempts = 10;
			
			const waitForNodeUrl = async () => {
				if (http.nodeUrl && this.socialMetadata.length === 0 && !this.loading) {
					await this.$store.dispatch('socialMetadata/fetchSocialMetadata');
					return;
				}
				
				attempts++;
				if (attempts < maxAttempts) {
					setTimeout(waitForNodeUrl, 500);
				} else {
					console.warn('NODE_URL not available after maximum attempts');
				}
			};
			
			await waitForNodeUrl();
		});
	},

	methods: {
		openUrl(url) {
			if (url) {
				window.open(url, '_blank');
			}
		},

		openAccountPage(targetAddress) {
			if (targetAddress) {
				this.$router.push(`/accounts/${targetAddress}`);
			}
		},

		openNamespacePage(namespace) {
			if (namespace) {
				this.$router.push(`/namespaces/${namespace}`);
			}
		},

		applySorting() {
			// Sort is automatically applied via computed property
			console.log('Sorting by:', this.sortBy, 'Order:', this.sortOrder);
		},

		toggleSortOrder() {
			this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
		},

		handleImageError(event, itemId) {
			// 画像エラーを記録
			if (!this.imageErrors.includes(itemId)) {
				this.imageErrors.push(itemId);
			}
			console.warn('Image load failed for:', itemId);
		},

		handleImageLoad(itemId) {
			// 画像が正常に読み込まれた場合、エラー状態をクリア
			const index = this.imageErrors.indexOf(itemId);
			if (index > -1) {
				this.imageErrors.splice(index, 1);
			}
		},

		getImageErrorStatus(itemId) {
			return this.imageErrors.includes(itemId);
		}
	}
};
</script>

<style lang="scss" scoped>
.smd-widget {
	padding: 20px;
}

.loading-container {
	display: flex;
	justify-content: center;
	padding: 40px 0;
}

.no-data {
	text-align: center;
	padding: 40px 0;
	color: var(--secondary-text);
}

.sort-controls {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 20px;
	padding: 10px;
	background-color: var(--card-bg);
	border-radius: 8px;
	border: 1px solid var(--card-border);
}

.sort-controls label {
	font-size: 14px;
	font-weight: 500;
	color: var(--primary-text);
}

.sort-select {
	padding: 6px 12px;
	border: 1px solid var(--card-border);
	border-radius: 4px;
	background-color: var(--card-bg);
	color: var(--primary-text);
	font-size: 14px;
	cursor: pointer;
}

.sort-order-btn {
	padding: 6px 10px;
	border: 1px solid var(--card-border);
	border-radius: 4px;
	background-color: var(--primary);
	color: white;
	font-size: 16px;
	font-weight: bold;
	cursor: pointer;
	transition: background-color 0.2s ease;
}

.sort-order-btn:hover {
	background-color: var(--primary-hover);
}

.smd-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 20px;
	margin-top: 20px;
}

.smd-card {
	border: 1px solid var(--card-border);
	border-radius: 8px;
	padding: 16px;
	background-color: var(--card-bg);
	cursor: pointer;
	transition: all 0.2s ease;
	
	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border-color: var(--primary);
	}
}

.smd-card-image {
	width: 64px;
	height: 64px;
	border-radius: 50%;
	overflow: hidden;
	margin-bottom: 12px;
	background-color: #140202;
	
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.placeholder-image {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.account-icon {

		padding: 8px;
        background-color: rgb(22 23 26 / 0%);
		border-radius: 50%;
		filter: brightness(0) invert(1); /* 白色にする */
	}
}

.smd-card-title {
	font-size: 16px;
	font-weight: 600;
	margin-bottom: 8px;
	color: var(--primary-text);
}

.smd-card-url {
	font-size: 14px;
	color: var(--link-text);
	margin-bottom: 4px;
	word-break: break-all;
	cursor: pointer;
	transition: color 0.2s ease;
	
	&:hover {
		color: var(--primary);
		text-decoration: underline;
	}
}

.smd-card-address {
	font-size: 12px;
	color: var(--primary);
	margin-bottom: 4px;
	font-family: monospace;
	font-weight: bold;
	word-break: break-all;
	cursor: pointer;
	transition: color 0.2s ease;
	
	&:hover {
		color: var(--primary-hover);
		text-decoration: underline;
	}
}

.smd-card-namespace {
	font-size: 12px;
	color: var(--primary);
	font-weight: bold;
	margin: 0;
	cursor: pointer;
	transition: color 0.2s ease;
	
	&:hover {
		color: var(--primary-hover);
		text-decoration: underline;
	}
}
</style>