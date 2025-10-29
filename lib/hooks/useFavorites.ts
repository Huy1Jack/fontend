'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

const FAVORITES_STORAGE_KEY = 'favorites_v2'

function normalizeId(id: number | string): string {
	return String(id)
}

export type UseFavoritesReturn = {
	favorites: (number | string)[]
	isFavorite: (id: number | string) => boolean
	addToFavorites: (id: number | string) => void
	removeFromFavorites: (id: number | string) => void
	toggleFavorite: (id: number | string) => void
	clearFavorites: () => void
	favoriteBooks: (number | string)[]
}

export function useFavorites(): UseFavoritesReturn {
	const [favoriteIds, setFavoriteIds] = useState<string[]>([])

	useEffect(() => {
		try {
			const raw = typeof window !== 'undefined' ? localStorage.getItem(FAVORITES_STORAGE_KEY) : null
			if (raw) {
				const parsed = JSON.parse(raw)
				if (Array.isArray(parsed)) {
					setFavoriteIds(parsed.map(normalizeId))
				}
			}
		} catch {}
	}, [])

	useEffect(() => {
		try {
			if (typeof window !== 'undefined') {
				localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds))
			}
		} catch {}
	}, [favoriteIds])

	const isFavorite = useCallback((id: number | string) => {
		const nid = normalizeId(id)
		return favoriteIds.includes(nid)
	}, [favoriteIds])

	const addToFavorites = useCallback((id: number | string) => {
		const nid = normalizeId(id)
		setFavoriteIds(prev => (prev.includes(nid) ? prev : [...prev, nid]))
	}, [])

	const removeFromFavorites = useCallback((id: number | string) => {
		const nid = normalizeId(id)
		setFavoriteIds(prev => prev.filter(x => x !== nid))
	}, [])

	const toggleFavorite = useCallback((id: number | string) => {
		const nid = normalizeId(id)
		setFavoriteIds(prev => (prev.includes(nid) ? prev.filter(x => x !== nid) : [...prev, nid]))
	}, [])

	const clearFavorites = useCallback(() => {
		setFavoriteIds([])
	}, [])

	const favorites = useMemo<(number | string)[]>(() => favoriteIds, [favoriteIds])

	return {
		favorites,
		isFavorite,
		addToFavorites,
		removeFromFavorites,
		toggleFavorite,
		clearFavorites,
		favoriteBooks: favorites,
	}
}








