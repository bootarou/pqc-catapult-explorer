/*
 *
 * Copyright (c) 2019-present for NEM
 *
 * Licensed under the Apache License, Version 2.0 (the "License ");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import http from './http';
import Constants from '../config/constants';
import { Convert, Address } from 'symbol-sdk';

class MetadataService {
	/**
	 * Gets a metadata from searchCriteria.
	 * @param {object} metadataSearchCriteria Search Criteria.
	 * @returns {object} formatted metadatas with pagination info.
	 */
	static searchMetadatas = async metadataSearchCriteria => {
		const searchMetadatas = await http.createRepositoryFactory
			.createMetadataRepository()
			.search(metadataSearchCriteria)
			.toPromise();

		return {
			...searchMetadatas,
			data: searchMetadatas.data.map(metadata => this.formatMetadata(metadata))
		};
	};

	/**
	 * Format Metadata to readable object.
	 * @param {object} metadata - metadata DTO.
	 * @returns {object} readable Metadata object.
	 */
	static formatMetadata = metadata => ({
		metadataId: metadata.id,
		...this.formatMetadataEntry(metadata.metadataEntry)
	});

	/**
	 * Format MetadataEntry to readable object.
	 * @param {object} metadataEntry - metadataEntry DTO.
	 * @returns {object} readable metadataEntry object.
	 */
	static formatMetadataEntry = metadataEntry => ({
		...metadataEntry,
		scopedMetadataKey: metadataEntry.scopedMetadataKey.toHex(),
		sourceAddress: metadataEntry.sourceAddress.plain(),
		targetAddress: metadataEntry.targetAddress.plain(),
		metadataType: Constants.MetadataType[metadataEntry.metadataType],
		targetId: metadataEntry.targetId
			? metadataEntry.targetId.toHex()
			: Constants.Message.UNAVAILABLE,
		value: metadataEntry.value
	});

	/**
	 * Gets social metadata from Symbol node.
	 * @param {number} pageNumber - Page number (default: 1).
	 * @returns {Promise<Array>} Promise resolving to social metadata array.
	 */
	static getSocialMetadata = async (pageNumber = 1) => {
		const NODE_URL = http.nodeUrl;
		
		// NODE_URLが利用できない場合は空配列を返す
		if (!NODE_URL) {
			console.warn('NODE_URL is not available yet');
			return [];
		}
		
		const scopedMetadataKey = 'D6FBBD8C20F5AC1C';
		const pageSize = 100;

		try {
			const url = `${NODE_URL}/metadata?scopedMetadataKey=${scopedMetadataKey}&pageSize=${pageSize}&pageNumber=${pageNumber}`;
			console.log('Fetching from URL:', url);
			
			const response = await fetch(url);
			
			if (!response.ok) {
				console.error('API response not OK:', response.status, response.statusText);
				return [];
			}
			
			const text = await response.text();
			console.log('Raw response:', text.substring(0, 200));
			
			const data = JSON.parse(text);
			return data.data || [];
		} catch (error) {
			console.error('Error fetching social metadata:', error);
			return [];
		}
	};

	/**
	 * Gets all social metadata with pagination.
	 * @returns {Promise<Array>} Promise resolving to all social metadata.
	 */
	static getAllSocialMetadata = async () => {
		let allData = [];
		let pageNumber = 1;
		let hasMoreData = true;

		while (hasMoreData) {
			try {
				const data = await MetadataService.getSocialMetadata(pageNumber);
				
				if (data.length > 0) {
					allData = allData.concat(data);
					pageNumber++;
					
					// If we got less than 100 items, we've reached the end
					hasMoreData = data.length === 100;
				} else {
					hasMoreData = false;
				}
			} catch (error) {
				console.error('Error fetching page', pageNumber, error);
				hasMoreData = false;
			}
		}

		return MetadataService.parseSocialMetadata(allData);
	};

	/**
	 * Parse social metadata values from hex encoded JSON.
	 * @param {Array} metadataArray - Array of metadata entries.
	 * @returns {Array} Parsed social metadata objects.
	 */
	static parseSocialMetadata = (metadataArray) => {
		const parsed = [];

		metadataArray.forEach((metadata, index) => {
			try {
				// Get the hex encoded value
				const hexValue = metadata.metadataEntry.value;
				console.log('Processing hex value:', hexValue.substring(0, 100));
			
				// Decode hex to UTF-8 string using Symbol SDK
				const jsonString = MetadataService.hexToUtf8(hexValue);
				console.log('Decoded string:', jsonString.substring(0, 100));
				
				// Parse JSON
				const socialData = JSON.parse(jsonString);
				
				// Decode name field properly with error handling
				if (socialData.name) {
					try {
						socialData.name = decodeURIComponent(escape(socialData.name));
					} catch (decodeError) {
						console.warn('Failed to decode name field, using original:', socialData.name);
						// Keep original name if decode fails
					}
				}
				
				// Validate required fields and skip empty entries
				if (socialData.url && socialData.name && 
					socialData.url.trim() !== '' && socialData.name.trim() !== '') {
					
					// Convert target address to proper format
					let formattedTargetAddress = metadata.metadataEntry.targetAddress;
					try {
						// If targetAddress is an Address object, convert to plain format
						if (typeof formattedTargetAddress === 'object' && formattedTargetAddress.plain) {
							formattedTargetAddress = formattedTargetAddress.plain();
						} else if (typeof formattedTargetAddress === 'string') {
							// Check if it's a HEX string (64 characters, no hyphens)
							if (formattedTargetAddress.length === 48 && /^[0-9A-Fa-f]+$/.test(formattedTargetAddress)) {
								// It's a HEX address, convert using createFromEncoded
								formattedTargetAddress = Address.createFromEncoded(formattedTargetAddress).plain();
							} else {
								// It's already a formatted address, try createFromRawAddress
								formattedTargetAddress = Address.createFromRawAddress(formattedTargetAddress).plain();
							}
						}
						console.log('Target address conversion:', metadata.metadataEntry.targetAddress, '->', formattedTargetAddress);
					} catch (addressError) {
						console.warn('Failed to convert target address:', addressError);
						// Use original value if conversion fails
						formattedTargetAddress = metadata.metadataEntry.targetAddress;
					}

					parsed.push({
						id: `smd-${index}`,
						url: socialData.url,
						name: socialData.name,
						imageUrl: socialData.imageUrl || '',
						namespace: socialData.namespace || '',
						sourceAddress: metadata.metadataEntry.sourceAddress,
						targetAddress: formattedTargetAddress
					});
				}
			} catch (error) {
				console.warn('Failed to parse social metadata:', error, {
					id: metadata.id,
					value: metadata.metadataEntry.value?.substring(0, 100)
				});
			}
		});

		return parsed;
	};

	/**
	 * Convert base64 string directly to UTF-8 string.
	 * @param {string} base64 - Base64 string.
	 * @returns {string} UTF-8 string.
	 */
	static base64ToUtf8 = (base64) => {
		try {
			// Use built-in atob and TextDecoder for proper UTF-8 handling
			const binaryString = atob(base64);
			const bytes = new Uint8Array(binaryString.length);
			
			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}
			
			return new TextDecoder('utf-8').decode(bytes);
		} catch (error) {
			console.warn('Failed to decode base64 to UTF-8:', error);
			// Fallback to simple atob
			return atob(base64);
		}
	};

	/**
	 * Convert hex string to UTF-8 string using Symbol SDK.
	 * @param {string} hex - Hex string.
	 * @returns {string} UTF-8 string.
	 */
	static hexToUtf8 = (hex) => {
		try {
			// Use Symbol SDK's Convert utility
			const uint8Array = Convert.hexToUint8(hex);
			return Convert.uint8ToUtf8(uint8Array);
		} catch (error) {
			console.warn('Symbol SDK conversion failed, using fallback:', error);
			// Fallback to manual conversion
			const bytes = [];
			for (let i = 0; i < hex.length; i += 2) {
				bytes.push(parseInt(hex.substr(i, 2), 16));
			}
			try {
				return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
			} catch (decodeError) {
				return String.fromCharCode(...bytes);
			}
		}
	};
}

export default MetadataService;
