import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../shared/context/auth-context"
import useHttpClient from "../shared/hooks/http-hook"
import { API_BASE_URL } from '../shared/utils/config'
import LoadingSpinner from "../shared/components/UIElements/LoadingSpinner"
import ErrorModal from "../shared/components/UIElements/ErrorModal"
import './MyJournals.css'


const MyJournals = () => {
    const { sendRequest, isLoading, error, clearError } = useHttpClient()
    const auth = useContext(AuthContext)
    const { userId } = auth
    const [ loadedJournals, setLoadedJournals ] = useState([])


    useEffect(() => {
        const fetchJournals = async () => {
            try {
                const responseData = await sendRequest(
                    `${API_BASE_URL}/api/journals/user/${userId}`,
                    "GET",
                    null,
                    {
                        Authorization: 'Bearer ' + auth.token
                    }
                )

                setLoadedJournals(responseData.journals)
            } catch (err) {
                console.log(err);
            }
        }

        if (userId && auth.token) {
            fetchJournals()
        }
    }, [sendRequest, userId, auth.token])




    return (
        <div className="journals-container">
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && <LoadingSpinner asOverlay />}
            
            <h2 className="journals-title">My Journey</h2>
            
            {!isLoading && loadedJournals.length === 0 && (
                <div className="journals-empty">
                    <p>You haven't written any journals yet. Start your journey today!</p>
                </div>
            )}

            {!isLoading && loadedJournals.length > 0 && (
                <ul className="journals-list">
                    {loadedJournals.map(journal => (
                        <li key={journal.id || journal._id} className="journal-card">
                            <div className="journal-header">
                                <span className="journal-date">
                                    {new Date(journal.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div className="journal-content">
                                {journal.content}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default MyJournals