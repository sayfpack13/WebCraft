import { GenerativeModel } from "@google/generative-ai"
import { useEffect, useRef, useState } from "react"
import './styles.css' // Import CSS file
import Loading from "react-loading"
import { Bounce, ToastContainer, toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import TextAreaEditor from "./TextAreaEditor"
import { IoIosSend, IoIosSettings } from "react-icons/io"
import { MdCancel } from "react-icons/md"
import SettingsUI from "./Settings"
import { Header } from "./Header"
import { extractWebCodes, getSettings, saveAsHtml, setSetting } from "./utils"

export default function Home() {
    // Google Generative AI API Key
    const api = "AIzaSyCxxGXr_e3TBkNfF0M5pr-twylMdKbu8JI"
    // show error reason if AI prompt failed
    const onErrorShowReason = true
    // Default prompt - don't change
    const prompt = "Rule:Generate web page code using <html>, <style>, and <script> only, if not possible as response return " + (onErrorShowReason ? "'null:<reason>'" : "'null'") + ". User prompt: "
    const helpDomain = "https://mmgc.ninja"

    // async loading state
    const [isDataLoading, setisDataLoading] = useState(true)
    // count initiliazed states
    const initiliazedCount = useRef(0)
    // number of states to initiliaze
    const initiliazeCount = 5

    const [userPrompt, setUserPrompt] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [gptInstance, setGptInstance] = useState()
    const [isSettingsOpen, setisSettingsOpen] = useState(false)
    const lastRequestIdRef = useRef(0)

    const [webCode, setWebCode] = useState(null)
    const [htmlCode, sethtmlCode] = useState(null)
    const [cssCode, setcssCode] = useState(null)
    const [jsCode, setjsCode] = useState(null)
    const [isSeperatedCodeView, setisSeperatedCodeView] = useState(null)
    const [isPreviewMinimized, setisPreviewMinimized] = useState(null)
    const [isEditorMinimized, setisEditorMinimized] = useState(null)

    // check if useEffect can be used only after initiliazed states !!
    const canUseEffectUpdate = () => {
        if (isDataLoading) {
            return false
        }
        if (initiliazedCount.current !== initiliazeCount) {
            initiliazedCount.current += 1
            return false
        }

        return true
    }

    // useEffects
    useEffect(() => {
        setWebCode(getSettings().code.full)
        sethtmlCode(getSettings().code.html)
        setcssCode(getSettings().code.css)
        setjsCode(getSettings().code.js)
        setisSeperatedCodeView(getSettings().code.seperated)
        setisPreviewMinimized(getSettings().isMinimized.preview)
        setisEditorMinimized(getSettings().isMinimized.editor)

        setisDataLoading(false)
    }, [])
    useEffect(() => {
        if (!canUseEffectUpdate()) {
            return
        }
        setSetting("code.full", webCode)
    }, [webCode])
    useEffect(() => {
        if (!canUseEffectUpdate()) {
            return
        }
        console.log(htmlCode);
        setSetting("code.html", htmlCode)
    }, [htmlCode])
    useEffect(() => {
        if (!canUseEffectUpdate()) {
            return
        }
        setSetting("code.css", cssCode)
    }, [cssCode])
    useEffect(() => {
        if (!canUseEffectUpdate()) {
            return
        }
        setSetting("code.js", jsCode)
    }, [jsCode])
    useEffect(() => {
        if (!canUseEffectUpdate()) {
            return
        }

        if (isSeperatedCodeView) {
            const extractedCode = extractWebCodes(webCode)
            sethtmlCode((extractedCode.html + "\n" + extractedCode.nonhtml).trim())
            setcssCode(extractedCode.css)
            setjsCode(extractedCode.js)
        } else {
            const extractedCode = extractWebCodes(htmlCode + cssCode + jsCode)
            setWebCode((extractedCode.html + "\n" + extractedCode.nonhtml + "\n" + extractedCode.css + "\n" + extractedCode.js).trim())
        }
    }, [isSeperatedCodeView])
    // useEffects








    const getGPT = () => {
        if (!gptInstance) {
            const newGPT = new GenerativeModel(api, {
                model: "gemini-1.0-pro",
                generationConfig: {
                    temperature: 0.5
                }
            })
            setGptInstance(newGPT)
            return newGPT
        }
        return gptInstance
    }

    const handleGPTError = (error) => {
        return onErrorShowReason ? "null:Can't generate for " + error + " reason !" : "null"
    }

    const getGPTResult = async () => {
        let response
        try {
            response = (await getGPT().startChat().sendMessage(prompt + userPrompt)).response

            // clean result code
            const result = response.text().replace(/```\w*/g, '')

            return result
        } catch (error) {
            try {
                return handleGPTError(response.candidates[0].finishReason)
            } catch (error2) {
                return handleGPTError("Error Contacting AI !!")
            }

        }
    }





    const chat = async () => {
        lastRequestIdRef.current += 1
        const request_id = Number(lastRequestIdRef.current)

        if (isLoading) {
            return setIsLoading(false)
        }

        setIsLoading(true)

        const result = await getGPTResult()

        // check last request id is the same, if not means canceled request
        if (lastRequestIdRef.current !== request_id) {
            return
        }

        // AI RESULT
        if (result.indexOf("null") === 0) {
            // error
            const error = onErrorShowReason ? result.slice(5) : "Something went wrong !!"
            toast.error(error)
        } else {
            // success
            const extractedCode = extractWebCodes(result)
            setWebCode(result)
            sethtmlCode(extractedCode.html)
            setcssCode(extractedCode.css)
            setjsCode(extractedCode.js)
        }


        setIsLoading(false)
    }


    const toggleSettings = () => {
        setisSettingsOpen(!isSettingsOpen)
    }



    const openFile = (result) => {
        const extractedCode = extractWebCodes(result)
        setWebCode(result)
        sethtmlCode(extractedCode.html)
        setcssCode(extractedCode.css)
        setjsCode(extractedCode.js)
    }

    const saveFile = () => {
        let content = ""
        let filename = "WebCraft"


        if (isSeperatedCodeView) {
            content = htmlCode + "\n" + cssCode + "\n" + jsCode
        } else {
            content = webCode
        }

        saveAsHtml(content, filename)
    }

    const clearEditor = () => {
        setWebCode("")
        sethtmlCode("")
        setcssCode("")
        setjsCode("")
    }

    return (
        <div className="container">
            <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover={true}
                theme="colored"
                style={{ width: "50%" }}
                toastStyle={{ fontWeight: "bold" }}
                transition={Bounce}
            />
            <Header
                onOpenFile={openFile}
                onSaveFile={saveFile}
                onClearEditor={clearEditor}
                onsetisPreviewMinimized={setisPreviewMinimized}
                onsetisEditorMinimized={setisEditorMinimized} 
                helpDomain={helpDomain}/>

            {isSettingsOpen && <SettingsUI isSeperatedCodeView={isSeperatedCodeView} setisSeperatedCodeView={setisSeperatedCodeView} onClose={toggleSettings} />}

            <div className="editor-container">
                {isPreviewMinimized &&
                    <div className="left-container">
                        {isLoading ?
                            <Loading className="loader" type="spin"></Loading>
                            :
                            <iframe srcDoc={isSeperatedCodeView ? (htmlCode + cssCode + jsCode) : webCode} title="Result"></iframe>
                        }
                    </div>
                }

                {isEditorMinimized &&
                    <div className="right-container">
                        <TextAreaEditor
                            id={"html"}
                            title={"Html Code"}
                            disabled={isLoading}
                            value={htmlCode}
                            onChange={sethtmlCode}
                            isSeperatedCodeView={isSeperatedCodeView}
                            placeholder="<html>&#10;Html Code&#10;</html>" />
                        <TextAreaEditor
                            id={"css"}
                            title={"Css Code"}
                            disabled={isLoading}
                            value={cssCode}
                            onChange={setcssCode}
                            isSeperatedCodeView={isSeperatedCodeView}
                            placeholder="<style>&#10;Css Code&#10;</style>" />
                        <TextAreaEditor
                            id={"js"}
                            title={"JavaScript Code"}
                            disabled={isLoading}
                            value={jsCode}
                            onChange={setjsCode}
                            isSeperatedCodeView={isSeperatedCodeView}
                            placeholder="<script src='http://example.com/file.js' />&#10;<script>&#10;JavaScript Code&#10;</script>" />
                        <TextAreaEditor
                            id={"full"}
                            title={"Web Code"}
                            disabled={isLoading}
                            value={webCode}
                            onChange={setWebCode}
                            isSeperatedCodeView={isSeperatedCodeView}
                            placeholder="<html>&#10;Web Code&#10;</html>" />
                    </div>
                }
            </div>


            <div className="input-container">
                <button className="settings-button" onClick={toggleSettings}>
                    <IoIosSettings />
                </button>

                <textarea
                    className="input-field"
                    disabled={isLoading}
                    type="text"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            chat()
                        }
                    }}
                    placeholder="Message WebCraft..."
                />
                <button className={!isLoading ? "prompt-button" : "prompt-button canceled"} onClick={chat}>
                    {isLoading ?
                        <>
                            Cancel <MdCancel />
                        </>
                        :
                        <>
                            Generate < IoIosSend />
                        </>
                    }
                </button>
            </div>
        </div >
    )
}
