import { useContext } from "react"
import { AuthContext } from "../../shared/context/auth-context"
import UserItem from "../components/UserItem"
import useHttpClient from "../../shared/hooks/http-hook"
import { API_BASE_URL } from '../../shared/utils/config'
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner"
import ErrorModal from "../../shared/components/UIElements/ErrorModal"
import "../../journals/MyJournals.css"


const UserFriends = () => {
    const {sendRequest, isLoading, error, clearError} = useHttpClient()
    const auth = useContext(AuthContext)
    const { friends } = auth

    const removeFriendHandler = async (id) => {
        try{
            await sendRequest(`${API_BASE_URL}/api/friends/${id}`,
                "DELETE",
                null,
                {
                    Authorization: 'Bearer ' + auth.token
                }
            )
            auth.setFriends((prev => prev.filter(f => (f.id || f._id || f.userId) !== id)))
        }catch(err){
            console.log(err)
        }
    }

    return (
        <div className="journals-container">
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && <LoadingSpinner asOverlay />}

            <h2 className="journals-title">My Friends</h2>

            {friends.length === 0 ? (
                <div className="journals-empty">
                    <p>No friends yet. Use Search to find people you know!</p>
                </div>
            ) : (
                <ul className="users-list">
                    {friends.map((friend, index) => {
                        const targetId = friend.id || friend._id || friend.userId;
                        return <UserItem
                            key={targetId || index}
                            username={friend.username}
                            noButton
                            showReject
                            onReject={() => removeFriendHandler(targetId)}
                            reject="Remove Friend"
                            disabled={isLoading} />
                    })}
                </ul>
            )}
        </div>
    )
}

export default UserFriends