import { useEffect, useState } from "react"
import { CiMaximize1, CiMinimize1 } from "react-icons/ci"

export default function TextAreaEditor({ title, value, onChange, disabled, placeholder }) {
    const [isHover, setisHover] = useState(false)
    const [isMinimized, setisMinimized] = useState(false)

    const toggleMinimized = () => {
        setisMinimized(!isMinimized)
    }

    const copyTextToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(value)
        } catch (error) {
            alert("Sorry can't copy the provided Code !!")
        }
    }


    return (
        <div className="editor"
            onMouseEnter={() => setisHover(true)}
            onMouseLeave={() => setisHover(false)}
            style={isMinimized ? {height:"auto"} : {}}
            >

            <div className="editor-header">
                <div className="editor-header-title">{title}</div>
                <button onClick={toggleMinimized} className="editor-header-button">{isMinimized ? <CiMaximize1 /> : <CiMinimize1 />}</button>

            </div>
            {!isMinimized &&
                <>
                    <textarea
                        disabled={disabled}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                    />
                    <button disabled={disabled} className="editor-button" onClick={copyTextToClipboard} style={!isHover ? { display: "none" } : { display: "block" }}>Copy</button>

                </>
            }

        </div>
    )
}