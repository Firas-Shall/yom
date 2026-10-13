import { useCallback, useEffect, useMemo, useState } from 'react'
import MainNavigation from './shared/components/Navigation/MainNavigation'
import { AuthContext } from './shared/context/auth-context'
import { Navigate, Routes, Route } from 'react-router'
import Auth from './user/pages/Auth'
import Search from './user/pages/Search'
import useHttpClient from './shared/hooks/http-hook'
import { API_BASE_URL } from './shared/utils/config'
import UserFriends from './user/pages/UserFriends'
import FriendRequests from './user/pages/FriendRequests'
import NewJournal from './journals/NewJournal'
import MyJournals from './journals/MyJournals'
import Feed from './journals/Feed'

const getStoredAuth = () => {
    try {
        const storedData = JSON.parse(localStorage.getItem('userData'))
        if (storedData && storedData.token && new Date(storedData.expiration) > new Date()) {
            return {
                token: storedData.token,
                userId: storedData.userId,
                expiration: new Date(storedData.expiration)
            }
        }
    } catch {
        return { token: null, userId: null, expiration: null }
    }
    return { token: null, userId: null, expiration: null }
}

function App() {
    const [initialAuth] = useState(getStoredAuth)
    const [token, setToken] = useState(initialAuth.token)
    const [userId, setUserId] = useState(initialAuth.userId)
    const [friends, setFriends] = useState([])
    const [sentRequests, setSentRequests] = useState([])
    const [receivedRequests, setReceivedRequests] = useState([])
    const { sendRequest } = useHttpClient()
    const [tokenExpirationDate, setTokenExpirationDate] = useState(initialAuth.expiration)


    const login = useCallback((uid, token, expirationDate) => {
        setToken(token)
        setUserId(uid)
        const expirationTime = expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60)
        setTokenExpirationDate(expirationTime)

        localStorage.setItem(
            "userData",
            JSON.stringify({
                userId: uid,
                token: token,
                expiration: expirationTime.toISOString(),
            }),
        )
    }, [])

    useEffect(() => {
        if (!token || !userId) {
            return
        }

        const fetchAllUserData = async () => {
            try {
                const headers = { Authorization: 'Bearer ' + token };

                const [friendsData, pendingData] = await Promise.all([
                    sendRequest(`${API_BASE_URL}/api/friends`, 'GET', null, headers),
                    sendRequest(`${API_BASE_URL}/api/friends/pending`, 'GET', null, headers)
                ]);

                setFriends(friendsData.friends || []);
                setSentRequests(pendingData.sentRequests || []);
                setReceivedRequests(pendingData.receivedRequests || []);
            } catch (err) {
                console.log("Failed to fetch user data", err);
            }
        };

        fetchAllUserData();
    }, [token, userId, sendRequest]);

    const logout = useCallback(() => {
        setToken(null)
        setUserId(null)
        setTokenExpirationDate(null)
        setFriends([])
        setSentRequests([])
        setReceivedRequests([])
        localStorage.removeItem("userData")
    }, [])

    useEffect(() => {
        if (token && tokenExpirationDate) {
            const remainingTime = tokenExpirationDate.getTime() - new Date().getTime()
            const logoutTimer = setTimeout(logout, remainingTime)
            return () => clearTimeout(logoutTimer)
        }
    }, [token, logout, tokenExpirationDate])

    const authValue = useMemo(() => ({
        isLoggedIn: !!token,
        token,
        login,
        logout,
        userId,
        friends,
        setFriends,
        sentRequests,
        setSentRequests,
        receivedRequests,
        setReceivedRequests
    }), [token, login, logout, userId, friends, sentRequests, receivedRequests])

    let routes
    if (!token) {
        routes = (
            <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
        )
    }else{
        routes = (
            <Routes>
                <Route path="/feed" element={<Feed />} />
                <Route path="/myjournals" element={<MyJournals/>}/>
                <Route path="/newjournal" element={<NewJournal/>}/>
                <Route path="/friends" element={<UserFriends />} />
                <Route path="/requests" element={<FriendRequests />} />
                <Route path="/search" element={<Search />} />
                <Route path="*" element={<Navigate to="/feed" replace />} />
            </Routes>
        )
    }

    return (
        <AuthContext.Provider value={authValue}>
            <MainNavigation />
            <main>{routes}</main>
        </AuthContext.Provider>
    )
}

export default App
