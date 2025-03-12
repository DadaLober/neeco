'use client'

// React core imports
import React, { useState, useCallback, useEffect, useMemo } from 'react'

// Utility imports
import { shapes } from '@/lib/shapes';

const RandomShapesGrid: React.FC = () => {
    const [hoveredIndices, setHoveredIndices] = useState<Set<number>>(new Set())
    const [rippleIndices, setRippleIndices] = useState<Map<number, number>>(new Map())
    const [gridSize, setGridSize] = useState({ rows: 0, cols: 0 })

    const getRandomShape = useCallback(() => shapes[Math.floor(Math.random() * shapes.length)], [])
    const getRandomColor = useCallback(() => {
        const shapeColors = ['#0D3959', '#FF871F', '#E94D35', '#4E6A51'];
        return shapeColors[Math.floor(Math.random() * shapeColors.length)];
    }, [])

    useEffect(() => {
        const updateGridSize = () => {
            const tileSize = 125 // 125x125px tiles
            const cols = Math.ceil(window.innerWidth / tileSize)
            const rows = Math.ceil(window.innerHeight / tileSize)
            setGridSize({ rows, cols })
        }

        updateGridSize()
        window.addEventListener('resize', updateGridSize)
        return () => window.removeEventListener('resize', updateGridSize)
    }, [])

    const tiles = useMemo(() =>
        Array.from({ length: gridSize.rows * gridSize.cols }).map(() => ({
            shape: getRandomShape(),
            color: getRandomColor()
        })),
        [gridSize, getRandomShape, getRandomColor]
    )

    const getAdjacentIndices = useCallback((index: number) => {
        const { rows, cols } = gridSize
        const row = Math.floor(index / cols)
        const col = index % cols

        return [
            index,
            index - cols, // top
            index + cols, // bottom
            row > 0 ? index - 1 : -1, // left
            col < cols - 1 ? index + 1 : -1, // right
            index - cols - 1, // top-left
            index - cols + 1, // top-right
            index + cols - 1, // bottom-left
            index + cols + 1, // bottom-right
        ].filter(i => i >= 0 && i < rows * cols)
    }, [gridSize])

    const handleMouseEnter = useCallback((index: number) => {
        setHoveredIndices(new Set(getAdjacentIndices(index)))
    }, [getAdjacentIndices])

    const handleMouseLeave = useCallback(() => {
        setHoveredIndices(new Set())
    }, [])

    const propagateRipple = useCallback((index: number, depth: number = 0) => {
        if (depth > 5) return // Limit the ripple depth

        setRippleIndices(prev => {
            const newMap = new Map(prev)
            newMap.set(index, depth)
            return newMap
        })

        getAdjacentIndices(index).forEach(adjIndex => {
            if (adjIndex !== index) {
                setTimeout(() => propagateRipple(adjIndex, depth + 1), 50)
            }
        })

        setTimeout(() => {
            setRippleIndices(prev => {
                const newMap = new Map(prev)
                newMap.delete(index)
                return newMap
            })
        }, 1000) // Remove the ripple effect after it's done
    }, [getAdjacentIndices])

    const handleClick = useCallback((index: number) => {
        propagateRipple(index)
    }, [propagateRipple])

    return (
        <div
            className="grid w-screen h-screen overflow-hidden"
            style={{
                gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
                gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`,
                backgroundColor: '#FDF5E1', // Cream background
            }}
        >
            {tiles.map((tile, index) => {
                const isHovered = hoveredIndices.has(index)
                const rippleDepth = rippleIndices.get(index)
                const isRippling = rippleDepth !== undefined
                const rotationAngle = isRippling ? 360 : (isHovered ? 180 : 0)

                return (
                    <div
                        key={index}
                        className="aspect-square relative p-4"
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(index)}
                    >
                        <div
                            className="w-full h-full transition-all duration-1000 ease-in-out"
                            style={{
                                transform: `rotate(${rotationAngle}deg) scale(${isHovered || isRippling ? 1.1 : 1})`,
                                backgroundColor: tile.color,
                                WebkitMaskImage: `url(${tile.shape})`,
                                maskImage: `url(${tile.shape})`,
                                WebkitMaskSize: '80%',
                                maskSize: '80%',
                                WebkitMaskRepeat: 'no-repeat',
                                maskRepeat: 'no-repeat',
                                WebkitMaskPosition: 'center',
                                maskPosition: 'center',
                            }}
                        />
                    </div>
                )
            })}
        </div>
    )
}

export default RandomShapesGrid
