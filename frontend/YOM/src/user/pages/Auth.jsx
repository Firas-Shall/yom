import Input from '../../shared/components/FormElements/Input'
import Button from '../../shared/components/FormElements/Button'
import useForm from '../../shared/hooks/form-hook'
import useHttpClient from '../../shared/hooks/http-hook'
import { useContext, useState } from 'react'
import { AuthContext } from '../../shared/context/auth-context'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import Card from '../../shared/components/UIElements/Card'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_MAXLENGTH, VALIDATOR_REQUIRE } from '../../shared/utils/validators'
import { API_BASE_URL } from '../../shared/utils/config'
import './Auth.css'

const Auth = () => {
    const auth = useContext(AuthContext)
    const [isLoginMode, setIsLoginMode] = useState(true)
    const { isLoading, error, clearError, sendRequest } = useHttpClient()
    const [formState, inputHandler, setFormData] = useForm({
        email: {
            value: '',
            isValid: false
        },
        password: {
            value: '',
            isValid: false
        }
    },
        false)

    const authSubmitHandler = async (event) => {
        event.preventDefault()

        if (isLoginMode) {
            try {
                const responseData = await sendRequest(
                    `${API_BASE_URL}/api/users/login`,
                    "POST",
                    JSON.stringify({
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value
                    }),
                    {
                        "Content-Type": "application/json",
                    },
                )

                auth.login(responseData.userId, responseData.token)
            } catch (err) {
                console.log(err)
            }
        } else {
            try {
                const responseData = await sendRequest(
                    `${API_BASE_URL}/api/users/signup`,
                    "POST",
                    JSON.stringify({
                        email: formState.inputs.email.value,
                        username: formState.inputs.username.value,
                        password: formState.inputs.password.value
                    }),
                    {
                        "Content-Type": "application/json"
                    }
                )

                auth.login(responseData.userId, responseData.token)
            } catch (err) {
                console.log(err)
            }
        }
    }

    const switchModeHandler = () => {
        if (!isLoginMode) {
            setFormData({
                ...formState.inputs,
                username: undefined
            },
                formState.inputs.email.isValid && formState.inputs.password.isValid
            )
        } else {
            setFormData({
                ...formState.inputs,
                username: {
                    value: '',
                    isValid: false
                }
            },
                false
            )
        }
        setIsLoginMode((prevMode) => !prevMode)
    }

    return (
        <>
            <ErrorModal error={error} onClear={clearError} />
            <div className="auth-landing">
                {/* ── Hero Section ── */}
                <div className="auth-hero">
                    <div className="auth-hero__logo">
                        <img src="/favicon.svg" alt="YOM logo" />
                        <span>YOM</span>
                    </div>

                    <h1>
                        Write your day.<br />
                        Read <span className="highlight">theirs</span>.
                    </h1>

                    <p className="auth-hero__subtitle">
                        One journal entry a day — that's the rule. Share your thoughts,
                        see what your friends wrote, and build a daily habit that actually
                        sticks.
                    </p>


                </div>

                {/* ── Auth Form ── */}
                <div className="auth-panel">
                    <Card className="authentication">
                        {isLoading && <LoadingSpinner asOverlay />}
                        <h2>{isLoginMode ? 'Welcome back' : 'Create account'}</h2>
                        <p className="auth-form-subtitle">
                            {isLoginMode
                                ? 'Sign in to continue your journal'
                                : 'Start your journaling journey'}
                        </p>
                        <form onSubmit={authSubmitHandler}>
                            {!isLoginMode &&
                                <Input
                                    element="input"
                                    type="text"
                                    id="username"
                                    label="Username"
                                    validators={[VALIDATOR_REQUIRE(), VALIDATOR_MINLENGTH(5), VALIDATOR_MAXLENGTH(10)]}
                                    errorText="Username must be 5-10 characters"
                                    onInput={inputHandler}
                                />
                            }
                            <Input
                                element="input"
                                id="email"
                                type="email"
                                label="E-Mail"
                                validators={[VALIDATOR_EMAIL()]}
                                errorText="Invalid Email!"
                                onInput={inputHandler}
                            />
                            <Input
                                element="input"
                                id="password"
                                type="password"
                                label="Password"
                                validators={[VALIDATOR_MINLENGTH(8)]}
                                errorText="Password must be at least 8 characters"
                                onInput={inputHandler}
                            ></Input>
                            <Button
                                className="auth-primary-btn"
                                type="submit"
                                disabled={!formState.isValid}
                            >
                                {isLoginMode ? "Sign In" : "Create Account"}
                            </Button>
                        </form>
                        <div className="auth-divider">
                            <span>{isLoginMode ? 'New here?' : 'Already have an account?'}</span>
                        </div>
                        <Button className="auth-switch-btn" onClick={switchModeHandler}>
                            {isLoginMode ? "Create an account" : "Sign in instead"}
                        </Button>
                    </Card>
                </div>
            </div>
        </>
    )

}

export default Auth