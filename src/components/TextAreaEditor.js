import { useState } from "react"
import { CiMaximize1, CiMinimize1 } from "react-icons/ci"
import { getSettings, setSetting } from "./Settings"

export default function TextAreaEditor({ id, title, value, onChange, disabled, placeholder }) {
    const [isHover, setisHover] = useState(false)
    const [isMinimized, setisMinimized] = useState(getSettings().isMinimized[id] || false)

    const toggleMinimized = () => {
        setisMinimized(!isMinimized)
        setSetting("isMinimized." + id, !isMinimized)
    }

    const copyTextToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(value)
        } catch (error) {
            alert("Sorry can't copy the provided Code !!")
        }
    }


    return (
        <div className={!isMinimized ? "editor" : "editor minimized"}
            onMouseEnter={() => setisHover(true)}
            onMouseLeave={() => setisHover(false)}>

            <div className="editor-header">
                <div className="editor-header-title">{title}</div>
                {id && <button onClick={toggleMinimized} className="editor-header-button">{isMinimized ? <CiMaximize1 /> : <CiMinimize1 />}</button>}
            </div>

            <div className={!isMinimized ? "editor-content" : "editor-content minimized"}>
                <textarea
                    disabled={disabled}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                />
                <button disabled={disabled} className="editor-copy-button" onClick={copyTextToClipboard} style={!isHover ? { display: "none" } : { display: "block" }}>Copy</button>
            </div>
        </div>
    )
}