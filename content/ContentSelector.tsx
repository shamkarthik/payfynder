import React from 'react'
import SelectionButton from '../src/components/SelectionButton'
import FindElement from '../src/components/FindElement'
const ContentSelector = () => {

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", position: "fixed",
            top: "70px", // 20px from the bottom of the screen
            right: "20px", zIndex: 999 }}>
        {/* <FindElement/>
        <SelectionButton/> */}
        </div>
    )
    
}

export default ContentSelector