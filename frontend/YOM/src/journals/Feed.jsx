import { AuthContext } from "../shared/context/auth-context"
import { useContext, useState, useEffect, useCallback } from "react"
import useHttpClient from "../shared/hooks/http-hook"
import { API_BASE_URL } from '../shared/utils/config'
import LoadingSpinner from "../shared/components/UIElements/LoadingSpinner"
import ErrorModal from "../shared/components/UIElements/ErrorModal"
import Button from "../shared/components/FormElements/Button"
import './MyJournals.css'

const Feed = () => {
    const auth = useContext(AuthContext)
    const { token } = auth
    const { sendRequest, isLoading, error, clearError } = useHttpClient()
    const [loadedJournals, setLoadedJournals] = useState([])

    const fetchFeed = useCallback(async () => {
        if (!token) return
        try {
            const responseData = await sendRequest(
                `${API_BASE_URL}/api/journals/feed`,
                'GET',
                null,
                { Authorization: 'Bearer ' + token }
            )
            setLoadedJournals(responseData.journals)
        } catch (err) {
            console.log(err)
        }
    }, [sendRequest, token])

    useEffect(() => {
        let isMounted = true
        const initialLoad = async () => {
            if (token) {
                try {
                    const responseData = await sendRequest(
                        `${API_BASE_URL}/api/journals/feed`,
                        'GET',
                        null,
                        { Authorization: 'Bearer ' + token }
                    )
                    if (isMounted) {
                        setLoadedJournals(responseData.journals)
                    }
                } catch (err) {
                    console.log(err)
                }
            }
        }

        initialLoad()
        return () => {
            isMounted = false
        }
    }, [sendRequest, token])

    return (
        <div className="journals-container">
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && <LoadingSpinner asOverlay />}

            <div className="feed-header">
                <h2 className="journals-title">Today's Feed</h2>
                <Button size="small" onClick={fetchFeed} disabled={isLoading}>
                    ↻ Refresh
                </Button>
            </div>

            {!isLoading && loadedJournals.length === 0 && (
                <div className="journals-empty">
                    <p>No one has posted today yet, or you don't have any friends. Check back later!</p>
                </div>
            )}

            {!isLoading && loadedJournals.length > 0 && (
                <ul className="journals-list">
                    {loadedJournals.map(journal => (
                        <li key={journal.id || journal._id} className="journal-card">
                            <div className="journal-header">
                                <span className="journal-author">
                                    {journal.userId?.username || 'Unknown user'}
                                </span>
                                <span className="journal-time">
                                    {new Date(journal.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
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

export default Feed