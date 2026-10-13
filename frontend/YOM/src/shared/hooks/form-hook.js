import { useCallback, useReducer } from "react"

const formReducer = (state, action) => {
    switch (action.type) {
        case "INPUT_CHANGE": {
            let formIsValid = true
            for (const input in state.inputs) {
                if (!state.inputs[input]) {
                    continue
                }
                if (input === action.input) {
                    formIsValid = formIsValid && action.isValid
                } else {
                    formIsValid = formIsValid && state.inputs[input].isValid
                }
            }
            return {
                ...state,
                inputs: {
                    ...state.inputs,
                    [action.input]: {
                        value: action.value,
                        isValid: action.isValid
                    }
                },
                isValid: formIsValid
            }
        }
        case "SET_DATA":
            return {
                inputs: action.inputs,
                isValid: action.formIsValid
            }

        default:
            return state
    }
}

const useForm = (initialInputs, initialFormValidity) => {
    const [formState, dispatch] = useReducer(formReducer, {
        inputs: initialInputs,
        isValid: initialFormValidity
    })

    const inputHandler = useCallback((id, value, isValid) => {
        dispatch({
            type: "INPUT_CHANGE",
            input: id,
            value,
            isValid
        })
    }, [])

    const setFormData = useCallback((inputData, formValidity) => {
        dispatch({
            type: "SET_DATA",
            inputs: inputData,
            formIsValid: formValidity
        })
    }, [])

    return [ formState, inputHandler, setFormData ]
}

export default useForm