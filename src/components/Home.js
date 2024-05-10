import { GenerativeModel } from "@google/generative-ai"
import { useEffect, useRef, useState } from "react"
import './styles.css' // Import CSS file
import Loading from "react-loading"
import { Bounce, ToastContainer, toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import TextAreaEditor from "./TextAreaEditor"
import { IoIosSend, IoIosSettings } from "react-icons/io"
import { MdCancel } from "react-icons/md"
import SettingsUI, { getSettings, setSetting } from "./Settings"

export default function Home() {
    // Google Generative AI API Key
    const api = "AIzaSyCxxGXr_e3TBkNfF0M5pr-twylMdKbu8JI"
    // show error reason if AI prompt failed
    const onErrorShowReason = true
    // Default prompt - don't change
    const prompt = "Generate HTML, CSS, and JavaScript code for a web page, if not possible as response return " + (onErrorShowReason ? "'null:<reason>'" : "'null'") + ". User prompt: "


    const [userPrompt, setUserPrompt] = useState("")
    const [isLoading, setIsLoading] = useState(null)
    const [gptInstance, setGptInstance] = useState()
    const [isSettingsOpen, setisSettingsOpen] = useState(false)
    const lastRequestIdRef = useRef(0)

    const [webCode, setWebCode] = useState(getSettings().code.full)
    const [htmlCode, sethtmlCode] = useState(getSettings().code.html)
    const [cssCode, setcssCode] = useState(getSettings().code.css)
    const [jsCode, setjsCode] = useState(getSettings().code.js)
    const [isSeperatedCodeView, setisSeperatedCodeView] = useState(getSettings().code.seperated)

    useEffect(() => {
        if (isSeperatedCodeView) {
            return
        }
        // extract
        const extractedCode = extractWebCodes(webCode)
        sethtmlCode(extractedCode.html)
        setcssCode(extractedCode.css)
        setjsCode(extractedCode.js)
        setSetting("code.full", webCode)
    }, [webCode])


    useEffect(() => {
        if (!isSeperatedCodeView) {
            return
        }

        setWebCode(htmlCode + "\n" + cssCode + "\n" + jsCode)
        setSetting("code.html", htmlCode)
        setSetting("code.css", cssCode)
        setSetting("code.js", jsCode)
    }, [htmlCode, cssCode, jsCode])





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


    const extractWebCodes = (code = "") => {
        const htmlPattern = /(?:<!DOCTYPE html>|<html>)[\s\S]*?<\/html>/i
        const scriptPattern = /<script\b[^>]*>[\s\S]*?<\/script>/gi
        const cssPattern = /<style\b[^>]*>[\s\S]*?<\/style>/gi

        let htmlCode = ""
        let cssCode = ""
        let jsCode = ""

        const htmlsMatch = code.match(htmlPattern)
        const scriptsMatch = code.match(scriptPattern)
        const cssMatch = code.match(cssPattern)

        if (htmlsMatch) {
            htmlsMatch.forEach(match => {
                let cleanedHtml = match.replace(scriptPattern, "")
                cleanedHtml = cleanedHtml.replace(cssPattern, "")
                htmlCode += cleanedHtml
            })
        }

        if (scriptsMatch) {
            jsCode = scriptsMatch
        }

        if (cssMatch) {
            cssCode = cssMatch
        }

        return {
            html: htmlCode,
            js: jsCode,
            css: cssCode
        };
    };









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
            setWebCode(extractedCode.html + "\n" + extractedCode.css + "\n" + extractedCode.js)
            sethtmlCode(extractedCode.html)
            setcssCode(extractedCode.css)
            setjsCode(extractedCode.js)
        }


        setIsLoading(false)
    }


    const toggleSettings = () => {
        setisSettingsOpen(!isSettingsOpen)
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

            {isSettingsOpen && <SettingsUI isSeperatedCodeView={isSeperatedCodeView} setisSeperatedCodeView={setisSeperatedCodeView} onClose={toggleSettings} />}

            <div className="editor-container">
                <div className="left-container">
                    {isLoading ?
                        <Loading className="loader" type="spin"></Loading>
                        :
                        <iframe srcDoc={webCode} title="Result"></iframe>
                    }
                </div>



                {isSeperatedCodeView ?
                    <div className="right-container">
                        <TextAreaEditor
                            id={"html"}
                            title={"Html Code"}
                            disabled={isLoading}
                            value={htmlCode}
                            onChange={sethtmlCode}
                            placeholder="<html>&#10;Html Code&#10;</html>" />
                        <TextAreaEditor
                            id={"css"}
                            title={"Css Code"}
                            disabled={isLoading}
                            value={cssCode}
                            onChange={setcssCode}
                            placeholder="<style>&#10;Css Code&#10;</style>" />
                        <TextAreaEditor
                            id={"js"}
                            title={"JavaScript Code"}
                            disabled={isLoading}
                            value={jsCode}
                            onChange={setjsCode}
                            placeholder="<script src='http://example.com/file.js' />&#10;<script>&#10;JavaScript Code&#10;</script>" />
                    </div>
                    :
                    <div className="right-container">
                        <TextAreaEditor
                            id={""}
                            title={"Web Code"}
                            disabled={isLoading}
                            value={webCode}
                            onChange={setWebCode}
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
