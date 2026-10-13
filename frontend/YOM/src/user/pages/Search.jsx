import { useEffect, useState, useCallback, useContext, useMemo } from "react";
import { AuthContext } from "../../shared/context/auth-context";
import useHttpClient from "../../shared/hooks/http-hook";
import { API_BASE_URL } from '../../shared/utils/config';
import Input from "../../shared/components/FormElements/Input";
import UserItem from "../components/UserItem";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import "../../journals/MyJournals.css"

const getId = (u) => u.id || u._id || u.userId;

const Search = () => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const { sendRequest, isLoading, error, clearError } = useHttpClient()
    const {
        sendRequest: sendFriendReq,
        isLoading: isFriendActionLoading,
        error: friendError,
        clearError: clearFriendError
    } = useHttpClient()
    const auth = useContext(AuthContext)
    const { friends, sentRequests, receivedRequests, setFriends, setSentRequests, setReceivedRequests, token, userId } = auth

    const friendshipStatusMap = useMemo(() => {
        const map = new Map();
        friends?.forEach(f => map.set(getId(f), 'friends'));
        sentRequests?.forEach(f => map.set(getId(f), 'pending_sent'));
        receivedRequests?.forEach(f => map.set(getId(f), 'pending_received'));
        return map
    }, [friends, sentRequests, receivedRequests]);

    const inputHandler = useCallback((id, value) => {
        setQuery(value);
    }, []);

    useEffect(() => {
        const trimmed = query.trim()
        if (trimmed.length === 0) {
            return
        }

        let ignore = false

        const fetchUsers = async () => {
            try {
                const responseData = await sendRequest(
                    `${API_BASE_URL}/api/users/search?username=${encodeURIComponent(trimmed)}`
                )
                if (!ignore) {
                    setResults(responseData.Users)
                }
            } catch (err) {
                console.log(err)
            }
        }

        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => {
            ignore = true
            clearTimeout(delayDebounceFn)
        };
    }, [query, sendRequest])

    const friendActionHandler = async (user, currentStatus) => {
        const targetUserId = getId(user)
        const headers = { Authorization: 'Bearer ' + token }
        try {
            if (currentStatus === 'pending_sent') {
                await sendFriendReq(`${API_BASE_URL}/api/friends/${targetUserId}`, 'DELETE', null, headers);
                setSentRequests(prev => prev.filter(f => getId(f) !== targetUserId));
            } else if (currentStatus === 'pending_received') {
                await sendFriendReq(`${API_BASE_URL}/api/friends/${targetUserId}/accept`, 'PATCH', null, headers);
                setReceivedRequests(prev => prev.filter(f => getId(f) !== targetUserId));
                setFriends(prev => [...prev, user]);
            } else {
                await sendFriendReq(`${API_BASE_URL}/api/friends/${targetUserId}`, 'POST', null, headers);
                setSentRequests(prev => [...prev, user]);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const rejectFriendHandler = async (targetUserId) => {
        try {
            await sendFriendReq(
                `${API_BASE_URL}/api/friends/${targetUserId}`,
                'DELETE',
                null,
                { Authorization: 'Bearer ' + token }
            );
            setReceivedRequests(prev => prev.filter(f => getId(f) !== targetUserId));
        } catch (err) {
            console.log(err);
        }
    };

    const hasQuery = query.trim().length > 0
    const visibleResults = hasQuery ? results.filter(user => getId(user) !== userId) : []

    return (
        <div className="journals-container">
            <ErrorModal error={error || friendError} onClear={error ? clearError : clearFriendError} />

            <h2 className="journals-title">Find Friends</h2>

            <Input
                type="text"
                element="input"
                id="search"
                label=""
                placeholder="Search by username..."
                onInput={inputHandler}
                validators={[]}
            />

            {isLoading && <LoadingSpinner />}

            {hasQuery && !isLoading && visibleResults.length === 0 && (
                <div className="journals-empty">
                    <p>No results found.</p>
                </div>
            )}

            {visibleResults.length > 0 && (
                <ul className="users-list">
                    {visibleResults.map((user) => {
                        const targetId = getId(user);
                        const status = friendshipStatusMap.get(targetId);

                        let buttonText = "Add Friend";
                        if (status === 'friends') buttonText = "Friends";
                        if (status === 'pending_sent') buttonText = "Cancel Request";
                        if (status === 'pending_received') buttonText = "Accept Request";

                        return (
                            <UserItem
                                key={targetId}
                                username={user.username}
                                content={buttonText}
                                onClick={() => friendActionHandler(user, status)}
                                disabled={status === 'friends' || isFriendActionLoading}
                                showReject={status === 'pending_received'}
                                onReject={() => rejectFriendHandler(targetId)}
                                reject="Reject"
                            />
                        )
                    })}
                </ul>
            )}
        </div>
    )

}

export default Search