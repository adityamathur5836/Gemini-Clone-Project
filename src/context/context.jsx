import { createContext, useState } from "react";
import runChat from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
    const [input, setInput] = useState('');
    const [recentPrompt, setRecentPrompt] = useState('');
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState('');
    
    const delayPara = (index, nextWord, delay) => {
        setTimeout(() => {
            setResultData(prev => prev + nextWord);
        }, delay);
    };

    const newChat = () => {
        setLoading(false);
        setShowResult(false);
    };

    const onSent = async (prompt) => {
        try {
            setResultData("");
            setLoading(true);
            setShowResult(true);

            let response;
            if (prompt !== undefined) {
                response = await runChat(prompt);
                setRecentPrompt(prompt);
            } else {
                setPrevPrompts(prev => [...prev, input]);
                setRecentPrompt(input);
                response = await runChat(input);
            }

            let responseArray = response.split('**');
            let newResponse = '';
            for (let i = 0; i < responseArray.length; i++) {
                if (i === 0 || i % 2 !== 1) {
                    newResponse += responseArray[i];
                } else {
                    newResponse += `<b>${responseArray[i]}</b>`;
                }
            }
            newResponse = newResponse.split("*").join("<br/>");

            let newResponseArray = newResponse.split(' ');
            let delay = 0;
            for (let i = 0; i < newResponseArray.length; i++) {
                const nextWord = newResponseArray[i] + " ";
                delayPara(i, nextWord, delay);
                delay += 100; 
            }
        } catch (error) {
            console.error('Error in onSent:', error);
            setLoading(false);
        } finally {
            setLoading(false);
            setInput("");
        }
    };

    const contextValue = {
        prevPrompts,
        setPrevPrompts,
        onSent,
        setRecentPrompt,
        recentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        newChat,
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;