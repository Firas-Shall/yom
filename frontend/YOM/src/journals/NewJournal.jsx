import Input from '../shared/components/FormElements/Input'
import Button from '../shared/components/FormElements/Button'
import useForm from '../shared/hooks/form-hook'
import useHttpClient from '../shared/hooks/http-hook'
import { API_BASE_URL } from '../shared/utils/config'
import { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../shared/context/auth-context'
import ErrorModal from '../shared/components/UIElements/ErrorModal'
import LoadingSpinner from '../shared/components/UIElements/LoadingSpinner'
import './MyJournals.css'
import { VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../shared/utils/validators'

const NewJournal = () => {
    const { sendRequest, isLoading, error, clearError } = useHttpClient()
    const auth = useContext(AuthContext)
    const [today, setToday] = useState(false)

    useEffect(() => {
        const checkPostedToday = async () => {
            try {
                const responseData = await sendRequest(
                    `${API_BASE_URL}/api/journals/today`,
                    'GET',
                    null,
                    { Authorization: 'Bearer ' + auth.token }
                )
                setToday(responseData.hasPosted)
            } catch (err) {
                console.log(err)
            }
        };

        if (auth.token) {
            checkPostedToday();
        }
    }, [sendRequest, auth.token]);

    const [formState, inputHandler] = useForm({
        content: {
            value: "",
            isValid: false
        }
    }, false)

    const journalSubmitHandler = async (event) => {
        event.preventDefault()

        try {
            await sendRequest(
                `${API_BASE_URL}/api/journals`,
                'POST',
                JSON.stringify({
                    content: formState.inputs.content.value
                }),
                {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + auth.token
                }
            )
            setToday(true)
        } catch (err) {
            console.log(err)
        }
    }


    return (
        <div className="journals-container">
            <ErrorModal error={error} onClear={clearError} />
            <h2 className="journals-title">Today's Journal</h2>
            <form className='journal-form' onSubmit={journalSubmitHandler}>
                {isLoading && <LoadingSpinner asOverlay />}
                {today && (
                    <p className="journal-posted">You've already written today's journal. Come back tomorrow!</p>
                )}
                <Input
                    validators={[VALIDATOR_REQUIRE(), VALIDATOR_MINLENGTH(10)]}
                    element="textarea"
                    id="content"
                    rows={8}
                    placeholder="How was your day?"
                    errorText="Journal should be at least 10 characters"
                    onInput={inputHandler}
                />
                <Button type="submit" disabled={today || !formState.isValid}>Add Journal</Button>
            </form>
        </div>
    )

}

export default NewJournal