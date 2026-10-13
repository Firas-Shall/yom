import { useState, useRef, useCallback, useEffect } from "react"

const useHttpClient = () => {
    const [ isLoading, setIsLoading ] = useState(false)
    const [ error, setError ] = useState()

    const activeHttpRequests = useRef([])

    const sendRequest = useCallback(async (url, method='GET', body= null, headers = {})=>{
        setIsLoading(true)

        const httpAbortCtrl = new AbortController()
        activeHttpRequests.current.push(httpAbortCtrl)

        try{
            const response = await fetch(url, {
                method,
                body,
                headers,
                signal: httpAbortCtrl.signal
            })

            const responseData = await response.json()

            if(!response.ok){
                throw new Error(responseData.message)
            }

            return responseData
        }catch(err){
            if (err.name !== "AbortError") {
                setError(err.message)
            }
            throw err
        }finally{
            activeHttpRequests.current =
                activeHttpRequests.current.filter(ctrl => ctrl !== httpAbortCtrl)

            setIsLoading(false)
        }
    }, [])

    const clearError = () => {
        setError(null)
    }

    useEffect(() => {
        return () => {
            activeHttpRequests.current.forEach(abortCtrl => abortCtrl.abort())
        }
    }, [])

    return { isLoading, error, sendRequest, clearError }
}

export default useHttpClient