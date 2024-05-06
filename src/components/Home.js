import { GenerativeModel } from "@google/generative-ai"
import { useEffect, useState } from "react"
import './styles.css' // Import CSS file
import Loading from "react-loading"
import { Bounce, ToastContainer, toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import TextAreaEditor from "./TextAreaEditor"

export default function Home() {
    // Google Generative AI API Key
    const api = "AIzaSyCxxGXr_e3TBkNfF0M5pr-twylMdKbu8JI"
    // show error reason if AI prompt failed
    const onErrorShowReason = true
    // Default prompt - don't change
    const prompt = "Rule: Generate web page code using Html + Css (required) + JavaScript, if not possible as response return " + (onErrorShowReason ? "'null:<reason>'" : "'null'") + ". User prompt: "


    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(null)
    const [isErrorMsg, setisErrorMsg] = useState(false)
    const [gptInstance, setGptInstance] = useState()
    const [gptResult, setGptResult] = useState("")

    const [htmlCode, sethtmlCode] = useState("")
    const [cssCode, setcssCode] = useState("")
    const [jsCode, setjsCode] = useState("")


    useEffect(() => {
        if (isErrorMsg) {
            toast.error(isErrorMsg)
        }
    }, [isErrorMsg])


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
            response = (await getGPT().startChat().sendMessage(prompt + input)).response

            // clean result code
            const result = response.text().replace(/```\w*/g, '')

            return result
        } catch (error) {
            return handleGPTError(response.candidates[0].finishReason)
        }
    }


    const extractWebCodes = (code = "") => {
        const htmlPattern = /<!DOCTYPE html>[\s\S]*?<\/html>/i
        const scriptPattern = /<script\b[^>]*>[\s\S]*?<\/script>/gi
        const cssPattern = /<style\b[^>]*>[\s\S]*?<\/style>/gi

        let htmlCode = ""
        let cssCode = ""
        let jsCode = ""

        // extract
        const htmlMatch = code.match(htmlPattern)
        const scriptsMatch = code.match(scriptPattern)
        const cssMatch = code.match(cssPattern)


        // setup codes
        if (htmlMatch) {
            htmlCode = (htmlMatch[0].replace(scriptPattern, "")).replace(cssPattern, "")
        }
        if (scriptsMatch) {
            scriptsMatch.forEach(script => {
                jsCode += script
            })
        }
        if (cssMatch) {
            cssMatch.forEach(style => {
                cssCode += style
            })
        }

        return {
            html: htmlCode,
            js: jsCode,
            css: cssCode
        }
    }


    const chat = async () => {
        setIsLoading(true)
        setisErrorMsg(false)

        const result = await getGPTResult()

        // AI RESULT
        if (result.indexOf("null") === 0) {
            // error
            setisErrorMsg(onErrorShowReason ? result.slice(5) : true)
        } else {
            // success
            setGptResult(result)
            const extractedCode = extractWebCodes(result)
            sethtmlCode(extractedCode.html)
            setcssCode(extractedCode.css)
            setjsCode(extractedCode.js)
        }


        setIsLoading(false)
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

            <div className="editor-container">
                <div className="left-container">
                    {isLoading ?
                        <Loading className="loader" type="spin"></Loading>
                        :
                        <iframe srcDoc={htmlCode + cssCode + jsCode} title="Result"></iframe>
                    }
                </div>



                <div className="right-container">
                    <TextAreaEditor
                        title={"Html Code"}
                        disabled={isLoading}
                        value={htmlCode}
                        onChange={sethtmlCode}
                        placeholder="<html>&#10;Html Code&#10;</html>" />
                    <TextAreaEditor
                    title={"Css Code"}
                        disabled={isLoading}
                        value={cssCode}
                        onChange={setcssCode}
                        placeholder="<style>&#10;Css Code&#10;</style>" />
                    <TextAreaEditor
                    title={"JavaScript Code"}
                        disabled={isLoading}
                        value={jsCode}
                        onChange={setjsCode}
                        placeholder="<script src='http://example.com/file.js' />&#10;<script>&#10;JavaScript Code&#10;</script>" />
                </div>
            </div>


            <div className="input-container">
                <input
                    className="input-field"
                    disabled={isLoading}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            chat()
                        }
                    }}
                />
                <button className="generate-button" disabled={isLoading} onClick={chat}>
                    Generate
                </button>
            </div>
        </div >
    )
}
