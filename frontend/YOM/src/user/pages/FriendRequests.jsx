import { useContext } from "react"
import { AuthContext } from "../../shared/context/auth-context"
import UserItem from "../components/UserItem"
import useHttpClient from "../../shared/hooks/http-hook"
import { API_BASE_URL } from '../../shared/utils/config'
import ErrorModal from "../../shared/components/UIElements/ErrorModal"
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner"
import "../../journals/MyJournals.css"

const FriendRequests = () => {
    const auth = useContext(AuthContext)
    const { receivedRequests, setReceivedRequests, setFriends, token } = auth
    const { sendRequest, isLoading, error, clearError } = useHttpClient()

    const acceptRequestHandler = async (friendId) => {
        try {
            await sendRequest(
                `${API_BASE_URL}/api/friends/${friendId}/accept`,
                'PATCH',
                null,
                { Authorization: 'Bearer ' + token }
            )
            const acceptedUser = receivedRequests.find(u => (u.id || u._id) === friendId);
            setReceivedRequests(prev => prev.filter(u => (u.id || u._id) !== friendId));
            if (acceptedUser) {
                setFriends(prev => [...prev, acceptedUser]);
            }
        } catch (err) {
            console.log(err)
        }
    }

    const rejectRequestHandler = async (friendId) => {
        try {
            await sendRequest(
                `${API_BASE_URL}/api/friends/${friendId}`,
                'DELETE',
                null,
                { Authorization: 'Bearer ' + token }
            )
            setReceivedRequests(prev => prev.filter(u => (u.id || u._id) !== friendId));
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className="journals-container">
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && <LoadingSpinner asOverlay />}

            <h2 className="journals-title">Friend Requests</h2>

            {(!receivedRequests || receivedRequests.length === 0) && (
                <div className="journals-empty">
                    <p>You have no pending friend requests.</p>
                </div>
            )}

            {receivedRequests && receivedRequests.length > 0 && (
                <ul className="users-list">
                    {receivedRequests.map(user => {
                        const targetId = user.id || user._id;
                        return (
                            <UserItem
                                key={targetId}
                                username={user.username}
                                noButton
                                showAccept
                                accept="Accept"
                                onAccept={() => acceptRequestHandler(targetId)}
                                showReject
                                reject="Decline"
                                onReject={() => rejectRequestHandler(targetId)}
                                disabled={isLoading}
                            />
                        )
                    })}
                </ul>
            )}
        </div>
    )
}

export default FriendRequests
