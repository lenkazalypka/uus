import React from 'react'
import styles from '../styles/MasonryGrid.module.css'

const MasonryGrid = ({ children }) => {
  return <div className={styles.masonry}>{children}</div>
}

export default MasonryGrid
