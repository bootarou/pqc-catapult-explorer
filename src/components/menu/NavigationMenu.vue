<template>
	<header
		class="ex-menu header-gradinet"
		:class="{'ex-menu-fixed': fixed }"
		ref="DesktopMenu"
	>
		<div class="width-limiter">
			<router-link to="/" :class="{'hide': !fixed}">
				<img src="../../styles/img/symbol_logo_200px.png" class="menu-logo" width="30px" height="30px"/>
			</router-link>
			<router-link
				v-for="item in items"
				:key="'dsktp_mn_'+getNameByKey(item.text)"
				class="ex-menu-item"
				:to="item.to" exact active-class="active"
			>
				<img v-if="iconUrl(item.icon)" width="15px" height="15px" :src="iconUrl(item.icon)" class="menu-icon" alt="menu icon"/>
				<span>{{getNameByKey(item.text)}}</span>
			</router-link>
		</div>
	</header>
</template>

<script>
import { pageMenu } from '../../config/';
import MenuComponent from './MenuComponent.vue';

export default {
	extends: MenuComponent,

	mounted () {
		let { DesktopMenu } = this.$refs;

		let offset = DesktopMenu.offsetTop;

		window.onscroll = () => {
			if (window.pageYOffset > offset) {
				this.fixed = true;
            }
            else {
				this.fixed = false;
            }
		};
	},

	computed: {
		isTestnet () {
			return this.$store.getters['api/isTestnet'];
		}
	},

	data () {
		return {
			items: pageMenu.items,
			fixed: false,
			scrollListener: {}
		};
	}
};
</script>

<style lang="scss" scoped>
.header-gradinet {
    background: var(--navigation-bg);
    border-bottom: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

[data-theme="darkMode"] .header-gradinet {
    background: var(--navigation-bg);
    border-bottom: 1px solid #4a5568;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
}

.ex-menu {
    padding: 0 60px;
    position: relative;

    .width-limiter {
        display: flex;
        align-items: center;
        width: 100%;
        max-width: $navmenu-max-width;
        margin-left: auto;
        margin-right: auto;
    }

    .menu-logo {
        width: 30px;
        margin-right: 15px;
    }

    .ex-menu-item {
        padding: 8px 20px;
        color: #374151;
        text-decoration: none;
        letter-spacing: 1px;
        position: relative;
        transition: all 0.2s ease-in-out;
        width: auto;
        display: inline-block;
        font-size: 13px;
        line-height: 24px;
        font-weight: 600;
        opacity: 1;
        text-transform: uppercase;
        background-color: rgba(107, 114, 128, 0.2);
        border: 1px solid rgba(107, 114, 128, 0.3);
        border-radius: 6px;
        margin: 0 4px;

        &:hover {
            background-color: rgba(107, 114, 128, 0.35);
            border-color: rgba(107, 114, 128, 0.5);
            opacity: 1;
            transform: translateY(-1px);
        }

        .menu-icon {
            margin-right: 8px;
            opacity: 1;
            width: 32px;
            height: 32px;
            filter: brightness(0.7);
        }
    }

    .ex-menu-item.active {
        color: #{$primary-color};
        font-weight: 600;
        opacity: 1;
        background-color: rgba(37, 99, 235, 0.25);
        border-color: rgba(37, 99, 235, 0.4);
        
        .menu-icon {
            opacity: 1;
            width: 32px;
            height: 32px;
            filter: none;
        }
    }

    // Dark mode styles
    [data-theme="darkMode"] & {
        .ex-menu-item {
            color: #cbd5e0;
            background-color: rgba(74, 85, 104, 0.3);
            border: 1px solid rgba(74, 85, 104, 0.4);

            &:hover {
                background-color: rgba(74, 85, 104, 0.5);
                border-color: rgba(74, 85, 104, 0.6);
                color: #e2e8f0;
            }

            .menu-icon {
                filter: brightness(1.2);
            }
        }

        .ex-menu-item.active {
            color: #60a5fa;
            background-color: rgba(96, 165, 250, 0.25);
            border-color: rgba(96, 165, 250, 0.4);
            
            .menu-icon {
                filter: none;
            }
        }
    }

    .ex-menu-item::before {
        opacity: 0;
        content: '';
        position: absolute;
        left: 0;
        width: 100%;
        height: 4px;
        background: #{$primary-color};
        transition: all 0.2s ease-in-out;
        bottom: 0;
    }

    .ex-menu-item.active::before {
        background-color: #{$primary-color};
        opacity: 1;
    }
}

.ex-menu-fixed {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
}

.hide {
    display: none;
}
</style>
