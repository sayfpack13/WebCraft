import { FaToggleOff, FaToggleOn } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { setSetting } from "./utils";

export default function SettingsUI({isSeperatedCodeView,setisSeperatedCodeView, onClose }) {

    const OptionUI = ({ title, isEnabled, onToggle }) => {
        return (
            <div className="settings-option">
                <button onClick={() => { onToggle(!isEnabled) }} className={isEnabled ? "settings-option-toggle-button active" : "settings-option-toggle-button"}>
                    {isEnabled ? <FaToggleOn /> : <FaToggleOff />}
                    <div className="settings-option-title">
                        {title}
                    </div>
                </button>

            </div>
        )
    }

    return (
        <div className="settings">
            <div className="settings-content">
                <div className="settings-header">
                    <div className="settings-header-title">Settings</div>
                    <button onClick={onClose} className="settings-close-button"><IoIosClose /></button>
                </div>

                <OptionUI title={"Seperate Code View"} isEnabled={isSeperatedCodeView} onToggle={(value)=>{
                    setisSeperatedCodeView(value)
                    setSetting("code.seperated",value)
                }} />
            </div>
        </div>
    )
}