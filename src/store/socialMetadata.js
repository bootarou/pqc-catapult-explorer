/*
 * Copyright (c) 2019-present for NEM
 * Licensed under the Apache License, Version 2.0
 */

import { MetadataService } from '../infrastructure';

const SOCIAL_METADATA_ACTIONS = [
	'initializePage',
	'uninitializePage',
	'fetchSocialMetadata'
];

const SOCIAL_METADATA_GETTERS = [
	'getInitialized',
	'isLoading',
	'getSocialMetadata'
];

const socialMetadata = {
	namespaced: true,
	
	state: {
		loading: false,
		socialMetadata: []
	},

	getters: {
		isLoading: state => state.loading,
		getSocialMetadata: state => state.socialMetadata
	},

	mutations: {
		setLoading(state, loading) {
			state.loading = loading;
		},
		setSocialMetadata(state, data) {
			state.socialMetadata = data;
		}
	},

	actions: {
		async fetchSocialMetadata({ commit }) {
			console.log('Fetching social metadata...');
			commit('setLoading', true);
			try {
				const socialMetadata = await MetadataService.getAllSocialMetadata();
				console.log('Fetched social metadata:', socialMetadata.length, 'items');
				commit('setSocialMetadata', socialMetadata);
			} catch (error) {
				console.error('Error fetching social metadata:', error);
				commit('setSocialMetadata', []);
			} finally {
				commit('setLoading', false);
			}
		}
	}
};

export default socialMetadata;