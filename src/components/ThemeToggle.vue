<template>
	<b-dropdown
		variant="outline-dark-mode-blue border-transparent"
		:text="themeLabel"
		size="sm"
		right
		class="theme-selector-dropdown"
	>
		<b-dropdown-item
			class="ex-dropdown-item"
			@click="setTheme('')"
			:class="{ active: !isDarkMode }"
		>
			<svg class="dropdown-icon light-icon" viewBox="0 0 24 24" fill="currentColor">
				<path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
			</svg>
			LIGHT MODE
		</b-dropdown-item>
		<b-dropdown-item
			class="ex-dropdown-item"
			@click="setTheme('darkMode')"
			:class="{ active: isDarkMode }"
		>
			<svg class="dropdown-icon dark-icon" viewBox="0 0 24 24" fill="currentColor">
				<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
			</svg>
			DARK MODE
		</b-dropdown-item>
	</b-dropdown>
</template>

<script>
export default {
	mounted () {
		// get theme from localstorage
		let theme = this.$store.getters['ui/theme'];

		// set default to lightMode if not theme specify (business-friendly)
		if (null === theme)
			theme = '';

		this.$store.dispatch('ui/changeTheme', theme);

		this.isDarkMode = 'darkMode' === theme;
	},

	data () {
		return {
			isDarkMode: false
		};
	},

	computed: {
		currentTheme() {
			return this.$store.getters['ui/theme'];
		},
		themeLabel() {
			return 'Theme: ' + (this.isDarkMode ? 'DARK' : 'LIGHT');
		}
	},

	watch: {
		currentTheme(newTheme) {
			console.log('Theme changed in store:', newTheme);
			this.isDarkMode = newTheme === 'darkMode';
			console.log('isDarkMode updated to:', this.isDarkMode);
		}
	},

	methods: {
		setTheme(theme) {
			console.log('Setting theme to:', theme);
			this.isDarkMode = theme === 'darkMode';
			this.$store.dispatch('ui/changeTheme', theme);
		}
	}
};
</script>

<style lang="scss" scoped>
.theme-selector-dropdown {
    .dropdown-toggle {
        border: 0;
        color: #acc5ce;
    }

    .dropdown-menu {
        border: 0;
        background: #3d7397c4;
    }

    .ex-dropdown-item {
        text-transform: uppercase;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;

        &.active {
            background-color: rgba(255, 255, 255, 0.1);
            color: #fff;
        }

        &:hover {
            background-color: rgba(255, 255, 255, 0.05);
        }
    }

    .dropdown-icon {
        width: 16px;
        height: 16px;

        &.light-icon {
            color: #fbbf24;
        }

        &.dark-icon {
            color: #a78bfa;
        }
    }
}

.dropdown-toggle::after {
    vertical-align: middle;
}
</style>
